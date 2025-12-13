// routes/users.js
// Routes cho User Management API (Admin only)

const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const bcrypt = require('bcrypt');

// Middleware kiểm tra admin
function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Chỉ admin mới có quyền thực hiện thao tác này' });
    }
    next();
}

// GET /api/users - Lấy danh sách users (admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    const pool = req.app.locals.pool;
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    
    try {
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;
        
        let whereConditions = [];
        let queryParams = [];
        
        if (search) {
            whereConditions.push('(username LIKE ? OR email LIKE ?)');
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm);
        }
        
        if (role) {
            whereConditions.push('role = ?');
            queryParams.push(role);
        }
        
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        
        // Lấy tổng số users
        const [countRows] = await pool.query(
            `SELECT COUNT(*) as total FROM users ${whereClause}`,
            queryParams
        );
        const total = countRows[0].total;
        
        // Lấy users với pagination
        const [users] = await pool.query(
            `SELECT id, username, email, role, created_at, updated_at 
             FROM users ${whereClause}
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?`,
            [...queryParams, limitNum, offset]
        );
        
        res.json({
            users: users,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalItems: total,
                itemsPerPage: limitNum
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách users:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// GET /api/users/:id - Lấy thông tin user (admin)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = parseInt(req.params.id);
    
    try {
        const [users] = await pool.query(
            'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?',
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy user' });
        }
        
        res.json(users[0]);
    } catch (error) {
        console.error('Lỗi khi lấy thông tin user:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// POST /api/users - Thêm user mới (admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    const pool = req.app.locals.pool;
    const { username, email, password, role = 'user' } = req.body;
    
    try {
        if (!username || !password) {
            return res.status(400).json({ message: 'Username và password là bắt buộc' });
        }
        
        // Kiểm tra username đã tồn tại chưa
        const [existingUsers] = await pool.query(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );
        
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'Username đã tồn tại' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Thêm user
        const [result] = await pool.query(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email || null, hashedPassword, role]
        );
        
        // Lấy user vừa tạo
        const [newUsers] = await pool.query(
            'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
            [result.insertId]
        );
        
        res.status(201).json({
            message: 'Thêm user thành công',
            user: newUsers[0]
        });
    } catch (error) {
        console.error('Lỗi khi thêm user:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// PUT /api/users/:id - Cập nhật user (admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = parseInt(req.params.id);
    const { username, email, password, role } = req.body;
    
    try {
        // Kiểm tra user có tồn tại không
        const [users] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy user' });
        }
        
        // Xây dựng câu lệnh UPDATE động
        const updateFields = [];
        const updateValues = [];
        
        if (username !== undefined) {
            // Kiểm tra username đã tồn tại chưa (trừ user hiện tại)
            const [existingUsers] = await pool.query(
                'SELECT id FROM users WHERE username = ? AND id != ?',
                [username, userId]
            );
            if (existingUsers.length > 0) {
                return res.status(409).json({ message: 'Username đã tồn tại' });
            }
            updateFields.push('username = ?');
            updateValues.push(username);
        }
        
        if (email !== undefined) {
            updateFields.push('email = ?');
            updateValues.push(email || null);
        }
        
        if (password !== undefined && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push('password = ?');
            updateValues.push(hashedPassword);
        }
        
        if (role !== undefined) {
            updateFields.push('role = ?');
            updateValues.push(role);
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'Không có thông tin nào để cập nhật' });
        }
        
        updateValues.push(userId);
        const updateSQL = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        await pool.query(updateSQL, updateValues);
        
        // Lấy user đã cập nhật
        const [updatedUsers] = await pool.query(
            'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?',
            [userId]
        );
        
        res.json({
            message: 'Cập nhật user thành công',
            user: updatedUsers[0]
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật user:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// DELETE /api/users/:id - Xóa user (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = parseInt(req.params.id);
    
    try {
        // Không cho phép xóa chính mình
        if (userId === req.user.id) {
            return res.status(400).json({ message: 'Không thể xóa chính mình' });
        }
        
        // Kiểm tra user có tồn tại không
        const [users] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy user' });
        }
        
        // Xóa user
        await pool.query('DELETE FROM users WHERE id = ?', [userId]);
        
        res.json({ message: 'Xóa user thành công' });
    } catch (error) {
        console.error('Lỗi khi xóa user:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

module.exports = router;


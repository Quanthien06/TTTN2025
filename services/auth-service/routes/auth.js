// services/auth-service/routes/auth.js
// Routes cho Auth Service

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.get('/register', (req, res) => {
    res.status(405).json({ 
        message: 'Phương thức GET không được hỗ trợ. Vui lòng sử dụng POST.',
        method: 'POST',
        endpoint: '/register',
        body: {
            username: 'string (bắt buộc)',
            password: 'string (bắt buộc)',
            role: 'string (tùy chọn, mặc định: "user")'
        }
    });
});

// POST /register - Đăng ký
router.post('/register', async (req, res) => {
    const pool = req.app.locals.pool;
    
    try {
        const { username, password, role = 'user' } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username và password là bắt buộc' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
        await pool.query(sql, [username, hashedPassword, role]);

        res.status(201).json({ message: 'Đăng ký thành công! Vui lòng đăng nhập.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Username đã tồn tại' });
        }
        console.error('Lỗi khi đăng ký:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

router.get('/login', (req, res) => {
    res.status(405).json({ 
        message: 'Phương thức GET không được hỗ trợ. Vui lòng sử dụng POST.',
        method: 'POST',
        endpoint: '/login'
    });
});

// POST /login - Đăng nhập
router.post('/login', async (req, res) => {
    const pool = req.app.locals.pool;
    const JWT_SECRET = req.app.locals.JWT_SECRET;

    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username và password là bắt buộc' });
        }

        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Username hoặc password không đúng' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Username hoặc password không đúng' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '100d' }
        );

        res.json({
            message: 'Đăng nhập thành công',
            token,
            user: { id: user.id, username: user.username, role: user.role }
        });
    } catch (error) {
        console.error('Lỗi khi đăng nhập:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// GET /me - Lấy thông tin user
router.get('/me', async (req, res) => {
    const pool = req.app.locals.pool;
    
    // Lấy user từ token (được verify bởi Gateway)
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Không có token' });
    }

    try {
        const token = authHeader.replace('Bearer ', '').trim();
        const JWT_SECRET = req.app.locals.JWT_SECRET;
        const decoded = jwt.verify(token, JWT_SECRET);

        const [rows] = await pool.query(
            'SELECT id, username, role, created_at FROM users WHERE id = ?',
            [decoded.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        res.json({ user: rows[0] });
    } catch (error) {
        res.status(401).json({ message: 'Token không hợp lệ' });
    }
});

// PUT /profile - Cập nhật profile
router.put('/profile', async (req, res) => {
    const pool = req.app.locals.pool;
    
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Không có token' });
    }

    try {
        const token = authHeader.replace('Bearer ', '').trim();
        const JWT_SECRET = req.app.locals.JWT_SECRET;
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        const { username } = req.body;

        if (!username || username.trim() === '') {
            return res.status(400).json({ message: 'Username không được để trống' });
        }

        const [existingUsers] = await pool.query(
            'SELECT id FROM users WHERE username = ? AND id != ?',
            [username, userId]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'Username đã tồn tại' });
        }

        await pool.query('UPDATE users SET username = ? WHERE id = ?', [username.trim(), userId]);

        const [rows] = await pool.query(
            'SELECT id, username, role, created_at FROM users WHERE id = ?',
            [userId]
        );

        res.json({
            message: 'Cập nhật thông tin thành công',
            user: rows[0]
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật profile:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// PUT /change-password - Đổi mật khẩu
router.put('/change-password', async (req, res) => {
    const pool = req.app.locals.pool;
    
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Không có token' });
    }

    try {
        const token = authHeader.replace('Bearer ', '').trim();
        const JWT_SECRET = req.app.locals.JWT_SECRET;
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password và new password là bắt buộc' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
        }

        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId]);

        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        console.error('Lỗi khi đổi mật khẩu:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// POST /logout - Đăng xuất
router.post('/logout', async (req, res) => {
    res.json({ 
        message: 'Đăng xuất thành công',
        note: 'Vui lòng xóa token ở client'
    });
});

module.exports = router;


// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // Sử dụng bcrypt tiêu chuẩn
const jwt = require('jsonwebtoken');
// Import middleware authenticateToken để bảo vệ các route cần xác thực
const authenticateToken = require('../middleware/auth');

router.get('/register', (req, res) => {
    res.status(405).json({ 
        message: 'Phương thức GET không được hỗ trợ. Vui lòng sử dụng POST.',
        method: 'POST',
        endpoint: '/api/register',
        body: {
            username: 'string (bắt buộc)',
            password: 'string (bắt buộc)',
            role: 'string (tùy chọn, mặc định: "admin")'
        },
        example: {
            url: 'POST http://localhost:5000/api/register',
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                username: 'new_user',
                password: 'password123',
                role: 'admin'
            }
        }
    });
});

// API ĐĂNG KÝ (REGISTER) - POST
router.post('/register', async (req, res) => {
    // Lấy pool từ ứng dụng chính
    const pool = req.app.locals.pool; 
    
    try {
        const { username, password, role = 'admin' } = req.body; 

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
        console.error('Lỗi khi đăng ký người dùng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// API ĐĂNG NHẬP (LOGIN) - GET để hiển thị hướng dẫn
router.get('/login', (req, res) => {
    res.status(405).json({ 
        message: 'Phương thức GET không được hỗ trợ. Vui lòng sử dụng POST.',
        method: 'POST',
        endpoint: '/api/login',
        body: {
            username: 'string (bắt buộc)',
            password: 'string (bắt buộc)'
        },
        example: {
            url: 'POST http://localhost:5000/api/login',
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                username: 'your_username',
                password: 'your_password'
            }
        }
    });
});

// API ĐĂNG NHẬP (LOGIN) - POST
router.post('/login', async (req, res) => {
    const pool = req.app.locals.pool; 
    const JWT_SECRET = req.app.locals.JWT_SECRET;

    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username và password là bắt buộc' });
        }

        // 1. Tìm user trong database
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Username hoặc password không đúng' });
        }

        // 2. Kiểm tra password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Username hoặc password không đúng' });
        }

        // 3. Tạo JWT - Sử dụng jwt đã require ở đầu file
        if (!JWT_SECRET) {
            console.error('JWT_SECRET không được cấu hình!');
            return res.status(500).json({ message: 'Lỗi cấu hình server' });
        }

        console.log('Đang tạo token với JWT_SECRET length:', JWT_SECRET.length);
        console.log('JWT_SECRET (first 10 chars):', JWT_SECRET.substring(0, 10) + '...');

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: '100d' }
        );
        
        console.log('Token đã được tạo thành công cho user:', user.username);
        console.log('Token length:', token.length);
        console.log('Token (first 30 chars):', token.substring(0, 30) + '...');

        // 4. Trả về token
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

// ============================================
// API BỔ SUNG CHO AUTH
// ============================================

// GET /api/me - Lấy thông tin user hiện tại
// Endpoint này cho phép user xem thông tin của chính mình
// Cần có token hợp lệ trong header Authorization
router.get('/me', authenticateToken, async (req, res) => {
    // Lấy connection pool từ app để thực hiện query database
    const pool = req.app.locals.pool;
    // req.user được set bởi middleware authenticateToken sau khi verify token thành công
    // req.user chứa thông tin: { id, username, role }
    const userId = req.user.id;

    try {
        // Query database để lấy thông tin user
        // Chỉ lấy các field cần thiết, không lấy password vì lý do bảo mật
        const [rows] = await pool.query(
            'SELECT id, username, role, created_at FROM users WHERE id = ?',
            [userId]
        );

        // Kiểm tra user có tồn tại không (trường hợp token hợp lệ nhưng user đã bị xóa)
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        // Lấy user đầu tiên (sẽ chỉ có 1 user với id này)
        const user = rows[0];
        
        // Trả về thông tin user
        res.json({
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                created_at: user.created_at
            }
        });

    } catch (error) {
        // Log lỗi để debug
        console.error('Lỗi khi lấy thông tin user:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// PUT /api/profile - Cập nhật thông tin cá nhân
// Cho phép user cập nhật username của mình
// Cần có token hợp lệ
router.put('/profile', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    // Lấy username mới từ request body
    const { username } = req.body;

    try {
        // Validation: Kiểm tra username không được rỗng
        if (!username || username.trim() === '') {
            return res.status(400).json({ message: 'Username không được để trống' });
        }

        // Kiểm tra username mới đã tồn tại chưa (trừ user hiện tại)
        // Để tránh trùng username với user khác
        const [existingUsers] = await pool.query(
            'SELECT id FROM users WHERE username = ? AND id != ?',
            [username, userId]
        );

        // Nếu username đã tồn tại, trả về lỗi 409 Conflict
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'Username đã tồn tại' });
        }

        // Cập nhật username trong database
        // trim() để loại bỏ khoảng trắng thừa
        await pool.query(
            'UPDATE users SET username = ? WHERE id = ?',
            [username.trim(), userId]
        );

        // Lấy thông tin user đã cập nhật để trả về
        const [rows] = await pool.query(
            'SELECT id, username, role, created_at FROM users WHERE id = ?',
            [userId]
        );

        // Trả về thông tin user đã cập nhật
        res.json({
            message: 'Cập nhật thông tin thành công',
            user: rows[0]
        });

    } catch (error) {
        console.error('Lỗi khi cập nhật profile:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// PUT /api/change-password - Đổi mật khẩu
// Cho phép user đổi mật khẩu của mình
// Yêu cầu: currentPassword (để xác nhận) và newPassword (mật khẩu mới)
router.put('/change-password', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    // Lấy mật khẩu hiện tại và mật khẩu mới từ request body
    const { currentPassword, newPassword } = req.body;

    try {
        // Validation: Kiểm tra cả 2 password đều phải có
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                message: 'Current password và new password là bắt buộc' 
            });
        }

        // Validation: Mật khẩu mới phải có ít nhất 6 ký tự (bảo mật)
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                message: 'Mật khẩu mới phải có ít nhất 6 ký tự' 
            });
        }

        // Lấy thông tin user từ database (bao gồm password đã hash)
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );

        // Kiểm tra user có tồn tại không
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        const user = rows[0];

        // Kiểm tra mật khẩu hiện tại có đúng không
        // bcrypt.compare so sánh password plain text với hash trong database
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            // Trả về lỗi 401 Unauthorized nếu mật khẩu không đúng
            return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' });
        }

        // Hash mật khẩu mới trước khi lưu vào database
        // Sử dụng bcrypt với 10 rounds (độ phức tạp)
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu mới vào database
        await pool.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedNewPassword, userId]
        );

        // Trả về thông báo thành công
        res.json({ message: 'Đổi mật khẩu thành công' });

    } catch (error) {
        console.error('Lỗi khi đổi mật khẩu:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// POST /api/logout - Đăng xuất
// Lưu ý: Với JWT stateless, logout thường được xử lý ở client (xóa token khỏi localStorage)
// Endpoint này chỉ là formality, client sẽ tự xóa token
// Nếu muốn implement token blacklist, cần tạo bảng blacklisted_tokens trong database
router.post('/logout', authenticateToken, async (req, res) => {
    // Với JWT stateless, không cần làm gì ở server
    // Client chỉ cần xóa token khỏi localStorage/sessionStorage
    
    // TODO: Nếu muốn implement token blacklist:
    // 1. Tạo bảng blacklisted_tokens trong database
    // 2. Lưu token vào blacklist khi logout
    // 3. Kiểm tra token trong blacklist ở middleware authenticateToken
    
    // Hiện tại chỉ trả về success, client tự xóa token
    res.json({ 
        message: 'Đăng xuất thành công',
        note: 'Vui lòng xóa token ở client (localStorage/sessionStorage)'
    });
});

module.exports = router;
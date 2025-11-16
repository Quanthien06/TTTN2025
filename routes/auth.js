// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // Sử dụng bcrypt tiêu chuẩn
const jwt = require('jsonwebtoken');

// API ĐĂNG KÝ (REGISTER) - GET để hiển thị hướng dẫn
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

module.exports = router;
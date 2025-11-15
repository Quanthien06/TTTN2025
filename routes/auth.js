const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRT = 'your_jwt_secret_key'; // Thay thế bằng khóa bí mật thực tế

//API Register 

router.post('/register', async (req, res) => {
    const pool = req.app.locals.pool; // lấy pool từ ứng dụng
    try {
        const { username, password, role = 'admin' } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username và password là bắt buộc' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
        await pool.query(sql, [username, hashedPassword, role]);
        res.status(201).json({ message: 'Đăng kí thành công ! Vui lòng đăng nhập lại' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Username đã tồn tại' });
        }
        console.error('Lỗi khi đăng kí người dùng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }});

    // API ĐĂNG NHẬP (LOGIN)
router.post('/login', async (req, res) => {
    const pool = req.app.locals.pool; 

    try {
        const { username, password } = req.body;

        // 1. Tìm người dùng
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Username hoặc mật khẩu không đúng' });
        }

        // 2. So sánh mật khẩu
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ message: 'Username hoặc mật khẩu không đúng' });
        }

        // 3. Tạo JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );

        // 4. Trả về Token
        res.json({ message: 'Đăng nhập thành công!', token: token, role: user.role });

    } catch (error) {
        console.error('Lỗi khi đăng nhập:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

module.exports = router;
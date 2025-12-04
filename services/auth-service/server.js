// services/auth-service/server.js
// Auth Service - Xử lý authentication và authorization

const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const authRouter = require('./routes/auth');

const app = express();

// Config
const PORT = 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'HhGg78@!kYpQzXcVbNmL1o2P3oI4U5yT6rE7wQ8aZ9sX0cVkGjH';

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tttn2025'
});

// Lưu pool và config vào app.locals
app.locals.pool = pool;
app.locals.JWT_SECRET = JWT_SECRET;
app.locals.jwt = jwt;

// Middleware
app.use(express.json());

// Routes
app.use('/', authRouter);

// Internal endpoint: Verify token (cho Gateway gọi)
app.post('/verify-token', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(401).json({ message: 'Không có token' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Lấy thông tin user từ database
        const [rows] = await pool.query(
            'SELECT id, username, role FROM users WHERE id = ?',
            [decoded.id]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'User không tồn tại' });
        }

        res.json({ user: rows[0] });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Token đã hết hạn',
                error: 'TokenExpiredError'
            });
        }
        return res.status(401).json({ 
            message: 'Token không hợp lệ',
            error: 'InvalidToken'
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'auth-service' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🔐 Auth Service đang chạy tại http://localhost:${PORT}`);
});


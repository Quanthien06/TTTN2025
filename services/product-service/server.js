// services/product-service/server.js
// Product Service - Quản lý sản phẩm và danh mục

const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const productRouter = require('./routes/products');
const categoryRouter = require('./routes/categories');

const app = express();

// Config
const PORT = 5002;
const JWT_SECRET = process.env.JWT_SECRET || 'HhGg78@!kYpQzXcVbNmL1o2P3oI4U5yT6rE7wQ8aZ9sX0cVkGjH';

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tttn2025'
});

// Middleware: Verify token để check admin
function verifyAdmin(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Không có token' });
    }

    try {
        const token = authHeader.replace('Bearer ', '').trim();
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Chỉ admin mới có quyền thực hiện' });
        }
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token không hợp lệ' });
    }
}

// Lưu vào app.locals
app.locals.pool = pool;
app.locals.verifyAdmin = verifyAdmin;

// Middleware
app.use(express.json());

// Routes
app.use('/products', productRouter);
app.use('/categories', categoryRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'product-service' });
});

// Start server
app.listen(PORT, () => {
    console.log(`📦 Product Service đang chạy tại http://localhost:${PORT}`);
});


// services/order-service/server.js
// Order Service - Quản lý đơn hàng

const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const orderRouter = require('./routes/orders');

const app = express();

// Config
const PORT = 5004;
const JWT_SECRET = process.env.JWT_SECRET || 'HhGg78@!kYpQzXcVbNmL1o2P3oI4U5yT6rE7wQ8aZ9sX0cVkGjH';
const CART_SERVICE_URL = process.env.CART_SERVICE_URL || 'http://localhost:5003';

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tttn2025'
});

// Middleware: Verify token
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Không có token' });
    }

    try {
        const token = authHeader.replace('Bearer ', '').trim();
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token không hợp lệ' });
    }
}

// Lưu vào app.locals
app.locals.pool = pool;
app.locals.verifyToken = verifyToken;
app.locals.CART_SERVICE_URL = CART_SERVICE_URL;
app.locals.axios = axios;

// Middleware
app.use(express.json());

// Routes
app.use('/orders', orderRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'order-service' });
});

// Start server
app.listen(PORT, () => {
    console.log(`📦 Order Service đang chạy tại http://localhost:${PORT}`);
});


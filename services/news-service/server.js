// services/news-service/server.js
// News Service - Quản lý tin công nghệ

const express = require('express');
const mysql = require('mysql2/promise');
const newsRouter = require('./routes/news');

const app = express();

// Config
const PORT = process.env.PORT || 5005;

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tttn2025'
});

// Lưu vào app.locals
app.locals.pool = pool;

// Middleware
app.use(express.json());

// Routes
app.use('/news', newsRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'news-service' });
});

// Start server
app.listen(PORT, () => {
    console.log(`📰 News Service đang chạy tại http://localhost:${PORT}`);
});


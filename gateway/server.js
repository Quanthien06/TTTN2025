// gateway/server.js
// API Gateway - Điểm vào chính của ứng dụng
// Gateway sẽ route requests đến các microservices tương ứng

const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

// Cấu hình các services
// Trong Docker, dùng tên service; ngoài Docker, dùng localhost
const SERVICES = {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
    product: process.env.PRODUCT_SERVICE_URL || 'http://localhost:5002',
    cart: process.env.CART_SERVICE_URL || 'http://localhost:5003',
    order: process.env.ORDER_SERVICE_URL || 'http://localhost:5004',
    news: process.env.NEWS_SERVICE_URL || 'http://localhost:5005'
};

const JWT_SECRET = process.env.JWT_SECRET || 'HhGg78@!kYpQzXcVbNmL1o2P3oI4U5yT6rE7wQ8aZ9sX0cVkGjH';

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware: Verify token với Auth Service
async function verifyToken(req, res, next) {
    // Bỏ qua các file static (img, css, js, fonts, etc.)
    if (!req.path.startsWith('/api')) {
        return next();
    }

    // Danh sách các route công khai (không cần token)
    const publicRoutes = [
        '/api/register',
        '/api/login',
        '/api/products',
        '/api/categories',
        '/api/news',
        '/api/forgot-password',
        '/api/reset-password',
        '/api/user-by-email',
        '/api/verify-email',
        '/api/resend-verification'
    ];

    // Kiểm tra nếu route là public
    const isPublicRoute = publicRoutes.some(route => {
        if (req.path === route) return true;
        if (req.path.startsWith(route) && route.includes('/products')) return true;
        if (req.path.startsWith(route) && route.includes('/categories')) return true;
        if (req.path.startsWith(route) && route.includes('/news')) return true;
        return false;
    });

    // GET /api/comments/product/:id là public, POST /api/comments cần auth
    if (req.path.startsWith('/api/comments/product/') && req.method === 'GET') {
        return next();
    }

    if (isPublicRoute) {
        return next();
    }

    // Lấy token từ header
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ 
            message: 'Không có token truy cập. Vui lòng đăng nhập.' 
        });
    }

    let token = authHeader.replace('Bearer ', '').trim();

    // Verify token với Auth Service
    try {
        const response = await axios.post(`${SERVICES.auth}/verify-token`, { token });
        // Auth service trả về { user: { id, username, role } }
        req.user = response.data.user || response.data;
        if (!req.user || !req.user.id) {
            console.error('Auth service response không hợp lệ:', response.data);
            return res.status(401).json({ message: 'Token không hợp lệ' });
        }
        next();
    } catch (error) {
        console.error('Lỗi verify token:', error.message);
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        return res.status(401).json({ message: 'Token không hợp lệ' });
    }
}

// Apply verifyToken middleware cho tất cả routes
app.use(verifyToken);

// ============================================
// AUTH ENDPOINTS → Auth Service
// ============================================

app.post('/api/register', async (req, res) => {
    try {
        const response = await axios.post(`${SERVICES.auth}/register`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(
            error.response?.data || { message: 'Lỗi server' }
        );
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const response = await axios.post(`${SERVICES.auth}/login`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(
            error.response?.data || { message: 'Lỗi server' }
        );
    }
});

app.get('/api/me', async (req, res) => {
    try {
        const response = await axios.get(`${SERVICES.auth}/me`, {
            headers: { 'Authorization': req.headers['authorization'] }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(
            error.response?.data || { message: 'Lỗi server' }
        );
    }
});

app.put('/api/profile', async (req, res) => {
    try {
        const response = await axios.put(`${SERVICES.auth}/profile`, req.body, {
            headers: { 'Authorization': req.headers['authorization'] }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(
            error.response?.data || { message: 'Lỗi server' }
        );
    }
});

app.put('/api/change-password', async (req, res) => {
    try {
        const response = await axios.put(`${SERVICES.auth}/change-password`, req.body, {
            headers: { 'Authorization': req.headers['authorization'] }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(
            error.response?.data || { message: 'Lỗi server' }
        );
    }
});

app.post('/api/logout', async (req, res) => {
    try {
        const response = await axios.post(`${SERVICES.auth}/logout`, {}, {
            headers: { 'Authorization': req.headers['authorization'] }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(
            error.response?.data || { message: 'Lỗi server' }
        );
    }
});

// POST /api/forgot-password - Gửi mã OTP
app.post('/api/forgot-password', async (req, res) => {
    try {
        const response = await axios.post(`${SERVICES.auth}/forgot-password`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(
            error.response?.data || { message: 'Lỗi server' }
        );
    }
});

// POST /api/reset-password - Đặt lại mật khẩu với OTP
app.post('/api/reset-password', async (req, res) => {
    try {
        const response = await axios.post(`${SERVICES.auth}/reset-password`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(
            error.response?.data || { message: 'Lỗi server' }
        );
    }
});

// GET /api/user-by-email - Lấy username từ email
app.get('/api/user-by-email', async (req, res) => {
    try {
        const response = await axios.get(`${SERVICES.auth}/user-by-email`, {
            params: req.query
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(
            error.response?.data || { message: 'Lỗi server' }
        );
    }
});

// ============================================
// PRODUCT ENDPOINTS → Product Service
// ============================================

app.use('/api/products', async (req, res) => {
    try {
        const url = `${SERVICES.product}/products${req.url}`;
        const method = req.method.toLowerCase();
        
        const config = {
            method,
            url,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (method !== 'get' && method !== 'delete') {
            config.data = req.body;
        }

        if (req.headers['authorization']) {
            config.headers['Authorization'] = req.headers['authorization'];
        }

        const response = await axios(config);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(
            error.response?.data || { message: 'Lỗi server' }
        );
    }
});

app.use('/api/categories', async (req, res) => {
    try {
        const url = `${SERVICES.product}/categories${req.url}`;
        const method = req.method.toLowerCase();
        
        const config = {
            method,
            url,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (method !== 'get' && method !== 'delete') {
            config.data = req.body;
        }

        if (req.headers['authorization']) {
            config.headers['Authorization'] = req.headers['authorization'];
        }

        const response = await axios(config);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(
            error.response?.data || { message: 'Lỗi server' }
        );
    }
});

// ============================================
// CART ENDPOINTS → Cart Service
// ============================================

app.use('/api/cart', async (req, res) => {
    try {
        const url = `${SERVICES.cart}/cart${req.url}`;
        const method = req.method.toLowerCase();
        
        const config = {
            method,
            url,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers['authorization']
            }
        };

        if (method !== 'get' && method !== 'delete') {
            config.data = req.body;
        }

        const response = await axios(config);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(
            error.response?.data || { message: 'Lỗi server' }
        );
    }
});

// ============================================
// ORDER ENDPOINTS → Order Service
// ============================================

app.use('/api/orders', async (req, res) => {
    try {
        const url = `${SERVICES.order}/orders${req.url}`;
        const method = req.method.toLowerCase();
        
        const config = {
            method,
            url,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers['authorization']
            }
        };

        if (method !== 'get' && method !== 'delete') {
            config.data = req.body;
        }

        const response = await axios(config);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(
            error.response?.data || { message: 'Lỗi server' }
        );
    }
});

// ============================================
// NEWS ENDPOINTS → News Service
// ============================================

app.use('/api/news', async (req, res) => {
    try {
        const url = `${SERVICES.news}/news${req.url}`;
        const method = req.method.toLowerCase();
        
        const config = {
            method,
            url,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (method !== 'get' && method !== 'delete') {
            config.data = req.body;
        }

        const response = await axios(config);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(
            error.response?.data || { message: 'Lỗi server' }
        );
    }
});

// ============================================
// COMMENTS ENDPOINTS → Xử lý trực tiếp trong Gateway
// ============================================

const mysql = require('mysql2/promise');

// Tạo connection pool cho comments
const commentsPool = mysql.createPool({
    host: process.env.DB_HOST || 'host.docker.internal',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tttn2025',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// GET /api/comments/product/:productId - Public endpoint
app.get('/api/comments/product/:productId', async (req, res) => {
    try {
        const productId = parseInt(req.params.productId);
        if (isNaN(productId)) {
            return res.status(400).json({ message: 'ID sản phẩm không hợp lệ' });
        }

        const [comments] = await commentsPool.query(
            `SELECT id, product_id, user_id, username, comment, rating, created_at, updated_at
             FROM product_comments 
             WHERE product_id = ? 
             ORDER BY created_at DESC`,
            [productId]
        );

        res.json({
            comments: comments,
            count: comments.length
        });
    } catch (error) {
        console.error('Lỗi khi lấy comments:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// POST /api/comments - Cần auth (đã được verifyToken middleware xử lý)
app.post('/api/comments', async (req, res) => {
    try {
        // Kiểm tra req.user có tồn tại không
        if (!req.user) {
            return res.status(401).json({ message: 'Vui lòng đăng nhập để bình luận' });
        }
        
        const userId = req.user.id;
        const username = req.user.username || 'Người dùng';
        const { product_id, comment, rating = 5 } = req.body;

        if (!product_id) {
            return res.status(400).json({ message: 'ID sản phẩm là bắt buộc' });
        }

        if (!comment || comment.trim() === '') {
            return res.status(400).json({ message: 'Nội dung comment không được để trống' });
        }

        const ratingNum = parseInt(rating);
        if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            return res.status(400).json({ message: 'Đánh giá phải từ 1 đến 5 sao' });
        }

        // Kiểm tra sản phẩm có tồn tại không
        const [products] = await commentsPool.query('SELECT id FROM products WHERE id = ?', [product_id]);
        if (products.length === 0) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        // Thêm comment
        const [result] = await commentsPool.query(
            `INSERT INTO product_comments (product_id, user_id, username, comment, rating) 
             VALUES (?, ?, ?, ?, ?)`,
            [product_id, userId, username, comment.trim(), ratingNum]
        );

        // Lấy comment vừa tạo
        const [newComments] = await commentsPool.query(
            'SELECT * FROM product_comments WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            message: 'Thêm comment thành công',
            comment: newComments[0]
        });
    } catch (error) {
        console.error('Lỗi khi thêm comment:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// DELETE /api/comments/:id - Cần auth
app.delete('/api/comments/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const commentId = parseInt(req.params.id);

        if (isNaN(commentId)) {
            return res.status(400).json({ message: 'ID comment không hợp lệ' });
        }

        // Kiểm tra comment có tồn tại không
        const [comments] = await commentsPool.query(
            'SELECT * FROM product_comments WHERE id = ?',
            [commentId]
        );

        if (comments.length === 0) {
            return res.status(404).json({ message: 'Comment không tồn tại' });
        }

        const comment = comments[0];

        // Kiểm tra quyền
        if (comment.user_id !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền xóa comment này' });
        }

        // Xóa comment
        await commentsPool.query('DELETE FROM product_comments WHERE id = ?', [commentId]);

        res.json({ message: 'Xóa comment thành công' });
    } catch (error) {
        console.error('Lỗi khi xóa comment:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// Serve homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log('🚀 API Gateway đang chạy tại http://localhost:' + PORT);
    console.log('📡 Kết nối đến các services:');
    console.log('   - Auth Service: ' + SERVICES.auth);
    console.log('   - Product Service: ' + SERVICES.product);
    console.log('   - Cart Service: ' + SERVICES.cart);
    console.log('   - Order Service: ' + SERVICES.order);
    console.log('   - News Service: ' + SERVICES.news);
});


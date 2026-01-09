// gateway/server.js
// API Gateway - Điểm vào chính của ứng dụng
// Gateway sẽ route requests đến các microservices tương ứng

const express = require('express');
const axios = require('axios');
const mysql = require('mysql2/promise');
const fs = require('fs');
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

// Prevent caching for HTML, CSS, JS files in development
app.use((req, res, next) => {
    if (req.path.endsWith('.html') || req.path.endsWith('.css') || req.path.endsWith('.js') || req.path === '/') {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Last-Modified', new Date().toUTCString());
        res.setHeader('ETag', `"${Date.now()}"`);
    }
    next();
});

// Serve static files: in Docker image `public` is copied to /app/public; in repo it is ../public
const publicDirCandidates = [
    path.join(__dirname, 'public'),
    path.join(__dirname, '..', 'public')
];
const PUBLIC_DIR = publicDirCandidates.find(p => fs.existsSync(p)) || publicDirCandidates[0];
app.use(express.static(PUBLIC_DIR));

// Legacy static routes (old links/bookmarks) -> SPA routes
app.get('/tech-news.html', (req, res) => {
    return res.redirect('/?page=tech-news');
});

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
        '/api/coupons/validate',
        '/api/coupons/active',
        '/api/categories',
        '/api/news',
        '/api/forgot-password',
        '/api/reset-password',
        '/api/user-by-email',
        '/api/verify-email',
        '/api/resend-verification',
        '/api/payment/check-account',  // Kiểm tra tài khoản demo - không cần auth
        '/api/faqs'  // FAQs - công khai
    ];

    // Kiểm tra nếu route là public
    const isPublicRoute = publicRoutes.some(route => {
        if (req.path === route) return true;
        if (req.path.startsWith(route) && route.includes('/products')) return true;
        if (req.path.startsWith(route) && route.includes('/categories')) return true;
        if (req.path.startsWith(route) && route.includes('/news')) return true;
        if (req.path.startsWith(route) && route.includes('/payment/check-account')) return true;
        if (req.path.startsWith(route) && route.includes('/coupons')) return true;
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
        const verifyUrl = `${SERVICES.auth}/verify-token`;
        const response = await axios.post(verifyUrl, { token }, { timeout: 8000 });
        // Auth service trả về { user: { id, username, role } }
        req.user = response.data.user || response.data;
        if (!req.user || !req.user.id) {
            console.error('Auth service response không hợp lệ:', response.data);
            return res.status(401).json({ message: 'Token không hợp lệ' });
        }
        next();
    } catch (error) {
        // Log chi tiết để debug triệt để (tránh chỉ hiện "Error")
        const status = error.response?.status;
        const data = error.response?.data;
        console.error('[VERIFY TOKEN FAILED]', {
            method: req.method,
            path: req.path,
            target: `${SERVICES.auth}/verify-token`,
            status: status || null,
            data: data || null,
            code: error.code || null,
            message: error.message || null
        });

        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            return res.status(502).json({ message: 'Auth service không phản hồi. Vui lòng thử lại.' });
        }

        if (error.response) {
            return res.status(status).json(data);
        }
        return res.status(401).json({ message: 'Token không hợp lệ' });
    }
}

// Apply verifyToken middleware cho tất cả routes
app.use(verifyToken);

// ============================================
// ADMIN STATS ENDPOINTS → handled in Gateway (direct DB)
// ============================================
function createDbPool(host) {
    return mysql.createPool({
        host,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'tttn2025',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
}

// DB host selection:
// - In Docker: default to host.docker.internal (MySQL on Windows host)
// - On host: default to localhost
const runningInDocker = (() => {
    try { return fs.existsSync('/.dockerenv'); } catch { return false; }
})();
const defaultDbHost = runningInDocker ? 'host.docker.internal' : 'localhost';
const dbHosts = (process.env.DB_HOST ? [process.env.DB_HOST] : []).concat(
    runningInDocker ? ['host.docker.internal', 'localhost'] : ['localhost', 'host.docker.internal']
).filter((v, i, a) => v && a.indexOf(v) === i);

let dbHostIndex = 0;
let dbPool = createDbPool(dbHosts[dbHostIndex] || defaultDbHost);

async function safeDbQuery(sql, params = []) {
    try {
        return await dbPool.query(sql, params);
    } catch (err) {
        // Auto-fallback on connection errors: rotate to next host candidate once.
        if ((err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') && dbHostIndex < dbHosts.length - 1) {
            const from = dbHosts[dbHostIndex];
            dbHostIndex += 1;
            const to = dbHosts[dbHostIndex];
            console.warn('[DB] Connection failed to', from, '-> retry with', to);
            dbPool = createDbPool(to);
            return await dbPool.query(sql, params);
        }
        throw err;
    }
}

// GET /api/stats/overview - Admin dashboard numbers
app.get('/api/stats/overview', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

        const [[{ totalUsers }]] = await safeDbQuery('SELECT COUNT(*) as totalUsers FROM users');
        const [[{ totalProducts }]] = await safeDbQuery('SELECT COUNT(*) as totalProducts FROM products');
        const [[orderAgg]] = await safeDbQuery('SELECT COUNT(*) as totalOrders, COALESCE(SUM(total), 0) as totalRevenue FROM orders');

        res.json({
            totalUsers: Number(totalUsers || 0),
            totalProducts: Number(totalProducts || 0),
            totalOrders: Number(orderAgg?.totalOrders || 0),
            totalRevenue: Number(orderAgg?.totalRevenue || 0)
        });
    } catch (error) {
        console.error('Error loading stats overview:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

let detectedOrdersCreatedColumn = null; // 'created_at' | 'createdAt'
async function getOrdersCreatedColumn() {
    if (detectedOrdersCreatedColumn) return detectedOrdersCreatedColumn;
    const dbName = process.env.DB_NAME || 'tttn2025';
    const [rows] = await safeDbQuery(
        `SELECT COLUMN_NAME
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ?
           AND TABLE_NAME = 'orders'
           AND COLUMN_NAME IN ('created_at','createdAt')
         LIMIT 1`,
        [dbName]
    );
    detectedOrdersCreatedColumn = rows?.[0]?.COLUMN_NAME || 'created_at';
    return detectedOrdersCreatedColumn;
}

// GET /api/stats/revenue - Data for 2 charts in admin.html:
// - Revenue by month (line chart)
// - Orders by status (doughnut)
app.get('/api/stats/revenue', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

        const createdCol = await getOrdersCreatedColumn();

        // Revenue by month for current year (T1..T12)
        const [revRows] = await safeDbQuery(
            `SELECT MONTH(\`${createdCol}\`) as month,
                    COALESCE(SUM(total), 0) as revenue
             FROM orders
             WHERE YEAR(\`${createdCol}\`) = YEAR(CURDATE())
             GROUP BY MONTH(\`${createdCol}\`)
             ORDER BY month ASC`
        );

        const months = Array.from({ length: 12 }, (_, i) => `T${i + 1}`);
        const revenue = Array.from({ length: 12 }, () => 0);
        for (const r of revRows) {
            const m = Number(r.month);
            if (m >= 1 && m <= 12) revenue[m - 1] = Number(r.revenue || 0);
        }

        // Orders by status (all-time counts; can be adjusted later)
        const [statusRows] = await safeDbQuery(
            `SELECT status, COUNT(*) as count
             FROM orders
             GROUP BY status`
        );
        const ordersByStatus = {
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
        };
        for (const s of statusRows) {
            const key = String(s.status || '').toLowerCase();
            if (ordersByStatus[key] !== undefined) ordersByStatus[key] = Number(s.count || 0);
        }

        res.json({ months, revenue, ordersByStatus });
    } catch (error) {
        console.error('Error loading stats revenue:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

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
// COUPON ENDPOINTS → Order Service
// ============================================

app.use('/api/coupons', async (req, res) => {
    try {
        const url = `${SERVICES.order}/coupons${req.url}`;
        const method = req.method.toLowerCase();
        
        const config = {
            method,
            url,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers['authorization'] || ''
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
// LOYALTY POINTS ENDPOINTS → Order Service
// ============================================

app.use('/api/loyalty', async (req, res) => {
    try {
        const url = `${SERVICES.order}/loyalty${req.url}`;
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
// PAYMENT ENDPOINTS → Direct DB Query
// ============================================

// GET /api/payment/check-account - Kiểm tra số tài khoản
app.get('/api/payment/check-account', async (req, res) => {
    try {
        const { bank, account_number } = req.query;
        
        if (!bank || !account_number) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp bank và account_number'
            });
        }

        // Use dbPool directly (created at startup)
        if (!dbPool) {
            return res.status(500).json({
                success: false,
                message: 'Database connection not available'
            });
        }

        // Query payment_demo_accounts table
        const [rows] = await dbPool.query(
            'SELECT id, bank_type, account_number, account_name, balance, is_active FROM payment_demo_accounts WHERE bank_type = ? AND account_number = ? AND is_active = TRUE',
            [bank, account_number]
        );

        if (rows && rows.length > 0) {
            const account = rows[0];
            return res.json({
                success: true,
                account: {
                    id: account.id,
                    bank_type: account.bank_type,
                    account_number: account.account_number,
                    account_name: account.account_name,
                    balance: parseFloat(account.balance)
                }
            });
        } else {
            return res.json({
                success: false,
                message: 'Không tìm thấy tài khoản với số tài khoản này'
            });
        }
    } catch (error) {
        console.error('Error checking account:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi kiểm tra tài khoản'
        });
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
// USERS ENDPOINTS → Auth Service (Admin)
// ============================================

app.use('/api/users', async (req, res) => {
    try {
        const url = `${SERVICES.auth}/users${req.url}`;
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
// COMMENTS ENDPOINTS → Xử lý trực tiếp trong Gateway
// ============================================

// GET /api/comments/product/:productId - Public endpoint
app.get('/api/comments/product/:productId', async (req, res) => {
    try {
        const productId = parseInt(req.params.productId);
        if (isNaN(productId)) {
            return res.status(400).json({ message: 'ID sản phẩm không hợp lệ' });
        }

        const [comments] = await safeDbQuery(
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
        const [products] = await safeDbQuery('SELECT id FROM products WHERE id = ?', [product_id]);
        if (products.length === 0) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        // Thêm comment
        const [result] = await safeDbQuery(
            `INSERT INTO product_comments (product_id, user_id, username, comment, rating) 
             VALUES (?, ?, ?, ?, ?)`,
            [product_id, userId, username, comment.trim(), ratingNum]
        );

        // Lấy comment vừa tạo
        const [newComments] = await safeDbQuery(
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
        const [comments] = await safeDbQuery(
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
        await safeDbQuery('DELETE FROM product_comments WHERE id = ?', [commentId]);

        res.json({ message: 'Xóa comment thành công' });
    } catch (error) {
        console.error('Lỗi khi xóa comment:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// GET /api/faqs - Lấy danh sách FAQs
app.get('/api/faqs', (req, res) => {
    // Prevent caching for API responses
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    try {
        const faqsPath = path.join(__dirname, '..', 'config', 'faqs.json');
        const faqsData = JSON.parse(fs.readFileSync(faqsPath, 'utf8'));
        res.json({
            success: true,
            data: faqsData
        });
    } catch (error) {
        console.error('Lỗi khi đọc FAQs:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể tải FAQs'
        });
    }
});

// Serve homepage (SPA)
app.get('/', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
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


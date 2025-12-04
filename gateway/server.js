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
    order: process.env.ORDER_SERVICE_URL || 'http://localhost:5004'
};

const JWT_SECRET = process.env.JWT_SECRET || 'HhGg78@!kYpQzXcVbNmL1o2P3oI4U5yT6rE7wQ8aZ9sX0cVkGjH';

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Middleware: Verify token với Auth Service
async function verifyToken(req, res, next) {
    // Danh sách các route công khai (không cần token)
    const publicRoutes = [
        '/api/register',
        '/api/login',
        '/api/products',
        '/api/categories'
    ];

    // Kiểm tra nếu route là public
    const isPublicRoute = publicRoutes.some(route => {
        if (req.path === route) return true;
        if (req.path.startsWith(route) && route.includes('/products')) return true;
        if (req.path.startsWith(route) && route.includes('/categories')) return true;
        return false;
    });

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
        req.user = response.data.user;
        next();
    } catch (error) {
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

// Serve homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
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
});


// server.js

// Load biến môi trường từ file .env
require('dotenv').config();

// Debug: Kiểm tra biến môi trường đã load chưa
console.log('=== ENVIRONMENT VARIABLES CHECK ===');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? `${process.env.GOOGLE_CLIENT_ID.substring(0, 20)}...` : 'UNDEFINED ❌');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET ✅' : 'UNDEFINED ❌');
console.log('GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL || 'UNDEFINED ❌');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'SET ✅' : 'UNDEFINED ❌');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD ? 'SET ✅' : 'UNDEFINED ❌');
console.log('=====================================\n');

// 1. "require" (nhập) thư viện express đã cài đặt
const express = require('express');  // gọi  path để truyền FE
// Hỗ trợ làm việc với đường dẫn hệ thống
const path = require('path');
// Nhập thư viện mysql2 và sử dụng bản hỗ trợ "Promises"
const mysql = require('mysql2/promise');
// ***** NHẬP THƯ VIỆN CẦN THIẾT CHO MIDDLEWARE *****
const jwt = require('jsonwebtoken');
// OAuth2 và Session
const session = require('express-session');
const passport = require('passport');

// ***** NHẬP CÁC FILE ROUTE ĐÃ TÁCH *****
// Đảm bảo bạn đã tạo thư mục routes/
const authRouter = require('./routes/auth');
const oauthRouter = require('./routes/oauth'); // OAuth2 routes
const productRouter = require('./routes/product');
const cartRouter = require('./routes/cart');
const orderRouter = require('./routes/orders');
const categoriesRouter = require('./routes/categories'); // Router cho Categories API
const newsRouter = require('./routes/news'); // Router cho Tech News
const commentsRouter = require('./routes/comments'); // Router cho Comments API
const usersRouter = require('./routes/users'); // Router cho Users Management API (Admin)
const statsRouter = require('./routes/stats'); // Router cho Statistics API (Admin)
// Import middleware xác thực
const authenticateToken = require('./middleware/auth'); 

const app = express();
const PORT = 5000;
// Khóa bí mật (Secret Key) dùng để ký (sign) JWT.
// Đây là nơi duy nhất SECRET được định nghĩa
const JWT_SECRET = 'HhGg78@!kYpQzXcVbNmL1o2P3oI4U5yT6rE7wQ8aZ9sX0cVkGjH'; 

// ****************************
// ******** MIDDLEWARE ********
// ****************************

// Session middleware cho OAuth2
app.use(session({
    secret: JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set true nếu dùng HTTPS
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware giúp Express đọc dữ liệu JSON
app.use(express.json());
// Phục vụ file tĩnh trong thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// 2. Tạo một "Connection Pool" (Bể kết nối)
const pool = mysql.createPool({
    host: 'localhost',      
    user: 'root',           
    password: '',           
    database: 'tttn2025'  
});

// LƯU POOL VÀ SECRET VÀO app.locals để các Router con truy cập
app.locals.pool = pool;
app.locals.JWT_SECRET = JWT_SECRET;
app.locals.jwt = jwt; // <--- ĐÃ THÊM: Lưu trữ đối tượng jwt vào app.locals
app.locals.app = app; // Cho OAuth routes truy cập app


// ****************************
// ***** AUTH MIDDLEWARE ******
// ****************************
// Middleware authenticateToken đã được import từ ./middleware/auth

// --- ÁNH XẠ CÁC ROUTE ĐÃ TÁCH ---

// API Endpoints cho Homepage (GET /)
app.get('/', (req, res) => {
    console.log('Yêu cầu GET: /');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Điều hướng các trang tĩnh dạng *.html tới SPA kèm tham số page
const htmlPageRoutes = new Set([
    'home', 'products', 'categories',
    'phone-tablet', 'phone', 'tablet', 'phone-accessories',
    'laptop', 'audio', 'watch-camera', 'accessories',
    'pc-monitor-printer', 'pc', 'monitor', 'printer', 'pc-parts',
    'promotions', 'tech-news', 'cart', 'orders', 'profile',
    'news-detail', 'news-details'
]);

app.get('/:page.html', (req, res, next) => {
    const page = req.params.page;
    if (htmlPageRoutes.has(page)) {
        const target = page === 'home' ? '/' : `/?page=${page}`;
        return res.redirect(target);
    }
    next();
});

// Comments cho sản phẩm - Đăng ký TRƯỚC authRouter để tránh bị chặn
app.use('/api/comments', (req, res, next) => {
    console.log(`[COMMENTS] ${req.method} ${req.originalUrl || req.path}`);
    next();
}, commentsRouter);
console.log('✓ Comments router đã được đăng ký tại /api/comments');

// Gắn router xác thực vào đường dẫn /api (chứa /register và /login)
app.use('/api', authRouter);
// Gắn router OAuth2 vào đường dẫn /api/auth
app.use('/api/auth', oauthRouter);

// Gắn router sản phẩm vào đường dẫn /api/products (chứa CRUD)
app.use('/api/products', productRouter);

// Gắn router giỏ hàng vào đường dẫn /api/cart
// Lưu ý: authenticateToken đã được thêm vào từng route trong cart.js
app.use('/api/cart', cartRouter);

// Gắn router đơn hàng vào đường dẫn /api/orders
// Lưu ý: authenticateToken đã được thêm vào từng route trong orders.js
app.use('/api/orders', orderRouter);

// Gắn router categories vào đường dẫn /api/categories
// Lưu ý: Một số route công khai (GET), một số cần admin (POST, PUT, DELETE)
app.use('/api/categories', categoriesRouter);
// Tin công nghệ
app.use('/api/news', newsRouter);
// Users Management (Admin only)
app.use('/api/users', usersRouter);
// Statistics/Dashboard (Admin only)
app.use('/api/stats', statsRouter);


// 7. Lắng nghe
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
    console.log('--- PUBLIC API ---');
    console.log(`GET Danh sách sản phẩm: http://localhost:${PORT}/api/products`);
    console.log(`POST Đăng ký: http://localhost:${PORT}/api/register`);
    console.log(`POST Đăng nhập: http://localhost:${PORT}/api/login`);
    console.log(`GET OAuth Google: http://localhost:${PORT}/api/auth/google`);
    console.log(`GET OAuth Status: http://localhost:${PORT}/api/auth/status`);
    console.log('\n--- PUBLIC API (Categories) ---');
    console.log(`GET Danh sách categories: http://localhost:${PORT}/api/categories`);
    console.log(`GET Sản phẩm theo category: http://localhost:${PORT}/api/categories/:id`);
    
    console.log('\n--- PRIVATE API (Cần Token) ---');
    console.log(`GET Thông tin user: http://localhost:${PORT}/api/me`);
    console.log(`PUT Cập nhật profile: http://localhost:${PORT}/api/profile`);
    console.log(`PUT Đổi mật khẩu: http://localhost:${PORT}/api/change-password`);
    console.log(`POST Đăng xuất: http://localhost:${PORT}/api/logout`);
    console.log(`GET Giỏ hàng: http://localhost:${PORT}/api/cart`);
    console.log(`POST Thêm vào giỏ: http://localhost:${PORT}/api/cart/items`);
    console.log(`POST Tạo đơn hàng: http://localhost:${PORT}/api/orders`);
    console.log(`GET Danh sách đơn hàng: http://localhost:${PORT}/api/orders`);
    console.log('\n--- ADMIN API (Cần Token Admin) ---');
    console.log(`POST Tạo category: http://localhost:${PORT}/api/categories`);
    console.log(`PUT Cập nhật category: http://localhost:${PORT}/api/categories/:id`);
    console.log(`DELETE Xóa category: http://localhost:${PORT}/api/categories/:id`);
    console.log('\nSử dụng Header "Authorization: Bearer [TOKEN]"');
});
// server.js

// 1. "require" (nhập) thư viện express đã cài đặt
const express = require('express');
// Hỗ trợ làm việc với đường dẫn hệ thống
const path = require('path');
// Nhập thư viện mysql2 và sử dụng bản hỗ trợ "Promises"
const mysql = require('mysql2/promise');
// ***** NHẬP THƯ VIỆN CẦN THIẾT CHO MIDDLEWARE *****
const jwt = require('jsonwebtoken');

// ***** NHẬP CÁC FILE ROUTE ĐÃ TÁCH *****
// Đảm bảo bạn đã tạo thư mục routes/
const authRouter = require('./routes/auth');
const productRouter = require('./routes/product');
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

// Gắn router xác thực vào đường dẫn /api (chứa /register và /login)
app.use('/api', authRouter);

// Gắn router sản phẩm vào đường dẫn /api/products (chứa CRUD)
app.use('/api/products', productRouter);


// 7. Lắng nghe
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
    console.log('--- PUBLIC API ---');
    console.log(`GET Danh sách sản phẩm: http://localhost:${PORT}/api/products`);
    console.log(`POST Đăng ký: http://localhost:${PORT}/api/register`);
    console.log(`POST Đăng nhập: http://localhost:${PORT}/api/login`);
    console.log('\n--- PRIVATE API (Cần Token) ---');
    console.log('Sử dụng Header "Authorization: Bearer [TOKEN]"');
});
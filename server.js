// 1. "require" (nhập) thư viện express đã cài đặt
const express = require('express');
//Nhập thư viện mysql12
const mysql = require('mysql2/promise');

// 2. Khởi tạo một ứng dụng express
const app = express();

// 3. Định nghĩa cổng (port) mà máy chủ sẽ chạy
const PORT = 5000;

//4. Thêm Connection Pool để kết nối MySQL
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tttn2025',
})

// 4. Tạo dữ liệu giả (Fake Data)
const products = [
    {
        id: '1',
        name: 'Laptop Gaming XYZ',
        category: 'laptop',
        price: 30000000,
        description: 'Laptop gaming cấu hình mạnh mẽ'
    },
    {
        id: '2',
        name: 'PC Văn phòng ABC',
        category: 'pc',
        price: 15000000,
        description: 'Máy tính bộ cho công việc văn phòng'
    },
    {
        id: '3',
        name: 'Chuột Logitech Pro',
        category: 'gears',
        price: 1200000,
        description: 'Chuột chơi game không dây'
    },
    {
        id: '4',
        name: 'Màn hình Dell UltraSharp',
        category: 'office-equipment', // Thiết bị văn phòng
        price: 7000000,
        description: 'Màn hình 27 inch 4K'
    }
];


// API Endpoints cho Homepage
//Thêm Async để báo cho Express biết đây là hàm bất đồng bộ
app.get('/', async (req, res) => {
    console.log('Yêu cầu GET: /');
    res.send('Chào mừng bạn đến với API sản phẩm của chúng tôi!');
});

// 5. API Endpoint để LẤY TẤT CẢ SẢN PHẨM (GET /api/products)
// Endpoint này trả về toàn bộ danh sách sản phẩm.
app.get('/api/products', async (req, res) => {
    try {
        console.log('Yêu cầu GET: /api/products');
        //Chờ đợi await kết quả từ DB
        const [rows] = await pool.query('SELECT * FROM products');
        // TRẢ VỀ TOÀN BỘ MẢNG PRODUCTS
        res.json(rows);
    }
    catch (error) {
        console.error('Lỗi khi lấy sản phẩm từ DB:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// 6. API Endpoint để LẤY MỘT SẢN PHẨM theo ID (GET /api/products/:id)
// Endpoint này lấy ID từ URL và tìm sản phẩm tương ứng.
app.get('/api/products/:id', async (req, res) => {
    try {
        //Dùng Prepared Statement để tránh SQL Injection
        const [rows] = await pool.query('SELECT * from products WHERE id = ?', [productId]);

        //Kiểm tra kết quả 
        if (rows.length > 0) {
            res.json(rows[0]); // Trả về sản phẩm đầu tiên (vì ID là duy nhất)
        }

        else {
            // Nếu không tìm thấy, báo lỗi 404 (Not Found)
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
    }
    catch (error) {
        console.error('Lỗi khi lấy sản phẩm từ DB:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});
// 7. Lắng nghe
// Khởi động máy chủ, yêu cầu nó "lắng nghe" các yêu cầu tại cổng PORT
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
    console.log(`Bạn có thể xem API sản phẩm tại http://localhost:${PORT}/api/products`);
});
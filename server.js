// 1. "require" (nhập) thư viện express đã cài đặt
const express = require('express');

// 2. Khởi tạo một ứng dụng express
const app = express();

// 3. Định nghĩa cổng (port) mà máy chủ sẽ chạy
const PORT = 5000;

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

// 5. API Endpoint để LẤY TẤT CẢ SẢN PHẨM (GET /api/products)
// Endpoint này trả về toàn bộ danh sách sản phẩm.
app.get('/api/products', (req, res) => {
    console.log('Yêu cầu GET: /api/products');
    // TRẢ VỀ TOÀN BỘ MẢNG PRODUCTS
    res.json(products);
});

// 6. API Endpoint để LẤY MỘT SẢN PHẨM theo ID (GET /api/products/:id)
// Endpoint này lấy ID từ URL và tìm sản phẩm tương ứng.
app.get('/api/products/:id', (req, res) => {
    // LẤY `id` từ tham số đường dẫn (req.params)
    const productId = req.params.id;
    
    // Tìm sản phẩm trong mảng `products` có id trùng khớp
    const product = products.find(p => p.id === productId);

    if (product) {
        // Nếu tìm thấy, trả về sản phẩm đó
        res.json(product);
    } else {
        // Nếu không tìm thấy, báo lỗi 404 (Not Found)
        res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
});

// 7. Lắng nghe
// Khởi động máy chủ, yêu cầu nó "lắng nghe" các yêu cầu tại cổng PORT
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
    console.log(`Bạn có thể xem API sản phẩm tại http://localhost:${PORT}/api/products`);
});
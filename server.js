// 1. "require" (nhập) thư viện express đã cài đặt
const express = require('express');
// Nhập thư viện mysql2 và sử dụng bản hỗ trợ "Promises"
const mysql = require('mysql2/promise');

const app = express();
const PORT = 5000;

// ****************************
// ******** MIDDLEWARE ********
// ****************************

// QUAN TRỌNG: Middleware giúp Express đọc dữ liệu JSON được gửi từ client trong body của request (req.body)
app.use(express.json()); 

// 2. Tạo một "Connection Pool" (Bể kết nối)
const pool = mysql.createPool({
    host: 'localhost',      // Địa chỉ máy chủ MySQL (thường là 'localhost')
    user: 'root',           // Tên đăng nhập (mặc định của XAMPP là 'root')
    password: '',           // Mật khẩu (mặc định của XAMPP là rỗng)
    database: 'tttn2025'  // Tên database chúng ta đang sử dụng
});

// --- API Endpoints ---

// API Endpoints cho Homepage (GET /)
app.get('/', (req, res) => {
    console.log('Yêu cầu GET: /');
    res.send('<h1>Chào mừng đến với Back-end API (Node.js/Express)</h1><p>Vui lòng truy cập <a href="/api/products">/api/products</a> để xem danh sách sản phẩm.</p>');
});

// 5. API Endpoint để LẤY TẤT CẢ SẢN PHẨM (GET /api/products)
app.get('/api/products', async (req, res) => {
    try {
        console.log('Yêu cầu GET: /api/products');
        // Thực thi câu lệnh SQL
        const [rows] = await pool.query('SELECT * FROM products');
        // Trả về toàn bộ kết quả từ DB
        res.json(rows);
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm từ DB:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi truy vấn sản phẩm' });
    }
});

// 6. API Endpoint để LẤY MỘT SẢN PHẨM theo ID (GET /api/products/:id)
app.get('/api/products/:id', async (req, res) => {
    // KHẮC PHỤC LỖI: Cần lấy productId từ req.params.id
    const productId = req.params.id; 

    try {
        // Dùng Prepared Statement để tránh SQL Injection
        const [rows] = await pool.query('SELECT * from products WHERE id = ?', [productId]);

        // Kiểm tra kết quả 
        if (rows.length > 0) {
            res.json(rows[0]); // Trả về sản phẩm đầu tiên (vì ID là duy nhất)
        } else {
            // Nếu không tìm thấy, báo lỗi 404 (Not Found)
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
    } catch (error) {
        console.error(`Lỗi khi lấy sản phẩm ID ${productId} từ DB:`, error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// Thêm sản phẩm (POST /api/products)
app.post('/api/products', async (req, res) => {
    try {
        // 1. Lấy dữ liệu sản phẩm mới từ body của request
        const { name, category, price, description } = req.body;

        // 2. Kiểm tra dữ liệu cơ bản
        if (!name || !price) {
            return res.status(400).json({ message: 'Tên và giá sản phẩm là bắt buộc' });
        }
        
        // 3. Chuẩn bị câu lệnh SQL
        const sql = 'INSERT INTO products (name, category, price, description) VALUES (?, ?, ?, ?)';

        // 4. Thực thi và truyền mảng giá trị
        const [result] = await pool.query(sql, [name, category, price, description]);
        
        // 5. Trả về thông tin sản phẩm vừa tạo
        res.status(201).json({
            message: 'Thêm sản phẩm thành công',
            id: result.insertId, // ID được tạo tự động từ database
            name,
            category,
            price,
            description
        });

    } catch (error) {
        console.error('Lỗi khi thêm sản phẩm vào DB:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi thêm sản phẩm' });
    }
});

// PUT: Cập nhật sản phẩm (PUT /api/products/:id)
app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID từ URL
        // Lấy data cần cập nhật từ body
        const { name, category, price, description } = req.body;

        // Kiểm tra dữ liệu
        if (!name || !price) {
            // ĐÃ SỬA LỖI CÚ PHÁP Ở ĐÂY: Loại bỏ dấu đóng ngoặc dư thừa
            return res.status(400).json({ message: 'Tên và giá sản phẩm là bắt buộc' });
        }
        
        // 4. Chuẩn bị câu lệnh SQL
        const sql = 'UPDATE products SET name = ?, category = ?, price = ?, description = ? WHERE id = ?';
        
        // 5. Thực thi. Chú ý thứ tự các tham số: [name, category, price, description, id]
        const [result] = await pool.query(sql, [name, category, price, description, id]);

        // 6. Kiểm tra xem có hàng nào được cập nhật không
        if (result.affectedRows > 0) {
            res.json({ message: `Cập nhật sản phẩm ID ${id} thành công!` });
        } else {
            // Nếu không có hàng nào bị ảnh hưởng, tức là không tìm thấy ID
            res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật' });
        }

    } catch (error) {
        console.error('Lỗi khi cập nhật sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// DELETE: Xóa sản phẩm theo ID
app.delete('/api/products/:id', async (req, res) => {
    try {
        // 1. Lấy ID từ URL
        const { id } = req.params;

        // 2. Chuẩn bị câu lệnh SQL
        const sql = 'DELETE FROM products WHERE id = ?';

        // 3. Thực thi
        const [result] = await pool.query(sql, [id]);

        // 4. Kiểm tra xem có hàng nào bị xóa không
        if (result.affectedRows > 0) {
            // Trả về mã 204 (No Content) nếu xóa thành công, không cần trả về body
            res.status(204).json({ message: `Xóa sản phẩm ID ${id} thành công!` });
        } else {
            // Nếu không có hàng nào bị ảnh hưởng, tức là không tìm thấy ID
            res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa' });
        }

    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});


// 7. Lắng nghe
// KHỞI ĐỘNG MÁY CHỦ CHỈ DUY NHẤT MỘT LẦN ở cuối file
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
    console.log(`Kiểm tra API GET: http://localhost:${PORT}/api/products`);
    console.log('Sử dụng Postman/REST Client để kiểm tra POST, PUT, DELETE.');
});
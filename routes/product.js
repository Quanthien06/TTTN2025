// routes/product.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

// API Endpoint để LẤY TẤT CẢ SẢN PHẨM (GET /products) - PUBLIC
router.get('/', async (req, res) => {
    const pool = req.app.locals.pool;

    try {
        console.log('Yêu cầu GET: /api/products');
        const [rows] = await pool.query('SELECT * FROM products');
        
        // Chuyển đổi price từ string sang number (nếu cần)
        const products = rows.map(product => ({
            ...product,
            price: typeof product.price === 'string' ? parseFloat(product.price) : product.price
        }));
        
        res.json(products);
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm từ DB:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi truy vấn sản phẩm' });
    }
});

// Xử lý khi dùng POST thay vì GET cho endpoint GET
router.post('/', (req, res, next) => {
    // Nếu không có token, hướng dẫn dùng GET
    if (!req.headers['authorization']) {
        return res.status(405).json({
            message: 'Phương thức POST không được hỗ trợ cho endpoint này. Vui lòng sử dụng GET để xem danh sách sản phẩm.',
            method: 'GET',
            endpoint: '/api/products',
            note: 'Để thêm sản phẩm, bạn cần dùng POST với header Authorization: Bearer [TOKEN]'
        });
    }
    // Nếu có token, chuyển sang middleware authenticateToken
    next();
}, authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;

    try {
        // Kiểm tra quyền (Chỉ cho phép 'admin' thực hiện thao tác này)
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền thêm sản phẩm' });
        }
        
        const { name, category, price, description } = req.body;
        if (!name || !price) {
            return res.status(400).json({ message: 'Tên và giá sản phẩm là bắt buộc' });
        }
        
        const sql = 'INSERT INTO products (name, category, price, description) VALUES (?, ?, ?, ?)';
        const [result] = await pool.query(sql, [name, category, price, description]);
        
        res.status(201).json({
            message: 'Thêm sản phẩm thành công',
            id: result.insertId, 
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

// API Endpoint để LẤY MỘT SẢN PHẨM theo ID (GET /products/:id) - PUBLIC
router.get('/:id', async (req, res) => {
    const pool = req.app.locals.pool;
    const productId = req.params.id; 

    try {
        const [rows] = await pool.query('SELECT * from products WHERE id = ?', [productId]);
        const product = rows[0];

        if (product) {
            // Chuyển đổi price từ string sang number (nếu cần)
            const formattedProduct = {
                ...product,
                price: typeof product.price === 'string' ? parseFloat(product.price) : product.price
            };
            res.json(formattedProduct); 
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
    } catch (error) {
        console.error(`Lỗi khi lấy sản phẩm ID ${productId} từ DB:`, error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});


// PUT: Cập nhật sản phẩm (PUT /products/:id) - PRIVATE (BẮT BUỘC CÓ TOKEN)
router.put('/:id', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;

    try {
        // Kiểm tra quyền
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền cập nhật sản phẩm' });
        }
        
        const { id } = req.params; 
        const { name, category, price, description } = req.body;

        if (!name || !price) {
            return res.status(400).json({ message: 'Tên và giá sản phẩm là bắt buộc' });
        }
        
        const sql = 'UPDATE products SET name = ?, category = ?, price = ?, description = ? WHERE id = ?';
        const [result] = await pool.query(sql, [name, category, price, description, id]);

        if (result.affectedRows > 0) {
            res.json({ message: `Cập nhật sản phẩm ID ${id} thành công!` });
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật' });
        }

    } catch (error) {
        console.error('Lỗi khi cập nhật sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// DELETE: Xóa sản phẩm theo ID - PRIVATE (BẮT BUỘC CÓ TOKEN)
router.delete('/:id', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;

    try {
        // Kiểm tra quyền
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền xóa sản phẩm' });
        }
        
        const { id } = req.params;
        const sql = 'DELETE FROM products WHERE id = ?';
        const [result] = await pool.query(sql, [id]);

        if (result.affectedRows > 0) {
            res.status(204).json({ message: `Xóa sản phẩm ID ${id} thành công!` });
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa' });
        }

    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

module.exports = router;
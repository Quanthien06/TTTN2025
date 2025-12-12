// routes/product.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

// API Endpoint để LẤY TẤT CẢ SẢN PHẨM (GET /products) - PUBLIC
// Hỗ trợ: Search, Filter, Sort, Pagination
// Query parameters:
//   - q: Tìm kiếm theo keyword (tìm trong name, description, category)
//   - category: Lọc theo danh mục
//   - minPrice: Giá tối thiểu
//   - maxPrice: Giá tối đa
//   - sort: Sắp xếp theo field (id, name, price, created_at)
//   - order: Thứ tự sắp xếp (asc, desc)
//   - page: Số trang (mặc định: 1)
//   - limit: Số sản phẩm mỗi trang (mặc định: 20)
router.get('/', async (req, res) => {
    const pool = req.app.locals.pool;

    try {
        // Lấy tất cả query parameters từ URL
        // Ví dụ: /api/products?q=laptop&category=laptop&minPrice=1000000&maxPrice=5000000&sort=price&order=asc&page=1&limit=10
        const {
            q,              // search keyword - từ khóa tìm kiếm
            category,       // filter by category - lọc theo danh mục
            minPrice,       // filter min price - giá tối thiểu
            maxPrice,       // filter max price - giá tối đa
            sort = 'id',    // sort field - trường để sắp xếp (mặc định: id)
            order = 'asc',  // sort order - thứ tự sắp xếp (mặc định: tăng dần)
            page = 1,       // page number - số trang (mặc định: 1)
            limit = 20      // items per page - số sản phẩm mỗi trang (mặc định: 20)
        } = req.query;

        // Validate và chuyển đổi page và limit sang số nguyên
        // parseInt() chuyển string sang số, nếu không hợp lệ thì dùng giá trị mặc định
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        // Tính toán offset (số bản ghi bỏ qua) cho phân trang
        // Ví dụ: page 2, limit 10 => offset = (2-1) * 10 = 10 (bỏ qua 10 bản ghi đầu)
        const offset = (pageNum - 1) * limitNum;

        // Validate sort field - chỉ cho phép sắp xếp theo các trường hợp lệ
        const validSortFields = ['id', 'name', 'price', 'created_at'];
        // Kiểm tra sort field có trong danh sách hợp lệ không, nếu không thì dùng 'id'
        const sortField = validSortFields.includes(sort) ? sort : 'id';

        // Validate order - chỉ cho phép 'asc' hoặc 'desc'
        // Nếu không phải 'desc' thì mặc định là 'asc'
        const sortOrder = (order.toLowerCase() === 'desc') ? 'DESC' : 'ASC';

        // Xây dựng WHERE clause (điều kiện lọc) và danh sách tham số
        // whereConditions: mảng chứa các điều kiện WHERE
        // queryParams: mảng chứa các giá trị để bind vào SQL query (tránh SQL injection)
        let whereConditions = [];
        let queryParams = [];

        // Tìm kiếm theo keyword (q)
        // Tìm trong 3 trường: name, description, category
        if (q && q.trim() !== '') {
            // LIKE với % để tìm kiếm một phần (partial match)
            // Ví dụ: q = "laptop" sẽ tìm "MacBook Laptop", "Laptop Gaming", v.v.
            whereConditions.push('(name LIKE ? OR description LIKE ? OR category LIKE ?)');
            const searchTerm = `%${q.trim()}%`; // Thêm % ở đầu và cuối để tìm kiếm một phần
            // Thêm 3 lần searchTerm vì có 3 điều kiện OR
            queryParams.push(searchTerm, searchTerm, searchTerm);
        }

        // Lọc theo category - chỉ lấy sản phẩm thuộc category cụ thể
        if (category && category.trim() !== '') {
            whereConditions.push('category = ?');
            queryParams.push(category.trim());
        }

        // Lọc theo giá tối thiểu (minPrice)
        if (minPrice) {
            const min = parseFloat(minPrice); // Chuyển sang số thực
            // Kiểm tra giá trị hợp lệ (không phải NaN)
            if (!isNaN(min)) {
                whereConditions.push('price >= ?');
                queryParams.push(min);
            }
        }

        // Lọc theo giá tối đa (maxPrice)
        if (maxPrice) {
            const max = parseFloat(maxPrice);
            if (!isNaN(max)) {
                whereConditions.push('price <= ?');
                queryParams.push(max);
            }
        }

        // Ghép các điều kiện WHERE lại với nhau bằng AND
        // Nếu có điều kiện thì tạo WHERE clause, nếu không thì để rỗng
        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}` 
            : '';

        // Query để đếm tổng số sản phẩm (cần cho pagination)
        // COUNT(*) đếm tất cả các bản ghi thỏa mãn điều kiện
        const countQuery = `SELECT COUNT(*) as total FROM products ${whereClause}`;
        const [countRows] = await pool.query(countQuery, queryParams);
        const total = countRows[0].total; // Tổng số sản phẩm

        // Query để lấy danh sách sản phẩm với phân trang
        // ORDER BY: Sắp xếp theo sortField và sortOrder
        // LIMIT: Giới hạn số lượng bản ghi trả về
        // OFFSET: Bỏ qua số bản ghi đầu tiên (cho phân trang)
        const dataQuery = `
            SELECT * FROM products 
            ${whereClause}
            ORDER BY ${sortField} ${sortOrder}
            LIMIT ? OFFSET ?
        `;
        // Thêm limit và offset vào cuối danh sách tham số
        queryParams.push(limitNum, offset);

        // Thực hiện query để lấy danh sách sản phẩm
        const [rows] = await pool.query(dataQuery, queryParams);

        // Format sản phẩm - chuyển đổi price từ string sang number
        const products = rows.map(product => ({
            ...product,
            price: typeof product.price === 'string' ? parseFloat(product.price) : product.price
        }));

        // Tính toán thông tin phân trang
        const totalPages = Math.ceil(total / limitNum); // Tổng số trang

        // Trả về kết quả bao gồm:
        // - products: Danh sách sản phẩm
        // - pagination: Thông tin phân trang
        res.json({
            products,
            pagination: {
                page: pageNum,          // Trang hiện tại
                limit: limitNum,        // Số sản phẩm mỗi trang
                total,                  // Tổng số sản phẩm
                totalPages              // Tổng số trang
            }
        });

    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
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

// API Endpoint để LẤY MỘT SẢN PHẨM theo SLUG (GET /products/by-slug/:slug) - PUBLIC
router.get('/by-slug/:slug', async (req, res) => {
    const pool = req.app.locals.pool;
    const slug = req.params.slug;

    try {
        // Tìm sản phẩm theo slug
        const [rows] = await pool.query('SELECT * FROM products WHERE slug = ?', [slug]);
        const product = rows[0];

        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        // Parse images JSON nếu có
        let images = [];
        if (product.images) {
            try {
                images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
            } catch (e) {
                images = [];
            }
        }

        // Format sản phẩm
        const formattedProduct = {
            ...product,
            price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
            original_price: product.original_price ? (typeof product.original_price === 'string' ? parseFloat(product.original_price) : product.original_price) : null,
            images: images
        };

        res.json(formattedProduct);
    } catch (error) {
        console.error(`Lỗi khi lấy sản phẩm theo slug ${slug}:`, error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// API Endpoint để LẤY MỘT SẢN PHẨM theo ID (GET /products/:id) - PUBLIC
// Lưu ý: Route này phải đặt SAU /by-slug/:slug để tránh conflict
router.get('/:id', async (req, res) => {
    const pool = req.app.locals.pool;
    const productId = req.params.id; 

    // Kiểm tra nếu là "by-slug" thì không xử lý ở đây (đã được xử lý ở route trên)
    if (productId === 'by-slug') {
        return;
    }

    try {
        const [rows] = await pool.query('SELECT * from products WHERE id = ?', [productId]);
        const product = rows[0];

        if (product) {
            // Parse images JSON nếu có
            let images = [];
            if (product.images) {
                try {
                    images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                } catch (e) {
                    images = [];
                }
            }

            // Chuyển đổi price từ string sang number (nếu cần)
            const formattedProduct = {
                ...product,
                price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
                original_price: product.original_price ? (typeof product.original_price === 'string' ? parseFloat(product.original_price) : product.original_price) : null,
                images: images
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
// services/product-service/routes/products.js
// Routes cho Products

const express = require('express');
const router = express.Router();

// GET /products - Lấy danh sách sản phẩm (với search, filter, sort, pagination)
router.get('/', async (req, res) => {
    const pool = req.app.locals.pool;

    try {
        const {
            q, category, minPrice, maxPrice,
            sort = 'id', order = 'asc',
            page = 1, limit = 20
        } = req.query;

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const offset = (pageNum - 1) * limitNum;

        const validSortFields = ['id', 'name', 'price', 'created_at'];
        const sortField = validSortFields.includes(sort) ? sort : 'id';
        const sortOrder = (order.toLowerCase() === 'desc') ? 'DESC' : 'ASC';

        let whereConditions = [];
        let queryParams = [];

        if (q && q.trim() !== '') {
            // Tìm theo slug chính xác trước, nếu không thì tìm trong name, description, category
            whereConditions.push('(slug = ? OR name LIKE ? OR description LIKE ? OR category LIKE ?)');
            const searchTerm = `%${q.trim()}%`;
            queryParams.push(q.trim(), searchTerm, searchTerm, searchTerm);
        }

        if (category && category.trim() !== '') {
            whereConditions.push('category = ?');
            queryParams.push(category.trim());
        }

        if (minPrice) {
            const min = parseFloat(minPrice);
            if (!isNaN(min)) {
                whereConditions.push('price >= ?');
                queryParams.push(min);
            }
        }

        if (maxPrice) {
            const max = parseFloat(maxPrice);
            if (!isNaN(max)) {
                whereConditions.push('price <= ?');
                queryParams.push(max);
            }
        }

        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}` 
            : '';

        const countQuery = `SELECT COUNT(*) as total FROM products ${whereClause}`;
        const [countRows] = await pool.query(countQuery, queryParams);
        const total = countRows[0].total;

        const dataQuery = `
            SELECT * FROM products 
            ${whereClause}
            ORDER BY ${sortField} ${sortOrder}
            LIMIT ? OFFSET ?
        `;
        queryParams.push(limitNum, offset);

        const [rows] = await pool.query(dataQuery, queryParams);

        const products = rows.map(product => ({
            ...product,
            price: typeof product.price === 'string' ? parseFloat(product.price) : product.price
        }));

        const totalPages = Math.ceil(total / limitNum);

        res.json({
            products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages
            }
        });

    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// GET /products/by-slug/:slug - Chi tiết sản phẩm theo slug
router.get('/by-slug/:slug', async (req, res) => {
    const pool = req.app.locals.pool;
    const slug = req.params.slug;

    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE slug = ?', [slug]);
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

            res.json({
                ...product,
                price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
                original_price: product.original_price ? (typeof product.original_price === 'string' ? parseFloat(product.original_price) : product.original_price) : null,
                images: images
            });
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm theo slug:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// GET /products/:id - Chi tiết sản phẩm
router.get('/:id', async (req, res) => {
    const pool = req.app.locals.pool;
    const productId = req.params.id;

    // Kiểm tra nếu là "by-slug" thì không xử lý ở đây
    if (productId === 'by-slug') {
        return;
    }

    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
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

            res.json({
                ...product,
                price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
                original_price: product.original_price ? (typeof product.original_price === 'string' ? parseFloat(product.original_price) : product.original_price) : null,
                images: images
            });
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// POST /products - Thêm sản phẩm (admin only)
router.post('/', (req, res, next) => {
    return req.app.locals.verifyAdmin(req, res, next);
}, async (req, res) => {
    const pool = req.app.locals.pool;

    try {
        const { name, category, price, description } = req.body;
        if (!name || !price) {
            return res.status(400).json({ message: 'Tên và giá sản phẩm là bắt buộc' });
        }

        const sql = 'INSERT INTO products (name, category, price, description) VALUES (?, ?, ?, ?)';
        const [result] = await pool.query(sql, [name, category, price, description]);

        res.status(201).json({
            message: 'Thêm sản phẩm thành công',
            id: result.insertId,
            name, category, price, description
        });
    } catch (error) {
        console.error('Lỗi khi thêm sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// PUT /products/:id - Cập nhật sản phẩm (admin only)
router.put('/:id', (req, res, next) => {
    return req.app.locals.verifyAdmin(req, res, next);
}, async (req, res) => {
    const pool = req.app.locals.pool;

    try {
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

// DELETE /products/:id - Xóa sản phẩm (admin only)
router.delete('/:id', (req, res, next) => {
    return req.app.locals.verifyAdmin(req, res, next);
}, async (req, res) => {
    const pool = req.app.locals.pool;

    try {
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


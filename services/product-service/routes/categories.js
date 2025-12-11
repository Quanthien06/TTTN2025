// services/product-service/routes/categories.js
// Routes cho Categories (sao chép từ routes/categories.js)

const express = require('express');
const router = express.Router();

// GET /categories - Lấy danh sách categories từ products
router.get('/', async (req, res) => {
    const pool = req.app.locals.pool;

    try {
        // Lấy các category unique từ bảng products với số lượng sản phẩm
        const [rows] = await pool.query(
            `SELECT 
                category as name,
                COUNT(*) as product_count
            FROM products
            WHERE category IS NOT NULL AND category != ''
            GROUP BY category
            ORDER BY category ASC`
        );

        // Map category names với icons và route
        const categoryConfig = {
            'Điện thoại, Tablet': { icon: '📱', route: 'phone-tablet' },
            'Laptop': { icon: '💻', route: 'laptop' },
            'Âm thanh, Mic thu âm': { icon: '🎵', route: 'audio' },
            'Đồng hồ, Camera': { icon: '📷', route: 'watch-camera' },
            'Phụ kiện': { icon: '🔌', route: 'accessories' },
            'PC, Màn hình, Máy in': { icon: '🖥️', route: 'pc-monitor-printer' }
        };

        const categories = rows.map((row, index) => {
            const config = categoryConfig[row.name] || { icon: '📦', route: 'products' };
            return {
                id: index + 1,
                name: row.name,
                slug: config.route,
                product_count: parseInt(row.product_count || 0),
                icon: config.icon,
                route: config.route
            };
        });

        res.json({ categories });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách categories:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// GET /categories/:id - Lấy sản phẩm theo category
router.get('/:id', async (req, res) => {
    const pool = req.app.locals.pool;
    const categoryId = req.params.id;

    try {
        const [categories] = await pool.query(
            'SELECT * FROM categories WHERE id = ?',
            [categoryId]
        );

        if (categories.length === 0) {
            return res.status(404).json({ message: 'Danh mục không tồn tại' });
        }

        const category = categories[0];
        const [products] = await pool.query(
            'SELECT * FROM products WHERE category = ?',
            [category.name]
        );

        const formattedProducts = products.map(product => ({
            ...product,
            price: typeof product.price === 'string' ? parseFloat(product.price) : product.price
        }));

        res.json({
            category,
            products: formattedProducts,
            count: products.length
        });
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm theo category:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// POST /categories - Tạo category (admin only)
router.post('/', (req, res, next) => {
    return req.app.locals.verifyAdmin(req, res, next);
}, async (req, res) => {
    const pool = req.app.locals.pool;

    try {
        const { name, slug, description } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Tên danh mục là bắt buộc' });
        }

        let categorySlug = slug || name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const [result] = await pool.query(
            'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
            [name.trim(), categorySlug, description || null]
        );

        const [newCategory] = await pool.query(
            'SELECT * FROM categories WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            message: 'Tạo danh mục thành công',
            category: newCategory[0]
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Slug đã tồn tại' });
        }
        console.error('Lỗi khi tạo category:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// PUT /categories/:id - Cập nhật category (admin only)
router.put('/:id', (req, res, next) => {
    return req.app.locals.verifyAdmin(req, res, next);
}, async (req, res) => {
    const pool = req.app.locals.pool;
    const categoryId = req.params.id;

    try {
        const { name, slug, description } = req.body;

        const [categories] = await pool.query(
            'SELECT * FROM categories WHERE id = ?',
            [categoryId]
        );

        if (categories.length === 0) {
            return res.status(404).json({ message: 'Danh mục không tồn tại' });
        }

        let updateFields = [];
        let updateParams = [];

        if (name !== undefined) {
            updateFields.push('name = ?');
            updateParams.push(name.trim());
        }

        if (slug !== undefined) {
            updateFields.push('slug = ?');
            updateParams.push(slug.trim());
        }

        if (description !== undefined) {
            updateFields.push('description = ?');
            updateParams.push(description);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'Không có thông tin để cập nhật' });
        }

        updateParams.push(categoryId);

        await pool.query(
            `UPDATE categories SET ${updateFields.join(', ')} WHERE id = ?`,
            updateParams
        );

        const [updatedCategory] = await pool.query(
            'SELECT * FROM categories WHERE id = ?',
            [categoryId]
        );

        res.json({
            message: 'Cập nhật danh mục thành công',
            category: updatedCategory[0]
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Slug đã tồn tại' });
        }
        console.error('Lỗi khi cập nhật category:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// DELETE /categories/:id - Xóa category (admin only)
router.delete('/:id', (req, res, next) => {
    return req.app.locals.verifyAdmin(req, res, next);
}, async (req, res) => {
    const pool = req.app.locals.pool;
    const categoryId = req.params.id;

    try {
        const [categories] = await pool.query(
            'SELECT * FROM categories WHERE id = ?',
            [categoryId]
        );

        if (categories.length === 0) {
            return res.status(404).json({ message: 'Danh mục không tồn tại' });
        }

        await pool.query('DELETE FROM categories WHERE id = ?', [categoryId]);
        res.json({ message: 'Xóa danh mục thành công' });
    } catch (error) {
        console.error('Lỗi khi xóa category:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

module.exports = router;


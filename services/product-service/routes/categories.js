// services/product-service/routes/categories.js
// Routes cho Categories (sao chép từ routes/categories.js)

const express = require('express');
const router = express.Router();

// GET /categories - Lấy danh sách categories chính theo navigation
router.get('/', async (req, res) => {
    const pool = req.app.locals.pool;

    try {
        // Danh sách các category chính theo navigation (chỉ lấy các mục này)
        const mainCategories = [
            { name: 'Điện thoại, Tablet', icon: '📱', route: 'phone-tablet' },
            { name: 'Laptop', icon: '💻', route: 'laptop' },
            { name: 'Âm thanh, Mic thu âm', icon: '🎵', route: 'audio' },
            { name: 'Đồng hồ, Camera', icon: '📷', route: 'watch-camera' },
            { name: 'Phụ kiện', icon: '🔌', route: 'accessories' },
            { name: 'PC, Màn hình, Máy in', icon: '🖥️', route: 'pc-monitor-printer' }
        ];

        // Lấy số lượng sản phẩm cho từng category chính
        const categories = await Promise.all(
            mainCategories.map(async (mainCat) => {
                // Đếm số sản phẩm thuộc category này
                // Lưu ý: products.category có thể chứa tên category chính hoặc sub-category
                const categoryNames = [mainCat.name];
                
                // Thêm các sub-category nếu có
                if (mainCat.name === 'Điện thoại, Tablet') {
                    categoryNames.push('Điện thoại', 'Tablet', 'Phụ kiện điện thoại');
                } else if (mainCat.name === 'PC, Màn hình, Máy in') {
                    categoryNames.push('PC', 'Màn hình', 'Máy in', 'Máy tính để bàn', 'Linh kiện PC');
                } else if (mainCat.name === 'Laptop') {
                    categoryNames.push('Laptop Apple', 'Laptop Asus', 'Laptop Dell', 'Laptop Gaming', 'Laptop HP', 'Laptop Lenovo', 'Laptop Văn phòng');
                }

                // Tạo placeholders cho IN clause
                const placeholders = categoryNames.map(() => '?').join(',');
                const [productCountRows] = await pool.query(
                    `SELECT COUNT(*) as count FROM products WHERE category IN (${placeholders})`,
                    categoryNames
                );

                const product_count = parseInt(productCountRows[0]?.count || 0);

                return {
                    id: mainCategories.indexOf(mainCat) + 1,
                    name: mainCat.name,
                    slug: mainCat.route,
                    product_count: product_count,
                    icon: mainCat.icon,
                    route: mainCat.route
                };
            })
        );

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


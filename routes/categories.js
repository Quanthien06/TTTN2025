// routes/categories.js
// Router xử lý các API liên quan đến Categories (Danh mục sản phẩm)

const express = require('express');
const router = express.Router();
// Import middleware authenticateToken để bảo vệ các route cần đăng nhập
const authenticateToken = require('../middleware/auth');

// ============================================
// GET /api/categories - Lấy danh sách tất cả danh mục
// Endpoint công khai, không cần đăng nhập
// ============================================
router.get('/', async (req, res) => {
    const pool = req.app.locals.pool;

    try {
        // Query lấy danh sách categories kèm số lượng sản phẩm mỗi danh mục
        // LEFT JOIN: Lấy tất cả categories, kể cả không có sản phẩm
        // COUNT(p.id): Đếm số sản phẩm trong mỗi category
        // GROUP BY: Nhóm theo category id để tính toán COUNT
        const [rows] = await pool.query(
            `SELECT 
                c.*,
                COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON p.category = c.name
            GROUP BY c.id
            ORDER BY c.name ASC`
        );

        // Format dữ liệu - chuyển product_count sang số nguyên
        const categories = rows.map(cat => ({
            ...cat,
            product_count: parseInt(cat.product_count || 0)
        }));

        // Trả về danh sách categories
        res.json({ categories });

    } catch (error) {
        console.error('Lỗi khi lấy danh sách categories:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// ============================================
// GET /api/categories/:id - Lấy sản phẩm theo danh mục
// Endpoint công khai, không cần đăng nhập
// Trả về: Thông tin category + danh sách sản phẩm thuộc category đó
// ============================================
router.get('/:id', async (req, res) => {
    const pool = req.app.locals.pool;
    // Lấy category ID từ URL params
    const categoryId = req.params.id;

    try {
        // Kiểm tra category có tồn tại không
        const [categories] = await pool.query(
            'SELECT * FROM categories WHERE id = ?',
            [categoryId]
        );

        // Nếu không tìm thấy, trả về 404
        if (categories.length === 0) {
            return res.status(404).json({ message: 'Danh mục không tồn tại' });
        }

        const category = categories[0];

        // Lấy tất cả sản phẩm thuộc category này
        // So sánh category name (vì products.category lưu tên category, không phải ID)
        const [products] = await pool.query(
            'SELECT * FROM products WHERE category = ?',
            [category.name]
        );

        // Format price từ string sang number
        const formattedProducts = products.map(product => ({
            ...product,
            price: typeof product.price === 'string' ? parseFloat(product.price) : product.price
        }));

        // Trả về category info + danh sách sản phẩm
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

// ============================================
// POST /api/categories - Tạo danh mục mới
// Chỉ admin mới có quyền tạo category
// Body: { name, slug (optional), description (optional) }
// ============================================
router.post('/', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;

    try {
        // Kiểm tra quyền admin - chỉ admin mới được tạo category
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Chỉ admin mới có quyền tạo danh mục' });
        }

        // Lấy dữ liệu từ request body
        const { name, slug, description } = req.body;

        // Validation: Tên danh mục là bắt buộc
        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Tên danh mục là bắt buộc' });
        }

        // Tự động generate slug nếu không được cung cấp
        // Slug là URL-friendly version của name
        // Ví dụ: "Laptop Gaming" => "laptop-gaming"
        let categorySlug = slug;
        if (!categorySlug || categorySlug.trim() === '') {
            // Chuyển về chữ thường, thay khoảng trắng và ký tự đặc biệt bằng dấu gạch ngang
            categorySlug = name.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')  // Thay ký tự không phải chữ/số bằng '-'
                .replace(/^-+|-+$/g, '');      // Xóa dấu '-' ở đầu và cuối
        }

        // Insert category mới vào database
        const [result] = await pool.query(
            'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
            [name.trim(), categorySlug, description || null]
        );

        // Lấy category vừa tạo để trả về
        const [newCategory] = await pool.query(
            'SELECT * FROM categories WHERE id = ?',
            [result.insertId]
        );

        // Trả về thông báo thành công + thông tin category mới
        res.status(201).json({
            message: 'Tạo danh mục thành công',
            category: newCategory[0]
        });

    } catch (error) {
        // Xử lý lỗi duplicate entry (slug đã tồn tại)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Slug đã tồn tại' });
        }
        console.error('Lỗi khi tạo category:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// ============================================
// PUT /api/categories/:id - Cập nhật danh mục
// Chỉ admin mới có quyền cập nhật category
// Body: { name (optional), slug (optional), description (optional) }
// ============================================
router.put('/:id', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const categoryId = req.params.id;

    try {
        // Kiểm tra quyền admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Chỉ admin mới có quyền cập nhật danh mục' });
        }

        // Lấy dữ liệu cập nhật từ request body (tất cả đều optional)
        const { name, slug, description } = req.body;

        // Kiểm tra category có tồn tại không
        const [categories] = await pool.query(
            'SELECT * FROM categories WHERE id = ?',
            [categoryId]
        );

        if (categories.length === 0) {
            return res.status(404).json({ message: 'Danh mục không tồn tại' });
        }

        // Xây dựng UPDATE query động dựa trên các field được cung cấp
        // Chỉ cập nhật các field có giá trị trong request body
        let updateFields = [];
        let updateParams = [];

        // Nếu có name thì thêm vào update
        if (name !== undefined) {
            updateFields.push('name = ?');
            updateParams.push(name.trim());
        }

        // Nếu có slug thì thêm vào update
        if (slug !== undefined) {
            updateFields.push('slug = ?');
            updateParams.push(slug.trim());
        }

        // Nếu có description thì thêm vào update (có thể là null để xóa description)
        if (description !== undefined) {
            updateFields.push('description = ?');
            updateParams.push(description);
        }

        // Nếu không có field nào để cập nhật, trả về lỗi
        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'Không có thông tin để cập nhật' });
        }

        // Thêm categoryId vào cuối danh sách params cho WHERE clause
        updateParams.push(categoryId);

        // Thực hiện UPDATE query
        await pool.query(
            `UPDATE categories SET ${updateFields.join(', ')} WHERE id = ?`,
            updateParams
        );

        // Lấy category đã cập nhật để trả về
        const [updatedCategory] = await pool.query(
            'SELECT * FROM categories WHERE id = ?',
            [categoryId]
        );

        // Trả về thông báo thành công + category đã cập nhật
        res.json({
            message: 'Cập nhật danh mục thành công',
            category: updatedCategory[0]
        });

    } catch (error) {
        // Xử lý lỗi duplicate entry (slug đã tồn tại)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Slug đã tồn tại' });
        }
        console.error('Lỗi khi cập nhật category:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// ============================================
// DELETE /api/categories/:id - Xóa danh mục
// Chỉ admin mới có quyền xóa category
// Lưu ý: Xóa category sẽ KHÔNG xóa các sản phẩm liên quan
// ============================================
router.delete('/:id', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const categoryId = req.params.id;

    try {
        // Kiểm tra quyền admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Chỉ admin mới có quyền xóa danh mục' });
        }

        // Kiểm tra category có tồn tại không
        const [categories] = await pool.query(
            'SELECT * FROM categories WHERE id = ?',
            [categoryId]
        );

        if (categories.length === 0) {
            return res.status(404).json({ message: 'Danh mục không tồn tại' });
        }

        // Xóa category khỏi database
        await pool.query('DELETE FROM categories WHERE id = ?', [categoryId]);

        // Trả về thông báo thành công
        res.json({ message: 'Xóa danh mục thành công' });

    } catch (error) {
        console.error('Lỗi khi xóa category:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// Export router để sử dụng trong server.js
module.exports = router;


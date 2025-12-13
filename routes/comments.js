// routes/comments.js
// Routes cho Product Comments API

const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

// ============================================
// GET /api/comments/product/:productId - Lấy tất cả comments của một sản phẩm
// Endpoint công khai, không cần đăng nhập
// ============================================
router.get('/product/:productId', async (req, res) => {
    console.log(`[GET] /api/comments/product/${req.params.productId}`);
    const pool = req.app.locals.pool;
    const productId = parseInt(req.params.productId);

    if (isNaN(productId)) {
        return res.status(400).json({ message: 'ID sản phẩm không hợp lệ' });
    }

    try {
        // Lấy tất cả comments của sản phẩm, sắp xếp theo thời gian mới nhất
        const [comments] = await pool.query(
            `SELECT 
                id, 
                product_id, 
                user_id, 
                username, 
                comment, 
                rating, 
                created_at, 
                updated_at
            FROM product_comments 
            WHERE product_id = ? 
            ORDER BY created_at DESC`,
            [productId]
        );

        res.json({
            comments: comments,
            count: comments.length
        });

    } catch (error) {
        console.error('Lỗi khi lấy comments:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// ============================================
// POST /api/comments - Thêm comment mới cho sản phẩm
// Cần đăng nhập (authenticateToken)
// Body: { product_id, comment, rating (optional, 1-5) }
// ============================================
router.post('/', authenticateToken, async (req, res) => {
    console.log('[POST] /api/comments - Body:', { product_id: req.body.product_id, comment: req.body.comment?.substring(0, 50), rating: req.body.rating });
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    const username = req.user.username || 'Người dùng';
    const { product_id, comment, rating = 5 } = req.body;

    // Validation
    if (!product_id) {
        return res.status(400).json({ message: 'ID sản phẩm là bắt buộc' });
    }

    if (!comment || comment.trim() === '') {
        return res.status(400).json({ message: 'Nội dung comment không được để trống' });
    }

    // Validate rating (1-5)
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({ message: 'Đánh giá phải từ 1 đến 5 sao' });
    }

    // Kiểm tra sản phẩm có tồn tại không
    try {
        const [products] = await pool.query('SELECT id FROM products WHERE id = ?', [product_id]);
        if (products.length === 0) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        // Thêm comment vào database
        const [result] = await pool.query(
            `INSERT INTO product_comments (product_id, user_id, username, comment, rating) 
             VALUES (?, ?, ?, ?, ?)`,
            [product_id, userId, username, comment.trim(), ratingNum]
        );

        // Lấy comment vừa tạo để trả về
        const [newComments] = await pool.query(
            'SELECT * FROM product_comments WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            message: 'Thêm comment thành công',
            comment: newComments[0]
        });

    } catch (error) {
        console.error('Lỗi khi thêm comment:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// ============================================
// DELETE /api/comments/:id - Xóa comment (chỉ user sở hữu hoặc admin)
// Cần đăng nhập (authenticateToken)
// ============================================
router.delete('/:id', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    const userRole = req.user.role;
    const commentId = parseInt(req.params.id);

    if (isNaN(commentId)) {
        return res.status(400).json({ message: 'ID comment không hợp lệ' });
    }

    try {
        // Kiểm tra comment có tồn tại không
        const [comments] = await pool.query(
            'SELECT * FROM product_comments WHERE id = ?',
            [commentId]
        );

        if (comments.length === 0) {
            return res.status(404).json({ message: 'Comment không tồn tại' });
        }

        const comment = comments[0];

        // Kiểm tra quyền: chỉ user sở hữu comment hoặc admin mới được xóa
        if (comment.user_id !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền xóa comment này' });
        }

        // Xóa comment
        await pool.query('DELETE FROM product_comments WHERE id = ?', [commentId]);

        res.json({ message: 'Xóa comment thành công' });

    } catch (error) {
        console.error('Lỗi khi xóa comment:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

module.exports = router;


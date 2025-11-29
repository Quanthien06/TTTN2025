const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

// POST /api/orders - Tạo đơn hàng từ cart
router.post('/', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    const { shipping_address, phone } = req.body;

    try {
        // 1. Lấy cart active của user
        const [carts] = await pool.query(
            'SELECT * FROM carts WHERE user_id = ? AND status = ?',
            [userId, 'active']
        );

        if (carts.length === 0) {
            return res.status(404).json({ message: 'Giỏ hàng trống' });
        }

        const cartId = carts[0].id;

        // 2. Lấy items trong cart
        const [cartItems] = await pool.query(
            'SELECT * FROM cart_items WHERE cart_id = ?',
            [cartId]
        );

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng không có sản phẩm' });
        }

        // 3. Tính tổng tiền
        const [totalRows] = await pool.query(
            'SELECT SUM(price * quantity) as total FROM cart_items WHERE cart_id = ?',
            [cartId]
        );
        const total = totalRows[0].total || 0;

        // 4. Tạo đơn hàng
        const [orderResult] = await pool.query(
            'INSERT INTO orders (user_id, total, shipping_address, phone, status) VALUES (?, ?, ?, ?, ?)',
            [userId, total, shipping_address, phone, 'pending']
        );
        const orderId = orderResult.insertId;

        // 5. Tạo order_items từ cart_items
        for (const item of cartItems) {
            await pool.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );
        }

        // 6. Xóa cart_items và đánh dấu cart là completed
        await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
        await pool.query('UPDATE carts SET status = ? WHERE id = ?', ['completed', cartId]);

        // 7. Lấy đơn hàng vừa tạo với items
        const [orders] = await pool.query(
            `SELECT o.*, 
                COUNT(oi.id) as item_count
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.id = ?
            GROUP BY o.id`,
            [orderId]
        );

        const [orderItems] = await pool.query(
            `SELECT oi.*, p.name as product_name, p.category
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?`,
            [orderId]
        );

        res.status(201).json({
            message: 'Đặt hàng thành công',
            order: {
                ...orders[0],
                total: parseFloat(orders[0].total),
                items: orderItems.map(item => ({
                    ...item,
                    price: parseFloat(item.price)
                }))
            }
        });

    } catch (error) {
        console.error('Lỗi khi tạo đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// GET /api/orders - Lấy danh sách đơn hàng (sẽ hoàn thiện sau)
router.get('/', authenticateToken, async (req, res) => {
    // Code sẽ được thêm sau
    res.json({ message: 'GET /api/orders - Đang phát triển' });
});

module.exports = router;
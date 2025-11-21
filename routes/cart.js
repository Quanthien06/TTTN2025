const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');

// Lấy | Tạo Cart Active
async function getOrCreateCart(createPool, userId) {
    const [carts] = await createPool.query(
        'SELECT * FROM carts WHERE user_id = ? AND status = ?',
        [userId, 'active'] // Prepared Statement | Parameterized Queries
    );

    if (carts.length > 0) {
        return carts[0].id; // trả về cart_id nếu đã có cart active
    }

    // trường hợp chưa có cart active, tạo mới
    const [result] = await createPool.query(
        'INSERT INTO carts (user_id, status) VALUES (?, ?)',
        [userId, 'active']
    );
    return result.insertId; // trả về cart_id mới tạo
}

// GET api/cart - Lấy giỏ hàng active của người dùng
router.get('/', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;

    try {
        const cartId = await getOrCreateCart(pool, userId);

        // Lấy cart
        const [cartRows] = await pool.query(
            'SELECT * FROM carts WHERE id = ?',
            [cartId]
        );
        const cart = cartRows[0] || { id: cartId, user_id: userId, status: 'active' };

        // Lấy items trong cart | Show thông tin sản phẩm
        const [items] = await pool.query(
            `SELECT 
                ci.id,
                ci.cart_id,
                ci.product_id,
                ci.quantity,
                ci.price,
                ci.created_at,
                ci.updated_at,
                p.name as product_name,
                p.category as product_category,
                (ci.price * ci.quantity) as subtotal
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = ?
            ORDER BY ci.created_at DESC`,
            [cartId]
        );

        // Tính tổng tiền trong cart 
        const [totalRows] = await pool.query(
            'SELECT SUM(price * quantity) as total FROM cart_items WHERE cart_id = ?',
            [cartId]
        );

        const total = totalRows[0].total || 0;

        // Format response
        const formattedItems = items.map(item => ({
            ...item,
            price: parseFloat(item.price),
            subtotal: parseFloat(item.subtotal)
        }));

        res.json({
            cart: {
                ...cart,
                items: formattedItems,
                total: parseFloat(total),
                item_count: items.length
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy giỏ hàng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// THÊM SẢN PHẨM VÀO GIỎ HÀNG - POST /api/cart/items
router.post('/items', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    try {
        // Validate input
        if (!productId || quantity == null || quantity <= 0) {
            return res.status(400).json({ message: 'productId và quantity hợp lệ là bắt buộc' });
        }

        // Kiểm tra sản phẩm tồn tại
        const [products] = await pool.query(
            'SELECT * FROM products WHERE id = ?',
            [productId]
        );

        if (products.length === 0) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        const product = products[0];
        const productPrice = parseFloat(product.price);

        // Lấy hoặc tạo cart
        const cartId = await getOrCreateCart(pool, userId);

        // Kiểm tra sản phẩm đã có trong cart chưa
        const [existingItems] = await pool.query(
            'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
            [cartId, productId]
        );

        if (existingItems.length > 0) {
            // Đã có → cộng dồn quantity
            const newQuantity = existingItems[0].quantity + quantity;
            await pool.query(
                'UPDATE cart_items SET quantity = ? WHERE id = ?',
                [newQuantity, existingItems[0].id]
            );

            // Lấy item đã cập nhật
            const [updatedItems] = await pool.query(
                'SELECT * FROM cart_items WHERE id = ?',
                [existingItems[0].id]
            );

            res.json({
                message: 'Đã cập nhật số lượng sản phẩm trong giỏ hàng',
                item: {
                    ...updatedItems[0],
                    price: parseFloat(updatedItems[0].price)
                }
            });
        } else {
            // Chưa có → thêm mới
            const [result] = await pool.query(
                'INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [cartId, productId, quantity, productPrice]
            );

            // Lấy item vừa thêm
            const [newItems] = await pool.query(
                'SELECT * FROM cart_items WHERE id = ?',
                [result.insertId]
            );

            res.status(201).json({
                message: 'Đã thêm sản phẩm vào giỏ hàng',
                item: {
                    ...newItems[0],
                    price: parseFloat(newItems[0].price)
                }
            });
        }
    } catch (error) {
        console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

// Lấy | Tạo Cart Active
async function getOrCreateCart(pool, userId) {
    const [carts] = await pool.query(
        'SELECT * FROM carts WHERE user_id = ? AND status = ?',
        [userId, 'active'] // Prepared Statement | Parameterized Queries
    );

    if (carts.length > 0) {
        return carts[0].id; // trả về cart_id nếu đã có cart active
    }

    // trường hợp chưa có cart active, tạo mới
    const [result] = await pool.query(
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

        const total = (totalRows[0] && totalRows[0].total) ? totalRows[0].total : 0;

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
    // Hỗ trợ cả product_id và productId để tương thích
    const productId = req.body.product_id || req.body.productId;
    const { quantity } = req.body;

    try {
        // Check validate
        if (!productId || quantity == null) {
            return res.status(400).json({ message: 'product_id và quantity hợp lệ là bắt buộc' });
        }

        if (quantity <= 0) {
            return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
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
                'UPDATE cart_items SET quantity = ?, price = ? WHERE id = ?',
                [newQuantity, productPrice, existingItems[0].id]
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

// PUT /api/cart/items/:itemId - Cập nhật số lượng
// ============================================
router.put('/items/:itemId', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    try {
        // Validation
        if (!quantity || quantity <= 0) {
            return res.status(400).json({ 
                message: 'Số lượng phải lớn hơn 0' 
            });
        }
        
        // Kiểm tra item tồn tại và thuộc cart của user
        const [items] = await pool.query(
            `SELECT ci.* FROM cart_items ci
            JOIN carts c ON ci.cart_id = c.id
            WHERE ci.id = ? AND c.user_id = ?`,
            [itemId, userId]
        );
        
        if (items.length === 0) {
            return res.status(404).json({ 
                message: 'Item không tồn tại hoặc không thuộc giỏ hàng của bạn' 
            });
        }
        
        // Cập nhật quantity
        await pool.query(
            'UPDATE cart_items SET quantity = ? WHERE id = ?',
            [quantity, itemId]
        );
        
        // Lấy item đã cập nhật
        const [updatedItems] = await pool.query(
            'SELECT * FROM cart_items WHERE id = ?',
            [itemId]
        );
        
        res.json({
            message: 'Đã cập nhật số lượng',
            item: {
                ...updatedItems[0],
                price: parseFloat(updatedItems[0].price)
            }
        });
        
    } catch (error) {
        console.error('Lỗi khi cập nhật số lượng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// ============================================
// DELETE /api/cart/items/:itemId - Xóa item
// ============================================
router.delete('/items/:itemId', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    const { itemId } = req.params;

    try {
        // Kiểm tra item tồn tại và thuộc cart của user
        const [items] = await pool.query(
            `SELECT ci.* FROM cart_items ci
            JOIN carts c ON ci.cart_id = c.id
            WHERE ci.id = ? AND c.user_id = ?`,
            [itemId, userId]
        );
        
        if (items.length === 0) {
            return res.status(404).json({ 
                message: 'Item không tồn tại hoặc không thuộc giỏ hàng của bạn' 
            });
        }
        
        // Xóa item
        await pool.query('DELETE FROM cart_items WHERE id = ?', [itemId]);
        
        res.json({ 
            message: 'Đã xóa sản phẩm khỏi giỏ hàng' 
        });
        
    } catch (error) {
        console.error('Lỗi khi xóa item:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// ============================================
// DELETE /api/cart - Xóa toàn bộ giỏ hàng
// ============================================
router.delete('/', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;

    try {
        // Tìm cart active của user
        const [carts] = await pool.query(
            'SELECT * FROM carts WHERE user_id = ? AND status = ?',
            [userId, 'active']
        );
        
        if (carts.length === 0) {
            return res.status(404).json({ 
                message: 'Không tìm thấy giỏ hàng' 
            });
        }
        
        const cartId = carts[0].id;
        
        // Xóa tất cả items
        await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
        
        // Xóa cart (hoặc đánh dấu abandoned)
        await pool.query(
            'UPDATE carts SET status = ? WHERE id = ?',
            ['abandoned', cartId]
        );
        
        res.json({ 
            message: 'Đã xóa toàn bộ giỏ hàng' 
        });
        
    } catch (error) {
        console.error('Lỗi khi xóa giỏ hàng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// ============================================
// GET /api/cart/total - Tính tổng tiền (tùy chọn)
// ============================================
router.get('/total', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;

    try {
        // Tìm cart active
        const [carts] = await pool.query(
            'SELECT * FROM carts WHERE user_id = ? AND status = ?',
            [userId, 'active']
        );
        
        if (carts.length === 0) {
            return res.json({ 
                total: 0,
                item_count: 0
            });
        }
        
        const cartId = carts[0].id;
        
        // Tính tổng
        const [totalRows] = await pool.query(
            `SELECT 
                SUM(price * quantity) as total,
                COUNT(*) as item_count
            FROM cart_items 
            WHERE cart_id = ?`,
            [cartId]
        );
        
        res.json({
            total: parseFloat(totalRows[0].total || 0),
            item_count: parseInt(totalRows[0].item_count || 0)
        });
        
    } catch (error) {
        console.error('Lỗi khi tính tổng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

module.exports = router;
    



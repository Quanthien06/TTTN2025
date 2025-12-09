// services/cart-service/routes/cart.js
// Routes cho Cart Service

const express = require('express');
const router = express.Router();

// Helper: Lấy hoặc tạo cart active
async function getOrCreateCart(pool, userId) {
    const [carts] = await pool.query(
        'SELECT * FROM carts WHERE user_id = ? AND status = ?',
        [userId, 'active']
    );

    if (carts.length > 0) {
        return carts[0].id;
    }

    const [result] = await pool.query(
        'INSERT INTO carts (user_id, status) VALUES (?, ?)',
        [userId, 'active']
    );
    return result.insertId;
}

// Tất cả routes cần verify token
router.use((req, res, next) => {
    return req.app.locals.verifyToken(req, res, next);
});

// GET /cart - Lấy giỏ hàng
router.get('/', async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;

    try {
        const cartId = await getOrCreateCart(pool, userId);

        const [cartRows] = await pool.query(
            'SELECT * FROM carts WHERE id = ?',
            [cartId]
        );

        const cart = cartRows[0] || { id: cartId, user_id: userId, status: 'active' };

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
                p.image_url as product_image,
                p.description as product_description,
                p.brand as product_brand,
                (ci.price * ci.quantity) as subtotal
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = ?
            ORDER BY ci.created_at DESC`,
            [cartId]
        );

        const [totalRows] = await pool.query(
            'SELECT SUM(price * quantity) as total FROM cart_items WHERE cart_id = ?',
            [cartId]
        );

        const total = (totalRows[0] && totalRows[0].total) ? totalRows[0].total : 0;

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

// POST /cart/items - Thêm sản phẩm
router.post('/items', async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    const productId = req.body.product_id || req.body.productId;
    const { quantity } = req.body;

    try {
        if (!productId || quantity == null) {
            return res.status(400).json({ message: 'product_id và quantity hợp lệ là bắt buộc' });
        }

        if (quantity <= 0) {
            return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
        }

        const [products] = await pool.query(
            'SELECT * FROM products WHERE id = ?',
            [productId]
        );

        if (products.length === 0) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        const product = products[0];
        const productPrice = parseFloat(product.price);

        const cartId = await getOrCreateCart(pool, userId);
        
        const [existingItems] = await pool.query(
            'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
            [cartId, productId]
        );
        
        if (existingItems.length > 0) {
            const newQuantity = existingItems[0].quantity + quantity;
            await pool.query(
                'UPDATE cart_items SET quantity = ?, price = ? WHERE id = ?',
                [newQuantity, productPrice, existingItems[0].id]
            );
            
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
            const [result] = await pool.query(
                'INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [cartId, productId, quantity, productPrice]
            );
            
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

// PUT /cart/items/:itemId - Cập nhật số lượng
router.put('/items/:itemId', async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    try {
        if (!quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
        }
        
        const [items] = await pool.query(
            `SELECT ci.* FROM cart_items ci
            JOIN carts c ON ci.cart_id = c.id
            WHERE ci.id = ? AND c.user_id = ?`,
            [itemId, userId]
        );
        
        if (items.length === 0) {
            return res.status(404).json({ message: 'Item không tồn tại hoặc không thuộc giỏ hàng của bạn' });
        }
        
        await pool.query(
            'UPDATE cart_items SET quantity = ? WHERE id = ?',
            [quantity, itemId]
        );
        
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

// DELETE /cart/items/:itemId - Xóa item
router.delete('/items/:itemId', async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    const { itemId } = req.params;

    try {
        const [items] = await pool.query(
            `SELECT ci.* FROM cart_items ci
            JOIN carts c ON ci.cart_id = c.id
            WHERE ci.id = ? AND c.user_id = ?`,
            [itemId, userId]
        );
        
        if (items.length === 0) {
            return res.status(404).json({ message: 'Item không tồn tại hoặc không thuộc giỏ hàng của bạn' });
        }
        
        await pool.query('DELETE FROM cart_items WHERE id = ?', [itemId]);
        res.json({ message: 'Đã xóa sản phẩm khỏi giỏ hàng' });
    } catch (error) {
        console.error('Lỗi khi xóa item:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// DELETE /cart - Xóa toàn bộ giỏ hàng
router.delete('/', async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;

    try {
        const [carts] = await pool.query(
            'SELECT * FROM carts WHERE user_id = ? AND status = ?',
            [userId, 'active']
        );
        
        if (carts.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
        }
        
        const cartId = carts[0].id;
        await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
        await pool.query(
            'UPDATE carts SET status = ? WHERE id = ?',
            ['abandoned', cartId]
        );
        
        res.json({ message: 'Đã xóa toàn bộ giỏ hàng' });
    } catch (error) {
        console.error('Lỗi khi xóa giỏ hàng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// GET /cart/total - Tính tổng tiền
router.get('/total', async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;

    try {
        const [carts] = await pool.query(
            'SELECT * FROM carts WHERE user_id = ? AND status = ?',
            [userId, 'active']
        );
        
        if (carts.length === 0) {
            return res.json({ total: 0, item_count: 0 });
        }
        
        const cartId = carts[0].id;
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


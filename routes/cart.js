const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');

// Lấy | Tạo Cart Active

async function getOrCreateCart(createPool, userId) {
    const [carts] = await createPool.query(
        'SELECT * FROM carts WHERE user_id = ? AND status = "?"',
        [userId, 'active'] //Prepared Statement | Parameterized Queries (Truy vấn tham số hóa)
    );

    if(carts.length > 0) {
        return carts[0].id; // trả về car t_id nếu đã có cart active
    }

    //trương hợp chưa có cart active, tạo mới
    const [result] = await createPool.query (
        'INSERT INTO carts (user_id, status) VALUES (?, ?)',
        [userId, 'active']
    );
    return result.insertId; // trả về cart_id mới tạo
}

// GET api/cart - Lấy giỏ hàng active của nguời dùng

router.get('/', autheticationToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;

    try {
        const cartId = await getOrCreateCart(pool, userId);

        //Lấy cart với items
        const [cartRows] = await pool.query(
            'SELECT * FROM carts where id = ?',
            [cartId]
        );

        const  cart = cartRows[0];

        //Lấy items trong cart | Show thông tin sản phẩm
        cons [items] = await pool.query(
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

        

    };
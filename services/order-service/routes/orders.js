// services/order-service/routes/orders.js
// Routes cho Order Service

const express = require('express');
const router = express.Router();
const axios = require('axios');

// Tất cả routes cần verify token
router.use((req, res, next) => {
    return req.app.locals.verifyToken(req, res, next);
});

// POST /orders - Tạo đơn hàng từ cart
router.post('/', async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    const { shipping_address, phone, payment_method, payment_details } = req.body;
    const CART_SERVICE_URL = req.app.locals.CART_SERVICE_URL;

    try {
        // Validate input
        if (!shipping_address || shipping_address.trim() === '') {
            return res.status(400).json({ message: 'Địa chỉ giao hàng là bắt buộc' });
        }

        // 1. Gọi Cart Service để lấy cart items
        let cartData;
        try {
            const cartResponse = await axios.get(`${CART_SERVICE_URL}/cart`, {
                headers: { 'Authorization': req.headers['authorization'] }
            });
            cartData = cartResponse.data.cart;
        } catch (error) {
            if (error.response?.status === 404) {
                return res.status(404).json({ message: 'Giỏ hàng trống' });
            }
            console.error('Lỗi khi gọi Cart Service:', error.message);
            throw error;
        }

        if (!cartData.items || cartData.items.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng không có sản phẩm' });
        }

        // Validate cart items có price
        for (const item of cartData.items) {
            if (!item.price || item.price <= 0) {
                console.error('Cart item missing price:', item);
                return res.status(400).json({ 
                    message: `Sản phẩm "${item.product_id}" không có giá. Vui lòng thử lại.` 
                });
            }
        }

        const total = parseFloat(cartData.total || 0);

        if (total <= 0) {
            return res.status(400).json({ message: 'Tổng tiền đơn hàng không hợp lệ' });
        }

        // 2. Tạo đơn hàng
        // Lưu payment_method vào shipping_address (có thể mở rộng thêm cột payment_method sau)
        const paymentInfo = payment_method ? `\n[Payment Method: ${payment_method}]` : '';
        const fullShippingAddress = shipping_address + paymentInfo;
        
        console.log('Creating order with data:', {
            userId,
            total,
            shipping_address: fullShippingAddress.substring(0, 50),
            phone: phone || null,
            payment_method
        });
        
        const [orderResult] = await pool.query(
            'INSERT INTO orders (user_id, total, shipping_address, shipping_phone, status) VALUES (?, ?, ?, ?, ?)',
            [userId, total, fullShippingAddress, phone || null, 'pending']
        );
        const orderId = orderResult.insertId;

        // 3. Tạo order_items từ cart items
        for (const item of cartData.items) {
            try {
                await pool.query(
                    'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                    [orderId, item.product_id, item.quantity, item.price]
                );
            } catch (itemError) {
                console.error('Lỗi khi thêm order_item:', itemError);
                console.error('Item data:', item);
                throw new Error(`Lỗi khi thêm sản phẩm vào đơn hàng: ${itemError.message}`);
            }
        }

        // 4. Xóa cart items và đánh dấu cart completed (gọi Cart Service)
        try {
            // Lấy cart_id từ cartData hoặc query lại
            const [carts] = await pool.query(
                'SELECT id FROM carts WHERE user_id = ? AND status = ?',
                [userId, 'active']
            );
            if (carts.length > 0) {
                const cartId = carts[0].id;
                
                // Xóa cart_items trực tiếp (vì cùng database)
                await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
                await pool.query('UPDATE carts SET status = ? WHERE id = ?', ['completed', cartId]);
            }
        } catch (error) {
            console.error('Lỗi khi xóa cart:', error);
            // Không fail order nếu xóa cart lỗi
        }

        // 5. Lấy đơn hàng vừa tạo với items
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
        console.error('=== LỖI KHI TẠO ĐƠN HÀNG ===');
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('SQL Message:', error.sqlMessage);
        console.error('SQL State:', error.sqlState);
        console.error('Stack:', error.stack);
        if (error.response) {
            console.error('Axios error response:', error.response.data);
        }
        console.error('Request body:', {
            shipping_address: req.body.shipping_address?.substring(0, 50),
            phone: req.body.phone,
            payment_method: req.body.payment_method,
            userId: userId
        });
        console.error('============================');
        
        // Trả về thông báo lỗi chi tiết hơn trong development
        const errorMessage = process.env.NODE_ENV === 'development' 
            ? `Lỗi máy chủ nội bộ: ${error.message}${error.sqlMessage ? ` (SQL: ${error.sqlMessage})` : ''}`
            : 'Lỗi máy chủ nội bộ';
            
        res.status(500).json({ 
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                code: error.code,
                sqlMessage: error.sqlMessage,
                sqlState: error.sqlState
            } : undefined
        });
    }
});

// GET /orders - Lấy danh sách đơn hàng của user
router.get('/', async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;

    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        const offset = (pageNum - 1) * limitNum;

        const [countRows] = await pool.query(
            'SELECT COUNT(*) as total FROM orders WHERE user_id = ?',
            [userId]
        );
        const totalItems = Number(countRows?.[0]?.total || 0);
        const totalPages = Math.max(1, Math.ceil(totalItems / limitNum));

        const [orders] = await pool.query(
            `SELECT o.*,
                    COUNT(oi.id) as item_count,
                    COALESCE(SUM(oi.quantity), 0) as total_quantity
             FROM orders o
             LEFT JOIN order_items oi ON o.id = oi.order_id
             WHERE o.user_id = ?
             GROUP BY o.id
             ORDER BY o.created_at DESC
             LIMIT ? OFFSET ?`,
            [userId, limitNum, offset]
        );

        const formattedOrders = orders.map(order => ({
            ...order,
            total: parseFloat(order.total),
            item_count: parseInt(order.item_count || 0),
            total_quantity: parseInt(order.total_quantity || 0)
        }));

        res.json({
            orders: formattedOrders,
            count: orders.length,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalItems,
                limit: limitNum
            }
        });

    } catch (error) {
        console.error('Lỗi khi lấy danh sách đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// GET /orders/admin - Lấy danh sách đơn hàng (Admin)
// NOTE: đặt trước /orders/:id để tránh bị match nhầm
router.get('/admin', async (req, res) => {
    const pool = req.app.locals.pool;
    const { page = 1, limit = 20 } = req.query;

    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
        }

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 20));
        const offset = (pageNum - 1) * limitNum;

        const [countRows] = await pool.query('SELECT COUNT(*) as total FROM orders');
        const total = Number(countRows?.[0]?.total || 0);

        // Join users để hiển thị thông tin user trên admin
        const [orders] = await pool.query(
            `SELECT o.*,
                    u.username as user_username,
                    u.email as user_email,
                    COUNT(oi.id) as item_count,
                    COALESCE(SUM(oi.quantity), 0) as total_quantity
             FROM orders o
             LEFT JOIN users u ON o.user_id = u.id
             LEFT JOIN order_items oi ON o.id = oi.order_id
             GROUP BY o.id
             ORDER BY o.created_at DESC
             LIMIT ? OFFSET ?`,
            [limitNum, offset]
        );

        const formattedOrders = orders.map(order => ({
            ...order,
            total: parseFloat(order.total),
            item_count: parseInt(order.item_count || 0),
            total_quantity: parseInt(order.total_quantity || 0),
            user: {
                id: order.user_id,
                username: order.user_username || null,
                email: order.user_email || null
            }
        }));

        res.json({
            orders: formattedOrders,
            total,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalItems: total,
                itemsPerPage: limitNum
            }
        });
    } catch (error) {
        console.error('Lỗi khi admin lấy danh sách đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// GET /orders/admin/:id - Lấy chi tiết đơn hàng (Admin)
// NOTE: đặt trước /orders/:id để tránh bị match nhầm
router.get('/admin/:id', async (req, res) => {
    const pool = req.app.locals.pool;
    const orderId = req.params.id;

    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
        }

        const [orders] = await pool.query(
            `SELECT o.*, u.username as username, u.email as email
             FROM orders o
             LEFT JOIN users u ON o.user_id = u.id
             WHERE o.id = ?`,
            [orderId]
        );

        if (orders.length === 0) {
            return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
        }

        const order = orders[0];

        const [orderItems] = await pool.query(
            `SELECT oi.*, 
                p.name as product_name, 
                p.category,
                (oi.price * oi.quantity) as subtotal
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?`,
            [orderId]
        );

        const formattedItems = orderItems.map(item => ({
            ...item,
            price: parseFloat(item.price),
            subtotal: parseFloat(item.subtotal)
        }));

        res.json({
            order: {
                ...order,
                total: parseFloat(order.total),
                items: formattedItems,
                item_count: formattedItems.length
            }
        });
    } catch (error) {
        console.error('Lỗi khi admin lấy chi tiết đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// GET /orders/:id - Lấy chi tiết đơn hàng
router.get('/:id', async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    const orderId = req.params.id;

    try {
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE id = ? AND user_id = ?',
            [orderId, userId]
        );

        if (orders.length === 0) {
            return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
        }

        const order = orders[0];

        const [orderItems] = await pool.query(
            `SELECT oi.*, 
                p.name as product_name, 
                p.category,
                (oi.price * oi.quantity) as subtotal
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?`,
            [orderId]
        );

        const formattedItems = orderItems.map(item => ({
            ...item,
            price: parseFloat(item.price),
            subtotal: parseFloat(item.subtotal)
        }));

        res.json({
            order: {
                ...order,
                total: parseFloat(order.total),
                items: formattedItems,
                item_count: formattedItems.length
            }
        });

    } catch (error) {
        console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// PUT /orders/:id/status - Cập nhật trạng thái (Admin only)
router.put('/:id/status', async (req, res) => {
    const pool = req.app.locals.pool;
    const orderId = req.params.id;
    const { status } = req.body;

    try {
        // Kiểm tra quyền admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Chỉ admin mới có quyền cập nhật trạng thái đơn hàng' });
        }

        // Validate status
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: 'Trạng thái không hợp lệ',
                valid_statuses: validStatuses
            });
        }

        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE id = ?',
            [orderId]
        );

        if (orders.length === 0) {
            return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
        }

        await pool.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, orderId]
        );

        const [updatedOrders] = await pool.query(
            'SELECT * FROM orders WHERE id = ?',
            [orderId]
        );

        res.json({
            message: 'Đã cập nhật trạng thái đơn hàng',
            order: {
                ...updatedOrders[0],
                total: parseFloat(updatedOrders[0].total)
            }
        });

    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

module.exports = router;


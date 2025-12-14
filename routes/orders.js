const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

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

// POST /api/orders - Tạo đơn hàng từ cart
router.post('/', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    const { shipping_address, phone, payment_method, payment_details } = req.body;

    try {
        // Validate input
        if (!shipping_address || shipping_address.trim() === '') {
            return res.status(400).json({ message: 'Địa chỉ giao hàng là bắt buộc' });
        }

        // 1. Lấy hoặc tạo cart active của user
        const cartId = await getOrCreateCart(pool, userId);

        // 2. Lấy items trong cart
        const [cartItems] = await pool.query(
            'SELECT * FROM cart_items WHERE cart_id = ?',
            [cartId]
        );

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng không có sản phẩm' });
        }

        // Validate cart items có price
        for (const item of cartItems) {
            if (!item.price || item.price <= 0) {
                console.error('Cart item missing price:', item);
                return res.status(400).json({ 
                    message: `Sản phẩm "${item.product_id}" không có giá. Vui lòng thử lại.` 
                });
            }
        }

        // 3. Tính tổng tiền
        const [totalRows] = await pool.query(
            'SELECT SUM(price * quantity) as total FROM cart_items WHERE cart_id = ?',
            [cartId]
        );
        const total = parseFloat(totalRows[0]?.total || 0);

        if (total <= 0) {
            return res.status(400).json({ message: 'Tổng tiền đơn hàng không hợp lệ' });
        }

        // 4. Tạo đơn hàng
        // Lưu payment_method vào shipping_address (có thể mở rộng thêm cột payment_method sau)
        const paymentInfo = payment_method ? `\n[Payment Method: ${payment_method}]` : '';
        const fullShippingAddress = shipping_address + paymentInfo;
        
        console.log('Creating order with data:', {
            userId,
            total,
            shipping_address: fullShippingAddress,
            phone: phone || null,
            payment_method,
            payment_details
        });
        
        const [orderResult] = await pool.query(
            'INSERT INTO orders (user_id, total, shipping_address, shipping_phone, status) VALUES (?, ?, ?, ?, ?)',
            [userId, total, fullShippingAddress, phone || null, 'pending']
        );
        const orderId = orderResult.insertId;

        // Tạo tracking entry đầu tiên: Đơn hàng đã đặt
        try {
            await pool.query(
                'INSERT INTO order_tracking_history (order_id, status, status_label) VALUES (?, ?, ?)',
                [orderId, 'order_placed', 'Đơn hàng đã đặt']
            );
        } catch (error) {
            console.error('Lỗi khi tạo tracking history:', error);
            // Không throw error, chỉ log vì tracking là optional
        }

        // 5. Tạo order_items từ cart_items
        for (const item of cartItems) {
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
        console.error('=== LỖI KHI TẠO ĐƠN HÀNG ===');
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('SQL Message:', error.sqlMessage);
        console.error('SQL State:', error.sqlState);
        console.error('Stack:', error.stack);
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

// GET /api/orders/admin - Lấy tất cả đơn hàng (admin only)
router.get('/admin', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    
    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Chỉ admin mới có quyền xem tất cả đơn hàng' });
    }
    
    const { page = 1, limit = 20, status = '' } = req.query;
    
    try {
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;
        
        let whereClause = '';
        let queryParams = [];
        
        if (status) {
            whereClause = 'WHERE o.status = ?';
            queryParams.push(status);
        }
        
        // Lấy tổng số đơn hàng
        const [countRows] = await pool.query(
            `SELECT COUNT(*) as total FROM orders o ${whereClause}`,
            queryParams
        );
        const total = countRows[0].total;
        
        // Lấy đơn hàng với pagination
        const [orders] = await pool.query(
            `SELECT o.*, 
                u.username,
                COUNT(oi.id) as item_count,
                SUM(oi.quantity) as total_quantity
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            ${whereClause}
            GROUP BY o.id
            ORDER BY o.created_at DESC
            LIMIT ? OFFSET ?`,
            [...queryParams, limitNum, offset]
        );

        const formattedOrders = orders.map(order => ({
            ...order,
            total: parseFloat(order.total),
            item_count: parseInt(order.item_count || 0),
            total_quantity: parseInt(order.total_quantity || 0)
        }));

        res.json({
            orders: formattedOrders,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalItems: total,
                itemsPerPage: limitNum
            }
        });

    } catch (error) {
        console.error('Lỗi khi lấy danh sách đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// GET /api/orders - Lấy danh sách đơn hàng của user
router.get('/', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;

    try {
        const [orders] = await pool.query(
            `SELECT o.*, 
                COUNT(oi.id) as item_count,
                SUM(oi.quantity) as total_quantity
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC`,
            [userId]
        );

        const formattedOrders = orders.map(order => ({
            ...order,
            total: parseFloat(order.total),
            item_count: parseInt(order.item_count || 0),
            total_quantity: parseInt(order.total_quantity || 0)
        }));

        res.json({
            orders: formattedOrders,
            count: orders.length
        });

    } catch (error) {
        console.error('Lỗi khi lấy danh sách đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// GET /api/orders/:id/tracking - Lấy lịch sử tracking của đơn hàng
router.get('/:id/tracking', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    const orderId = parseInt(req.params.id);

    try {
        // Kiểm tra đơn hàng thuộc về user (hoặc admin)
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE id = ?',
            [orderId]
        );

        if (orders.length === 0) {
            return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
        }

        // Nếu không phải admin, chỉ cho phép xem đơn hàng của chính mình
        if (req.user.role !== 'admin' && orders[0].user_id !== userId) {
            return res.status(403).json({ message: 'Bạn không có quyền xem đơn hàng này' });
        }

        // Lấy tracking history
        const [trackingHistory] = await pool.query(
            'SELECT * FROM order_tracking_history WHERE order_id = ? ORDER BY created_at ASC',
            [orderId]
        );

        res.json({
            order_id: orderId,
            tracking: trackingHistory
        });

    } catch (error) {
        console.error('Lỗi khi lấy tracking history:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// GET /api/orders/:id - Lấy chi tiết đơn hàng
router.get('/:id', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    const orderId = req.params.id;
    const isAdmin = req.user.role === 'admin';

    try {
        // Admin có thể xem tất cả đơn hàng, user chỉ xem đơn hàng của mình
        let orders;
        if (isAdmin) {
            [orders] = await pool.query(
                'SELECT o.*, u.username FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?',
                [orderId]
            );
        } else {
            [orders] = await pool.query(
                'SELECT * FROM orders WHERE id = ? AND user_id = ?',
                [orderId, userId]
            );
        }

        if (orders.length === 0) {
            return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
        }

        const order = orders[0];

        // Lấy items
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
            ...order,
            total: parseFloat(order.total),
            items: formattedItems,
            item_count: formattedItems.length
        });

    } catch (error) {
        console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// PUT /api/orders/:id/status - Cập nhật trạng thái đơn hàng (Admin only)
router.put('/:id/status', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
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

        // Kiểm tra đơn hàng tồn tại
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE id = ?',
            [orderId]
        );

        if (orders.length === 0) {
            return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
        }

        // Cập nhật status
        await pool.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, orderId]
        );

        // Ghi lại tracking history
        const statusLabels = {
            'pending': 'Đơn hàng đã đặt',
            'processing': 'Đơn hàng đã thanh toán',
            'shipped': 'Đã giao cho đơn vị vận chuyển',
            'delivered': 'Đã nhận được hàng',
            'cancelled': 'Đơn hàng đã hủy'
        };
        
        const statusKey = status === 'pending' ? 'order_placed' : 
                          status === 'processing' ? 'order_paid' : status;
        
        // Kiểm tra xem tracking đã tồn tại chưa
        const [existingTracking] = await pool.query(
            'SELECT id FROM order_tracking_history WHERE order_id = ? AND status = ?',
            [orderId, statusKey]
        );
        
        if (existingTracking.length === 0) {
            await pool.query(
                'INSERT INTO order_tracking_history (order_id, status, status_label) VALUES (?, ?, ?)',
                [orderId, statusKey, statusLabels[status] || status]
            );
        }

        // Lấy đơn hàng đã cập nhật
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
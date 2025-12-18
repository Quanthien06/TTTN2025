const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

/**
 * GET /api/shipments
 * Lấy danh sách shipments của user (các shipment của đơn hàng của user)
 */
router.get('/', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    try {
        let shipments;

        if (isAdmin) {
            // Admin: lấy tất cả shipments
            [shipments] = await pool.query(
                `SELECT s.*, o.user_id 
                FROM shipments s
                JOIN orders o ON s.order_id = o.id
                ORDER BY s.updated_at DESC
                LIMIT 100`
            );
        } else {
            // User: lấy shipments của đơn hàng của user
            [shipments] = await pool.query(
                `SELECT s.* 
                FROM shipments s
                JOIN orders o ON s.order_id = o.id
                WHERE o.user_id = ?
                ORDER BY s.updated_at DESC`,
                [userId]
            );
        }

        res.json({
            shipments: shipments.map(s => ({
                ...s,
                shipping_cost: parseFloat(s.shipping_cost)
            })),
            count: shipments.length
        });

    } catch (error) {
        console.error('Lỗi khi lấy danh sách shipments:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

/**
 * GET /api/shipments/admin/list
 * Lấy danh sách tất cả shipments với pagination (Admin only)
 */
router.get('/admin/list', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;

    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Chỉ admin mới có quyền xem danh sách' });
    }

    try {
        const { page = 1, limit = 20, status = '', search = '' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;

        let whereClause = '';
        let queryParams = [];

        // Filter by status
        if (status) {
            whereClause += 'WHERE s.status = ?';
            queryParams.push(status);
        }

        // Search by tracking number or order id
        if (search) {
            const searchTerm = `%${search}%`;
            if (whereClause) {
                whereClause += ' AND (s.tracking_number LIKE ? OR s.order_id LIKE ?)';
            } else {
                whereClause = 'WHERE (s.tracking_number LIKE ? OR s.order_id LIKE ?)';
            }
            queryParams.push(searchTerm, searchTerm);
        }

        // Get total count
        const [countRows] = await pool.query(
            `SELECT COUNT(*) as total FROM shipments s ${whereClause}`,
            queryParams
        );
        const total = countRows[0].total;

        // Get shipments with pagination
        const [shipments] = await pool.query(
            `SELECT s.*, o.user_id, o.total as order_total, o.status as order_status, u.username
            FROM shipments s
            JOIN orders o ON s.order_id = o.id
            LEFT JOIN users u ON o.user_id = u.id
            ${whereClause}
            ORDER BY s.updated_at DESC
            LIMIT ? OFFSET ?`,
            [...queryParams, limitNum, offset]
        );

        res.json({
            shipments: shipments.map(s => ({
                ...s,
                shipping_cost: parseFloat(s.shipping_cost),
                order_total: parseFloat(s.order_total)
            })),
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalItems: total,
                itemsPerPage: limitNum
            }
        });

    } catch (error) {
        console.error('Lỗi khi lấy danh sách shipments:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

/**
 * GET /api/shipments/:orderId
 * Lấy thông tin vận chuyển và lịch sử tracking của một đơn hàng
 */
router.get('/:orderId', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    const orderId = req.params.orderId;
    const isAdmin = req.user.role === 'admin';

    try {
        // Kiểm tra đơn hàng tồn tại và thuộc về user (hoặc admin)
        let orders;
        if (isAdmin) {
            [orders] = await pool.query(
                'SELECT * FROM orders WHERE id = ?',
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

        // Lấy thông tin shipment
        const [shipments] = await pool.query(
            'SELECT * FROM shipments WHERE order_id = ?',
            [orderId]
        );

        if (shipments.length === 0) {
            // Nếu chưa có shipment, trả về null
            return res.json({
                shipment: null,
                events: []
            });
        }

        const shipment = shipments[0];

        // Lấy lịch sử events
        const [events] = await pool.query(
            `SELECT * FROM shipment_events 
            WHERE shipment_id = ? 
            ORDER BY event_time ASC`,
            [shipment.id]
        );

        res.json({
            shipment: {
                ...shipment,
                shipping_cost: parseFloat(shipment.shipping_cost)
            },
            events: events
        });

    } catch (error) {
        console.error('Lỗi khi lấy thông tin vận chuyển:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

/**
 * POST /api/shipments
 * Tạo shipment mới cho một đơn hàng (Admin only)
 */
router.post('/', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const { order_id, carrier_name, tracking_number, estimated_delivery_date, shipping_cost } = req.body;

    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Chỉ admin mới có quyền tạo shipment' });
    }

    try {
        // Validate input
        if (!order_id || !carrier_name || !tracking_number) {
            return res.status(400).json({ message: 'order_id, carrier_name, tracking_number là bắt buộc' });
        }

        // Kiểm tra đơn hàng tồn tại
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE id = ?',
            [order_id]
        );

        if (orders.length === 0) {
            return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
        }

        // Tạo shipment
        const [result] = await pool.query(
            `INSERT INTO shipments (order_id, carrier_name, tracking_number, estimated_delivery_date, shipping_cost, status)
            VALUES (?, ?, ?, ?, ?, 'pending')`,
            [order_id, carrier_name, tracking_number, estimated_delivery_date, shipping_cost || 0]
        );

        const shipmentId = result.insertId;

        // Tạo event đầu tiên: Shipment đã được tạo
        await pool.query(
            `INSERT INTO shipment_events (shipment_id, status, event_label, event_time)
            VALUES (?, 'pending', 'Đơn hàng đã được giao cho đơn vị vận chuyển', NOW())`,
            [shipmentId]
        );

        // Cập nhật order với shipment_id
        await pool.query(
            'UPDATE orders SET shipment_id = ?, status = ? WHERE id = ?',
            [shipmentId, 'shipped', order_id]
        );

        // Lấy shipment vừa tạo
        const [newShipments] = await pool.query(
            'SELECT * FROM shipments WHERE id = ?',
            [shipmentId]
        );

        res.status(201).json({
            message: 'Tạo shipment thành công',
            shipment: {
                ...newShipments[0],
                shipping_cost: parseFloat(newShipments[0].shipping_cost)
            }
        });

    } catch (error) {
        console.error('Lỗi khi tạo shipment:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

/**
 * PUT /api/shipments/:shipmentId/update-status
 * Cập nhật trạng thái shipment (Admin only)
 */
router.put('/:shipmentId/update-status', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const shipmentId = req.params.shipmentId;
    const { status, event_label, location } = req.body;

    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Chỉ admin mới có quyền cập nhật shipment' });
    }

    try {
        // Validate status
        const validStatuses = ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'failed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
        }

        // Kiểm tra shipment tồn tại
        const [shipments] = await pool.query(
            'SELECT * FROM shipments WHERE id = ?',
            [shipmentId]
        );

        if (shipments.length === 0) {
            return res.status(404).json({ message: 'Shipment không tồn tại' });
        }

        const shipment = shipments[0];

        // Cập nhật shipment status
        await pool.query(
            'UPDATE shipments SET status = ?, updated_at = NOW() WHERE id = ?',
            [status, shipmentId]
        );

        // Tạo event mới
        await pool.query(
            `INSERT INTO shipment_events (shipment_id, status, event_label, location, event_time)
            VALUES (?, ?, ?, ?, NOW())`,
            [shipmentId, status, event_label || getDefaultLabel(status), location || null]
        );

        // Cập nhật order status tương ứng
        const orderStatus = mapShipmentToOrderStatus(status);
        if (shipment.order_id) {
            await pool.query(
                'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
                [orderStatus, shipment.order_id]
            );

            // Nếu delivered, cập nhật actual_delivery_date
            if (status === 'delivered') {
                await pool.query(
                    'UPDATE shipments SET actual_delivery_date = CURDATE() WHERE id = ?',
                    [shipmentId]
                );
            }
        }

        res.json({
            message: 'Cập nhật trạng thái shipment thành công',
            shipment: {
                id: shipmentId,
                status: status,
                updated_at: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Lỗi khi cập nhật shipment:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

/**
 * POST /api/shipments/webhook/:carrier
 * Webhook endpoint để nhận cập nhật từ đơn vị vận chuyển
 * VD: GHN, GHTK gửi webhook update tracking
 */
router.post('/webhook/:carrier', async (req, res) => {
    const pool = req.app.locals.pool;
    const carrier = req.params.carrier;
    const { tracking_number, status, message, location } = req.body;

    try {
        // Tìm shipment theo tracking_number
        const [shipments] = await pool.query(
            'SELECT * FROM shipments WHERE tracking_number = ? AND carrier_name = ?',
            [tracking_number, carrier]
        );

        if (shipments.length === 0) {
            return res.status(404).json({ message: 'Shipment không tìm thấy' });
        }

        const shipment = shipments[0];

        // Map carrier status to our status
        const mappedStatus = mapCarrierStatus(carrier, status);

        // Cập nhật shipment
        await pool.query(
            'UPDATE shipments SET status = ?, updated_at = NOW() WHERE id = ?',
            [mappedStatus, shipment.id]
        );

        // Tạo event
        await pool.query(
            `INSERT INTO shipment_events (shipment_id, status, event_label, location, event_time)
            VALUES (?, ?, ?, ?, NOW())`,
            [shipment.id, mappedStatus, message || getDefaultLabel(mappedStatus), location || null]
        );

        // Cập nhật order status
        const orderStatus = mapShipmentToOrderStatus(mappedStatus);
        await pool.query(
            'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
            [orderStatus, shipment.order_id]
        );

        res.json({ message: 'Cập nhật tracking thành công' });

    } catch (error) {
        console.error('Lỗi khi xử lý webhook:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Map carrier-specific status to our standard status
 */
function mapCarrierStatus(carrier, carrierStatus) {
    const statusMap = {
        ghn: {
            'ready_to_pick': 'pending',
            'picking': 'pending',
            'picked': 'picked_up',
            'cancel': 'failed',
            'on_way': 'in_transit',
            'waylay': 'out_for_delivery',
            'at_sort_center': 'in_transit',
            'delivered': 'delivered',
            'delivery_fail': 'failed',
            'returning': 'returned',
            'return_sorted': 'returned',
            'returned': 'returned'
        },
        ghtk: {
            '1': 'pending',
            '2': 'picked_up',
            '3': 'in_transit',
            '4': 'out_for_delivery',
            '5': 'delivered',
            '-1': 'failed',
            '-2': 'returned'
        },
        viettel: {
            'Đã tiếp nhận': 'pending',
            'Đang lấy hàng': 'pending',
            'Đã lấy hàng': 'picked_up',
            'Đang chuyên chở': 'in_transit',
            'Đang giao': 'out_for_delivery',
            'Đã giao': 'delivered',
            'Giao không thành': 'failed'
        }
    };

    return statusMap[carrier.toLowerCase()]?.[carrierStatus] || 'in_transit';
}

/**
 * Map shipment status to order status
 */
function mapShipmentToOrderStatus(shipmentStatus) {
    const statusMap = {
        'pending': 'pending',
        'picked_up': 'shipped',
        'in_transit': 'shipped',
        'out_for_delivery': 'shipped',
        'delivered': 'delivered',
        'returned': 'cancelled',
        'failed': 'cancelled'
    };

    return statusMap[shipmentStatus] || 'shipped';
}

/**
 * Get default label for status
 */
function getDefaultLabel(status) {
    const labels = {
        'pending': 'Đơn hàng đang được chuẩn bị',
        'picked_up': 'Đơn hàng đã được nhặt từ kho',
        'in_transit': 'Đơn hàng đang được vận chuyển',
        'out_for_delivery': 'Đơn hàng đang được giao tới bạn',
        'delivered': 'Đơn hàng đã được giao thành công',
        'returned': 'Đơn hàng đã được hoàn trả',
        'failed': 'Giao hàng không thành công'
    };

    return labels[status] || 'Cập nhật trạng thái đơn hàng';
}

module.exports = router;

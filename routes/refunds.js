const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// POST /api/refunds - create refund request (authenticated user)
router.post('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.id;
  const { order_id, reason, amount } = req.body;

  if (!order_id) return res.status(400).json({ message: 'order_id is required' });

  try {
    // Check order exists and belongs to user (or admin)
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [order_id]);
    if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });
    const order = orders[0];
    if (req.user.role !== 'admin' && order.user_id !== userId) {
      return res.status(403).json({ message: 'Không có quyền tạo yêu cầu hoàn tiền cho đơn hàng này' });
    }

    // Basic status check: only delivered or shipped can request refund (configurable)
    if (!['delivered', 'shipped', 'cancelled', 'processing'].includes(order.status)) {
      return res.status(400).json({ message: 'Trạng thái đơn hiện không cho phép hoàn tiền' });
    }

    const [result] = await pool.query(
      `INSERT INTO refunds (order_id, user_id, reason, amount, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [order_id, userId, reason || '', amount || order.total || 0, 'requested']
    );

    res.status(201).json({ message: 'Yêu cầu hoàn tiền đã được gửi', refund_id: result.insertId });
  } catch (e) {
    console.error('Error creating refund request', e);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

// GET /api/refunds - list refunds (admin only)
router.get('/', authenticateToken, authorize(['admin']), async (req, res) => {
  const pool = req.app.locals.pool;
  const { page = 1, limit = 20, status = '' } = req.query;
  try {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let where = '';
    const params = [];
    if (status) { where = 'WHERE r.status = ?'; params.push(status); }

    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM refunds r ${where}`, params);
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT r.*, u.username, o.status as order_status FROM refunds r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN orders o ON r.order_id = o.id
       ${where}
       ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    res.json({ refunds: rows, pagination: { currentPage: pageNum, totalPages: Math.ceil(total/limitNum), totalItems: total } });
  } catch (e) {
    console.error('Error listing refunds', e);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

// GET /api/refunds/mine - user's refund requests
router.get('/mine', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.id;
  try {
    const [rows] = await pool.query('SELECT r.*, o.status as order_status FROM refunds r LEFT JOIN orders o ON r.order_id = o.id WHERE r.user_id = ? ORDER BY r.created_at DESC', [userId]);
    res.json({ refunds: rows });
  } catch (e) {
    console.error('Error listing user refunds', e);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

// PUT /api/refunds/:id/status - update refund status (admin only)
router.put('/:id/status', authenticateToken, authorize(['admin']), async (req, res) => {
  const pool = req.app.locals.pool;
  const refundId = req.params.id;
  const { status, admin_note } = req.body;
  const valid = ['requested','approved','rejected','refunded','cancelled','processing'];
  if (!valid.includes(status)) return res.status(400).json({ message: 'Status không hợp lệ' });

  try {
    const [rows] = await pool.query('SELECT * FROM refunds WHERE id = ?', [refundId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Refund request not found' });
    const refund = rows[0];

    await pool.query('UPDATE refunds SET status = ?, admin_note = ?, updated_at = NOW() WHERE id = ?', [status, admin_note || null, refundId]);

    // If fully refunded, update order status and add tracking entry
    if (status === 'refunded') {
      await pool.query('UPDATE orders SET status = ? WHERE id = ?', ['refunded', refund.order_id]);
      try {
        await pool.query('INSERT INTO order_tracking_history (order_id, status, status_label) VALUES (?, ?, ?)', [refund.order_id, 'refunded', 'Đã hoàn tiền'] );
      } catch (e) { console.warn('Could not insert tracking for refund', e); }
    }

    res.json({ message: 'Đã cập nhật trạng thái hoàn tiền' });
  } catch (e) {
    console.error('Error updating refund status', e);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

module.exports = router;

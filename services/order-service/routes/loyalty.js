// Loyalty points routes
const express = require('express');
const router = express.Router();

// All routes require authentication
router.use((req, res, next) => {
    return req.app.locals.verifyToken(req, res, next);
});

// Get user's loyalty points balance
router.get('/balance', async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;

    try {
        const [points] = await pool.query(
            'SELECT * FROM loyalty_points WHERE user_id = ?',
            [userId]
        );

        if (points.length === 0) {
            // Initialize if not exists
            await pool.query(
                'INSERT INTO loyalty_points (user_id, balance, total_earned, total_redeemed) VALUES (?, 0, 0, 0)',
                [userId]
            );
            return res.json({
                balance: 0,
                total_earned: 0,
                total_redeemed: 0,
                points_value: 0 // 1 point = 1000 VNĐ
            });
        }

        const userPoints = points[0];
        const pointsValue = userPoints.balance * 1000; // 1 point = 1000 VNĐ

        res.json({
            balance: userPoints.balance,
            total_earned: userPoints.total_earned,
            total_redeemed: userPoints.total_redeemed,
            points_value: pointsValue
        });

    } catch (error) {
        console.error('Error getting loyalty points:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// Get loyalty points transactions
router.get('/transactions', async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    try {
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const offset = (pageNum - 1) * limitNum;

        const [transactions] = await pool.query(
            `SELECT * FROM loyalty_points_transactions 
             WHERE user_id = ? 
             ORDER BY created_at DESC 
             LIMIT ? OFFSET ?`,
            [userId, limitNum, offset]
        );

        const [countRows] = await pool.query(
            'SELECT COUNT(*) as total FROM loyalty_points_transactions WHERE user_id = ?',
            [userId]
        );

        res.json({
            transactions: transactions.map(t => ({
                ...t,
                points: parseInt(t.points)
            })),
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(countRows[0].total / limitNum),
                totalItems: countRows[0].total,
                limit: limitNum
            }
        });

    } catch (error) {
        console.error('Error getting transactions:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// Calculate points to earn from order amount
router.post('/calculate', async (req, res) => {
    const { order_amount } = req.body;

    try {
        // Earn 1 point per 10,000 VNĐ spent
        const pointsToEarn = Math.floor(parseFloat(order_amount || 0) / 10000);

        res.json({
            points_to_earn: pointsToEarn,
            points_value: pointsToEarn * 1000 // 1 point = 1000 VNĐ
        });

    } catch (error) {
        console.error('Error calculating points:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// Redeem points (used during checkout)
router.post('/redeem', async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    const { points, order_id, description } = req.body;

    try {
        if (!points || points <= 0) {
            return res.status(400).json({ message: 'Số điểm không hợp lệ' });
        }

        // Get current balance
        const [userPoints] = await pool.query(
            'SELECT * FROM loyalty_points WHERE user_id = ?',
            [userId]
        );

        if (userPoints.length === 0 || userPoints[0].balance < points) {
            return res.status(400).json({ message: 'Số điểm không đủ' });
        }

        // Update balance
        await pool.query(
            'UPDATE loyalty_points SET balance = balance - ?, total_redeemed = total_redeemed + ? WHERE user_id = ?',
            [points, points, userId]
        );

        // Create transaction
        await pool.query(
            `INSERT INTO loyalty_points_transactions (user_id, points, type, description, order_id)
             VALUES (?, ?, 'redeem', ?, ?)`,
            [userId, points, description || `Đổi ${points} điểm`, order_id || null]
        );

        const discountAmount = points * 1000; // 1 point = 1000 VNĐ

        res.json({
            message: 'Đổi điểm thành công',
            points_redeemed: points,
            discount_amount: discountAmount,
            new_balance: userPoints[0].balance - points
        });

    } catch (error) {
        console.error('Error redeeming points:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// Helper function to earn points (called after order completion)
async function earnPoints(pool, userId, orderId, orderAmount) {
    try {
        // Earn 1 point per 10,000 VNĐ spent
        const pointsEarned = Math.floor(parseFloat(orderAmount) / 10000);

        if (pointsEarned > 0) {
            // Update balance
            await pool.query(
                'UPDATE loyalty_points SET balance = balance + ?, total_earned = total_earned + ? WHERE user_id = ?',
                [pointsEarned, pointsEarned, userId]
            );

            // Create transaction
            await pool.query(
                `INSERT INTO loyalty_points_transactions (user_id, points, type, description, order_id)
                 VALUES (?, ?, 'earn', ?, ?)`,
                [userId, pointsEarned, `Tích lũy từ đơn hàng #${orderId}`, orderId]
            );

            return pointsEarned;
        }

        return 0;
    } catch (error) {
        console.error('Error earning points:', error);
        return 0;
    }
}

module.exports = { router, earnPoints };


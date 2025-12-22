// Coupon management routes
const express = require('express');
const router = express.Router();

// Middleware: Optional auth for validate endpoint
router.use((req, res, next) => {
    // Allow validate and active endpoints without auth
    if (req.path === '/validate' || req.path === '/active') {
        return next();
    }
    // Other endpoints require auth
    if (!req.app.locals.verifyToken) {
        return res.status(500).json({ message: 'Auth middleware not configured' });
    }
    return req.app.locals.verifyToken(req, res, next);
});

// Validate coupon code
router.post('/validate', async (req, res) => {
    const pool = req.app.locals.pool;
    // Try to get user ID from token if provided
    let userId = null;
    if (req.headers['authorization'] && req.app.locals.verifyToken) {
        try {
            const authHeader = req.headers['authorization'];
            const token = authHeader.replace('Bearer ', '').trim();
            const jwt = require('jsonwebtoken');
            const JWT_SECRET = process.env.JWT_SECRET || 'HhGg78@!kYpQzXcVbNmL1o2P3oI4U5yT6rE7wQ8aZ9sX0cVkGjH';
            const decoded = jwt.verify(token, JWT_SECRET);
            userId = decoded.id;
        } catch (e) {
            // Ignore token errors for public validation
        }
    }
    const { code, total_amount } = req.body;

    try {
        if (!code || !code.trim()) {
            return res.status(400).json({ message: 'Mã giảm giá không được để trống' });
        }

        const couponCode = code.trim().toUpperCase();

        // Get coupon
        const [coupons] = await pool.query(
            'SELECT * FROM coupons WHERE code = ? AND is_active = TRUE',
            [couponCode]
        );

        if (coupons.length === 0) {
            return res.status(404).json({ message: 'Mã giảm giá không tồn tại hoặc đã hết hạn' });
        }

        const coupon = coupons[0];

        // Check validity dates
        const now = new Date();
        const validFrom = new Date(coupon.valid_from);
        const validUntil = new Date(coupon.valid_until);

        if (now < validFrom) {
            return res.status(400).json({ message: 'Mã giảm giá chưa có hiệu lực' });
        }

        if (now > validUntil) {
            return res.status(400).json({ message: 'Mã giảm giá đã hết hạn' });
        }

        // Check usage limit
        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
            return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng' });
        }

        // Check minimum purchase amount
        const purchaseAmount = parseFloat(total_amount || 0);
        if (purchaseAmount < parseFloat(coupon.min_purchase_amount || 0)) {
            return res.status(400).json({ 
                message: `Đơn hàng tối thiểu ${parseFloat(coupon.min_purchase_amount).toLocaleString('vi-VN')} VNĐ để sử dụng mã này` 
            });
        }

        // Check if user already used this coupon (if user is logged in)
        if (userId) {
            const [usage] = await pool.query(
                'SELECT COUNT(*) as count FROM coupon_usage WHERE coupon_id = ? AND user_id = ?',
                [coupon.id, userId]
            );

            // For now, allow multiple uses per user. Can be restricted later if needed
            // if (usage[0].count > 0) {
            //     return res.status(400).json({ message: 'Bạn đã sử dụng mã giảm giá này rồi' });
            // }
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.discount_type === 'percentage') {
            discountAmount = (purchaseAmount * parseFloat(coupon.discount_value)) / 100;
            if (coupon.max_discount_amount) {
                discountAmount = Math.min(discountAmount, parseFloat(coupon.max_discount_amount));
            }
        } else {
            discountAmount = parseFloat(coupon.discount_value);
        }

        const finalAmount = Math.max(0, purchaseAmount - discountAmount);

        res.json({
            valid: true,
            coupon: {
                id: coupon.id,
                code: coupon.code,
                name: coupon.name,
                description: coupon.description,
                discount_type: coupon.discount_type,
                discount_value: parseFloat(coupon.discount_value),
                discount_amount: discountAmount,
                original_amount: purchaseAmount,
                final_amount: finalAmount
            }
        });

    } catch (error) {
        console.error('Error validating coupon:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// Get all active coupons (public)
router.get('/active', async (req, res) => {
    const pool = req.app.locals.pool;

    try {
        const now = new Date();
        const [coupons] = await pool.query(
            `SELECT id, code, name, description, discount_type, discount_value, min_purchase_amount, max_discount_amount, valid_until
             FROM coupons 
             WHERE is_active = TRUE 
             AND valid_from <= ? 
             AND valid_until >= ?
             ORDER BY created_at DESC`,
            [now, now]
        );

        res.json({
            coupons: coupons.map(c => ({
                ...c,
                discount_value: parseFloat(c.discount_value),
                min_purchase_amount: parseFloat(c.min_purchase_amount || 0),
                max_discount_amount: c.max_discount_amount ? parseFloat(c.max_discount_amount) : null
            }))
        });

    } catch (error) {
        console.error('Error getting active coupons:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// Admin: Create coupon
router.post('/', async (req, res) => {
    const pool = req.app.locals.pool;

    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Chỉ admin mới có quyền tạo mã giảm giá' });
        }

        const {
            code,
            name,
            description,
            discount_type,
            discount_value,
            min_purchase_amount,
            max_discount_amount,
            usage_limit,
            valid_from,
            valid_until
        } = req.body;

        // Validate
        if (!code || !name || !discount_type || !discount_value) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }

        const [result] = await pool.query(
            `INSERT INTO coupons (code, name, description, discount_type, discount_value, min_purchase_amount, max_discount_amount, usage_limit, valid_from, valid_until)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                code.toUpperCase(),
                name,
                description || null,
                discount_type,
                discount_value,
                min_purchase_amount || 0,
                max_discount_amount || null,
                usage_limit || null,
                valid_from || new Date(),
                valid_until
            ]
        );

        res.status(201).json({
            message: 'Tạo mã giảm giá thành công',
            coupon: { id: result.insertId, code: code.toUpperCase() }
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Mã giảm giá đã tồn tại' });
        }
        console.error('Error creating coupon:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

module.exports = router;


const express = require('express');
const router = express.Router();

// GET /api/stores
// Query params: page, limit, system, search, city
router.get('/', async (req, res) => {
    const pool = req.app.locals.pool;
    const page = parseInt(req.query.page || '1', 10);
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const offset = (page - 1) * limit;

    const { system = '', search = '', city = '' } = req.query;

    try {
        // Build where clause dynamically
        let where = [];
        let params = [];

        if (system && system !== 'all') {
            where.push('system = ?');
            params.push(system);
        }
        if (city) {
            where.push('address LIKE ?');
            params.push(`%${city}%`);
        }
        if (search) {
            where.push('(name LIKE ? OR address LIKE ? OR phone LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const whereSQL = where.length > 0 ? ('WHERE ' + where.join(' AND ')) : '';

        // total count
        const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM stores ${whereSQL}`, params);
        const total = countRows && countRows[0] ? countRows[0].total : 0;

        // fetch paginated
        const [rows] = await pool.query(
            `SELECT id, system, name, address, phone, lat, lng FROM stores ${whereSQL} ORDER BY id ASC LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        res.json({
            stores: rows || [],
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error /api/stores', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;

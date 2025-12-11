const express = require('express');
const router = express.Router();

// GET /api/news?page=1&limit=5
router.get('/', async (req, res) => {
    const pool = req.app.locals.pool;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 5, 1);
    const offset = (page - 1) * limit;

    try {
        const [rows] = await pool.query(
            'SELECT id, title, slug, summary, thumbnail_url, category, tags, author, source_url, published_at FROM news ORDER BY published_at DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );

        const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM news');
        const totalPages = Math.ceil(total / limit);

        res.json({
            news: rows,
            pagination: {
                page,
                limit,
                totalItems: total,
                totalPages
            }
        });
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ message: 'Error fetching news', error: error.message });
    }
});

// GET /api/news/:slug
router.get('/:slug', async (req, res) => {
    const pool = req.app.locals.pool;
    const { slug } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT id, title, slug, summary, content, thumbnail_url, category, tags, author, source_url, published_at FROM news WHERE slug = ? LIMIT 1',
            [slug]
        );
        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: 'News not found' });
        }
        res.json({ news: rows[0] });
    } catch (error) {
        console.error('Error fetching news detail:', error);
        res.status(500).json({ message: 'Error fetching news detail', error: error.message });
    }
});

module.exports = router;


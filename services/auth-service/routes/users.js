// services/auth-service/routes/users.js
// Admin-only Users Management endpoints for Gateway proxy (/api/users -> auth-service /users)

const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();

// Some environments use created_at (snake_case) while others use createdAt (camelCase).
// Detect once per process to avoid "Unknown column" runtime errors.
let detectedCreatedColumn = null; // 'created_at' | 'createdAt'
async function getCreatedColumn(pool) {
  if (detectedCreatedColumn) return detectedCreatedColumn;
  try {
    const dbName = process.env.DB_NAME || 'tttn2025';
    const [rows] = await pool.query(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ?
         AND TABLE_NAME = 'users'
         AND COLUMN_NAME IN ('created_at','createdAt')
       LIMIT 1`,
      [dbName]
    );
    detectedCreatedColumn = rows?.[0]?.COLUMN_NAME || 'created_at';
  } catch (e) {
    detectedCreatedColumn = 'created_at';
  }
  return detectedCreatedColumn;
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  return next();
}

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth-service users router is working!', path: '/users/test' });
});

// GET /users - List users (admin)
router.get('/', (req, res, next) => req.app.locals.verifyToken(req, res, next), requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  const { page = 1, limit = 20, search = '', role = '' } = req.query;

  try {
    const createdCol = await getCreatedColumn(pool);
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const where = [];
    const params = [];

    if (search) {
      where.push('(username LIKE ? OR email LIKE ?)');
      const q = `%${search}%`;
      params.push(q, q);
    }
    if (role) {
      where.push('role = ?');
      params.push(role);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );
    const total = Number(countRows?.[0]?.total || 0);

    const [users] = await pool.query(
      `SELECT id, username, email, role, \`${createdCol}\` as createdAt
       FROM users ${whereClause}
       ORDER BY \`${createdCol}\` DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    // Backward compatible response shape for current admin JS
    res.json({
      users: users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email ?? null,
        role: u.role,
        createdAt: u.createdAt ?? null
      })),
      total,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    });
  } catch (error) {
    console.error('[AUTH-SERVICE USERS] Error listing users:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

// GET /users/:id - Get user (admin)
router.get('/:id', (req, res, next) => req.app.locals.verifyToken(req, res, next), requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = parseInt(req.params.id, 10);
  if (Number.isNaN(userId)) return res.status(400).json({ message: 'ID không hợp lệ' });

  try {
    const createdCol = await getCreatedColumn(pool);
    const [rows] = await pool.query(
      `SELECT id, username, email, role, \`${createdCol}\` as createdAt FROM users WHERE id = ?`,
      [userId]
    );
    if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy user' });
    const u = rows[0];
    res.json({
      id: u.id,
      username: u.username,
      email: u.email ?? null,
      role: u.role,
      createdAt: u.createdAt ?? null
    });
  } catch (error) {
    console.error('[AUTH-SERVICE USERS] Error get user:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

// POST /users - Create user (admin)
router.post('/', (req, res, next) => req.app.locals.verifyToken(req, res, next), requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  const { username, email, password, role = 'user' } = req.body || {};

  try {
    if (!username || !password) {
      return res.status(400).json({ message: 'Username và password là bắt buộc' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length) return res.status(409).json({ message: 'Username đã tồn tại' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email || null, hashed, role]
    );

    // Reuse schema detection for safe response shape
    const createdCol = await getCreatedColumn(pool);
    const [rows] = await pool.query(
      `SELECT id, username, email, role, \`${createdCol}\` as createdAt FROM users WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({ message: 'Thêm user thành công', user: rows[0] });
  } catch (error) {
    console.error('[AUTH-SERVICE USERS] Error create user:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

// PUT /users/:id - Update user (admin)
router.put('/:id', (req, res, next) => req.app.locals.verifyToken(req, res, next), requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = parseInt(req.params.id, 10);
  if (Number.isNaN(userId)) return res.status(400).json({ message: 'ID không hợp lệ' });

  const { username, email, password, role } = req.body || {};

  try {
    const [exists] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (!exists.length) return res.status(404).json({ message: 'Không tìm thấy user' });

    const fields = [];
    const values = [];

    if (username !== undefined) {
      const [dup] = await pool.query('SELECT id FROM users WHERE username = ? AND id != ?', [username, userId]);
      if (dup.length) return res.status(409).json({ message: 'Username đã tồn tại' });
      fields.push('username = ?');
      values.push(username);
    }
    if (email !== undefined) {
      fields.push('email = ?');
      values.push(email || null);
    }
    if (password !== undefined && String(password).trim() !== '') {
      const hashed = await bcrypt.hash(password, 10);
      fields.push('password = ?');
      values.push(hashed);
    }
    if (role !== undefined) {
      fields.push('role = ?');
      values.push(role);
    }

    if (!fields.length) return res.status(400).json({ message: 'Không có thông tin nào để cập nhật' });

    values.push(userId);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

    const createdCol = await getCreatedColumn(pool);
    const [rows] = await pool.query(`SELECT id, username, email, role, \`${createdCol}\` as createdAt FROM users WHERE id = ?`, [userId]);
    res.json({ message: 'Cập nhật user thành công', user: rows[0] });
  } catch (error) {
    console.error('[AUTH-SERVICE USERS] Error update user:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

// DELETE /users/:id - Delete user (admin)
router.delete('/:id', (req, res, next) => req.app.locals.verifyToken(req, res, next), requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = parseInt(req.params.id, 10);
  if (Number.isNaN(userId)) return res.status(400).json({ message: 'ID không hợp lệ' });

  try {
    if (req.user && userId === req.user.id) {
      return res.status(400).json({ message: 'Không thể xóa chính mình' });
    }

    const [exists] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (!exists.length) return res.status(404).json({ message: 'Không tìm thấy user' });

    await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ message: 'Xóa user thành công' });
  } catch (error) {
    console.error('[AUTH-SERVICE USERS] Error delete user:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

module.exports = router;



// tests/helpers/app.js
// Helper để tạo Express app instance cho testing

/**
 * Tạo Express app instance từ service
 */
function createApp(servicePath) {
  // Mock app.locals với test database pool
  const { getPool } = require('./db');
  const pool = getPool();
  
  // Load service
  const app = require(servicePath);
  
  // Setup app.locals với test config
  app.locals.pool = pool;
  app.locals.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt';
  app.locals.jwt = require('jsonwebtoken');
  
  // Setup verifyToken middleware
  const jwt = require('jsonwebtoken');
  app.locals.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'Không có token' });
    
    try {
      const token = authHeader.replace('Bearer ', '').trim();
      const decoded = jwt.verify(token, app.locals.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
  };
  
  return app;
}

module.exports = {
  createApp
};


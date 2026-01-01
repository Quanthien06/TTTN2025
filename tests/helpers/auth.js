// tests/helpers/auth.js
// Auth helper functions cho testing

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt';

/**
 * Tạo JWT token cho testing
 */
function generateToken(userData = {}) {
  const {
    id = 1,
    username = 'testuser',
    role = 'user'
  } = userData;
  
  return jwt.sign(
    { id, username, role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

/**
 * Tạo Authorization header với token
 */
function getAuthHeader(token) {
  return {
    'Authorization': `Bearer ${token}`
  };
}

/**
 * Tạo request với authentication
 */
function authenticatedRequest(app, token) {
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
}

module.exports = {
  generateToken,
  getAuthHeader,
  authenticatedRequest,
  JWT_SECRET
};


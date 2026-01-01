// tests/integration/auth.test.js
// Integration tests cho Auth Service

const request = require('supertest');
const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const authRouter = require('../../services/auth-service/routes/auth');
const { cleanDatabase, createTestUser, getPool, closePool } = require('../helpers/db');
const { generateToken } = require('../helpers/auth');

// Tạo Express app cho testing
function createTestApp() {
  const app = express();
  app.use(express.json());
  
  const pool = getPool();
  const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt';
  
  app.locals.pool = pool;
  app.locals.JWT_SECRET = JWT_SECRET;
  app.locals.jwt = jwt;
  
  // Setup verifyToken middleware (cần cho /me endpoint)
  app.locals.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'Không có token' });
    
    try {
      const token = authHeader.replace('Bearer ', '').trim();
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
  };
  
  app.use('/', authRouter);
  
  return app;
}

describe('Auth Service Integration Tests', () => {
  let app;
  let pool;
  
  beforeAll(async () => {
    app = createTestApp();
    pool = getPool();
    await cleanDatabase();
  });
  
  afterAll(async () => {
    await cleanDatabase();
    await closePool();
  });
  
  beforeEach(async () => {
    await cleanDatabase();
  });
  
  describe('POST /register', () => {
    test('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          username: 'testuser',
          password: 'testpass123',
          role: 'user'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Đăng ký thành công! Vui lòng đăng nhập.');
    });
    
    test('should return 400 if username or password is missing', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          username: 'testuser'
          // missing password
        });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Username và password là bắt buộc');
    });
    
    test('should return 409 if username already exists', async () => {
      // Tạo user đầu tiên
      const firstUser = await createTestUser(pool, { username: 'existinguser' });
      
      // Thử tạo user với cùng username (không clean database giữa tests)
      const response = await request(app)
        .post('/register')
        .send({
          username: 'existinguser',
          password: 'testpass123'
        });
      
      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Username đã tồn tại');
      
      // Clean up
      await pool.query('DELETE FROM users WHERE id = ?', [firstUser.id]);
    });
    
    test('should hash password before storing', async () => {
      const username = 'hashtest';
      const password = 'testpass123';
      
      await request(app)
        .post('/register')
        .send({ username, password });
      
      // Kiểm tra password đã được hash
      const [rows] = await pool.query('SELECT password FROM users WHERE username = ?', [username]);
      expect(rows.length).toBe(1);
      expect(rows[0].password).not.toBe(password);
      expect(rows[0].password.startsWith('$2b$')).toBe(true); // bcrypt hash format
    });
  });
  
  describe('POST /login', () => {
    let testUser;
    
    beforeEach(async () => {
      testUser = await createTestUser(pool, {
        username: 'logintest',
        password: 'testpass123'
      });
    });
    
    test('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          username: 'logintest',
          password: 'testpass123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Đăng nhập thành công');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe('logintest');
    });
    
    test('should return 401 with incorrect password', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          username: 'logintest',
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Username hoặc password không đúng');
      expect(response.body.token).toBeUndefined();
    });
    
    test('should return 401 with non-existent username', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          username: 'nonexistent',
          password: 'testpass123'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Username hoặc password không đúng');
    });
    
    test('should return 400 if username or password is missing', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          username: 'logintest'
          // missing password
        });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Username và password là bắt buộc');
    });
    
    test('should return valid JWT token on successful login', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          username: 'logintest',
          password: 'testpass123'
        });
      
      const token = response.body.token;
      const decoded = jwt.verify(token, app.locals.JWT_SECRET);
      
      expect(decoded.id).toBe(testUser.id);
      expect(decoded.username).toBe('logintest');
      expect(decoded.role).toBe('user');
    });
  });
  
  describe('GET /me', () => {
    test('should return user info with valid token', async () => {
      const testUser = await createTestUser(pool);
      const token = generateToken({
        id: testUser.id,
        username: testUser.username,
        role: testUser.role
      });
      
      const response = await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.id).toBe(testUser.id);
      expect(response.body.user.username).toBe(testUser.username);
    });
    
    test('should return 401 without token', async () => {
      const response = await request(app)
        .get('/me');
      
      expect(response.status).toBe(401);
    });
    
    test('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/me')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('POST /forgot-password', () => {
    test('should send OTP email for existing user', async () => {
      const testUser = await createTestUser(pool, {
        email: 'test@example.com'
      });
      
      const response = await request(app)
        .post('/forgot-password')
        .send({
          email: 'test@example.com'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.sent).toBe(true);
      
      // Kiểm tra OTP đã được lưu trong database
      const [rows] = await pool.query(
        'SELECT otp_code, otp_expires FROM users WHERE id = ?',
        [testUser.id]
      );
      expect(rows[0].otp_code).toBeDefined();
      expect(rows[0].otp_expires).toBeDefined();
    });
    
    test('should return success even for non-existent email (security)', async () => {
      const response = await request(app)
        .post('/forgot-password')
        .send({
          email: 'nonexistent@example.com'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.sent).toBe(true);
    });
    
    test('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/forgot-password')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email là bắt buộc');
    });
  });
  
  describe('POST /reset-password', () => {
    test('should reset password with valid OTP', async () => {
      const testUser = await createTestUser(pool, {
        email: 'reset@example.com',
        password: 'oldpassword'
      });
      
      // Set OTP
      const otpCode = '123456';
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await pool.query(
        'UPDATE users SET otp_code = ?, otp_expires = ? WHERE id = ?',
        [otpCode, otpExpires, testUser.id]
      );
      
      const response = await request(app)
        .post('/reset-password')
        .send({
          email: 'reset@example.com',
          otp: otpCode,
          newPassword: 'newpassword123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Đặt lại mật khẩu thành công');
      
      // Kiểm tra password đã được đổi
      const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [testUser.id]);
      const isNewPasswordValid = await bcrypt.compare('newpassword123', rows[0].password);
      expect(isNewPasswordValid).toBe(true);
    });
    
    test('should return 401 with invalid OTP', async () => {
      const testUser = await createTestUser(pool, {
        email: 'reset2@example.com'
      });
      
      const response = await request(app)
        .post('/reset-password')
        .send({
          email: 'reset2@example.com',
          otp: 'wrongotp',
          newPassword: 'newpassword123'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Mã OTP không đúng');
    });
    
    test('should return 401 with expired OTP', async () => {
      const testUser = await createTestUser(pool, {
        email: 'reset3@example.com'
      });
      
      // Set expired OTP
      const otpCode = '123456';
      const otpExpires = new Date(Date.now() - 1000); // Expired
      await pool.query(
        'UPDATE users SET otp_code = ?, otp_expires = ? WHERE id = ?',
        [otpCode, otpExpires, testUser.id]
      );
      
      const response = await request(app)
        .post('/reset-password')
        .send({
          email: 'reset3@example.com',
          otp: otpCode,
          newPassword: 'newpassword123'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Mã OTP đã hết hạn');
    });
    
    test('should return 400 if password is too short', async () => {
      const response = await request(app)
        .post('/reset-password')
        .send({
          email: 'test@example.com',
          otp: '123456',
          newPassword: '12345' // Too short
        });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Mật khẩu mới phải có ít nhất 6 ký tự');
    });
  });
  
  describe('PUT /change-password', () => {
    test('should change password with correct current password', async () => {
      const testUser = await createTestUser(pool, {
        username: 'changepass',
        password: 'oldpass123'
      });
      
      const token = generateToken({
        id: testUser.id,
        username: testUser.username
      });
      
      const response = await request(app)
        .put('/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'oldpass123',
          newPassword: 'newpass123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Đổi mật khẩu thành công');
      
      // Verify new password works
      const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [testUser.id]);
      const isNewPasswordValid = await bcrypt.compare('newpass123', rows[0].password);
      expect(isNewPasswordValid).toBe(true);
    });
    
    test('should return 401 with incorrect current password', async () => {
      const testUser = await createTestUser(pool, {
        username: 'changepass2',
        password: 'oldpass123'
      });
      
      const token = generateToken({
        id: testUser.id,
        username: testUser.username
      });
      
      const response = await request(app)
        .put('/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'wrongpass',
          newPassword: 'newpass123'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Mật khẩu hiện tại không đúng');
    });
    
    test('should return 400 if password is too short', async () => {
      const testUser = await createTestUser(pool);
      const token = generateToken({
        id: testUser.id,
        username: testUser.username
      });
      
      const response = await request(app)
        .put('/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'oldpass123',
          newPassword: '12345' // Too short
        });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Mật khẩu mới phải có ít nhất 6 ký tự');
    });
  });
});


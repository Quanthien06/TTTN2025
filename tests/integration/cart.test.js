// tests/integration/cart.test.js
// Integration tests cho Cart Service

const request = require('supertest');
const express = require('express');
const cartRouter = require('../../services/cart-service/routes/cart');
const { cleanDatabase, createTestUser, createTestProduct, getPool, closePool } = require('../helpers/db');
const { generateToken } = require('../helpers/auth');

function createTestApp() {
  const app = express();
  app.use(express.json());
  
  const pool = getPool();
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
  
  // Mount router tại /cart như trong server.js
  app.use('/cart', cartRouter);
  
  return app;
}

describe('Cart Service Integration Tests', () => {
  let app;
  let pool;
  let testUser;
  let testProduct;
  let authToken;
  
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
    
    // Tạo test user và product
    testUser = await createTestUser(pool);
    testProduct = await createTestProduct(pool, {
      name: 'Test Product',
      price: 1000000,
      stock_quantity: 10
    });
    
    authToken = generateToken({
      id: testUser.id,
      username: testUser.username,
      role: testUser.role
    });
  });
  
  describe('GET /cart', () => {
    test('should return empty cart for new user', async () => {
      const response = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.cart).toBeDefined();
      expect(response.body.items).toBeDefined();
      expect(response.body.items.length).toBe(0);
      expect(response.body.total).toBe(0);
    });
    
    test('should return 401 without token', async () => {
      const response = await request(app)
        .get('/cart');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('POST /cart/items', () => {
    test('should add product to cart', async () => {
      const response = await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_id: testProduct.id,
          quantity: 2
        });
      
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Đã thêm sản phẩm vào giỏ hàng');
      expect(response.body.item).toBeDefined();
      expect(response.body.item.product_id).toBe(testProduct.id);
      expect(response.body.item.quantity).toBe(2);
    });
    
    test('should return 400 if quantity exceeds stock', async () => {
      const response = await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_id: testProduct.id,
          quantity: 100 // Exceeds stock_quantity of 10
        });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Số lượng vượt quá tồn kho');
    });
    
    test('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_id: 99999,
          quantity: 1
        });
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Không tìm thấy sản phẩm');
    });
    
    test('should update quantity if product already in cart', async () => {
      // Add product first time
      await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_id: testProduct.id,
          quantity: 2
        });
      
      // Add same product again
      const response = await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_id: testProduct.id,
          quantity: 3
        });
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Đã cập nhật số lượng sản phẩm trong giỏ hàng');
      expect(response.body.item.quantity).toBe(5); // 2 + 3
    });
  });
  
  describe('PUT /cart/items/:id', () => {
    let cartItemId;
    
    beforeEach(async () => {
      // Add item to cart
      const addResponse = await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_id: testProduct.id,
          quantity: 2
        });
      
      cartItemId = addResponse.body.item.id;
    });
    
    test('should update cart item quantity', async () => {
      const response = await request(app)
        .put(`/cart/items/${cartItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quantity: 5
        });
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Đã cập nhật số lượng');
      expect(response.body.item.quantity).toBe(5);
    });
    
    test('should return 400 if quantity exceeds stock', async () => {
      const response = await request(app)
        .put(`/cart/items/${cartItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quantity: 100
        });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Số lượng vượt quá tồn kho');
    });
    
    test('should return 404 for non-existent cart item', async () => {
      const response = await request(app)
        .put('/cart/items/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quantity: 5
        });
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Không tìm thấy sản phẩm trong giỏ hàng');
    });
  });
  
  describe('DELETE /cart/items/:id', () => {
    let cartItemId;
    
    beforeEach(async () => {
      // Add item to cart
      const addResponse = await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_id: testProduct.id,
          quantity: 2
        });
      
      cartItemId = addResponse.body.item.id;
    });
    
    test('should delete cart item', async () => {
      const response = await request(app)
        .delete(`/cart/items/${cartItemId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Đã xóa sản phẩm khỏi giỏ hàng');
      
      // Verify item is deleted
      const cartResponse = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(cartResponse.body.items.length).toBe(0);
    });
    
    test('should return 404 for non-existent cart item', async () => {
      const response = await request(app)
        .delete('/cart/items/99999')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Không tìm thấy sản phẩm trong giỏ hàng');
    });
  });
  
  describe('DELETE /cart', () => {
    beforeEach(async () => {
      // Add items to cart
      await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_id: testProduct.id,
          quantity: 2
        });
    });
    
    test('should clear entire cart', async () => {
      const response = await request(app)
        .delete('/cart')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Đã xóa toàn bộ giỏ hàng');
      
      // Verify cart is empty
      const cartResponse = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(cartResponse.body.items.length).toBe(0);
    });
  });
  
  describe('GET /cart/total', () => {
    test('should calculate cart total correctly', async () => {
      // Add multiple items
      await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_id: testProduct.id,
          quantity: 2
        });
      
      const product2 = await createTestProduct(pool, {
        name: 'Product 2',
        price: 2000000,
        stock_quantity: 5
      });
      
      await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_id: product2.id,
          quantity: 3
        });
      
      const response = await request(app)
        .get('/cart/total')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.total).toBe(8000000); // (1000000 * 2) + (2000000 * 3)
    });
  });
});


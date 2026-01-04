// tests/integration/order.test.js
// Integration tests cho Order Service

const request = require('supertest');
const express = require('express');
const axios = require('axios');
const ordersRouter = require('../../services/order-service/routes/orders');
const { cleanDatabase, createTestUser, createTestProduct, getPool, closePool } = require('../helpers/db');
const { generateToken } = require('../helpers/auth');

// Mock axios
jest.mock('axios');

function createTestApp() {
  const app = express();
  app.use(express.json());
  
  const pool = getPool();
  app.locals.pool = pool;
  app.locals.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt';
  app.locals.jwt = require('jsonwebtoken');
  app.locals.CART_SERVICE_URL = 'http://localhost:5003'; // Mock URL
  
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
  
  // Mount router tại /orders như trong server.js
  app.use('/orders', ordersRouter);
  
  return app;
}

describe('Order Service Integration Tests', () => {
  let app;
  let pool;
  let testUser;
  let testProduct1;
  let testProduct2;
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
    
    // Tạo test user và products
    testUser = await createTestUser(pool);
    testProduct1 = await createTestProduct(pool, {
      name: 'Product 1',
      price: 1000000,
      stock_quantity: 10
    });
    testProduct2 = await createTestProduct(pool, {
      name: 'Product 2',
      price: 2000000,
      stock_quantity: 5
    });
    
    authToken = generateToken({
      id: testUser.id,
      username: testUser.username,
      role: testUser.role
    });
  });
  
  describe('POST /orders', () => {
    test('should create order successfully', async () => {
      // Mock axios để trả về cart data
      axios.get.mockResolvedValue({
        data: {
          items: [
            {
              product_id: testProduct1.id,
              quantity: 2,
              price: testProduct1.price
            }
          ],
          total: testProduct1.price * 2
        }
      });
      
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          shipping_address: '123 Test Street, Test City',
          shipping_phone: '0123456789',
          shipping_name: 'Test User',
          payment_method: 'bank_transfer'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Đặt hàng thành công');
      expect(response.body.order).toBeDefined();
      expect(response.body.order.status).toBe('pending');
    });
    
    test('should return 400 if items array is empty', async () => {
      // Mock empty cart
      axios.get.mockResolvedValue({
        data: {
          cart: {
            items: [],
            total: 0
          }
        }
      });
      
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          shipping_address: '123 Test Street',
          shipping_phone: '0123456789',
          shipping_name: 'Test User',
          payment_method: 'bank_transfer'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Giỏ hàng');
    });
    
    test('should return 400 if product does not exist', async () => {
      // Mock cart with non-existent product
      axios.get.mockResolvedValue({
        data: {
          items: [
            {
              product_id: 99999,
              quantity: 1,
              price: 1000000
            }
          ],
          total: 1000000
        }
      });
      
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          shipping_address: '123 Test Street',
          shipping_phone: '0123456789',
          shipping_name: 'Test User',
          payment_method: 'bank_transfer'
        });
      
      expect(response.status).toBe(400);
    });
    
    test('should return 400 if quantity exceeds stock', async () => {
      // Mock cart with quantity exceeding stock
      axios.get.mockResolvedValue({
        data: {
          items: [
            {
              product_id: testProduct1.id,
              quantity: 100, // Exceeds stock_quantity of 10
              price: testProduct1.price
            }
          ],
          total: testProduct1.price * 100
        }
      });
      
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          shipping_address: '123 Test Street',
          shipping_phone: '0123456789',
          shipping_name: 'Test User',
          payment_method: 'bank_transfer'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('tồn kho');
    });
    
    test('should deduct stock quantity after creating order', async () => {
      const initialStock = testProduct1.stock_quantity;
      const orderQuantity = 3;

      // Mock cart
      axios.get.mockResolvedValue({
        data: {
          items: [
            {
              product_id: testProduct1.id,
              quantity: orderQuantity,
              price: testProduct1.price
            }
          ],
          total: testProduct1.price * orderQuantity
        }
      });
      
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          shipping_address: '123 Test Street',
          shipping_phone: '0123456789',
          shipping_name: 'Test User',
          payment_method: 'bank_transfer'
        });
      
      expect(response.status).toBe(201);
      
      // Verify stock was deducted
      const [rows] = await pool.query(
        'SELECT stock_quantity FROM products WHERE id = ?',
        [testProduct1.id]
      );
      
      expect(rows[0].stock_quantity).toBe(initialStock - orderQuantity);
    });
  });
  
  describe('GET /orders', () => {
    test('should return user orders', async () => {
      // Tạo một order
      const [orderResult] = await pool.query(
        `INSERT INTO orders (user_id, total, status, shipping_address, payment_method) 
         VALUES (?, ?, ?, ?, ?)`,
        [testUser.id, 2000000, 'pending', '123 Test Street', 'bank_transfer']
      );
      const orderId = orderResult.insertId;
      
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, testProduct1.id, 2, testProduct1.price]
      );
      
      const response = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.orders).toBeDefined();
      expect(response.body.orders.length).toBe(1);
      expect(response.body.orders[0].id).toBe(orderId);
    });
    
    test('should return empty array if user has no orders', async () => {
      const response = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.orders).toBeDefined();
      expect(response.body.orders.length).toBe(0);
    });
  });
  
  describe('GET /orders/:id', () => {
    test('should return order details', async () => {
      // Tạo order
      const [orderResult] = await pool.query(
        `INSERT INTO orders (user_id, total, status, shipping_address, payment_method) 
         VALUES (?, ?, ?, ?, ?)`,
        [testUser.id, 2000000, 'pending', '123 Test Street', 'bank_transfer']
      );
      const orderId = orderResult.insertId;
      
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, testProduct1.id, 2, testProduct1.price]
      );
      
      const response = await request(app)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.order).toBeDefined();
      expect(response.body.order.id).toBe(orderId);
      expect(response.body.order.items).toBeDefined();
      expect(response.body.order.items.length).toBe(1);
    });
    
    test('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/orders/99999')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(404);
    });
    
    test('should return 403 if user tries to access another user order', async () => {
      // Tạo user khác
      const otherUser = await createTestUser(pool, { username: 'otheruser' });
      
      // Tạo order cho user khác
      const [orderResult] = await pool.query(
        `INSERT INTO orders (user_id, total, status, shipping_address, payment_method) 
         VALUES (?, ?, ?, ?, ?)`,
        [otherUser.id, 2000000, 'pending', '123 Test Street', 'bank_transfer']
      );
      const orderId = orderResult.insertId;
      
      // User hiện tại cố truy cập order của user khác
      const response = await request(app)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(404);
    });
  });
  
  describe('Order Tracking', () => {
    test('should create tracking record when order is created', async () => {
      // Mock cart
      axios.get.mockResolvedValue({
        data: {
          items: [
            {
              product_id: testProduct1.id,
              quantity: 2,
              price: testProduct1.price
            }
          ],
          total: testProduct1.price * 2
        }
      });
      
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          shipping_address: '123 Test Street',
          shipping_phone: '0123456789',
          shipping_name: 'Test User',
          payment_method: 'bank_transfer'
        });
      
      expect(response.status).toBe(201);
      const orderId = response.body.order.id;
      
      // Verify tracking record exists
      const [trackingRows] = await pool.query(
        'SELECT * FROM order_tracking WHERE order_id = ?',
        [orderId]
      );
      
      expect(trackingRows.length).toBeGreaterThan(0);
      expect(trackingRows[0].status).toBe('pending');
    });
  });
});


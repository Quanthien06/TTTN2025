// tests/integration/product.test.js
// Integration tests cho Product Service

const request = require('supertest');
const express = require('express');
const productsRouter = require('../../services/product-service/routes/products');
const { cleanDatabase, createTestProduct, createTestCategory, getPool, closePool } = require('../helpers/db');

function createTestApp() {
  const app = express();
  app.use(express.json());
  
  const pool = getPool();
  app.locals.pool = pool;
  
  // Mount router tại /products như trong server.js
  app.use('/products', productsRouter);
  
  return app;
}

describe('Product Service Integration Tests', () => {
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
  
  describe('GET /products', () => {
    beforeEach(async () => {
      // Tạo test products
      await createTestProduct(pool, {
        name: 'Laptop Dell XPS 13',
        price: 30000000,
        category: 'laptop',
        brand: 'Dell',
        slug: 'laptop-dell-xps-13'
      });
      
      await createTestProduct(pool, {
        name: 'iPhone 15 Pro',
        price: 25000000,
        category: 'phone',
        brand: 'Apple',
        slug: 'iphone-15-pro'
      });
      
      await createTestProduct(pool, {
        name: 'Samsung Galaxy S24',
        price: 20000000,
        category: 'phone',
        brand: 'Samsung',
        slug: 'samsung-galaxy-s24'
      });
    });
    
    test('should return all products', async () => {
      // Tạo products trong beforeEach, nhưng có thể bị clean
      // Tạo lại để đảm bảo có data
      await createTestProduct(pool, {
        name: 'Laptop Dell XPS 13',
        price: 30000000,
        category: 'laptop',
        brand: 'Dell',
        slug: 'laptop-dell-xps-13-test'
      });

      await createTestProduct(pool, {
        name: 'iPhone 15 Pro',
        price: 25000000,
        category: 'phone',
        brand: 'Apple',
        slug: 'iphone-15-pro-test'
      });

      await createTestProduct(pool, {
        name: 'Samsung Galaxy S24',
        price: 20000000,
        category: 'phone',
        brand: 'Samsung',
        slug: 'samsung-galaxy-s24-test'
      });
      
      const response = await request(app)
        .get('/products');
      
      expect(response.status).toBe(200);
      expect(response.body.products).toBeDefined();
      expect(response.body.products.length).toBeGreaterThanOrEqual(3);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBeGreaterThanOrEqual(3);
    });
    
    test('should search products by keyword', async () => {
      const response = await request(app)
        .get('/products')
        .query({ q: 'iPhone' });
      
      expect(response.status).toBe(200);
      expect(response.body.products.length).toBe(1);
      expect(response.body.products[0].name).toContain('iPhone');
    });
    
    test('should filter products by category', async () => {
      const response = await request(app)
        .get('/products')
        .query({ category: 'phone' });
      
      expect(response.status).toBe(200);
      expect(response.body.products.length).toBe(2);
      response.body.products.forEach(product => {
        expect(product.category).toBe('phone');
      });
    });
    
    test('should filter products by min price', async () => {
      // Create additional test products to ensure we have the expected count
      await createTestProduct(pool, {
        name: 'MacBook Pro M3',
        price: 35000000,
        category: 'laptop',
        brand: 'Apple',
        slug: 'macbook-pro-m3'
      });

      const response = await request(app)
        .get('/products')
        .query({ minPrice: 25000000 });

      expect(response.status).toBe(200);
      expect(response.body.products.length).toBeGreaterThanOrEqual(2);
      response.body.products.forEach(product => {
        expect(parseFloat(product.price)).toBeGreaterThanOrEqual(25000000);
      });
    });
    
    test('should filter products by max price', async () => {
      // Create additional test products to ensure we have the expected count
      await createTestProduct(pool, {
        name: 'iPad Air',
        price: 18000000,
        category: 'tablet',
        brand: 'Apple',
        slug: 'ipad-air'
      });

      const response = await request(app)
        .get('/products')
        .query({ maxPrice: 22000000 });

      expect(response.status).toBe(200);
      expect(response.body.products.length).toBeGreaterThanOrEqual(1);
      response.body.products.forEach(product => {
        expect(parseFloat(product.price)).toBeLessThanOrEqual(22000000);
      });
    });
    
    test('should filter products by price range', async () => {
      const response = await request(app)
        .get('/products')
        .query({ minPrice: 20000000, maxPrice: 25000000 });
      
      expect(response.status).toBe(200);
      expect(response.body.products.length).toBe(2);
      response.body.products.forEach(product => {
        const price = parseFloat(product.price);
        expect(price).toBeGreaterThanOrEqual(20000000);
        expect(price).toBeLessThanOrEqual(25000000);
      });
    });
    
    test('should sort products by price ascending', async () => {
      const response = await request(app)
        .get('/products')
        .query({ sort: 'price', order: 'asc' });
      
      expect(response.status).toBe(200);
      const prices = response.body.products.map(p => parseFloat(p.price));
      expect(prices[0]).toBeLessThanOrEqual(prices[1]);
      expect(prices[1]).toBeLessThanOrEqual(prices[2]);
    });
    
    test('should sort products by price descending', async () => {
      const response = await request(app)
        .get('/products')
        .query({ sort: 'price', order: 'desc' });
      
      expect(response.status).toBe(200);
      const prices = response.body.products.map(p => parseFloat(p.price));
      expect(prices[0]).toBeGreaterThanOrEqual(prices[1]);
      expect(prices[1]).toBeGreaterThanOrEqual(prices[2]);
    });
    
    test('should paginate products', async () => {
      // Đảm bảo có ít nhất 3 products
      await createTestProduct(pool, { name: 'Product 1', price: 1000000, slug: 'product-1' });
      await createTestProduct(pool, { name: 'Product 2', price: 2000000, slug: 'product-2' });
      await createTestProduct(pool, { name: 'Product 3', price: 3000000, slug: 'product-3' });
      
      const response = await request(app)
        .get('/products')
        .query({ page: 1, limit: 2 });
      
      expect(response.status).toBe(200);
      expect(response.body.products.length).toBe(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.total).toBeGreaterThanOrEqual(3);
      expect(response.body.pagination.totalPages).toBeGreaterThanOrEqual(2);
    });
    
    test('should combine search, filter, sort and pagination', async () => {
      const response = await request(app)
        .get('/products')
        .query({
          q: 'phone',
          minPrice: 20000000,
          maxPrice: 25000000,
          sort: 'price',
          order: 'desc',
          page: 1,
          limit: 10
        });
      
      expect(response.status).toBe(200);
      expect(response.body.products.length).toBe(2);
      expect(response.body.products[0].name).toContain('iPhone'); // Higher price first
    });
  });
  
  describe('GET /products/:id', () => {
    test('should return product by id', async () => {
      const product = await createTestProduct(pool, {
        name: 'Test Product',
        price: 1000000
      });
      
      const response = await request(app)
        .get(`/products/${product.id}`);
      
      expect(response.status).toBe(200);
      // Product service trả về product trực tiếp, không có wrapper
      expect(response.body.id).toBe(product.id);
      expect(response.body.name).toBe('Test Product');
    });
    
    test('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/products/99999');
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Không tìm thấy sản phẩm');
    });
  });
});


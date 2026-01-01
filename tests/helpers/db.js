// tests/helpers/db.js
// Database helper functions cho testing

const mysql = require('mysql2/promise');

// Test database config
const TEST_DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tttn2025_test',
  multipleStatements: true
};

let pool = null;

/**
 * Tạo database connection pool cho testing
 */
function getPool() {
  if (!pool) {
    pool = mysql.createPool(TEST_DB_CONFIG);
  }
  return pool;
}

/**
 * Đóng database connection pool
 */
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Xóa tất cả dữ liệu trong các bảng (trừ bảng system)
 */
async function cleanDatabase() {
  const connection = await mysql.createConnection(TEST_DB_CONFIG);
  
  try {
    // Tắt foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Danh sách các bảng cần xóa
    const tables = [
      'order_tracking',
      'order_items',
      'orders',
      'shipments',
      'cart_items',
      'carts',
      'loyalty_points',
      'coupons',
      'comments',
      'products',
      'categories',
      'news',
      'users'
    ];
    
    // Xóa dữ liệu từng bảng
    for (const table of tables) {
      try {
        await connection.query(`TRUNCATE TABLE ${table}`);
      } catch (error) {
        // Bỏ qua nếu bảng không tồn tại
        if (error.code !== 'ER_NO_SUCH_TABLE') {
          console.warn(`Warning: Could not truncate table ${table}:`, error.message);
        }
      }
    }
    
    // Bật lại foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  } finally {
    await connection.end();
  }
}

/**
 * Tạo test user
 */
async function createTestUser(pool, userData = {}) {
  const {
    username = `testuser_${Date.now()}`,
    password = 'testpass123',
    email = `test_${Date.now()}@test.com`,
    role = 'user'
  } = userData;
  
  const bcrypt = require('bcrypt');
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const [result] = await pool.query(
    'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
    [username, hashedPassword, email, role]
  );
  
  return {
    id: result.insertId,
    username,
    password, // Trả về plain password để test
    email,
    role
  };
}

/**
 * Tạo test product
 */
async function createTestProduct(pool, productData = {}) {
  const {
    name = `Test Product ${Date.now()}`,
    description = 'Test description',
    price = 1000000,
    original_price = 1200000,
    stock_quantity = 10,
    category = 'laptop',
    brand = 'Test Brand',
    slug = `test-product-${Date.now()}`
  } = productData;
  
  const [result] = await pool.query(
    `INSERT INTO products 
     (name, description, price, original_price, stock_quantity, category, brand, slug, main_image_url) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, description, price, original_price, stock_quantity, category, brand, slug, 'test-image.jpg']
  );
  
  return {
    id: result.insertId,
    name,
    description,
    price,
    original_price,
    stock_quantity,
    category,
    brand,
    slug
  };
}

/**
 * Tạo test category
 */
async function createTestCategory(pool, categoryData = {}) {
  const {
    name = `Test Category ${Date.now()}`,
    slug = `test-category-${Date.now()}`,
    description = 'Test category description'
  } = categoryData;
  
  const [result] = await pool.query(
    'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
    [name, slug, description]
  );
  
  return {
    id: result.insertId,
    name,
    slug,
    description
  };
}

module.exports = {
  getPool,
  closePool,
  cleanDatabase,
  createTestUser,
  createTestProduct,
  createTestCategory,
  TEST_DB_CONFIG
};


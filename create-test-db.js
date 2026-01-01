// create-test-db.js
// Script để tạo test database

const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  // Không chỉ định database để có thể tạo database mới
  multipleStatements: true
};

const TEST_DB_NAME = 'tttn2025_test';

async function createTestDatabase() {
  console.log('🔧 Creating test database...\n');
  
  let connection;
  
  try {
    // Kết nối MySQL (không chỉ định database)
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connected to MySQL');
    
    // Tạo database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${TEST_DB_NAME}\``);
    console.log(`✅ Database '${TEST_DB_NAME}' created successfully!`);
    
    // Kiểm tra database đã tồn tại
    const [databases] = await connection.query('SHOW DATABASES LIKE ?', [TEST_DB_NAME]);
    
    if (databases.length > 0) {
      console.log(`\n📋 Test database '${TEST_DB_NAME}' is ready!`);
      console.log('\n📋 Next steps:');
      console.log('   1. Run: npm run test:quick');
      console.log('   2. Run: npm test');
    }
    
    await connection.end();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error creating test database:');
    console.error('   ', error.message);
    console.error('\n💡 Make sure:');
    console.error('   1. MySQL is running');
    console.error('   2. Database credentials are correct');
    console.error('   3. User has CREATE DATABASE permission');
    
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

createTestDatabase();


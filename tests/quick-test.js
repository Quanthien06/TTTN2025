// tests/quick-test.js
// Quick test để verify testing setup

const { getPool, closePool, cleanDatabase } = require('./helpers/db');

async function quickTest() {
  console.log('🧪 Running quick test to verify setup...\n');
  
  try {
    // Test database connection
    console.log('1. Testing database connection...');
    const pool = getPool();
    const [rows] = await pool.query('SELECT 1 as test');
    console.log('   ✅ Database connection OK');
    
    // Test clean database
    console.log('2. Testing database cleanup...');
    await cleanDatabase();
    console.log('   ✅ Database cleanup OK');
    
    // Test close pool
    console.log('3. Testing pool close...');
    await closePool();
    console.log('   ✅ Pool close OK');
    
    console.log('\n✅ All quick tests passed!');
    console.log('   You can now run: npm test');
    
  } catch (error) {
    console.error('\n❌ Quick test failed:');
    console.error('   Error:', error.message);
    console.error('\n   Make sure:');
    console.error('   1. MySQL is running');
    console.error('   2. Test database exists: CREATE DATABASE tttn2025_test;');
    console.error('   3. Database credentials are correct');
    process.exit(1);
  }
}

quickTest();


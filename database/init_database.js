// Script khởi tạo database cho Docker
// Chạy từ host: node database/init_database.js
// Hoặc từ trong container MySQL

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3307, // Port từ Docker
    user: process.env.DB_USER || 'tttn_user',
    password: process.env.DB_PASSWORD || 'tttn_pass',
    database: process.env.DB_NAME || 'tttn2025',
    multipleStatements: true
};

async function initDatabase() {
    let connection;
    
    try {
        console.log('Đang kết nối đến database...');
        console.log(`Host: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
        console.log(`Database: ${DB_CONFIG.database}`);
        
        connection = await mysql.createConnection(DB_CONFIG);
        console.log('✅ Đã kết nối đến database!\n');

        // Đọc file SQL schema
        const schemaPath = path.join(__dirname, '01_init_schema.sql');
        if (!fs.existsSync(schemaPath)) {
            console.error('❌ Không tìm thấy file schema:', schemaPath);
            return;
        }

        const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');
        
        // Chạy từng statement
        const statements = schemaSQL
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`Đang chạy ${statements.length} statements...\n`);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                try {
                    await connection.query(statement);
                    console.log(`✅ Statement ${i + 1}/${statements.length} đã chạy`);
                } catch (error) {
                    // Bỏ qua lỗi nếu table đã tồn tại
                    if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
                        error.code === 'ER_DUP_KEYNAME' ||
                        error.message.includes('already exists')) {
                        console.log(`⚠️  Statement ${i + 1}: ${error.message.split('\n')[0]}`);
                    } else {
                        console.error(`❌ Lỗi ở statement ${i + 1}:`, error.message);
                    }
                }
            }
        }

        // Kiểm tra các bảng đã được tạo
        console.log('\n📊 Kiểm tra các bảng đã tạo:');
        const [tables] = await connection.query('SHOW TABLES');
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`  ✓ ${tableName}`);
        });

        console.log('\n✅ Database đã được khởi tạo thành công!');
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 Gợi ý:');
            console.error('  - Đảm bảo MySQL container đang chạy: docker-compose ps');
            console.error('  - Kiểm tra port: DB_PORT=' + DB_CONFIG.port);
            console.error('  - Kiểm tra credentials trong docker-compose.yml');
        }
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Chạy script
initDatabase();


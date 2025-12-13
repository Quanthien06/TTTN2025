// database/setup_comments.js
// Script để tạo bảng product_comments trong database

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tttn2025',
    multipleStatements: true
};

async function setupComments() {
    let connection;
    
    try {
        console.log('=== SETUP PRODUCT COMMENTS TABLE ===\n');
        
        connection = await mysql.createConnection(dbConfig);
        console.log('✓ Kết nối database thành công!\n');
        
        // Đọc file SQL
        const sqlPath = path.join(__dirname, 'comments_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Thực thi SQL
        console.log('Đang tạo bảng product_comments...');
        await connection.query(sql);
        console.log('✓ Đã tạo bảng product_comments thành công!\n');
        
        // Kiểm tra xem cột rating đã có chưa
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'product_comments' 
            AND COLUMN_NAME = 'rating'
        `, [dbConfig.database]);
        
        if (columns.length === 0) {
            console.log('Đang thêm cột rating...');
            await connection.query(`
                ALTER TABLE product_comments 
                ADD COLUMN rating INT DEFAULT 5 COMMENT 'Đánh giá từ 1-5 sao' AFTER comment
            `);
            console.log('✓ Đã thêm cột rating!\n');
        } else {
            console.log('✓ Cột rating đã tồn tại\n');
        }
        
        // Hiển thị cấu trúc bảng
        console.log('📊 Cấu trúc bảng product_comments:');
        const [tableColumns] = await connection.query('DESCRIBE product_comments');
        tableColumns.forEach(col => {
            console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        
        console.log('\n✅ Hoàn thành! Bảng product_comments đã sẵn sàng sử dụng.');
        console.log('\n💡 Chạy "node database/seed_comments.js" để thêm comments mẫu.');
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        if (error.sqlMessage) {
            console.error('SQL Error:', error.sqlMessage);
        }
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Đã đóng kết nối database.');
        }
    }
}

// Chạy script
setupComments();


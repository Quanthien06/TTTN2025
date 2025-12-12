// Script để thêm cột avatar_url vào bảng users
// Chạy: node database/add_avatar_field.js

const mysql = require('mysql2/promise');

const config = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tttn2025',
    multipleStatements: true
};

async function addAvatarField() {
    let connection;
    
    try {
        console.log('🔌 Đang kết nối đến database...');
        connection = await mysql.createConnection(config);
        console.log('✅ Đã kết nối thành công!');
        
        console.log('\n📝 Đang kiểm tra cột avatar_url...');
        
        // Kiểm tra avatar_url
        try {
            await connection.query('SELECT avatar_url FROM users LIMIT 1');
            console.log('✓ Cột avatar_url đã tồn tại');
        } catch (error) {
            console.log('+ Sẽ thêm cột avatar_url');
            await connection.query(
                'ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) NULL COMMENT "URL ảnh đại diện"'
            );
            console.log('✅ Đã thêm cột avatar_url thành công!');
        }
        
        // Hiển thị cấu trúc bảng users
        console.log('\n📊 Cấu trúc bảng users:');
        const [columns] = await connection.query('DESCRIBE users');
        const avatarColumn = columns.find(col => col.Field === 'avatar_url');
        if (avatarColumn) {
            console.log(`  - avatar_url (${avatarColumn.Type}) ${avatarColumn.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        }
        
        console.log('\n✅ Hoàn thành!');
        
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
addAvatarField();


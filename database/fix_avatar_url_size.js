// Script để thay đổi cột avatar_url từ VARCHAR(500) sang MEDIUMTEXT
// Để có thể lưu base64 data URL của ảnh
// Chạy: node database/fix_avatar_url_size.js

const mysql = require('mysql2/promise');

const config = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tttn2025',
    multipleStatements: true
};

async function fixAvatarUrlSize() {
    let connection;
    
    try {
        console.log('🔌 Đang kết nối đến database...');
        connection = await mysql.createConnection(config);
        console.log('✅ Đã kết nối thành công!');
        
        console.log('\n📝 Đang kiểm tra cột avatar_url...');
        
        // Kiểm tra kiểu dữ liệu hiện tại
        const [columns] = await connection.query('DESCRIBE users');
        const avatarColumn = columns.find(col => col.Field === 'avatar_url');
        
        if (!avatarColumn) {
            console.log('❌ Cột avatar_url không tồn tại. Chạy add_avatar_field.js trước.');
            process.exit(1);
        }
        
        console.log(`📊 Kiểu dữ liệu hiện tại: ${avatarColumn.Type}`);
        
        // Nếu đã là TEXT hoặc MEDIUMTEXT, không cần thay đổi
        if (avatarColumn.Type.includes('TEXT')) {
            console.log('✅ Cột avatar_url đã có kiểu TEXT, không cần thay đổi.');
            return;
        }
        
        // Thay đổi từ VARCHAR(500) sang MEDIUMTEXT
        console.log('🔄 Đang thay đổi kiểu dữ liệu sang MEDIUMTEXT...');
        await connection.query(
            'ALTER TABLE users MODIFY COLUMN avatar_url MEDIUMTEXT NULL COMMENT "URL ảnh đại diện (có thể là URL hoặc base64 data URL)"'
        );
        console.log('✅ Đã thay đổi thành công!');
        
        // Kiểm tra lại
        const [updatedColumns] = await connection.query('DESCRIBE users');
        const updatedAvatarColumn = updatedColumns.find(col => col.Field === 'avatar_url');
        if (updatedAvatarColumn) {
            console.log(`📊 Kiểu dữ liệu mới: ${updatedAvatarColumn.Type}`);
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
fixAvatarUrlSize();


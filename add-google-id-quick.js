// Script nhanh để thêm cột google_id vào bảng users
const mysql = require('mysql2/promise');

async function addGoogleId() {
    try {
        // Kết nối database (dùng cấu hình giống server.js)
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'tttn2025'
        });

        console.log('✅ Đã kết nối đến database!');

        // Kiểm tra xem cột google_id đã tồn tại chưa
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'tttn2025' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'google_id'
        `);

        if (columns.length === 0) {
            // Thêm cột google_id
            await connection.query(`
                ALTER TABLE users 
                ADD COLUMN google_id VARCHAR(255) UNIQUE NULL
            `);
            console.log('✅ Đã thêm cột google_id vào bảng users');
        } else {
            console.log('ℹ️  Cột google_id đã tồn tại');
        }

        // Tạo index cho google_id nếu chưa có
        try {
            await connection.query('CREATE INDEX idx_google_id ON users(google_id)');
            console.log('✅ Đã tạo index cho google_id');
        } catch (error) {
            if (error.code !== 'ER_DUP_KEYNAME') {
                throw error;
            }
            console.log('ℹ️  Index cho google_id đã tồn tại');
        }

        await connection.end();
        console.log('\n✅ Hoàn thành! Bảng users đã có cột google_id.');
        console.log('Bây giờ bạn có thể đăng nhập bằng Google!');
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('⚠️  Không thể kết nối đến MySQL. Đảm bảo MySQL đang chạy.');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('⚠️  Sai thông tin đăng nhập MySQL. Kiểm tra lại user/password.');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('⚠️  Database "tttn2025" không tồn tại. Tạo database trước.');
        }
        process.exit(1);
    }
}

addGoogleId();


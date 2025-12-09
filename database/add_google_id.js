// database/add_google_id.js
// Script để thêm cột google_id vào bảng users

const mysql = require('mysql2/promise');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function addGoogleId() {
    try {
        // Nhập thông tin MySQL
        const host = await question('MySQL Host (default: localhost): ') || 'localhost';
        const user = await question('MySQL User (default: root): ') || 'root';
        const password = await question('MySQL Password: ');
        const database = await question('Database name (default: tttn2025): ') || 'tttn2025';

        // Tạo connection
        const connection = await mysql.createConnection({
            host,
            user,
            password,
            database
        });

        console.log('Đã kết nối đến database!');

        // Kiểm tra xem cột google_id đã tồn tại chưa
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'google_id'
        `, [database]);

        if (columns.length === 0) {
            // Thêm cột google_id
            await connection.query(`
                ALTER TABLE users 
                ADD COLUMN google_id VARCHAR(255) UNIQUE NULL AFTER email_verified
            `);
            console.log('✓ Đã thêm cột google_id');
        } else {
            console.log('✓ Cột google_id đã tồn tại');
        }

        // Tạo index cho google_id nếu chưa có
        try {
            await connection.query('CREATE INDEX idx_google_id ON users(google_id)');
            console.log('✓ Đã tạo index cho google_id');
        } catch (error) {
            if (error.code !== 'ER_DUP_KEYNAME') {
                throw error;
            }
            console.log('✓ Index cho google_id đã tồn tại');
        }

        await connection.end();
        console.log('\n✓ Hoàn thành! Database đã được cập nhật.');
        
    } catch (error) {
        console.error('Lỗi:', error.message);
    } finally {
        rl.close();
    }
}

addGoogleId();



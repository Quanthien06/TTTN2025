// database/add_email_fields.js
// Script để thêm các cột email và OTP vào bảng users

const mysql = require('mysql2/promise');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function addEmailFields() {
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

        // Kiểm tra xem các cột đã tồn tại chưa
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
        `, [database]);

        const existingColumns = columns.map(col => col.COLUMN_NAME);
        console.log('Các cột hiện có:', existingColumns.join(', '));

        // Thêm các cột nếu chưa có
        const alterStatements = [];

        if (!existingColumns.includes('email')) {
            alterStatements.push('ADD COLUMN email VARCHAR(255) UNIQUE NULL AFTER username');
        }

        if (!existingColumns.includes('email_verified')) {
            alterStatements.push('ADD COLUMN email_verified BOOLEAN DEFAULT FALSE AFTER email');
        }

        if (!existingColumns.includes('otp_code')) {
            alterStatements.push('ADD COLUMN otp_code VARCHAR(6) NULL AFTER email_verified');
        }

        if (!existingColumns.includes('otp_expires')) {
            alterStatements.push('ADD COLUMN otp_expires TIMESTAMP NULL AFTER otp_code');
        }

        if (alterStatements.length > 0) {
            const alterSQL = `ALTER TABLE users ${alterStatements.join(', ')}`;
            console.log('Đang thực thi:', alterSQL);
            await connection.query(alterSQL);
            console.log('✓ Đã thêm các cột thành công!');
        } else {
            console.log('✓ Tất cả các cột đã tồn tại!');
        }

        // Tạo index cho email nếu chưa có
        try {
            await connection.query('CREATE INDEX idx_email ON users(email)');
            console.log('✓ Đã tạo index cho email');
        } catch (error) {
            if (error.code !== 'ER_DUP_KEYNAME') {
                throw error;
            }
            console.log('✓ Index cho email đã tồn tại');
        }

        // Tạo index cho otp_code nếu chưa có
        try {
            await connection.query('CREATE INDEX idx_otp_code ON users(otp_code)');
            console.log('✓ Đã tạo index cho otp_code');
        } catch (error) {
            if (error.code !== 'ER_DUP_KEYNAME') {
                throw error;
            }
            console.log('✓ Index cho otp_code đã tồn tại');
        }

        await connection.end();
        console.log('\n✓ Hoàn thành! Database đã được cập nhật.');
        
    } catch (error) {
        console.error('Lỗi:', error.message);
        if (error.code === 'ER_DUP_ENTRY') {
            console.error('Email đã tồn tại trong database');
        }
    } finally {
        rl.close();
    }
}

addEmailFields();


// Script để thêm các trường mới cho profile user
// Chạy: node database/add_profile_fields.js

const mysql = require('mysql2/promise');

const config = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tttn2025',
    multipleStatements: true
};

async function addProfileFields() {
    let connection;
    
    try {
        console.log('🔌 Đang kết nối đến database...');
        connection = await mysql.createConnection(config);
        console.log('✅ Đã kết nối thành công!');
        
        console.log('\n📝 Đang thêm các cột mới vào bảng users...');
        
        // Kiểm tra và thêm các cột mới
        const alterStatements = [];
        
        // Kiểm tra full_name
        try {
            await connection.query('SELECT full_name FROM users LIMIT 1');
            console.log('✓ Cột full_name đã tồn tại');
        } catch (error) {
            alterStatements.push('ADD COLUMN full_name VARCHAR(255) NULL COMMENT "Họ và tên đầy đủ"');
            console.log('+ Sẽ thêm cột full_name');
        }
        
        // Kiểm tra phone
        try {
            await connection.query('SELECT phone FROM users LIMIT 1');
            console.log('✓ Cột phone đã tồn tại');
        } catch (error) {
            alterStatements.push('ADD COLUMN phone VARCHAR(20) NULL COMMENT "Số điện thoại"');
            console.log('+ Sẽ thêm cột phone');
        }
        
        // Kiểm tra address
        try {
            await connection.query('SELECT address FROM users LIMIT 1');
            console.log('✓ Cột address đã tồn tại');
        } catch (error) {
            alterStatements.push('ADD COLUMN address TEXT NULL COMMENT "Địa chỉ"');
            console.log('+ Sẽ thêm cột address');
        }
        
        // Kiểm tra date_of_birth
        try {
            await connection.query('SELECT date_of_birth FROM users LIMIT 1');
            console.log('✓ Cột date_of_birth đã tồn tại');
        } catch (error) {
            alterStatements.push('ADD COLUMN date_of_birth DATE NULL COMMENT "Ngày sinh"');
            console.log('+ Sẽ thêm cột date_of_birth');
        }
        
        if (alterStatements.length > 0) {
            const alterSQL = `ALTER TABLE users ${alterStatements.join(', ')}`;
            console.log('\n🔧 Đang thực thi ALTER TABLE...');
            await connection.query(alterSQL);
            console.log('✅ Đã thêm các cột mới thành công!');
        } else {
            console.log('\n✅ Tất cả các cột đã tồn tại, không cần thêm mới.');
        }
        
        // Hiển thị cấu trúc bảng users
        console.log('\n📊 Cấu trúc bảng users sau khi cập nhật:');
        const [columns] = await connection.query('DESCRIBE users');
        columns.forEach(col => {
            console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        
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
addProfileFields();


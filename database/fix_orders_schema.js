// database/fix_orders_schema.js
// Script để sửa schema orders nếu thiếu cột

const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tttn2025'
};

async function fixOrdersSchema() {
    let connection;
    try {
        console.log('=== SỬA SCHEMA ORDERS ===\n');
        connection = await mysql.createConnection(dbConfig);
        console.log('✓ Kết nối thành công!\n');

        // Kiểm tra các cột cần thiết
        const [columns] = await connection.query('DESCRIBE orders');
        const existingColumns = columns.map(c => c.Field);
        console.log('Các cột hiện có:', existingColumns.join(', '));
        console.log('');

        // Kiểm tra và thêm shipping_phone nếu thiếu
        if (!existingColumns.includes('shipping_phone')) {
            console.log('→ Đang thêm cột shipping_phone...');
            await connection.query(`
                ALTER TABLE orders 
                ADD COLUMN shipping_phone VARCHAR(20) NULL AFTER shipping_address
            `);
            console.log('✓ Đã thêm cột shipping_phone');
        } else {
            console.log('✓ Cột shipping_phone đã tồn tại');
        }

        // Kiểm tra và thêm updated_at nếu thiếu
        if (!existingColumns.includes('updated_at')) {
            console.log('→ Đang thêm cột updated_at...');
            await connection.query(`
                ALTER TABLE orders 
                ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at
            `);
            console.log('✓ Đã thêm cột updated_at');
        } else {
            console.log('✓ Cột updated_at đã tồn tại');
        }

        console.log('\n=== KẾT QUẢ ===');
        console.log('✓ Schema đã được kiểm tra và sửa!');
        
        await connection.end();
        console.log('\n✓ Hoàn thành!');

    } catch (error) {
        console.error('Lỗi:', error);
        if (connection) {
            await connection.end();
        }
        process.exit(1);
    }
}

fixOrdersSchema();



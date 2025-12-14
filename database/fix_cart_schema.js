// database/fix_cart_schema.js
// Script để sửa schema carts và cart_items

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tttn2025',
    multipleStatements: true
};

async function fixCartSchema() {
    let connection;
    try {
        console.log('=== SỬA SCHEMA CARTS VÀ CART_ITEMS ===\n');
        console.log('Bước 1: Đang kết nối database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✓ Kết nối thành công!\n');

        console.log('Bước 2: Đang kiểm tra và sửa schema...\n');

        // 1. Tạo bảng carts nếu chưa có
        await connection.query(`
            CREATE TABLE IF NOT EXISTS carts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                status ENUM('active', 'completed', 'abandoned') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log('✓ Đã tạo/kiểm tra bảng carts');

        // 2. Kiểm tra và thêm cột cart_id vào cart_items
        const [cartIdCheck] = await connection.query(`
            SELECT COUNT(*) as count 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'cart_items' 
            AND COLUMN_NAME = 'cart_id'
        `, [dbConfig.database]);

        if (cartIdCheck[0].count === 0) {
            // Nếu chưa có cart_id, cần migrate dữ liệu
            console.log('  → Đang thêm cột cart_id...');
            
            // Thêm cột cart_id
            await connection.query(`
                ALTER TABLE cart_items 
                ADD COLUMN cart_id INT NULL AFTER id
            `);
            
            // Tạo carts cho các user hiện có và migrate dữ liệu
            const [users] = await connection.query('SELECT DISTINCT user_id FROM cart_items');
            for (const user of users) {
                // Tạo hoặc lấy cart cho user
                const [carts] = await connection.query(
                    'SELECT id FROM carts WHERE user_id = ? AND status = ?',
                    [user.user_id, 'active']
                );
                
                let cartId;
                if (carts.length === 0) {
                    const [result] = await connection.query(
                        'INSERT INTO carts (user_id, status) VALUES (?, ?)',
                        [user.user_id, 'active']
                    );
                    cartId = result.insertId;
                } else {
                    cartId = carts[0].id;
                }
                
                // Update cart_items với cart_id
                await connection.query(
                    'UPDATE cart_items SET cart_id = ? WHERE user_id = ? AND cart_id IS NULL',
                    [cartId, user.user_id]
                );
            }
            
            // Set NOT NULL và thêm foreign key
            await connection.query(`
                ALTER TABLE cart_items 
                MODIFY COLUMN cart_id INT NOT NULL,
                ADD FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
                ADD INDEX idx_cart_id (cart_id)
            `);
            
            console.log('  ✓ Đã thêm cột cart_id và migrate dữ liệu');
        } else {
            console.log('  ℹ️  Cột cart_id đã tồn tại');
        }

        // 3. Kiểm tra và thêm cột price vào cart_items
        const [priceCheck] = await connection.query(`
            SELECT COUNT(*) as count 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'cart_items' 
            AND COLUMN_NAME = 'price'
        `, [dbConfig.database]);

        if (priceCheck[0].count === 0) {
            console.log('  → Đang thêm cột price...');
            
            // Thêm cột price và lấy giá từ products
            await connection.query(`
                ALTER TABLE cart_items 
                ADD COLUMN price DECIMAL(10, 2) NULL AFTER quantity
            `);
            
            // Update price từ products
            await connection.query(`
                UPDATE cart_items ci
                JOIN products p ON ci.product_id = p.id
                SET ci.price = p.price
                WHERE ci.price IS NULL
            `);
            
            // Set NOT NULL
            await connection.query(`
                ALTER TABLE cart_items 
                MODIFY COLUMN price DECIMAL(10, 2) NOT NULL
            `);
            
            console.log('  ✓ Đã thêm cột price và migrate dữ liệu');
        } else {
            console.log('  ℹ️  Cột price đã tồn tại');
        }

        // 4. Xóa unique constraint cũ (user_id, product_id) nếu có
        try {
            await connection.query(`
                ALTER TABLE cart_items DROP INDEX unique_user_product
            `);
            console.log('  ✓ Đã xóa unique constraint cũ');
        } catch (error) {
            if (!error.message.includes("doesn't exist")) {
                console.log('  ℹ️  Không có unique constraint cũ để xóa');
            }
        }

        // 5. Thêm unique constraint mới (cart_id, product_id)
        try {
            await connection.query(`
                ALTER TABLE cart_items 
                ADD UNIQUE KEY unique_cart_product (cart_id, product_id)
            `);
            console.log('  ✓ Đã thêm unique constraint mới (cart_id, product_id)');
        } catch (error) {
            if (error.message.includes("Duplicate key")) {
                console.log('  ℹ️  Unique constraint đã tồn tại');
            } else {
                throw error;
            }
        }

        console.log('\n=== KẾT QUẢ ===');
        console.log('✓ Schema đã được sửa thành công!');
        
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

// Chạy script
fixCartSchema();


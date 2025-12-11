// database/03_update_products_schema.js
// Script để cập nhật schema products

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

async function updateSchema() {
    let connection;
    try {
        console.log('=== CẬP NHẬT SCHEMA PRODUCTS ===\n');
        console.log('Bước 1: Đang kết nối database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✓ Kết nối thành công!\n');

        console.log('Bước 2: Đang kiểm tra và cập nhật schema...\n');

        // Kiểm tra và thêm các cột mới
        const columns = [
            { name: 'slug', type: 'VARCHAR(255) UNIQUE', after: 'name' },
            { name: 'original_price', type: 'DECIMAL(10, 2) NULL', after: 'price' },
            { name: 'main_image_url', type: 'VARCHAR(500)', after: 'original_price' },
            { name: 'images', type: 'JSON', after: 'main_image_url' },
            { name: 'brand', type: 'VARCHAR(100)', after: 'category' },
            { name: 'stock_quantity', type: 'INT DEFAULT 0', after: 'brand' }
        ];

        for (const col of columns) {
            try {
                const [rows] = await connection.query(`
                    SELECT COUNT(*) as count 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = ? 
                    AND TABLE_NAME = 'products' 
                    AND COLUMN_NAME = ?
                `, [dbConfig.database, col.name]);

                if (rows[0].count === 0) {
                    await connection.query(`ALTER TABLE products ADD COLUMN ${col.name} ${col.type} AFTER ${col.after}`);
                    console.log(`  ✓ Đã thêm cột: ${col.name}`);
                } else {
                    console.log(`  ℹ️  Cột ${col.name} đã tồn tại`);
                }
            } catch (error) {
                console.log(`  ⚠️  Lỗi khi thêm cột ${col.name}:`, error.message);
            }
        }

        // Đổi tên cột image_url thành main_image_url nếu tồn tại
        try {
            const [rows] = await connection.query(`
                SELECT COUNT(*) as count 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = ? 
                AND TABLE_NAME = 'products' 
                AND COLUMN_NAME = 'image_url'
            `, [dbConfig.database]);

            if (rows[0].count > 0) {
                await connection.query(`
                    ALTER TABLE products 
                    CHANGE COLUMN image_url main_image_url VARCHAR(500) NOT NULL 
                    COMMENT 'Ảnh chính dùng làm nền sản phẩm'
                `);
                console.log('  ✓ Đã đổi tên cột: image_url -> main_image_url');
            }
        } catch (error) {
            console.log('  ⚠️  Lỗi khi đổi tên cột image_url:', error.message);
        }

        // Đổi tên cột stock thành stock_quantity nếu tồn tại
        try {
            const [rows] = await connection.query(`
                SELECT COUNT(*) as count 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = ? 
                AND TABLE_NAME = 'products' 
                AND COLUMN_NAME = 'stock'
            `, [dbConfig.database]);

            if (rows[0].count > 0) {
                await connection.query(`
                    ALTER TABLE products 
                    CHANGE COLUMN stock stock_quantity INT DEFAULT 0
                `);
                console.log('  ✓ Đã đổi tên cột: stock -> stock_quantity');
            }
        } catch (error) {
            console.log('  ⚠️  Lỗi khi đổi tên cột stock:', error.message);
        }

        // Thêm index cho slug nếu chưa có
        try {
            await connection.query('CREATE INDEX IF NOT EXISTS idx_slug ON products(slug)');
            console.log('  ✓ Đã thêm index cho slug');
        } catch (error) {
            console.log('  ⚠️  Lỗi khi thêm index:', error.message);
        }

        console.log('\n✅ Hoàn thành cập nhật schema!');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        console.error(error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✓ Đã đóng kết nối database.');
        }
    }
}

updateSchema();


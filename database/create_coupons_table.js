// Create coupons table
const mysql = require('mysql2/promise');

async function createCouponsTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'tttn2025'
    });

    try {
        // Create coupons table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS coupons (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                discount_type ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
                discount_value DECIMAL(10, 2) NOT NULL,
                min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
                max_discount_amount DECIMAL(10, 2) DEFAULT NULL,
                usage_limit INT DEFAULT NULL,
                used_count INT DEFAULT 0,
                valid_from DATETIME NOT NULL,
                valid_until DATETIME NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_code (code),
                INDEX idx_valid (valid_from, valid_until, is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Create coupon_usage table to track usage per user
        await connection.query(`
            CREATE TABLE IF NOT EXISTS coupon_usage (
                id INT AUTO_INCREMENT PRIMARY KEY,
                coupon_id INT NOT NULL,
                user_id INT NOT NULL,
                order_id INT,
                used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
                INDEX idx_coupon_user (coupon_id, user_id),
                INDEX idx_user (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log('✅ Coupons tables created successfully');

        // Seed some sample coupons
        await connection.query(`
            INSERT IGNORE INTO coupons (code, name, description, discount_type, discount_value, min_purchase_amount, max_discount_amount, usage_limit, valid_from, valid_until, is_active) VALUES
            ('WELCOME10', 'Chào mừng mới', 'Giảm 10% cho đơn hàng đầu tiên', 'percentage', 10, 0, 50000, 1000, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), TRUE),
            ('SAVE50K', 'Tiết kiệm 50K', 'Giảm 50,000 VNĐ cho đơn từ 500K', 'fixed', 50000, 500000, NULL, 500, NOW(), DATE_ADD(NOW(), INTERVAL 6 MONTH), TRUE),
            ('VIP20', 'VIP 20%', 'Giảm 20% cho đơn từ 1 triệu', 'percentage', 20, 1000000, 200000, 200, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), TRUE),
            ('NEWYEAR2025', 'Năm mới 2025', 'Giảm 15% cho tất cả đơn hàng', 'percentage', 15, 0, 100000, 10000, NOW(), DATE_ADD(NOW(), INTERVAL 3 MONTH), TRUE)
        `);

        console.log('✅ Sample coupons seeded');

    } catch (error) {
        console.error('❌ Error creating coupons table:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

if (require.main === module) {
    createCouponsTable()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = createCouponsTable;


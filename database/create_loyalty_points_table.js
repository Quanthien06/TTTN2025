// Create loyalty points table
const mysql = require('mysql2/promise');

async function createLoyaltyPointsTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'tttn2025'
    });

    try {
        // Create loyalty_points table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS loyalty_points (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL UNIQUE,
                balance INT DEFAULT 0,
                total_earned INT DEFAULT 0,
                total_redeemed INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Create loyalty_points_transactions table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS loyalty_points_transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                points INT NOT NULL,
                type ENUM('earn', 'redeem', 'expire', 'adjust') NOT NULL,
                description VARCHAR(255),
                order_id INT,
                reference_id VARCHAR(100),
                expires_at DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
                INDEX idx_user (user_id),
                INDEX idx_type (type),
                INDEX idx_order (order_id),
                INDEX idx_expires (expires_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log('✅ Loyalty points tables created successfully');

        // Initialize loyalty points for existing users
        await connection.query(`
            INSERT IGNORE INTO loyalty_points (user_id, balance, total_earned, total_redeemed)
            SELECT id, 0, 0, 0 FROM users
        `);

        console.log('✅ Loyalty points initialized for existing users');

    } catch (error) {
        console.error('❌ Error creating loyalty points table:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

if (require.main === module) {
    createLoyaltyPointsTable()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = createLoyaltyPointsTable;


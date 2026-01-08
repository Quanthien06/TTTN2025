/**
 * Database Security Constraints Migration
 * Thêm foreign keys, check constraints, unique constraints, và indexes
 * Cách dùng: node database/add_security_constraints.js
 */

const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tttn2025',
    multipleStatements: true
};

async function addSecurityConstraints() {
    let connection;
    
    try {
        console.log('🔒 === THÊM DATABASE CONSTRAINTS ===\n');
        connection = await mysql.createConnection(dbConfig);
        console.log('✓ Kết nối database thành công!\n');

        // 1. Add Foreign Key Constraints
        console.log('📌 1. Thêm Foreign Key Constraints...\n');
        
        const foreignKeys = [
            {
                table: 'cart_items',
                constraint: 'fk_cart_items_cart_id',
                column: 'cart_id',
                refTable: 'carts',
                refColumn: 'id',
                onDelete: 'CASCADE'
            },
            {
                table: 'cart_items',
                constraint: 'fk_cart_items_product_id',
                column: 'product_id',
                refTable: 'products',
                refColumn: 'id',
                onDelete: 'CASCADE'
            },
            {
                table: 'order_items',
                constraint: 'fk_order_items_order_id',
                column: 'order_id',
                refTable: 'orders',
                refColumn: 'id',
                onDelete: 'CASCADE'
            },
            {
                table: 'order_items',
                constraint: 'fk_order_items_product_id',
                column: 'product_id',
                refTable: 'products',
                refColumn: 'id',
                onDelete: 'RESTRICT'
            },
            {
                table: 'orders',
                constraint: 'fk_orders_user_id',
                column: 'user_id',
                refTable: 'users',
                refColumn: 'id',
                onDelete: 'RESTRICT'
            },
            {
                table: 'carts',
                constraint: 'fk_carts_user_id',
                column: 'user_id',
                refTable: 'users',
                refColumn: 'id',
                onDelete: 'CASCADE'
            }
        ];

        for (const fk of foreignKeys) {
            try {
                // Check if constraint already exists
                const [existing] = await connection.query(`
                    SELECT CONSTRAINT_NAME 
                    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                    WHERE TABLE_SCHEMA = ? 
                    AND TABLE_NAME = ? 
                    AND CONSTRAINT_NAME = ?
                `, [dbConfig.database, fk.table, fk.constraint]);

                if (existing.length > 0) {
                    console.log(`  ⊘ ${fk.constraint} đã tồn tại (bỏ qua)`);
                } else {
                    await connection.query(`
                        ALTER TABLE ${fk.table}
                        ADD CONSTRAINT ${fk.constraint}
                        FOREIGN KEY (${fk.column}) 
                        REFERENCES ${fk.refTable}(${fk.refColumn}) 
                        ON DELETE ${fk.onDelete}
                    `);
                    console.log(`  ✓ Đã thêm ${fk.constraint}`);
                }
            } catch (error) {
                if (error.code === 'ER_DUP_KEY' || error.code === 'ER_DUP_ENTRY') {
                    console.log(`  ⊘ ${fk.constraint} đã tồn tại (bỏ qua)`);
                } else {
                    console.error(`  ✗ Lỗi khi thêm ${fk.constraint}:`, error.message);
                }
            }
        }

        // 2. Add Check Constraints
        console.log('\n📌 2. Thêm Check Constraints...\n');
        
        const checkConstraints = [
            {
                table: 'products',
                constraint: 'chk_products_price_positive',
                check: 'price >= 0'
            },
            {
                table: 'products',
                constraint: 'chk_products_stock_positive',
                check: 'stock_quantity >= 0'
            },
            {
                table: 'cart_items',
                constraint: 'chk_cart_items_quantity_positive',
                check: 'quantity > 0'
            },
            {
                table: 'order_items',
                constraint: 'chk_order_items_quantity_positive',
                check: 'quantity > 0'
            },
            {
                table: 'orders',
                constraint: 'chk_orders_total_positive',
                check: 'total >= 0'
            }
        ];

        for (const chk of checkConstraints) {
            try {
                // MySQL doesn't support CHECK constraints in older versions
                // We'll use triggers instead or skip if not supported
                const [existing] = await connection.query(`
                    SELECT CONSTRAINT_NAME 
                    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                    WHERE TABLE_SCHEMA = ? 
                    AND TABLE_NAME = ? 
                    AND CONSTRAINT_NAME = ?
                `, [dbConfig.database, chk.table, chk.constraint]);

                if (existing.length > 0) {
                    console.log(`  ⊘ ${chk.constraint} đã tồn tại (bỏ qua)`);
                } else {
                    // Try to add CHECK constraint (MySQL 8.0.16+)
                    try {
                        await connection.query(`
                            ALTER TABLE ${chk.table}
                            ADD CONSTRAINT ${chk.constraint}
                            CHECK (${chk.check})
                        `);
                        console.log(`  ✓ Đã thêm ${chk.constraint}`);
                    } catch (checkError) {
                        // If CHECK not supported, log warning
                        console.log(`  ⚠ ${chk.constraint} không được hỗ trợ (MySQL version < 8.0.16)`);
                    }
                }
            } catch (error) {
                console.error(`  ✗ Lỗi khi thêm ${chk.constraint}:`, error.message);
            }
        }

        // 3. Add Unique Constraints
        console.log('\n📌 3. Thêm Unique Constraints...\n');
        
        const uniqueConstraints = [
            {
                table: 'users',
                constraint: 'uk_users_username',
                column: 'username'
            },
            {
                table: 'users',
                constraint: 'uk_users_email',
                column: 'email'
            },
            {
                table: 'products',
                constraint: 'uk_products_slug',
                column: 'slug'
            }
        ];

        for (const uk of uniqueConstraints) {
            try {
                const [existing] = await connection.query(`
                    SELECT CONSTRAINT_NAME 
                    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                    WHERE TABLE_SCHEMA = ? 
                    AND TABLE_NAME = ? 
                    AND CONSTRAINT_NAME = ?
                `, [dbConfig.database, uk.table, uk.constraint]);

                if (existing.length > 0) {
                    console.log(`  ⊘ ${uk.constraint} đã tồn tại (bỏ qua)`);
                } else {
                    await connection.query(`
                        ALTER TABLE ${uk.table}
                        ADD CONSTRAINT ${uk.constraint} UNIQUE (${uk.column})
                    `);
                    console.log(`  ✓ Đã thêm ${uk.constraint}`);
                }
            } catch (error) {
                if (error.code === 'ER_DUP_KEY' || error.code === 'ER_DUP_ENTRY') {
                    console.log(`  ⊘ ${uk.constraint} đã tồn tại (bỏ qua)`);
                } else {
                    console.error(`  ✗ Lỗi khi thêm ${uk.constraint}:`, error.message);
                }
            }
        }

        // 4. Add Indexes for Performance
        console.log('\n📌 4. Thêm Indexes...\n');
        
        const indexes = [
            { table: 'users', index: 'idx_users_email', columns: 'email' },
            { table: 'users', index: 'idx_users_username', columns: 'username' },
            { table: 'users', index: 'idx_users_role', columns: 'role' },
            { table: 'products', index: 'idx_products_category', columns: 'category' },
            { table: 'products', index: 'idx_products_slug', columns: 'slug' },
            { table: 'products', index: 'idx_products_price', columns: 'price' },
            { table: 'products', index: 'idx_products_created_at', columns: 'created_at' },
            { table: 'orders', index: 'idx_orders_user_id', columns: 'user_id' },
            { table: 'orders', index: 'idx_orders_status', columns: 'status' },
            { table: 'orders', index: 'idx_orders_created_at', columns: 'created_at' },
            { table: 'cart_items', index: 'idx_cart_items_cart_id', columns: 'cart_id' },
            { table: 'cart_items', index: 'idx_cart_items_product_id', columns: 'product_id' },
            { table: 'order_items', index: 'idx_order_items_order_id', columns: 'order_id' },
            { table: 'order_items', index: 'idx_order_items_product_id', columns: 'product_id' }
        ];

        for (const idx of indexes) {
            try {
                const [existing] = await connection.query(`
                    SELECT INDEX_NAME 
                    FROM INFORMATION_SCHEMA.STATISTICS 
                    WHERE TABLE_SCHEMA = ? 
                    AND TABLE_NAME = ? 
                    AND INDEX_NAME = ?
                `, [dbConfig.database, idx.table, idx.index]);

                if (existing.length > 0) {
                    console.log(`  ⊘ ${idx.index} đã tồn tại (bỏ qua)`);
                } else {
                    await connection.query(`
                        CREATE INDEX ${idx.index} ON ${idx.table} (${idx.columns})
                    `);
                    console.log(`  ✓ Đã thêm ${idx.index}`);
                }
            } catch (error) {
                if (error.code === 'ER_DUP_KEYNAME') {
                    console.log(`  ⊘ ${idx.index} đã tồn tại (bỏ qua)`);
                } else {
                    console.error(`  ✗ Lỗi khi thêm ${idx.index}:`, error.message);
                }
            }
        }

        console.log('\n✅ === HOÀN TẤT ===');
        console.log('✓ Database constraints đã được thêm thành công!');
        console.log('\n📋 Tóm tắt:');
        console.log('  • Foreign Keys: Đảm bảo referential integrity');
        console.log('  • Check Constraints: Đảm bảo data validation');
        console.log('  • Unique Constraints: Đảm bảo uniqueness');
        console.log('  • Indexes: Cải thiện query performance');

    } catch (error) {
        console.error('\n❌ Lỗi:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run migration
if (require.main === module) {
    addSecurityConstraints();
}

module.exports = { addSecurityConstraints };


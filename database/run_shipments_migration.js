/**
 * Script để chạy migration shipments schema
 * Cách dùng: node database/run_shipments_migration.js
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function runMigration() {
    let connection;
    
    try {
        // Kết nối tới database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'tttn2025',
            port: process.env.DB_PORT || 3306
        });

        console.log('✓ Kết nối database thành công');

        // Đọc SQL migration file
        const sqlFilePath = path.join(__dirname, '05_shipments_schema.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

        // Tách các câu lệnh SQL
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        console.log(`\n📝 Chạy ${statements.length} câu lệnh SQL...`);

        // Chạy từng câu lệnh
        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i] + ';';
            console.log(`\n[${i + 1}/${statements.length}] ${stmt.substring(0, 80)}...`);
            
            try {
                await connection.execute(stmt);
                console.log(`✓ Thành công`);
            } catch (err) {
                // Ignore "table already exists" error
                if (err.code === 'ER_TABLE_EXISTS_ERROR') {
                    console.log(`⊘ Bảng đã tồn tại (bỏ qua)`);
                } else {
                    throw err;
                }
            }
        }

        console.log('\n✅ Migration hoàn tất!');
        console.log('\nCác bảng được tạo:');
        console.log('  • shipments - Thông tin vận chuyển chính');
        console.log('  • shipment_events - Lịch sử cập nhật tracking');

        // Kiểm tra xem tables được tạo chưa
        const [tables] = await connection.execute(
            `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('shipments', 'shipment_events')`,
            [process.env.DB_NAME || 'tttn2025']
        );

        if (tables.length > 0) {
            console.log('\n📊 Các bảng tồn tại:');
            tables.forEach(t => console.log(`  • ${t.TABLE_NAME}`));
        }

    } catch (error) {
        console.error('\n❌ Lỗi:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run migration
runMigration();

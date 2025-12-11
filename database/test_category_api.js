// database/test_category_api.js
const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tttn2025'
};

async function testCategoryFilter() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        const categories = [
            'Âm thanh, Mic thu âm',
            'Đồng hồ, Camera',
            'PC, Màn hình, Máy in'
        ];
        
        console.log('\n🧪 Test filter category:\n');
        
        for (const category of categories) {
            const [rows] = await connection.query(
                'SELECT COUNT(*) as count FROM products WHERE category = ?',
                [category]
            );
            
            console.log(`Category: "${category}"`);
            console.log(`  Số sản phẩm: ${rows[0].count}`);
            
            if (rows[0].count > 0) {
                const [products] = await connection.query(
                    'SELECT id, name FROM products WHERE category = ? LIMIT 3',
                    [category]
                );
                console.log(`  Mẫu sản phẩm:`);
                products.forEach(p => console.log(`    - ${p.name}`));
            }
            console.log('');
        }
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

testCategoryFilter();


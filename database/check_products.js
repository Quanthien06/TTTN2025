// database/check_products.js
const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tttn2025'
};

async function checkProducts() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        const [rows] = await connection.query(`
            SELECT category, COUNT(*) as count 
            FROM products 
            GROUP BY category 
            ORDER BY category
        `);
        
        console.log('\n📊 Categories trong database:');
        rows.forEach(r => {
            console.log(`   ${r.category}: ${r.count} sản phẩm`);
        });
        
        // Kiểm tra một số sản phẩm cụ thể
        const [samples] = await connection.query(`
            SELECT name, category, main_image_url, images 
            FROM products 
            WHERE category IN ('Âm thanh, Mic thu âm', 'Đồng hồ, Camera', 'PC, Màn hình, Máy in')
            LIMIT 5
        `);
        
        console.log('\n📦 Mẫu sản phẩm từ các category này:');
        samples.forEach(p => {
            const images = p.images ? JSON.parse(p.images) : [];
            console.log(`   - ${p.name} (${p.category})`);
            console.log(`     Main image: ${p.main_image_url ? '✓' : '✗'}`);
            console.log(`     Additional images: ${images.length} ảnh`);
        });
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

checkProducts();


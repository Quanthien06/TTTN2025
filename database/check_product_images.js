// Quick check script
const mysql = require('mysql2/promise');

(async () => {
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'tttn2025'
    });
    
    const [rows] = await conn.query(
        'SELECT id, name, slug, main_image_url, images FROM products WHERE slug LIKE ? LIMIT 1',
        ['%iphone-15%']
    );
    
    if (rows.length > 0) {
        console.log('Product:', rows[0].name);
        console.log('Slug:', rows[0].slug);
        console.log('Main image:', rows[0].main_image_url);
        console.log('Images:', rows[0].images);
        
        if (rows[0].images) {
            try {
                const parsed = typeof rows[0].images === 'string' ? JSON.parse(rows[0].images) : rows[0].images;
                console.log('Parsed images:', parsed);
            } catch (e) {
                console.log('Error parsing:', e.message);
            }
        }
    } else {
        console.log('No product found');
    }
    
    await conn.end();
})();


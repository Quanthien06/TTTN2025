// database/format_product_images.js
// Script để format lại main_image_url và images trong database
// theo cấu trúc folder: /img/products/[slug]/1.jpg, 2.jpg, 3.jpg, 4.jpg

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tttn2025'
};

// Hàm tạo slug từ tên sản phẩm
function createSlug(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// Hàm kiểm tra file ảnh có tồn tại không
function checkImageExists(imagePath) {
    const fullPath = path.join(__dirname, '..', 'public', imagePath);
    return fs.existsSync(fullPath);
}

async function formatProductImages() {
    let connection;
    try {
        console.log('=== FORMAT PRODUCT IMAGES ===\n');
        console.log('Bước 1: Đang kết nối database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✓ Kết nối thành công!\n');

        console.log('Bước 2: Đang lấy danh sách products...');
        const [products] = await connection.query(
            'SELECT id, name, slug, main_image_url, images FROM products'
        );
        console.log(`✓ Tìm thấy ${products.length} sản phẩm\n`);

        console.log('Bước 3: Đang format lại image paths...\n');
        
        let updated = 0;
        let skipped = 0;
        let errors = 0;

        for (const product of products) {
            try {
                // Tạo slug nếu chưa có
                const slug = product.slug || createSlug(product.name);
                
                // Tạo base path
                const basePath = `/img/products/${slug}`;
                
                // Kiểm tra xem folder có tồn tại không
                const folderPath = path.join(__dirname, '..', 'public', 'img', 'products', slug);
                const folderExists = fs.existsSync(folderPath);
                
                if (!folderExists) {
                    skipped++;
                    console.log(`  ⚠️  Bỏ qua: ${product.name} (chưa có folder ảnh: ${slug})`);
                    continue;
                }
                
                // Main image: 1.jpg
                const mainImageUrl = `${basePath}/1.jpg`;
                
                // Kiểm tra main image có tồn tại không
                if (!checkImageExists(mainImageUrl)) {
                    skipped++;
                    console.log(`  ⚠️  Bỏ qua: ${product.name} (không có ảnh chính: 1.jpg)`);
                    continue;
                }
                
                // Additional images: 2.jpg, 3.jpg, 4.jpg (chỉ thêm nếu file tồn tại)
                const additionalImages = [];
                for (let i = 2; i <= 4; i++) {
                    const imagePath = `${basePath}/${i}.jpg`;
                    if (checkImageExists(imagePath)) {
                        additionalImages.push(imagePath);
                    }
                }
                
                // Cập nhật slug nếu chưa có
                if (!product.slug) {
                    await connection.query(
                        'UPDATE products SET slug = ? WHERE id = ?',
                        [slug, product.id]
                    );
                    console.log(`  ✓ Đã tạo slug cho: ${product.name} -> ${slug}`);
                }
                
                // Cập nhật main_image_url
                await connection.query(
                    'UPDATE products SET main_image_url = ? WHERE id = ?',
                    [mainImageUrl, product.id]
                );
                
                // Cập nhật images (JSON array)
                const imagesJson = JSON.stringify(additionalImages);
                await connection.query(
                    'UPDATE products SET images = ? WHERE id = ?',
                    [imagesJson, product.id]
                );
                
                updated++;
                console.log(`  ✓ Đã cập nhật: ${product.name}`);
                console.log(`    - Main image: ${mainImageUrl}`);
                console.log(`    - Additional images: ${additionalImages.length} ảnh`);
                
            } catch (error) {
                errors++;
                console.error(`  ✗ Lỗi khi cập nhật ${product.name}:`, error.message);
            }
        }

        console.log('\n=== KẾT QUẢ ===');
        console.log(`✓ Đã cập nhật: ${updated} sản phẩm`);
        console.log(`⚠️  Bỏ qua: ${skipped} sản phẩm`);
        console.log(`✗ Lỗi: ${errors} sản phẩm`);
        
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
formatProductImages();


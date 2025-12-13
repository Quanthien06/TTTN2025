// scripts/update-product-image-paths.js
// Script để cập nhật đường dẫn ảnh trong database theo cấu trúc folder mới

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tttn2025'
};

// Tạo slug từ tên sản phẩm
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

// Kiểm tra ảnh có tồn tại không
function checkProductImages(productName) {
    const slug = createSlug(productName);
    const productFolder = path.join(__dirname, '../public/img/products', slug);
    
    if (!fs.existsSync(productFolder)) {
        return null;
    }
    
    const images = [];
    // Kiểm tra ảnh 1 (main image)
    if (fs.existsSync(path.join(productFolder, '1.jpg'))) {
        images.push(`/img/products/${slug}/1.jpg`);
    }
    
    // Kiểm tra ảnh phụ (2, 3, 4)
    for (let i = 2; i <= 4; i++) {
        const imagePath = path.join(productFolder, `${i}.jpg`);
        if (fs.existsSync(imagePath)) {
            images.push(`/img/products/${slug}/${i}.jpg`);
        }
    }
    
    return images.length > 0 ? images : null;
}

// Cập nhật đường dẫn ảnh trong database
async function updateProductImagePaths() {
    let connection;
    
    try {
        console.log('🔗 Đang kết nối database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✓ Kết nối thành công!\n');
        
        // Lấy tất cả sản phẩm
        const [products] = await connection.query('SELECT id, name, slug FROM products');
        
        console.log(`📦 Tìm thấy ${products.length} sản phẩm\n`);
        console.log('🔄 Đang cập nhật đường dẫn ảnh...\n');
        
        let updatedCount = 0;
        let notFoundCount = 0;
        
        for (const product of products) {
            const images = checkProductImages(product.name);
            
            if (images && images.length > 0) {
                const mainImage = images[0];
                const otherImages = images.slice(1);
                
                await connection.query(
                    `UPDATE products 
                     SET main_image_url = ?, images = ? 
                     WHERE id = ?`,
                    [
                        mainImage,
                        JSON.stringify(otherImages),
                        product.id
                    ]
                );
                
                console.log(`✓ ${product.name}`);
                console.log(`  Main: ${mainImage}`);
                console.log(`  Others: ${otherImages.length} ảnh\n`);
                updatedCount++;
            } else {
                console.log(`⚠️  ${product.name} - Không tìm thấy ảnh\n`);
                notFoundCount++;
            }
        }
        
        console.log(`\n✅ Hoàn thành!`);
        console.log(`   ✓ Đã cập nhật: ${updatedCount} sản phẩm`);
        console.log(`   ⚠️  Không tìm thấy ảnh: ${notFoundCount} sản phẩm`);
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Chạy script
updateProductImagePaths();


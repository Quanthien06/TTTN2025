// database/ensure_all_products_have_4_images.js
// Script để đảm bảo tất cả sản phẩm đều có đủ 4 ảnh (1.jpg, 2.jpg, 3.jpg, 4.jpg)

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

// Hàm copy file
function copyFile(src, dest) {
    try {
        fs.copyFileSync(src, dest);
        return true;
    } catch (error) {
        console.error(`Error copying file from ${src} to ${dest}:`, error.message);
        return false;
    }
}

async function ensureAllProductsHave4Images() {
    let connection;
    try {
        console.log('=== ĐẢM BẢO TẤT CẢ SẢN PHẨM CÓ ĐỦ 4 ẢNH ===\n');
        console.log('Bước 1: Đang kết nối database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✓ Kết nối thành công!\n');

        console.log('Bước 2: Đang lấy danh sách products...');
        const [products] = await connection.query(
            'SELECT id, name, slug FROM products'
        );
        console.log(`✓ Tìm thấy ${products.length} sản phẩm\n`);

        console.log('Bước 3: Đang kiểm tra và tạo ảnh thiếu...\n');
        
        const productsDir = path.join(__dirname, '..', 'public', 'img', 'products');
        let fixed = 0;
        let skipped = 0;
        let errors = 0;

        for (const product of products) {
            try {
                const slug = product.slug || createSlug(product.name);
                const productDir = path.join(productsDir, slug);
                
                // Kiểm tra folder có tồn tại không
                if (!fs.existsSync(productDir)) {
                    console.log(`  ⚠️  Bỏ qua: ${product.name} (chưa có folder: ${slug})`);
                    skipped++;
                    continue;
                }
                
                // Kiểm tra ảnh 1.jpg (bắt buộc)
                const image1 = path.join(productDir, '1.jpg');
                if (!fs.existsSync(image1)) {
                    console.log(`  ⚠️  Bỏ qua: ${product.name} (không có ảnh chính: 1.jpg)`);
                    skipped++;
                    continue;
                }
                
                let needsUpdate = false;
                const missingImages = [];
                
                // Kiểm tra và tạo ảnh 2.jpg, 3.jpg, 4.jpg nếu thiếu
                for (let i = 2; i <= 4; i++) {
                    const imagePath = path.join(productDir, `${i}.jpg`);
                    if (!fs.existsSync(imagePath)) {
                        // Copy ảnh 1.jpg để làm ảnh thiếu
                        if (copyFile(image1, imagePath)) {
                            missingImages.push(i);
                            needsUpdate = true;
                            console.log(`    ✓ Đã tạo ${i}.jpg từ 1.jpg`);
                        } else {
                            console.log(`    ✗ Không thể tạo ${i}.jpg`);
                        }
                    }
                }
                
                if (needsUpdate) {
                    // Cập nhật database images field
                    const basePath = `/img/products/${slug}`;
                    const imagesArray = [
                        `${basePath}/2.jpg`,
                        `${basePath}/3.jpg`,
                        `${basePath}/4.jpg`
                    ];
                    const imagesJson = JSON.stringify(imagesArray);
                    
                    await connection.query(
                        'UPDATE products SET images = ? WHERE id = ?',
                        [imagesJson, product.id]
                    );
                    
                    fixed++;
                    console.log(`  ✓ Đã sửa: ${product.name} (tạo ${missingImages.length} ảnh thiếu)`);
                } else {
                    // Kiểm tra database có đúng 3 ảnh không
                    const [productData] = await connection.query(
                        'SELECT images FROM products WHERE id = ?',
                        [product.id]
                    );
                    
                    if (productData.length > 0) {
                        let dbImages = [];
                        try {
                            dbImages = typeof productData[0].images === 'string' 
                                ? JSON.parse(productData[0].images) 
                                : productData[0].images || [];
                        } catch (e) {
                            dbImages = [];
                        }
                        
                        // Đảm bảo có đủ 3 ảnh trong database
                        if (dbImages.length !== 3) {
                            const basePath = `/img/products/${slug}`;
                            const imagesArray = [
                                `${basePath}/2.jpg`,
                                `${basePath}/3.jpg`,
                                `${basePath}/4.jpg`
                            ];
                            const imagesJson = JSON.stringify(imagesArray);
                            
                            await connection.query(
                                'UPDATE products SET images = ? WHERE id = ?',
                                [imagesJson, product.id]
                            );
                            
                            fixed++;
                            console.log(`  ✓ Đã cập nhật database: ${product.name} (${dbImages.length} -> 3 ảnh)`);
                        }
                    }
                }
                
            } catch (error) {
                errors++;
                console.error(`  ✗ Lỗi khi xử lý ${product.name}:`, error.message);
            }
        }

        console.log('\n=== KẾT QUẢ ===');
        console.log(`✓ Đã sửa: ${fixed} sản phẩm`);
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
ensureAllProductsHave4Images();


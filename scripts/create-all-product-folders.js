// scripts/create-all-product-folders.js
// Script để tạo folder structure cho tất cả sản phẩm trong database

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tttn2025'
};

const PRODUCTS_IMG_DIR = path.join(__dirname, '../public/img/products');

// Tạo slug từ tên sản phẩm
function createSlug(name) {
    if (!name) return '';
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// Tạo folder cho một sản phẩm
function createProductFolder(slug) {
    const productFolder = path.join(PRODUCTS_IMG_DIR, slug);
    
    if (!fs.existsSync(productFolder)) {
        fs.mkdirSync(productFolder, { recursive: true });
        return true; // Folder mới được tạo
    }
    return false; // Folder đã tồn tại
}

// Tạo placeholder image (SVG) nếu chưa có ảnh
function createPlaceholderImage(folderPath, productName) {
    const placeholderPath = path.join(folderPath, '1.jpg');
    
    // Nếu đã có ảnh thì không tạo placeholder
    if (fs.existsSync(placeholderPath)) {
        return false;
    }
    
    // Tạo SVG placeholder
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="800" fill="#f3f4f6"/>
  <text x="400" y="350" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#9ca3af" text-anchor="middle">
    ${productName.substring(0, 30)}
  </text>
  <text x="400" y="400" font-family="Arial, sans-serif" font-size="24" fill="#d1d5db" text-anchor="middle">
    Chưa có ảnh
  </text>
</svg>`;
    
    // Lưu SVG (sẽ cần convert sang JPG sau nếu cần)
    const svgPath = path.join(folderPath, 'placeholder.svg');
    fs.writeFileSync(svgPath, svgContent, 'utf8');
    
    return true;
}

// Main function
async function createAllProductFolders() {
    let connection;
    
    try {
        console.log('=== TẠO FOLDER CHO TẤT CẢ SẢN PHẨM ===\n');
        
        // Kết nối database
        console.log('🔗 Đang kết nối database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✓ Kết nối thành công!\n');
        
        // Tạo folder products nếu chưa có
        if (!fs.existsSync(PRODUCTS_IMG_DIR)) {
            fs.mkdirSync(PRODUCTS_IMG_DIR, { recursive: true });
            console.log('✓ Đã tạo folder: public/img/products\n');
        }
        
        // Lấy tất cả sản phẩm
        console.log('📦 Đang lấy danh sách sản phẩm...');
        const [products] = await connection.query(
            'SELECT id, name, slug FROM products ORDER BY id'
        );
        
        console.log(`✓ Tìm thấy ${products.length} sản phẩm\n`);
        console.log('📁 Đang tạo folder structure...\n');
        
        let createdCount = 0;
        let existingCount = 0;
        let errorCount = 0;
        
        for (const product of products) {
            try {
                // Sử dụng slug từ database hoặc tạo từ tên
                const slug = product.slug || createSlug(product.name);
                
                if (!slug) {
                    console.log(`⚠️  SKIP - ID ${product.id}: Không thể tạo slug từ tên "${product.name}"`);
                    errorCount++;
                    continue;
                }
                
                // Tạo folder
                const isNew = createProductFolder(slug);
                
                if (isNew) {
                    console.log(`✓ Đã tạo: ${slug} (ID: ${product.id})`);
                    createdCount++;
                    
                    // Tạo placeholder nếu cần
                    const folderPath = path.join(PRODUCTS_IMG_DIR, slug);
                    createPlaceholderImage(folderPath, product.name);
                } else {
                    existingCount++;
                }
                
            } catch (error) {
                console.error(`✗ Lỗi khi xử lý sản phẩm ID ${product.id}:`, error.message);
                errorCount++;
            }
        }
        
        console.log('\n=== KẾT QUẢ ===');
        console.log(`✓ Đã tạo mới: ${createdCount} folder`);
        console.log(`⊘ Đã tồn tại: ${existingCount} folder`);
        if (errorCount > 0) {
            console.log(`✗ Lỗi: ${errorCount} sản phẩm`);
        }
        console.log(`\n📂 Tổng cộng: ${createdCount + existingCount} folder`);
        console.log(`\n💡 Bây giờ bạn có thể:`);
        console.log(`   1. Đặt ảnh vào các folder: public/img/products/[slug]/`);
        console.log(`   2. Đặt tên file: 1.jpg (main), 2.jpg, 3.jpg, 4.jpg (phụ)`);
        console.log(`   3. Chạy: node scripts/setup-product-images.js để resize ảnh`);
        console.log(`   4. Chạy: node scripts/update-product-image-paths.js để cập nhật database`);
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        if (error.sqlMessage) {
            console.error('SQL Error:', error.sqlMessage);
        }
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Đã đóng kết nối database.');
        }
    }
}

// Chạy script
createAllProductFolders();


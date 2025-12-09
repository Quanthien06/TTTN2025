// Script tự động cập nhật hình ảnh cho tất cả sản phẩm laptop
const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tttn2025'
};

// Mapping brand -> Unsplash search keywords hoặc image URLs
const brandImageMap = {
    'Lenovo': 'lenovo-laptop',
    'HP': 'hp-laptop',
    'Dell': 'dell-laptop',
    'Asus': 'asus-laptop',
    'Apple': 'macbook',
    'Acer': 'acer-laptop',
    'MSI': 'msi-laptop',
    'Infinix': 'laptop',
    'Realme': 'laptop',
    'Samsung': 'samsung-laptop'
};

// Tạo image URL thông minh
function generateImageURL(product) {
    const brand = product.brand || 'laptop';
    const name = product.name || '';
    
    // Option 1: Sử dụng Unsplash với brand name
    const unsplashKeyword = brandImageMap[brand] || 'laptop';
    const unsplashURL = `https://source.unsplash.com/400x400/?${encodeURIComponent(unsplashKeyword)}`;
    
    // Option 2: Sử dụng placeholder với brand và model
    const shortName = name.substring(0, 30).replace(/[^a-zA-Z0-9\s]/g, '');
    const placeholderURL = `https://via.placeholder.com/400x400/4F46E5/FFFFFF?text=${encodeURIComponent(brand + ' ' + shortName)}`;
    
    // Option 3: Sử dụng Picsum với consistent seed dựa trên product ID
    const picsumURL = `https://picsum.photos/seed/${product.id}/400/400`;
    
    // Option 4: Sử dụng DummyImage với brand color
    const brandColors = {
        'Lenovo': '0066CC',
        'HP': '0096D6',
        'Dell': '007DB8',
        'Asus': '000000',
        'Apple': '000000',
        'Acer': '83B81A',
        'MSI': 'FF0000'
    };
    const color = brandColors[brand] || '4F46E5';
    const dummyImageURL = `https://dummyimage.com/400x400/${color}/FFFFFF.png&text=${encodeURIComponent(brand)}`;
    
    // Trả về Unsplash (có thể thay đổi)
    return unsplashURL;
}

// Cập nhật hình ảnh cho tất cả sản phẩm
async function updateProductImages() {
    let connection;
    
    try {
        console.log('=== CẬP NHẬT HÌNH ẢNH SẢN PHẨM ===\n');
        
        connection = await mysql.createConnection(dbConfig);
        console.log('✓ Kết nối database thành công!\n');
        
        // Lấy tất cả sản phẩm laptop
        console.log('Đang lấy danh sách sản phẩm...');
        const [products] = await connection.query(
            `SELECT id, name, brand, image_url FROM products WHERE category LIKE 'Laptop%' ORDER BY id`
        );
        
        console.log(`Tìm thấy ${products.length} sản phẩm\n`);
        console.log('Đang cập nhật hình ảnh...\n');
        
        let updatedCount = 0;
        let skippedCount = 0;
        
        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            
            // Bỏ qua nếu đã có image_url hợp lệ (không phải placeholder cũ)
            if (product.image_url && 
                !product.image_url.includes('via.placeholder.com') && 
                !product.image_url.includes('placeholder.com')) {
                skippedCount++;
                continue;
            }
            
            // Tạo image URL mới
            const newImageURL = generateImageURL(product);
            
            // Cập nhật vào database
            await connection.query(
                'UPDATE products SET image_url = ? WHERE id = ?',
                [newImageURL, product.id]
            );
            
            updatedCount++;
            
            if ((i + 1) % 100 === 0) {
                console.log(`  Đã cập nhật ${i + 1}/${products.length} sản phẩm...`);
            }
        }
        
        console.log('\n=== KẾT QUẢ ===');
        console.log(`✓ Đã cập nhật: ${updatedCount} sản phẩm`);
        console.log(`⊘ Đã bỏ qua: ${skippedCount} sản phẩm (đã có ảnh)`);
        console.log(`📊 Tổng cộng: ${products.length} sản phẩm`);
        console.log('\n💡 Hình ảnh đã được cập nhật sử dụng Unsplash API');
        console.log('   Mỗi lần load sẽ có ảnh ngẫu nhiên từ Unsplash');
        
    } catch (error) {
        console.error('\n✗ LỖI:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\nĐã đóng kết nối database');
        }
    }
}

updateProductImages().catch(console.error);


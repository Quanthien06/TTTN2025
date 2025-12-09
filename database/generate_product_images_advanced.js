// Script nâng cao: Tạo hình ảnh với nhiều options
const mysql = require('mysql2/promise');
const https = require('https');
const fs = require('fs');
const path = require('path');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tttn2025'
};

// Các phương thức tạo image URL
const ImageGenerators = {
    // 1. Unsplash - Ảnh thật từ Unsplash
    unsplash: (product) => {
        const brand = product.brand || 'laptop';
        const keyword = brand.toLowerCase().replace(/\s+/g, '-');
        return `https://source.unsplash.com/400x400/?${keyword}-laptop`;
    },
    
    // 2. Placeholder với brand và model
    placeholder: (product) => {
        const brand = product.brand || 'Laptop';
        const name = (product.name || '').substring(0, 25).replace(/[^a-zA-Z0-9\s]/g, '');
        return `https://via.placeholder.com/400x400/4F46E5/FFFFFF?text=${encodeURIComponent(brand + ' ' + name)}`;
    },
    
    // 3. Picsum với seed cố định (cùng ID = cùng ảnh)
    picsum: (product) => {
        return `https://picsum.photos/seed/laptop-${product.id}/400/400`;
    },
    
    // 4. DummyImage với màu brand
    dummyimage: (product) => {
        const brandColors = {
            'Lenovo': '0066CC',
            'HP': '0096D6',
            'Dell': '007DB8',
            'Asus': '000000',
            'Apple': '000000',
            'Acer': '83B81A',
            'MSI': 'FF0000',
            'Infinix': '1A1A1A',
            'Realme': 'FF6900',
            'Samsung': '1428A0'
        };
        const color = brandColors[product.brand] || '4F46E5';
        const brand = product.brand || 'Laptop';
        return `https://dummyimage.com/400x400/${color}/FFFFFF.png&text=${encodeURIComponent(brand)}`;
    },
    
    // 5. Placeholder.com với thông tin chi tiết
    placeholderDetailed: (product) => {
        const brand = product.brand || 'Laptop';
        const specs = [];
        if (product.ram_gb) specs.push(`${product.ram_gb}GB RAM`);
        if (product.ssd_gb) specs.push(`${product.ssd_gb}GB SSD`);
        const specText = specs.join(' | ');
        const text = `${brand}\n${specText}`.substring(0, 50);
        return `https://via.placeholder.com/400x400/1E293B/60A5FA?text=${encodeURIComponent(text)}`;
    },
    
    // 6. UI Avatars - Avatar với brand name
    uiavatar: (product) => {
        const brand = product.brand || 'Laptop';
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(brand)}&size=400&background=4F46E5&color=fff&bold=true`;
    }
};

async function updateImagesWithMethod(method = 'unsplash') {
    let connection;
    
    try {
        console.log(`=== CẬP NHẬT HÌNH ẢNH (Method: ${method}) ===\n`);
        
        connection = await mysql.createConnection(dbConfig);
        console.log('✓ Kết nối database thành công!\n');
        
        const [products] = await connection.query(
            `SELECT id, name, brand, ram_gb, ssd_gb, image_url 
             FROM products 
             WHERE category LIKE 'Laptop%' 
             ORDER BY id`
        );
        
        console.log(`Tìm thấy ${products.length} sản phẩm\n`);
        console.log('Đang cập nhật hình ảnh...\n');
        
        const generator = ImageGenerators[method];
        if (!generator) {
            console.error(`✗ Method "${method}" không tồn tại!`);
            console.log('Các method có sẵn:', Object.keys(ImageGenerators).join(', '));
            return;
        }
        
        let updatedCount = 0;
        
        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const newImageURL = generator(product);
            
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
        console.log(`📸 Method: ${method}`);
        
    } catch (error) {
        console.error('\n✗ LỖI:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Chạy với method mặc định hoặc từ command line
const method = process.argv[2] || 'unsplash';
updateImagesWithMethod(method).catch(console.error);


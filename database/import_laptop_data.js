// Script import dữ liệu laptop từ CSV vào database
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Cấu hình database
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', // Điền password MySQL của bạn
    database: 'tttn2025',
    multipleStatements: true
};

// Giới hạn số sản phẩm cần import (giúp test nhanh, giảm tải)
const MAX_PRODUCTS = 100;

// Đọc và parse CSV - Sử dụng cách đơn giản hơn
function parseCSV(csvContent) {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        // Parse CSV đơn giản - split theo dấu phẩy
        const values = line.split(',');
        
        // Đảm bảo có đủ giá trị
        while (values.length < headers.length) {
            values.push('');
        }
        
        // Trim tất cả giá trị
        const trimmedValues = values.slice(0, headers.length).map(v => v.trim());
        
        const row = {};
        headers.forEach((header, index) => {
            row[header] = trimmedValues[index] || '';
        });
        
        // Chỉ thêm nếu có tên sản phẩm
        if (row['model_name'] && row['model_name'].trim()) {
            data.push(row);
        }
    }
    
    return data;
}

// Chuyển đổi giá trị sang kiểu dữ liệu phù hợp
function convertValue(value, fieldName) {
    if (!value || value === '' || value === 'Missing' || value === '0') {
        return null;
    }
    
    // Loại bỏ ký tự đặc biệt
    value = value.toString().trim();
    
    // Xử lý các trường số
    if (fieldName.includes('GB') || fieldName.includes('cores') || fieldName.includes('threads') || fieldName.includes('score')) {
        const num = parseInt(value.replace(/[^\d]/g, ''));
        return isNaN(num) ? null : num;
    }
    
    // Xử lý giá
    if (fieldName === 'price') {
        const num = parseFloat(value.replace(/[^\d.]/g, ''));
        return isNaN(num) ? null : num;
    }
    
    // Xử lý kích thước màn hình
    if (fieldName.includes('screen_size')) {
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
    }
    
    return value;
}

// Tạo description từ thông tin sản phẩm
function generateDescription(row) {
    const parts = [];
    
    if (row['processor_name']) parts.push(`CPU: ${row['processor_name']}`);
    if (row['ram(GB)']) parts.push(`RAM: ${row['ram(GB)']}GB`);
    if (row['ssd(GB)']) parts.push(`SSD: ${row['ssd(GB)']}GB`);
    if (row['Hard Disk(GB)'] && row['Hard Disk(GB)'] !== '0') {
        parts.push(`HDD: ${row['Hard Disk(GB)']}GB`);
    }
    if (row['graphics'] && row['graphics'] !== 'Missing') {
        parts.push(`Card đồ họa: ${row['graphics']}`);
    }
    if (row['screen_size(inches)']) {
        parts.push(`Màn hình: ${row['screen_size(inches)']}" ${row['resolution (pixels)'] || ''}`);
    }
    if (row['Operating System']) parts.push(`Hệ điều hành: ${row['Operating System']}`);
    
    return parts.join(' | ') || 'Laptop chất lượng cao';
}

// Xác định category dựa trên brand và tên sản phẩm
function determineCategory(brand, name) {
    const nameLower = name.toLowerCase();
    
    // Gaming laptop
    if (nameLower.includes('gaming') || nameLower.includes('tuf') || nameLower.includes('victus')) {
        return 'Laptop Gaming';
    }
    
    // Brand categories
    const brandCategories = {
        'Lenovo': 'Laptop Lenovo',
        'HP': 'Laptop HP',
        'Dell': 'Dell',
        'Asus': 'Laptop Asus',
        'Apple': 'Laptop Apple',
        'Acer': 'Laptop Văn phòng',
        'MSI': 'Laptop Gaming',
        'Infinix': 'Laptop Văn phòng',
        'Realme': 'Laptop Văn phòng'
    };
    
    return brandCategories[brand] || 'Laptop';
}

// Import dữ liệu
async function importData() {
    let connection;
    
    try {
        console.log('Đang kết nối database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('Kết nối thành công!');
        
        // Đọc file CSV
        const csvPath = path.join(__dirname, 'laptop.csv');
        console.log(`Đang đọc file: ${csvPath}`);
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        
        // Parse CSV
        console.log('Đang parse dữ liệu CSV...');
        const rows = parseCSV(csvContent);
        console.log(`Tìm thấy ${rows.length} sản phẩm`);

        // Chỉ lấy tối đa MAX_PRODUCTS sản phẩm đầu để import
        const rowsToImport = rows.slice(0, MAX_PRODUCTS);
        if (rows.length > MAX_PRODUCTS) {
            console.log(`Giới hạn import ${rowsToImport.length}/${rows.length} sản phẩm (có thể tăng MAX_PRODUCTS nếu cần)`);
        }
        
        // Xóa dữ liệu cũ (tùy chọn)
        console.log('Đang xóa dữ liệu cũ...');
        await connection.query('DELETE FROM products WHERE category LIKE "Laptop%"');
        
        // Insert dữ liệu
        console.log('Đang import dữ liệu...');
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < rowsToImport.length; i++) {
            const row = rowsToImport[i];
            
            try {
                const name = row['model_name'] || '';
                const brand = row['brand'] || '';
                const category = determineCategory(brand, name);
                
                const product = {
                    name: name,
                    brand: brand,
                    category: category,
                    processor_name: convertValue(row['processor_name'], 'processor_name'),
                    ram_gb: convertValue(row['ram(GB)'], 'ram(GB)'),
                    ssd_gb: convertValue(row['ssd(GB)'], 'ssd(GB)'),
                    hard_disk_gb: convertValue(row['Hard Disk(GB)'], 'Hard Disk(GB)'),
                    operating_system: convertValue(row['Operating System'], 'Operating System'),
                    graphics: convertValue(row['graphics'], 'graphics'),
                    screen_size_inches: convertValue(row['screen_size(inches)'], 'screen_size(inches)'),
                    resolution: convertValue(row['resolution (pixels)'], 'resolution (pixels)'),
                    no_of_cores: convertValue(row['no_of_cores'], 'no_of_cores'),
                    no_of_threads: convertValue(row['no_of_threads'], 'no_of_threads'),
                    spec_score: convertValue(row['spec_score'], 'spec_score'),
                    price: convertValue(row['price'], 'price'),
                    description: generateDescription(row),
                    stock: Math.floor(Math.random() * 20) + 5 // Random stock 5-25
                };
                
                // Tính original_price (giảm giá 5-15%)
                if (product.price) {
                    const discountPercent = Math.floor(Math.random() * 10) + 5; // 5-15%
                    product.original_price = Math.round(product.price * (1 + discountPercent / 100));
                }
                
                // Tạo image URL placeholder
                product.image_url = `https://via.placeholder.com/400x400?text=${encodeURIComponent(brand + ' ' + name.substring(0, 20))}`;
                
                await connection.query(
                    `INSERT INTO products (
                        name, brand, category, processor_name, ram_gb, ssd_gb, hard_disk_gb,
                        operating_system, graphics, screen_size_inches, resolution,
                        no_of_cores, no_of_threads, spec_score, price, original_price,
                        description, image_url, stock
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        product.name, product.brand, product.category,
                        product.processor_name, product.ram_gb, product.ssd_gb, product.hard_disk_gb,
                        product.operating_system, product.graphics, product.screen_size_inches, product.resolution,
                        product.no_of_cores, product.no_of_threads, product.spec_score,
                        product.price, product.original_price, product.description, product.image_url, product.stock
                    ]
                );
                
                successCount++;
                
                if ((i + 1) % 100 === 0 || i === rowsToImport.length - 1) {
                    console.log(`Đã import ${i + 1}/${rowsToImport.length} sản phẩm...`);
                }
            } catch (error) {
                errorCount++;
                console.error(`Lỗi khi import dòng ${i + 1}:`, error.message);
            }
        }
        
        console.log('\n=== KẾT QUẢ IMPORT ===');
        console.log(`Thành công: ${successCount} sản phẩm`);
        console.log(`Lỗi: ${errorCount} sản phẩm`);
        console.log(`Tổng cộng đã thử import: ${rowsToImport.length} sản phẩm`);
        
    } catch (error) {
        console.error('Lỗi:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\nĐã đóng kết nối database');
        }
    }
}

// Chạy import
if (require.main === module) {
    importData().catch(console.error);
}

module.exports = { importData };


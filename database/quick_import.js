// Script import nhanh - chạy trực tiếp
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Cấu hình database - Sửa password ở đây nếu cần
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', // Điền password MySQL của bạn (hoặc để trống nếu không có)
    database: 'tttn2025',
    multipleStatements: true
};

async function quickImport() {
    let connection;
    
    try {
        console.log('=== IMPORT LAPTOP DATA ===\n');
        console.log('Đang kết nối database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✓ Kết nối thành công!\n');
        
        // Đọc file CSV
        const csvPath = path.join(__dirname, 'laptop.csv');
        console.log(`Đang đọc file: ${csvPath}`);
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        
        // Parse CSV đơn giản
        const lines = csvContent.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        console.log(`Tìm thấy ${lines.length - 1} dòng dữ liệu\n`);
        
        // Xóa dữ liệu cũ
        console.log('Đang xóa dữ liệu cũ...');
        await connection.query('DELETE FROM products WHERE category LIKE "Laptop%"');
        console.log('✓ Đã xóa dữ liệu cũ\n');
        
        // Import dữ liệu
        console.log('Đang import dữ liệu...');
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim()) continue;
            
            try {
                const values = line.split(',');
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = (values[index] || '').trim();
                });
                
                // Bỏ qua nếu không có tên sản phẩm
                if (!row['model_name'] || !row['model_name'].trim()) continue;
                
                const name = row['model_name'].replace(/'/g, "''");
                const brand = (row['brand'] || '').replace(/'/g, "''");
                const nameLower = name.toLowerCase();
                
                // Xác định category
                let category = 'Laptop';
                if (nameLower.includes('gaming') || nameLower.includes('tuf') || nameLower.includes('victus')) {
                    category = 'Laptop Gaming';
                } else if (brand === 'Lenovo') {
                    category = 'Laptop Lenovo';
                } else if (brand === 'HP') {
                    category = 'Laptop HP';
                } else if (brand === 'Dell') {
                    category = 'Dell';
                } else if (brand === 'Asus') {
                    category = 'Laptop Asus';
                } else if (brand === 'Apple') {
                    category = 'Laptop Apple';
                }
                
                // Parse các giá trị
                const processor = (row['processor_name'] || '').replace(/'/g, "''");
                const ram = parseInt(row['ram(GB)']) || null;
                const ssd = parseInt(row['ssd(GB)']) || null;
                const hdd = parseInt(row['Hard Disk(GB)']) || null;
                const os = (row['Operating System'] || '').replace(/'/g, "''");
                const graphics = (row['graphics'] || '').replace(/'/g, "''");
                const screenSize = parseFloat(row['screen_size(inches)']) || null;
                const resolution = (row['resolution (pixels)'] || '').replace(/'/g, "''");
                const cores = parseInt(row['no_of_cores']) || null;
                const threads = parseInt(row['no_of_threads']) || null;
                const score = parseInt(row['spec_score']) || null;
                const price = parseFloat(row['price']) || null;
                
                if (!price) continue; // Bỏ qua nếu không có giá
                
                // Tạo description
                const descParts = [];
                if (processor) descParts.push(`CPU: ${processor}`);
                if (ram) descParts.push(`RAM: ${ram}GB`);
                if (ssd) descParts.push(`SSD: ${ssd}GB`);
                if (hdd && hdd > 0) descParts.push(`HDD: ${hdd}GB`);
                if (graphics && graphics !== 'Missing') descParts.push(`Card đồ họa: ${graphics}`);
                if (screenSize) descParts.push(`Màn hình: ${screenSize}" ${resolution}`);
                if (os) descParts.push(`Hệ điều hành: ${os}`);
                const description = descParts.join(' | ') || 'Laptop chất lượng cao';
                
                // Tính original_price (giảm giá 10%)
                const originalPrice = Math.round(price * 1.1);
                const stock = Math.floor(Math.random() * 20) + 5;
                const imageUrl = `https://via.placeholder.com/400x400?text=${encodeURIComponent(brand + ' ' + name.substring(0, 20))}`;
                
                await connection.query(
                    `INSERT INTO products (
                        name, brand, category, processor_name, ram_gb, ssd_gb, hard_disk_gb,
                        operating_system, graphics, screen_size_inches, resolution,
                        no_of_cores, no_of_threads, spec_score, price, original_price,
                        description, image_url, stock
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        name, brand, category, processor || null, ram, ssd, hdd || 0,
                        os || null, graphics !== 'Missing' ? graphics : null, screenSize, resolution || null,
                        cores, threads, score, price, originalPrice,
                        description, imageUrl, stock
                    ]
                );
                
                successCount++;
                
                if (successCount % 50 === 0) {
                    console.log(`  Đã import ${successCount} sản phẩm...`);
                }
            } catch (error) {
                errorCount++;
                if (errorCount <= 5) {
                    console.error(`  Lỗi dòng ${i}: ${error.message}`);
                }
            }
        }
        
        console.log('\n=== KẾT QUẢ ===');
        console.log(`✓ Thành công: ${successCount} sản phẩm`);
        console.log(`✗ Lỗi: ${errorCount} sản phẩm`);
        console.log(`📊 Tổng cộng: ${lines.length - 1} dòng`);
        
    } catch (error) {
        console.error('\n✗ LỖI:', error.message);
        if (error.message.includes('Access denied')) {
            console.log('\n💡 Gợi ý: Kiểm tra lại password MySQL trong file quick_import.js');
        }
    } finally {
        if (connection) {
            await connection.end();
            console.log('\nĐã đóng kết nối database');
        }
    }
}

// Chạy import
quickImport().catch(console.error);


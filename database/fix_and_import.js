// Script fix schema và import dữ liệu
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tttn2025',
    multipleStatements: true
};

async function fixAndImport() {
    let connection;
    
    try {
        console.log('=== FIX SCHEMA VÀ IMPORT DATA ===\n');
        
        connection = await mysql.createConnection(dbConfig);
        console.log('✓ Kết nối database thành công!\n');
        
        // Kiểm tra và ALTER TABLE
        console.log('Đang kiểm tra và cập nhật schema...');
        
        // Kiểm tra các cột hiện có
        const [columns] = await connection.query('SHOW COLUMNS FROM products');
        const existingColumns = columns.map(col => col.Field);
        
        console.log(`  Bảng products hiện có ${existingColumns.length} cột`);
        
        const alterStatements = [];
        
        // Thêm các cột mới nếu chưa có
        if (!existingColumns.includes('brand')) {
            alterStatements.push("ALTER TABLE products ADD COLUMN brand VARCHAR(100) COMMENT 'Thương hiệu' AFTER name");
        }
        if (!existingColumns.includes('processor_name')) {
            alterStatements.push("ALTER TABLE products ADD COLUMN processor_name VARCHAR(255) COMMENT 'CPU' AFTER category");
        }
        if (!existingColumns.includes('ram_gb')) {
            alterStatements.push("ALTER TABLE products ADD COLUMN ram_gb INT COMMENT 'RAM (GB)' AFTER processor_name");
        }
        if (!existingColumns.includes('ssd_gb')) {
            alterStatements.push("ALTER TABLE products ADD COLUMN ssd_gb INT COMMENT 'SSD (GB)' AFTER ram_gb");
        }
        if (!existingColumns.includes('hard_disk_gb')) {
            alterStatements.push("ALTER TABLE products ADD COLUMN hard_disk_gb INT DEFAULT 0 COMMENT 'HDD (GB)' AFTER ssd_gb");
        }
        if (!existingColumns.includes('operating_system')) {
            alterStatements.push("ALTER TABLE products ADD COLUMN operating_system VARCHAR(100) COMMENT 'Hệ điều hành' AFTER hard_disk_gb");
        }
        if (!existingColumns.includes('graphics')) {
            alterStatements.push("ALTER TABLE products ADD COLUMN graphics VARCHAR(255) COMMENT 'Card đồ họa' AFTER operating_system");
        }
        if (!existingColumns.includes('screen_size_inches')) {
            alterStatements.push("ALTER TABLE products ADD COLUMN screen_size_inches DECIMAL(4,1) COMMENT 'Kích thước màn hình' AFTER graphics");
        }
        if (!existingColumns.includes('resolution')) {
            alterStatements.push("ALTER TABLE products ADD COLUMN resolution VARCHAR(50) COMMENT 'Độ phân giải' AFTER screen_size_inches");
        }
        if (!existingColumns.includes('no_of_cores')) {
            alterStatements.push("ALTER TABLE products ADD COLUMN no_of_cores INT COMMENT 'Số nhân CPU' AFTER resolution");
        }
        if (!existingColumns.includes('no_of_threads')) {
            alterStatements.push("ALTER TABLE products ADD COLUMN no_of_threads INT COMMENT 'Số luồng CPU' AFTER no_of_cores");
        }
        if (!existingColumns.includes('spec_score')) {
            alterStatements.push("ALTER TABLE products ADD COLUMN spec_score INT COMMENT 'Điểm đánh giá' AFTER no_of_threads");
        }
        if (!existingColumns.includes('original_price')) {
            alterStatements.push("ALTER TABLE products ADD COLUMN original_price DECIMAL(15, 2) COMMENT 'Giá gốc' AFTER price");
        }
        if (!existingColumns.includes('image_url')) {
            alterStatements.push("ALTER TABLE products ADD COLUMN image_url VARCHAR(500) COMMENT 'URL hình ảnh' AFTER description");
        }
        if (!existingColumns.includes('stock')) {
            alterStatements.push("ALTER TABLE products ADD COLUMN stock INT DEFAULT 10 COMMENT 'Số lượng tồn kho' AFTER original_price");
        }
        
        for (const sql of alterStatements) {
            try {
                await connection.query(sql);
            } catch (error) {
                // Bỏ qua lỗi nếu cột đã tồn tại
                if (!error.message.includes('Duplicate column name')) {
                    console.log(`  ⚠ ${error.message}`);
                }
            }
        }
        
        // Thêm indexes
        try {
            await connection.query('CREATE INDEX IF NOT EXISTS idx_brand ON products(brand)');
            await connection.query('CREATE INDEX IF NOT EXISTS idx_brand_category ON products(brand, category)');
        } catch (error) {
            // Bỏ qua nếu index đã tồn tại
        }
        
        console.log('✓ Schema đã được cập nhật\n');
        
        // Import dữ liệu
        console.log('Đang import dữ liệu từ CSV...');
        const csvPath = path.join(__dirname, 'laptop.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const lines = csvContent.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        console.log(`  Tìm thấy ${lines.length - 1} dòng dữ liệu`);
        
        // Xóa dữ liệu cũ
        await connection.query('DELETE FROM products WHERE category LIKE "Laptop%"');
        console.log('  Đã xóa dữ liệu cũ');
        
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
                
                if (!row['model_name'] || !row['model_name'].trim()) continue;
                
                const name = row['model_name'].replace(/'/g, "''");
                const brand = (row['brand'] || '').replace(/'/g, "''");
                const nameLower = name.toLowerCase();
                
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
                
                if (!price) continue;
                
                const descParts = [];
                if (processor) descParts.push(`CPU: ${processor}`);
                if (ram) descParts.push(`RAM: ${ram}GB`);
                if (ssd) descParts.push(`SSD: ${ssd}GB`);
                if (hdd && hdd > 0) descParts.push(`HDD: ${hdd}GB`);
                if (graphics && graphics !== 'Missing') descParts.push(`Card đồ họa: ${graphics}`);
                if (screenSize) descParts.push(`Màn hình: ${screenSize}" ${resolution}`);
                if (os) descParts.push(`Hệ điều hành: ${os}`);
                const description = descParts.join(' | ') || 'Laptop chất lượng cao';
                
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
                
                if (successCount % 100 === 0) {
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
    } finally {
        if (connection) {
            await connection.end();
            console.log('\nĐã đóng kết nối database');
        }
    }
}

fixAndImport().catch(console.error);


// database/02_seed_products.js
// Script để seed dữ liệu sản phẩm mẫu

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tttn2025',
    multipleStatements: true
};

// Hàm tạo slug từ tên
function createSlug(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Dữ liệu sản phẩm mẫu
const productsData = {
    'Điện thoại, Tablet': [
        { name: 'iPhone 15 Pro Max 256GB', price: 29990000, original_price: 32990000, brand: 'Apple', description: 'iPhone 15 Pro Max với chip A17 Pro, camera 48MP, pin lâu dài', stock: 15 },
        { name: 'Samsung Galaxy S24 Ultra 512GB', price: 27990000, original_price: 29990000, brand: 'Samsung', description: 'Galaxy S24 Ultra với S Pen, camera 200MP, màn hình Dynamic AMOLED 2X', stock: 12 },
        { name: 'Xiaomi 14 Pro 256GB', price: 18990000, original_price: 20990000, brand: 'Xiaomi', description: 'Xiaomi 14 Pro với Snapdragon 8 Gen 3, camera Leica', stock: 20 },
        { name: 'OPPO Find X7 Ultra 512GB', price: 22990000, original_price: 24990000, brand: 'OPPO', description: 'OPPO Find X7 Ultra với camera kép 50MP, sạc nhanh 100W', stock: 18 },
        { name: 'iPad Pro 12.9 inch M2 256GB', price: 24990000, original_price: 26990000, brand: 'Apple', description: 'iPad Pro với chip M2, màn hình Liquid Retina XDR', stock: 14 },
        { name: 'Samsung Galaxy Tab S9 Ultra', price: 21990000, original_price: 23990000, brand: 'Samsung', description: 'Galaxy Tab S9 Ultra với S Pen, màn hình 14.6 inch', stock: 16 },
        { name: 'iPhone 14 128GB', price: 19990000, original_price: 21990000, brand: 'Apple', description: 'iPhone 14 với chip A15 Bionic, camera kép 12MP', stock: 25 },
        { name: 'Samsung Galaxy A55 5G 128GB', price: 8990000, original_price: 9990000, brand: 'Samsung', description: 'Galaxy A55 với camera 50MP, pin 5000mAh', stock: 30 },
        { name: 'Xiaomi Redmi Note 13 Pro', price: 6990000, original_price: 7990000, brand: 'Xiaomi', description: 'Redmi Note 13 Pro với camera 200MP, sạc nhanh 67W', stock: 35 },
        { name: 'OnePlus 12 256GB', price: 17990000, original_price: 19990000, brand: 'OnePlus', description: 'OnePlus 12 với Snapdragon 8 Gen 3, sạc nhanh 100W', stock: 20 },
        { name: 'Realme GT 6 256GB', price: 12990000, original_price: 14990000, brand: 'Realme', description: 'Realme GT 6 với Snapdragon 8s Gen 3, sạc nhanh 120W', stock: 22 },
        { name: 'Vivo X100 Pro 512GB', price: 20990000, original_price: 22990000, brand: 'Vivo', description: 'Vivo X100 Pro với camera Zeiss, chip MediaTek Dimensity 9300', stock: 15 },
        { name: 'iPad Air 11 inch M2 128GB', price: 14990000, original_price: 16990000, brand: 'Apple', description: 'iPad Air với chip M2, màn hình Liquid Retina', stock: 18 },
        { name: 'Huawei MatePad Pro 13.2', price: 18990000, original_price: 20990000, brand: 'Huawei', description: 'MatePad Pro với chip Kirin 9000s, màn hình OLED', stock: 12 },
        { name: 'Google Pixel 8 Pro 256GB', price: 22990000, original_price: 24990000, brand: 'Google', description: 'Pixel 8 Pro với Tensor G3, camera AI tiên tiến', stock: 10 }
    ],
    'Laptop': [
        { name: 'MacBook Pro 16 inch M3 Pro', price: 59990000, original_price: 64990000, brand: 'Apple', description: 'MacBook Pro với chip M3 Pro, RAM 18GB, SSD 512GB', stock: 8 },
        { name: 'Dell XPS 15 9530', price: 44990000, original_price: 47990000, brand: 'Dell', description: 'XPS 15 với Intel Core i7, RTX 4050, màn hình OLED 3.5K', stock: 12 },
        { name: 'ASUS ROG Strix G16', price: 32990000, original_price: 35990000, brand: 'ASUS', description: 'ROG Strix G16 với Intel Core i9, RTX 4060, màn hình 165Hz', stock: 15 },
        { name: 'HP Spectre x360 14', price: 39990000, original_price: 42990000, brand: 'HP', description: 'Spectre x360 với Intel Core i7, màn hình OLED touch, 2-in-1', stock: 10 },
        { name: 'Lenovo ThinkPad X1 Carbon Gen 11', price: 42990000, original_price: 45990000, brand: 'Lenovo', description: 'ThinkPad X1 Carbon với Intel Core i7, màn hình 2.8K', stock: 12 },
        { name: 'MacBook Air 15 inch M3', price: 39990000, original_price: 42990000, brand: 'Apple', description: 'MacBook Air với chip M3, RAM 8GB, SSD 256GB', stock: 20 },
        { name: 'MSI Stealth 16 Studio', price: 47990000, original_price: 50990000, brand: 'MSI', description: 'Stealth 16 Studio với Intel Core i9, RTX 4070, màn hình 4K', stock: 8 },
        { name: 'Acer Predator Helios 16', price: 36990000, original_price: 39990000, brand: 'Acer', description: 'Predator Helios 16 với Intel Core i7, RTX 4060, màn hình 165Hz', stock: 14 },
        { name: 'Razer Blade 15', price: 54990000, original_price: 57990000, brand: 'Razer', description: 'Blade 15 với Intel Core i9, RTX 4070, màn hình QHD 240Hz', stock: 6 },
        { name: 'LG Gram 17', price: 34990000, original_price: 37990000, brand: 'LG', description: 'LG Gram 17 với Intel Core i7, màn hình 17 inch, siêu nhẹ', stock: 16 },
        { name: 'ASUS ZenBook 14 OLED', price: 27990000, original_price: 29990000, brand: 'ASUS', description: 'ZenBook 14 với AMD Ryzen 7, màn hình OLED 2.8K', stock: 18 },
        { name: 'Microsoft Surface Laptop Studio 2', price: 49990000, original_price: 52990000, brand: 'Microsoft', description: 'Surface Laptop Studio 2 với Intel Core i7, RTX 4060', stock: 10 },
        { name: 'Dell Alienware m16 R2', price: 52990000, original_price: 55990000, brand: 'Dell', description: 'Alienware m16 với Intel Core i9, RTX 4080, màn hình QHD 165Hz', stock: 7 },
        { name: 'HP Omen 16', price: 29990000, original_price: 32990000, brand: 'HP', description: 'Omen 16 với AMD Ryzen 7, RTX 4060, màn hình 144Hz', stock: 15 },
        { name: 'Lenovo Legion Pro 7i', price: 44990000, original_price: 47990000, brand: 'Lenovo', description: 'Legion Pro 7i với Intel Core i9, RTX 4070, màn hình 240Hz', stock: 12 },
        { name: 'MacBook Pro 14 inch M3', price: 49990000, original_price: 52990000, brand: 'Apple', description: 'MacBook Pro với chip M3, RAM 18GB, SSD 512GB', stock: 14 },
        { name: 'ASUS TUF Gaming A16', price: 24990000, original_price: 26990000, brand: 'ASUS', description: 'TUF Gaming A16 với AMD Ryzen 7, RTX 4050, màn hình 165Hz', stock: 20 }
    ],
    'Âm thanh, Mic thu âm': [
        { name: 'AirPods Pro 2 USB-C', price: 6990000, original_price: 7990000, brand: 'Apple', description: 'AirPods Pro 2 với chống ồn chủ động, USB-C', stock: 30 },
        { name: 'Sony WH-1000XM5', price: 8990000, original_price: 9990000, brand: 'Sony', description: 'Tai nghe chống ồn với công nghệ LDAC, pin 30 giờ', stock: 25 },
        { name: 'Bose QuietComfort Ultra', price: 10990000, original_price: 11990000, brand: 'Bose', description: 'QuietComfort Ultra với Immersive Audio, chống ồn tốt nhất', stock: 20 },
        { name: 'JBL Flip 6', price: 2990000, original_price: 3490000, brand: 'JBL', description: 'Loa Bluetooth JBL Flip 6 chống nước IPX7, pin 12 giờ', stock: 40 },
        { name: 'Samsung Galaxy Buds2 Pro', price: 4990000, original_price: 5990000, brand: 'Samsung', description: 'Galaxy Buds2 Pro với chống ồn, chất lượng âm thanh 24-bit', stock: 35 },
        { name: 'Shure SM7B', price: 12990000, original_price: 13990000, brand: 'Shure', description: 'Microphone dynamic SM7B chuyên nghiệp cho streaming', stock: 15 },
        { name: 'Rode NT-USB+', price: 5990000, original_price: 6990000, brand: 'Rode', description: 'Microphone USB condenser Rode NT-USB+ cho podcast', stock: 25 },
        { name: 'Audio-Technica ATH-M50x', price: 3990000, original_price: 4490000, brand: 'Audio-Technica', description: 'Tai nghe studio ATH-M50x với âm thanh chính xác', stock: 30 },
        { name: 'Sennheiser HD 660S2', price: 8990000, original_price: 9990000, brand: 'Sennheiser', description: 'Tai nghe open-back HD 660S2 chất lượng cao', stock: 18 },
        { name: 'Bose SoundLink Flex', price: 3490000, original_price: 3990000, brand: 'Bose', description: 'Loa Bluetooth SoundLink Flex chống nước, pin 12 giờ', stock: 35 },
        { name: 'HyperX Cloud Alpha Wireless', price: 4990000, original_price: 5990000, brand: 'HyperX', description: 'Tai nghe gaming Cloud Alpha Wireless pin 300 giờ', stock: 28 },
        { name: 'SteelSeries Arctis Nova Pro', price: 6990000, original_price: 7990000, brand: 'SteelSeries', description: 'Tai nghe gaming Arctis Nova Pro với DAC', stock: 22 },
        { name: 'Blue Yeti X', price: 7990000, original_price: 8990000, brand: 'Blue', description: 'Microphone USB condenser Blue Yeti X với RGB', stock: 20 },
        { name: 'Elgato Wave:3', price: 5990000, original_price: 6990000, brand: 'Elgato', description: 'Microphone USB condenser Wave:3 cho streamer', stock: 25 },
        { name: 'Jabra Elite 10', price: 5990000, original_price: 6990000, brand: 'Jabra', description: 'Tai nghe true wireless Elite 10 với chống ồn', stock: 30 },
        { name: 'Anker Soundcore Liberty 4 NC', price: 3990000, original_price: 4990000, brand: 'Anker', description: 'Tai nghe true wireless với chống ồn chủ động', stock: 40 },
        { name: 'Marshall Acton III', price: 4990000, original_price: 5990000, brand: 'Marshall', description: 'Loa Bluetooth Marshall Acton III thiết kế cổ điển', stock: 25 },
        { name: 'Sonos Era 100', price: 5990000, original_price: 6990000, brand: 'Sonos', description: 'Loa thông minh Sonos Era 100 với Alexa', stock: 20 }
    ],
    'Đồng hồ, Camera': [
        { name: 'Apple Watch Ultra 2', price: 19990000, original_price: 21990000, brand: 'Apple', description: 'Apple Watch Ultra 2 với màn hình 49mm, pin 36 giờ', stock: 15 },
        { name: 'Samsung Galaxy Watch6 Classic', price: 9990000, original_price: 11990000, brand: 'Samsung', description: 'Galaxy Watch6 Classic với vòng bezel vật lý, pin 40 giờ', stock: 20 },
        { name: 'Canon EOS R6 Mark II', price: 59990000, original_price: 64990000, brand: 'Canon', description: 'Máy ảnh mirrorless Canon EOS R6 Mark II 24MP', stock: 8 },
        { name: 'Sony A7 IV', price: 54990000, original_price: 59990000, brand: 'Sony', description: 'Máy ảnh mirrorless Sony A7 IV 33MP full-frame', stock: 10 },
        { name: 'Nikon Z6 III', price: 57990000, original_price: 62990000, brand: 'Nikon', description: 'Máy ảnh mirrorless Nikon Z6 III 24MP', stock: 9 },
        { name: 'Garmin Fenix 7 Pro', price: 17990000, original_price: 19990000, brand: 'Garmin', description: 'Đồng hồ thể thao Fenix 7 Pro với GPS, pin 18 ngày', stock: 12 },
        { name: 'Fujifilm X-T5', price: 39990000, original_price: 44990000, brand: 'Fujifilm', description: 'Máy ảnh mirrorless Fujifilm X-T5 40MP', stock: 14 },
        { name: 'GoPro Hero 12 Black', price: 11990000, original_price: 13990000, brand: 'GoPro', description: 'Action camera GoPro Hero 12 Black 5.3K', stock: 25 },
        { name: 'DJI Osmo Action 4', price: 9990000, original_price: 11990000, brand: 'DJI', description: 'Action camera DJI Osmo Action 4 4K', stock: 22 },
        { name: 'Apple Watch Series 9', price: 9990000, original_price: 11990000, brand: 'Apple', description: 'Apple Watch Series 9 với chip S9, màn hình Always-On', stock: 30 },
        { name: 'Xiaomi Watch S3', price: 2990000, original_price: 3990000, brand: 'Xiaomi', description: 'Smartwatch Xiaomi Watch S3 với màn hình AMOLED', stock: 35 },
        { name: 'Canon RF 24-70mm f/2.8L', price: 59990000, original_price: 64990000, brand: 'Canon', description: 'Ống kính zoom Canon RF 24-70mm f/2.8L', stock: 6 },
        { name: 'Sony FE 70-200mm f/2.8 GM', price: 69990000, original_price: 74990000, brand: 'Sony', description: 'Ống kính tele Sony FE 70-200mm f/2.8 GM', stock: 5 },
        { name: 'Insta360 X3', price: 8990000, original_price: 10990000, brand: 'Insta360', description: 'Camera 360 độ Insta360 X3 5.7K', stock: 18 },
        { name: 'Polaroid Now+', price: 3990000, original_price: 4990000, brand: 'Polaroid', description: 'Máy ảnh lấy tức thì Polaroid Now+ với app', stock: 20 },
        { name: 'Leica Q3', price: 89990000, original_price: 94990000, brand: 'Leica', description: 'Máy ảnh compact Leica Q3 60MP full-frame', stock: 3 },
        { name: 'OM System OM-1', price: 44990000, original_price: 49990000, brand: 'OM System', description: 'Máy ảnh mirrorless OM-1 20MP với chống rung', stock: 12 },
        { name: 'Huawei Watch GT 4', price: 5990000, original_price: 6990000, brand: 'Huawei', description: 'Smartwatch Huawei Watch GT 4 pin 14 ngày', stock: 25 }
    ],
    'Phụ kiện': [
        { name: 'Sạc MagSafe Apple', price: 990000, original_price: 1290000, brand: 'Apple', description: 'Sạc không dây MagSafe cho iPhone', stock: 50 },
        { name: 'Ốp lưng iPhone 15 Pro Max', price: 490000, original_price: 690000, brand: 'Spigen', description: 'Ốp lưng Spigen Ultra Hybrid cho iPhone 15 Pro Max', stock: 60 },
        { name: 'Dán màn hình cường lực', price: 290000, original_price: 390000, brand: 'Spigen', description: 'Dán màn hình cường lực Spigen cho iPhone', stock: 80 },
        { name: 'Pin sạc dự phòng 20000mAh', price: 990000, original_price: 1290000, brand: 'Anker', description: 'Pin sạc dự phòng Anker PowerCore 20000mAh', stock: 45 },
        { name: 'Cáp USB-C to Lightning', price: 490000, original_price: 690000, brand: 'Anker', description: 'Cáp sạc Anker USB-C to Lightning 1m', stock: 70 },
        { name: 'Giá đỡ laptop', price: 490000, original_price: 690000, brand: 'Nulaxy', description: 'Giá đỡ laptop Nulaxy điều chỉnh độ cao', stock: 40 },
        { name: 'Bàn phím cơ Logitech MX Keys', price: 2990000, original_price: 3490000, brand: 'Logitech', description: 'Bàn phím không dây Logitech MX Keys', stock: 30 },
        { name: 'Chuột Logitech MX Master 3S', price: 2990000, original_price: 3490000, brand: 'Logitech', description: 'Chuột không dây Logitech MX Master 3S', stock: 35 },
        { name: 'Webcam Logitech C920', price: 2990000, original_price: 3490000, brand: 'Logitech', description: 'Webcam Logitech C920 HD 1080p', stock: 25 },
        { name: 'Ổ cứng SSD Samsung 1TB', price: 1990000, original_price: 2490000, brand: 'Samsung', description: 'Ổ cứng SSD Samsung 980 PRO 1TB NVMe', stock: 40 },
        { name: 'Thẻ nhớ SanDisk 256GB', price: 990000, original_price: 1290000, brand: 'SanDisk', description: 'Thẻ nhớ SanDisk Extreme 256GB UHS-I', stock: 50 },
        { name: 'Hub USB-C 7-in-1', price: 990000, original_price: 1290000, brand: 'Anker', description: 'Hub USB-C Anker 7-in-1 với HDMI, USB-A', stock: 35 },
        { name: 'Balo laptop Targus', price: 1990000, original_price: 2490000, brand: 'Targus', description: 'Balo laptop Targus 15.6 inch chống nước', stock: 30 },
        { name: 'Túi đựng MacBook', price: 1490000, original_price: 1990000, brand: 'Incase', description: 'Túi đựng MacBook Incase với đệm bảo vệ', stock: 25 },
        { name: 'Bàn phím cơ Keychron K8', price: 2490000, original_price: 2990000, brand: 'Keychron', description: 'Bàn phím cơ Keychron K8 wireless', stock: 28 },
        { name: 'Chuột gaming Razer DeathAdder V3', price: 1990000, original_price: 2490000, brand: 'Razer', description: 'Chuột gaming Razer DeathAdder V3', stock: 32 },
        { name: 'Bàn di chuột Logitech G640', price: 490000, original_price: 690000, brand: 'Logitech', description: 'Bàn di chuột gaming Logitech G640', stock: 40 },
        { name: 'Microphone boom arm', price: 990000, original_price: 1290000, brand: 'Rode', description: 'Cần đỡ microphone Rode PSA1', stock: 20 },
        { name: 'Đèn ring light', price: 1490000, original_price: 1990000, brand: 'Neewer', description: 'Đèn ring light Neewer 18 inch với tripod', stock: 25 },
        { name: 'Giá đỡ màn hình kép', price: 1990000, original_price: 2490000, brand: 'VIVO', description: 'Giá đỡ màn hình kép VIVO điều chỉnh độ cao', stock: 18 }
    ],
    'PC, Màn hình, Máy in': [
        { name: 'PC Gaming ASUS ROG Strix', price: 29990000, original_price: 32990000, brand: 'ASUS', description: 'PC Gaming với RTX 4060, Intel Core i7, RAM 16GB', stock: 12 },
        { name: 'PC Workstation Dell Precision', price: 39990000, original_price: 44990000, brand: 'Dell', description: 'PC Workstation với RTX 4070, Intel Xeon, RAM 32GB', stock: 8 },
        { name: 'Màn hình Dell UltraSharp U2723DE', price: 8990000, original_price: 10990000, brand: 'Dell', description: 'Màn hình Dell 27 inch 2K IPS', stock: 20 },
        { name: 'Màn hình LG UltraGear 27GP850', price: 7990000, original_price: 9990000, brand: 'LG', description: 'Màn hình gaming LG 27 inch QHD 165Hz', stock: 25 },
        { name: 'Màn hình Samsung Odyssey G9', price: 19990000, original_price: 22990000, brand: 'Samsung', description: 'Màn hình cong Samsung 49 inch QHD 240Hz', stock: 10 },
        { name: 'Máy in HP LaserJet Pro', price: 4990000, original_price: 5990000, brand: 'HP', description: 'Máy in laser HP LaserJet Pro đen trắng', stock: 15 },
        { name: 'Máy in Canon PIXMA G3010', price: 3990000, original_price: 4990000, brand: 'Canon', description: 'Máy in Canon màu phun mực liên tục', stock: 18 },
        { name: 'PC Mini Intel NUC', price: 8990000, original_price: 10990000, brand: 'Intel', description: 'PC Mini Intel NUC với Intel Core i7', stock: 14 },
        { name: 'Màn hình ASUS ProArt PA279CV', price: 10990000, original_price: 12990000, brand: 'ASUS', description: 'Màn hình ASUS 27 inch 4K cho designer', stock: 12 },
        { name: 'Màn hình Apple Studio Display', price: 39990000, original_price: 42990000, brand: 'Apple', description: 'Màn hình Apple Studio Display 27 inch 5K', stock: 8 },
        { name: 'Máy in Epson EcoTank L3250', price: 3990000, original_price: 4990000, brand: 'Epson', description: 'Máy in Epson màu phun mực liên tục', stock: 20 },
        { name: 'PC All-in-One HP Pavilion', price: 19990000, original_price: 22990000, brand: 'HP', description: 'PC All-in-One HP với màn hình 27 inch', stock: 10 },
        { name: 'Màn hình Acer Predator X34', price: 14990000, original_price: 16990000, brand: 'Acer', description: 'Màn hình gaming Acer 34 inch ultrawide 180Hz', stock: 15 },
        { name: 'Máy in Brother HL-L2350DW', price: 3990000, original_price: 4990000, brand: 'Brother', description: 'Máy in laser Brother đen trắng WiFi', stock: 16 },
        { name: 'PC Gaming MSI MAG Codex', price: 24990000, original_price: 27990000, brand: 'MSI', description: 'PC Gaming với RTX 4060, AMD Ryzen 7', stock: 14 },
        { name: 'Màn hình BenQ SW272U', price: 12990000, original_price: 14990000, brand: 'BenQ', description: 'Màn hình BenQ 27 inch 4K cho photographer', stock: 12 },
        { name: 'Máy in Canon imageCLASS', price: 5990000, original_price: 6990000, brand: 'Canon', description: 'Máy in laser Canon đen trắng đa chức năng', stock: 10 },
        { name: 'PC Workstation HP Z2', price: 34990000, original_price: 37990000, brand: 'HP', description: 'PC Workstation với RTX 4070, Intel Core i9', stock: 8 }
    ]
};

async function seedProducts() {
    let connection;
    try {
        console.log('=== SEED DỮ LIỆU SẢN PHẨM ===\n');
        console.log('Bước 1: Đang kết nối database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✓ Kết nối thành công!\n');

        // Xóa dữ liệu cũ (tùy chọn)
        console.log('Bước 2: Đang xóa dữ liệu cũ...');
        await connection.query('DELETE FROM products');
        console.log('✓ Đã xóa dữ liệu cũ\n');

        console.log('Bước 3: Đang thêm sản phẩm mới...\n');
        
        let totalProducts = 0;
        
        for (const [category, products] of Object.entries(productsData)) {
            console.log(`📦 Category: ${category} (${products.length} sản phẩm)`);
            
            for (const product of products) {
                const slug = createSlug(product.name);
                
                // Tạo mảng ảnh: 1 ảnh chính + 3 ảnh phụ
                // Sử dụng Unsplash với seed để có ảnh nhất quán
                const seed = slug.replace(/-/g, '');
                const mainImage = `https://picsum.photos/seed/${seed}-main/800/600`;
                const images = [
                    `https://picsum.photos/seed/${seed}-1/800/600`,
                    `https://picsum.photos/seed/${seed}-2/800/600`,
                    `https://picsum.photos/seed/${seed}-3/800/600`
                ];
                
                const sql = `
                    INSERT INTO products (
                        name, slug, description, price, original_price,
                        main_image_url, images, category, brand, stock_quantity
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                
                await connection.query(sql, [
                    product.name,
                    slug,
                    product.description,
                    product.price,
                    product.original_price,
                    mainImage,
                    JSON.stringify(images),
                    category,
                    product.brand,
                    product.stock
                ]);
                
                totalProducts++;
            }
            
            console.log(`  ✓ Đã thêm ${products.length} sản phẩm\n`);
        }
        
        console.log(`\n✅ Hoàn thành! Đã thêm tổng cộng ${totalProducts} sản phẩm`);
        
        // Hiển thị thống kê
        const [stats] = await connection.query(`
            SELECT category, COUNT(*) as count 
            FROM products 
            GROUP BY category
        `);
        
        console.log('\n📊 Thống kê theo category:');
        stats.forEach(stat => {
            console.log(`   ${stat.category}: ${stat.count} sản phẩm`);
        });
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        console.error(error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n✓ Đã đóng kết nối database.');
        }
    }
}

// Chạy script
seedProducts();


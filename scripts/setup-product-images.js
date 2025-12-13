// scripts/setup-product-images.js
// Script để tạo folder structure và resize ảnh sản phẩm

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Cấu hình
const PRODUCTS_IMG_DIR = path.join(__dirname, '../public/img/products');
const TARGET_SIZE = { width: 800, height: 800 }; // Kích thước chuẩn cho tất cả ảnh

// Tạo slug từ tên sản phẩm
function createSlug(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
        .replace(/[^a-z0-9\s-]/g, '') // Xóa ký tự đặc biệt
        .replace(/\s+/g, '-') // Thay space bằng dấu gạch ngang
        .replace(/-+/g, '-') // Xóa nhiều dấu gạch ngang liên tiếp
        .trim();
}

// Tạo folder structure cho sản phẩm
function createProductFolder(productName) {
    const slug = createSlug(productName);
    const productFolder = path.join(PRODUCTS_IMG_DIR, slug);
    
    if (!fs.existsSync(productFolder)) {
        fs.mkdirSync(productFolder, { recursive: true });
        console.log(`✓ Đã tạo folder: ${slug}`);
    }
    
    return { slug, folder: productFolder };
}

// Resize và lưu ảnh
async function resizeAndSaveImage(inputPath, outputPath, size = TARGET_SIZE) {
    try {
        await sharp(inputPath)
            .resize(size.width, size.height, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 90 })
            .toFile(outputPath);
        
        console.log(`  ✓ Đã resize: ${path.basename(outputPath)}`);
        return true;
    } catch (error) {
        console.error(`  ✗ Lỗi khi resize ${path.basename(inputPath)}:`, error.message);
        return false;
    }
}

// Xử lý ảnh cho một sản phẩm
async function processProductImages(productName, sourceImagesDir) {
    const { slug, folder } = createProductFolder(productName);
    
    // Chuyển đổi đường dẫn tương đối thành absolute
    let absoluteSourceDir = sourceImagesDir;
    if (!path.isAbsolute(sourceImagesDir)) {
        absoluteSourceDir = path.resolve(process.cwd(), sourceImagesDir);
    }
    
    // Kiểm tra source folder
    if (!fs.existsSync(absoluteSourceDir)) {
        console.log(`⚠️  Không tìm thấy folder: ${sourceImagesDir}`);
        console.log(`   Đã thử đường dẫn: ${absoluteSourceDir}`);
        console.log(`\n💡 Hướng dẫn:`);
        console.log(`   1. Tạo folder: ${path.join(process.cwd(), 'temp-images', slug)}`);
        console.log(`   2. Đặt ảnh vào folder đó (tên file không quan trọng)`);
        console.log(`   3. Chạy lại script với đường dẫn đúng\n`);
        return false;
    }
    
    // Lấy danh sách file ảnh
    const files = fs.readdirSync(absoluteSourceDir)
        .filter(file => {
            const filePath = path.join(absoluteSourceDir, file);
            const stat = fs.statSync(filePath);
            return stat.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(file);
        })
        .sort(); // Sắp xếp theo tên
    
    if (files.length === 0) {
        console.log(`⚠️  Không tìm thấy ảnh trong: ${absoluteSourceDir}`);
        console.log(`\n💡 Đảm bảo folder chứa file ảnh (.jpg, .jpeg, .png, .webp)\n`);
        return false;
    }
    
    console.log(`\n📦 Xử lý sản phẩm: ${productName}`);
    console.log(`   Folder: ${slug}`);
    console.log(`   Source: ${absoluteSourceDir}`);
    console.log(`   Tìm thấy ${files.length} ảnh`);
    
    // Copy và resize ảnh
    let successCount = 0;
    for (let i = 0; i < Math.min(files.length, 4); i++) {
        const sourceFile = path.join(absoluteSourceDir, files[i]);
        const outputFile = path.join(folder, `${i + 1}.jpg`);
        
        if (await resizeAndSaveImage(sourceFile, outputFile)) {
            successCount++;
        }
    }
    
    console.log(`✅ Hoàn thành: ${successCount}/${Math.min(files.length, 4)} ảnh đã được xử lý\n`);
    return successCount > 0;
}

// Batch process từ danh sách sản phẩm
async function batchProcessProducts(products) {
    console.log('🚀 Bắt đầu xử lý ảnh sản phẩm...\n');
    
    // Tạo folder products nếu chưa có
    if (!fs.existsSync(PRODUCTS_IMG_DIR)) {
        fs.mkdirSync(PRODUCTS_IMG_DIR, { recursive: true });
        console.log('✓ Đã tạo folder: public/img/products\n');
    }
    
    let successCount = 0;
    
    for (const product of products) {
        const { name, sourceDir } = product;
        if (await processProductImages(name, sourceDir)) {
            successCount++;
        }
    }
    
    console.log(`\n🎉 Hoàn thành! Đã xử lý ${successCount}/${products.length} sản phẩm`);
}

// Hàm chính
async function main() {
    // Ví dụ sử dụng:
    // Bạn có thể chỉnh sửa danh sách này theo nhu cầu
    const products = [
        {
            name: 'iPhone 15 Pro Max 256GB',
            sourceDir: path.join(__dirname, '../temp-images/iphone-15-pro-max') // Folder chứa ảnh gốc
        },
        // Thêm các sản phẩm khác ở đây
    ];
    
    // Nếu có tham số từ command line
    if (process.argv.length >= 4) {
        const productName = process.argv[2];
        const sourceDir = process.argv[3];
        await processProductImages(productName, sourceDir);
    } else if (products.length > 0) {
        await batchProcessProducts(products);
    } else {
        console.log(`
📖 Hướng dẫn sử dụng:

1. Xử lý một sản phẩm:
   node scripts/setup-product-images.js "Tên Sản Phẩm" "đường/dẫn/đến/folder/ảnh"

2. Batch process (chỉnh sửa array products trong file):
   node scripts/setup-product-images.js

Ví dụ:
   node scripts/setup-product-images.js "iPhone 15 Pro Max" "./temp-images/iphone"
        `);
    }
}

// Chạy script
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { createSlug, processProductImages, batchProcessProducts };


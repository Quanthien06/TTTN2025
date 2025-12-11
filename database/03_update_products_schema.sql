-- database/03_update_products_schema.sql
-- Script để cập nhật schema products

-- Xóa bảng cũ nếu cần (cẩn thận: sẽ mất dữ liệu)
-- DROP TABLE IF EXISTS products;

-- Tạo lại bảng với schema mới
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2) NULL,
    main_image_url VARCHAR(500) NOT NULL COMMENT 'Ảnh chính dùng làm nền sản phẩm',
    images JSON COMMENT 'Mảng JSON chứa các ảnh phụ (tối thiểu 3 ảnh)',
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_price (price),
    INDEX idx_slug (slug),
    FULLTEXT INDEX ft_search (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Nếu bảng đã tồn tại, thêm các cột mới
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE AFTER name,
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2) NULL AFTER price,
ADD COLUMN IF NOT EXISTS main_image_url VARCHAR(500) AFTER original_price,
ADD COLUMN IF NOT EXISTS images JSON AFTER main_image_url,
ADD COLUMN IF NOT EXISTS brand VARCHAR(100) AFTER category,
ADD COLUMN IF NOT EXISTS stock_quantity INT DEFAULT 0 AFTER brand;

-- Đổi tên cột image_url thành main_image_url nếu tồn tại
SET @dbname = DATABASE();
SET @tablename = 'products';
SET @columnname = 'image_url';
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE
            (TABLE_SCHEMA = @dbname)
            AND (TABLE_NAME = @tablename)
            AND (COLUMN_NAME = @columnname)
    ) > 0,
    'ALTER TABLE products CHANGE COLUMN image_url main_image_url VARCHAR(500) NOT NULL COMMENT ''Ảnh chính dùng làm nền sản phẩm'';',
    'SELECT 1'
));
PREPARE alterIfExists FROM @preparedStatement;
EXECUTE alterIfExists;
DEALLOCATE PREPARE alterIfExists;

-- Đổi tên cột stock thành stock_quantity nếu tồn tại
SET @columnname = 'stock';
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE
            (TABLE_SCHEMA = @dbname)
            AND (TABLE_NAME = @tablename)
            AND (COLUMN_NAME = @columnname)
    ) > 0,
    'ALTER TABLE products CHANGE COLUMN stock stock_quantity INT DEFAULT 0;',
    'SELECT 1'
));
PREPARE alterIfExists FROM @preparedStatement;
EXECUTE alterIfExists;
DEALLOCATE PREPARE alterIfExists;

-- Thêm index cho slug nếu chưa có
CREATE INDEX IF NOT EXISTS idx_slug ON products(slug);


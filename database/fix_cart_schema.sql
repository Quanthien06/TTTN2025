-- database/fix_cart_schema.sql
-- Script để sửa schema carts và cart_items

-- Tạo bảng carts nếu chưa có
CREATE TABLE IF NOT EXISTS carts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    status ENUM('active', 'completed', 'abandoned') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Kiểm tra và thêm cột cart_id vào cart_items nếu chưa có
SET @dbname = DATABASE();
SET @tablename = 'cart_items';
SET @columnname = 'cart_id';

SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE
            (TABLE_SCHEMA = @dbname)
            AND (TABLE_NAME = @tablename)
            AND (COLUMN_NAME = @columnname)
    ) = 0,
    'ALTER TABLE cart_items ADD COLUMN cart_id INT NOT NULL AFTER id, ADD FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE, ADD INDEX idx_cart_id (cart_id);',
    'SELECT 1'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Kiểm tra và thêm cột price vào cart_items nếu chưa có
SET @columnname = 'price';
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE
            (TABLE_SCHEMA = @dbname)
            AND (TABLE_NAME = @tablename)
            AND (COLUMN_NAME = @columnname)
    ) = 0,
    'ALTER TABLE cart_items ADD COLUMN price DECIMAL(10, 2) NOT NULL AFTER quantity;',
    'SELECT 1'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Xóa unique constraint cũ nếu có (user_id, product_id)
-- Và thêm unique constraint mới (cart_id, product_id)
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
        WHERE
            (TABLE_SCHEMA = @dbname)
            AND (TABLE_NAME = @tablename)
            AND (CONSTRAINT_NAME = 'unique_user_product')
    ) > 0,
    'ALTER TABLE cart_items DROP INDEX unique_user_product;',
    'SELECT 1'
));
PREPARE dropConstraintIfExists FROM @preparedStatement;
EXECUTE dropConstraintIfExists;
DEALLOCATE PREPARE dropConstraintIfExists;

-- Thêm unique constraint mới (cart_id, product_id)
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
        WHERE
            (TABLE_SCHEMA = @dbname)
            AND (TABLE_NAME = @tablename)
            AND (CONSTRAINT_NAME = 'unique_cart_product')
    ) = 0,
    'ALTER TABLE cart_items ADD UNIQUE KEY unique_cart_product (cart_id, product_id);',
    'SELECT 1'
));
PREPARE addConstraintIfNotExists FROM @preparedStatement;
EXECUTE addConstraintIfNotExists;
DEALLOCATE PREPARE addConstraintIfNotExists;


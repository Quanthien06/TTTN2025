-- ============================================
-- SCHEMA CHO PRODUCTS (PRODUCT SERVICE)
-- Cấu trúc lại cho dữ liệu Laptop
-- ============================================

-- Bảng products: Lưu thông tin sản phẩm laptop
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'Tên sản phẩm (model_name)',
    brand VARCHAR(100) COMMENT 'Thương hiệu (Lenovo, HP, Dell, Asus, Apple, etc.)',
    category VARCHAR(255) DEFAULT 'Laptop' COMMENT 'Danh mục sản phẩm',
    
    -- Thông tin kỹ thuật
    processor_name VARCHAR(255) COMMENT 'Tên processor (CPU)',
    ram_gb INT COMMENT 'RAM (GB)',
    ssd_gb INT COMMENT 'SSD (GB)',
    hard_disk_gb INT DEFAULT 0 COMMENT 'Ổ cứng HDD (GB)',
    operating_system VARCHAR(100) COMMENT 'Hệ điều hành (Windows, Mac, Linux)',
    graphics VARCHAR(255) COMMENT 'Card đồ họa',
    screen_size_inches DECIMAL(4,1) COMMENT 'Kích thước màn hình (inches)',
    resolution VARCHAR(50) COMMENT 'Độ phân giải (pixels)',
    no_of_cores INT COMMENT 'Số nhân CPU',
    no_of_threads INT COMMENT 'Số luồng CPU',
    spec_score INT COMMENT 'Điểm đánh giá kỹ thuật',
    
    -- Thông tin giá và bán hàng
    price DECIMAL(15, 2) NOT NULL COMMENT 'Giá bán',
    original_price DECIMAL(15, 2) COMMENT 'Giá gốc (nếu có giảm giá)',
    stock INT DEFAULT 10 COMMENT 'Số lượng tồn kho',
    
    -- Mô tả và hình ảnh
    description TEXT COMMENT 'Mô tả chi tiết sản phẩm',
    image_url VARCHAR(500) COMMENT 'URL hình ảnh sản phẩm',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_category (category),
    INDEX idx_brand (brand),
    INDEX idx_name (name),
    INDEX idx_price (price),
    INDEX idx_brand_category (brand, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tạo category "Laptop" nếu chưa có
INSERT IGNORE INTO categories (name, description) VALUES 
('Laptop', 'Máy tính xách tay các loại');

-- Tạo các categories con cho laptop theo brand
INSERT IGNORE INTO categories (name, description) VALUES 
('Laptop Lenovo', 'Laptop thương hiệu Lenovo'),
('Laptop HP', 'Laptop thương hiệu HP'),
('Laptop Dell', 'Laptop thương hiệu Dell'),
('Laptop Asus', 'Laptop thương hiệu Asus'),
('Laptop Apple', 'Laptop thương hiệu Apple (MacBook)'),
('Laptop Gaming', 'Laptop chơi game'),
('Laptop Văn phòng', 'Laptop cho công việc văn phòng');

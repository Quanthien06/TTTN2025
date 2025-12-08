-- ALTER TABLE để thêm các cột mới cho laptop data
-- Chạy file này nếu bảng products đã tồn tại

USE tttn2025;

-- Thêm các cột mới nếu chưa có
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS brand VARCHAR(100) COMMENT 'Thương hiệu' AFTER name,
ADD COLUMN IF NOT EXISTS processor_name VARCHAR(255) COMMENT 'Tên processor (CPU)' AFTER category,
ADD COLUMN IF NOT EXISTS ram_gb INT COMMENT 'RAM (GB)' AFTER processor_name,
ADD COLUMN IF NOT EXISTS ssd_gb INT COMMENT 'SSD (GB)' AFTER ram_gb,
ADD COLUMN IF NOT EXISTS hard_disk_gb INT DEFAULT 0 COMMENT 'Ổ cứng HDD (GB)' AFTER ssd_gb,
ADD COLUMN IF NOT EXISTS operating_system VARCHAR(100) COMMENT 'Hệ điều hành' AFTER hard_disk_gb,
ADD COLUMN IF NOT EXISTS graphics VARCHAR(255) COMMENT 'Card đồ họa' AFTER operating_system,
ADD COLUMN IF NOT EXISTS screen_size_inches DECIMAL(4,1) COMMENT 'Kích thước màn hình (inches)' AFTER graphics,
ADD COLUMN IF NOT EXISTS resolution VARCHAR(50) COMMENT 'Độ phân giải (pixels)' AFTER screen_size_inches,
ADD COLUMN IF NOT EXISTS no_of_cores INT COMMENT 'Số nhân CPU' AFTER resolution,
ADD COLUMN IF NOT EXISTS no_of_threads INT COMMENT 'Số luồng CPU' AFTER no_of_cores,
ADD COLUMN IF NOT EXISTS spec_score INT COMMENT 'Điểm đánh giá kỹ thuật' AFTER no_of_threads,
ADD COLUMN IF NOT EXISTS original_price DECIMAL(15, 2) COMMENT 'Giá gốc' AFTER price;

-- Thêm indexes
CREATE INDEX IF NOT EXISTS idx_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_brand_category ON products(brand, category);

-- Cập nhật category mặc định cho các sản phẩm hiện có
UPDATE products SET category = 'Laptop' WHERE category IS NULL OR category = '';


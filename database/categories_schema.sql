-- ============================================
-- SCHEMA CHO DANH MỤC SẢN PHẨM (CATEGORIES)
-- ============================================
-- File này tạo bảng categories để quản lý danh mục sản phẩm
-- Chạy file này trong MySQL Workbench hoặc phpMyAdmin

-- Tạo bảng categories nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS categories (
    -- ID tự động tăng, khóa chính
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Tên danh mục (bắt buộc, không được NULL)
    name VARCHAR(255) NOT NULL,
    
    -- Slug: URL-friendly version của tên (ví dụ: "laptop-gaming" thay vì "Laptop Gaming")
    -- UNIQUE: đảm bảo không có 2 slug trùng nhau
    slug VARCHAR(255) UNIQUE,
    
    -- Mô tả danh mục (có thể NULL)
    description TEXT,
    
    -- Thời gian tạo (tự động set khi insert)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Thời gian cập nhật (tự động update khi modify)
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Index cho slug để tìm kiếm nhanh hơn
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DỮ LIỆU MẪU (TÙY CHỌN)
-- ============================================
-- Bạn có thể uncomment và chạy phần này để thêm dữ liệu mẫu

-- INSERT INTO categories (name, slug, description) VALUES
-- ('Laptop', 'laptop', 'Máy tính xách tay'),
-- ('Điện thoại', 'dien-thoai', 'Smartphone và điện thoại di động'),
-- ('Tablet', 'tablet', 'Máy tính bảng'),
-- ('Phụ kiện', 'phu-kien', 'Các phụ kiện điện tử');


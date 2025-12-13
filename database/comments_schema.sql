-- database/comments_schema.sql
-- Script để tạo bảng comments cho sản phẩm
-- Chạy file này trong MySQL hoặc sử dụng setup_comments.js

-- Tạo bảng comments
CREATE TABLE IF NOT EXISTS product_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    username VARCHAR(100) NOT NULL,
    comment TEXT NOT NULL,
    rating INT DEFAULT 5 COMMENT 'Đánh giá từ 1-5 sao',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


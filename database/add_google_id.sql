-- ============================================
-- ALTER USERS TABLE - THÊM GOOGLE_ID
-- ============================================

-- Thêm cột google_id vào bảng users
ALTER TABLE users 
ADD COLUMN google_id VARCHAR(255) UNIQUE NULL AFTER email_verified;

-- Tạo index cho google_id để tìm kiếm nhanh
CREATE INDEX idx_google_id ON users(google_id);



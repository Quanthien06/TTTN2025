-- ============================================
-- SCHEMA CHO GIỎ HÀNG (CART)
-- ============================================

-- Bảng carts: Lưu thông tin giỏ hàng của user
CREATE TABLE IF NOT EXISTS carts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    status ENUM('active', 'completed', 'abandoned') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_status (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng cart_items: Lưu các sản phẩm trong giỏ hàng
CREATE TABLE IF NOT EXISTS cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1 COMMENT 'Số lượng phải lớn hơn 0 (validation ở application level)',
    price DECIMAL(15, 2) NOT NULL COMMENT 'Giá tại thời điểm thêm vào giỏ (tránh giá thay đổi)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_product (cart_id, product_id) COMMENT 'Mỗi sản phẩm chỉ có 1 record trong 1 cart',
    INDEX idx_cart_id (cart_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- STORED PROCEDURES (TÙY CHỌN)
-- ============================================

-- Procedure: Lấy hoặc tạo cart active cho user
-- Lưu ý: Một số phiên bản MySQL/MariaDB không hỗ trợ CREATE PROCEDURE IF NOT EXISTS
-- Nếu gặp lỗi, hãy xóa procedure cũ trước: DROP PROCEDURE IF EXISTS GetOrCreateActiveCart;
DELIMITER //
CREATE PROCEDURE GetOrCreateActiveCart(IN p_user_id INT)
BEGIN
    DECLARE v_cart_id INT;
    
    -- Tìm cart active của user
    SELECT id INTO v_cart_id 
    FROM carts 
    WHERE user_id = p_user_id AND status = 'active' 
    LIMIT 1;
    
    -- Nếu chưa có, tạo mới
    IF v_cart_id IS NULL THEN
        INSERT INTO carts (user_id, status) 
        VALUES (p_user_id, 'active');
        SET v_cart_id = LAST_INSERT_ID();
    END IF;
    
    SELECT v_cart_id as cart_id;
END //
DELIMITER ;

-- Procedure: Tính tổng tiền của cart
-- Lưu ý: Nếu gặp lỗi, hãy xóa procedure cũ trước: DROP PROCEDURE IF EXISTS CalculateCartTotal;
DELIMITER //
CREATE PROCEDURE CalculateCartTotal(IN p_cart_id INT)
BEGIN
    SELECT 
        c.id as cart_id,
        c.user_id,
        COUNT(ci.id) as item_count,
        COALESCE(SUM(ci.price * ci.quantity), 0) as total
    FROM carts c
    LEFT JOIN cart_items ci ON c.id = ci.cart_id
    WHERE c.id = p_cart_id
    GROUP BY c.id, c.user_id;
END //
DELIMITER ;

-- ============================================
-- VIEWS (TÙY CHỌN)
-- ============================================

-- View: Xem cart với thông tin đầy đủ
-- Lưu ý: Nếu gặp lỗi, hãy xóa view cũ trước: DROP VIEW IF EXISTS v_cart_details;
CREATE OR REPLACE VIEW v_cart_details AS
SELECT 
    c.id as cart_id,
    c.user_id,
    u.username,
    c.status,
    c.created_at as cart_created_at,
    c.updated_at as cart_updated_at,
    ci.id as item_id,
    ci.product_id,
    p.name as product_name,
    p.category as product_category,
    ci.quantity,
    ci.price as item_price,
    (ci.price * ci.quantity) as subtotal,
    ci.created_at as item_added_at
FROM carts c
JOIN users u ON c.user_id = u.id
LEFT JOIN cart_items ci ON c.id = ci.cart_id
LEFT JOIN products p ON ci.product_id = p.id
WHERE c.status = 'active';

-- View: Tổng hợp cart summary
-- Lưu ý: Nếu gặp lỗi, hãy xóa view cũ trước: DROP VIEW IF EXISTS v_cart_summary;
CREATE OR REPLACE VIEW v_cart_summary AS
SELECT 
    c.id as cart_id,
    c.user_id,
    u.username,
    c.status,
    COUNT(ci.id) as total_items,
    COALESCE(SUM(ci.quantity), 0) as total_quantity,
    COALESCE(SUM(ci.price * ci.quantity), 0) as total_amount,
    c.created_at,
    c.updated_at
FROM carts c
JOIN users u ON c.user_id = u.id
LEFT JOIN cart_items ci ON c.id = ci.cart_id
GROUP BY c.id, c.user_id, u.username, c.status, c.created_at, c.updated_at;

-- ============================================
-- TRIGGERS (TÙY CHỌN)
-- ============================================

-- Trigger: Tự động xóa cart nếu không còn items
-- Lưu ý: Một số phiên bản MySQL/MariaDB không hỗ trợ CREATE TRIGGER IF NOT EXISTS
-- Nếu gặp lỗi, hãy xóa trigger cũ trước: DROP TRIGGER IF EXISTS trg_delete_empty_cart;
DELIMITER //
CREATE TRIGGER trg_delete_empty_cart
AFTER DELETE ON cart_items
FOR EACH ROW
BEGIN
    DECLARE item_count INT;
    
    SELECT COUNT(*) INTO item_count
    FROM cart_items
    WHERE cart_id = OLD.cart_id;
    
    IF item_count = 0 THEN
        DELETE FROM carts WHERE id = OLD.cart_id;
    END IF;
END //
DELIMITER ;

-- ============================================
-- SAMPLE DATA (ĐỂ TEST)
-- ============================================

-- Thêm dữ liệu mẫu (chỉ chạy nếu muốn test)
-- INSERT INTO carts (user_id, status) VALUES (1, 'active');
-- INSERT INTO cart_items (cart_id, product_id, quantity, price) 
-- VALUES (1, 1, 2, 30000000), (1, 2, 1, 15000000);

-- ============================================
-- INDEXES BỔ SUNG (Để tối ưu performance)
-- ============================================

-- Index cho tìm kiếm cart theo user và status
-- Đã có trong CREATE TABLE: INDEX idx_user_status (user_id, status)

-- Index cho tìm kiếm items theo cart
-- Đã có trong CREATE TABLE: INDEX idx_cart_id (cart_id)

-- ============================================
-- CLEANUP QUERIES (Dọn dẹp dữ liệu cũ)
-- ============================================

-- Xóa các cart abandoned quá 30 ngày
-- DELETE FROM carts 
-- WHERE status = 'abandoned' 
-- AND updated_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Xóa các cart completed quá 90 ngày (nếu muốn)
-- DELETE FROM carts 
-- WHERE status = 'completed' 
-- AND updated_at < DATE_SUB(NOW(), INTERVAL 90 DAY);


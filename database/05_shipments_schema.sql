-- ============================================
-- SHIPMENTS & SHIPMENT TRACKING TABLE
-- ============================================
-- Dùng để lưu thông tin vận chuyển và lịch sử tracking

-- 1. SHIPMENTS TABLE - Thông tin vận chuyển chính
CREATE TABLE IF NOT EXISTS shipments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    carrier_name VARCHAR(100) COMMENT 'Tên đơn vị vận chuyển (GHN, GHTK, Viettel, v.v.)',
    tracking_number VARCHAR(100) UNIQUE COMMENT 'Mã tracking từ đơn vị vận chuyển',
    status ENUM('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'failed') DEFAULT 'pending',
    estimated_delivery_date DATE COMMENT 'Ngày dự kiến giao hàng',
    actual_delivery_date DATE COMMENT 'Ngày thực tế giao hàng',
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    notes TEXT COMMENT 'Ghi chú từ người giao hàng',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_tracking_number (tracking_number),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. SHIPMENT EVENTS TABLE - Lịch sử cập nhật tracking
CREATE TABLE IF NOT EXISTS shipment_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shipment_id INT NOT NULL,
    status ENUM('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'failed') NOT NULL,
    event_label VARCHAR(255) COMMENT 'Mô tả sự kiện (VD: "Đơn hàng đã được nhặt từ kho")',
    location VARCHAR(255) COMMENT 'Vị trí xảy ra sự kiện',
    event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE,
    INDEX idx_shipment_id (shipment_id),
    INDEX idx_event_time (event_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Thêm cột shipment_id vào orders table (nếu chưa có)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipment_id INT NULL;
ALTER TABLE orders ADD FOREIGN KEY IF NOT EXISTS fk_shipment_id (shipment_id) REFERENCES shipments(id);

-- 4. Update order status để liên kết với shipment status
-- Khi shipment status thay đổi, order status cũng thay đổi tương ứng

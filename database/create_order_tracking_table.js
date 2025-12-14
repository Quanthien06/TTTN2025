// database/create_order_tracking_table.js
// Script để tạo bảng order_tracking_history
// Chạy: node database/create_order_tracking_table.js

const mysql = require('mysql2/promise');

const config = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tttn2025',
    multipleStatements: true
};

async function createOrderTrackingTable() {
    let connection;
    
    try {
        console.log('🔌 Đang kết nối đến database...');
        connection = await mysql.createConnection(config);
        console.log('✅ Đã kết nối thành công!');
        
        console.log('\n📝 Đang kiểm tra bảng order_tracking_history...');
        
        // Kiểm tra xem bảng đã tồn tại chưa
        try {
            await connection.query('SELECT 1 FROM order_tracking_history LIMIT 1');
            console.log('✓ Bảng order_tracking_history đã tồn tại');
        } catch (error) {
            console.log('+ Sẽ tạo bảng order_tracking_history');
            
            // Tạo bảng order_tracking_history
            await connection.query(`
                CREATE TABLE IF NOT EXISTS order_tracking_history (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    order_id INT NOT NULL,
                    status VARCHAR(50) NOT NULL COMMENT 'Trạng thái: order_placed, order_paid, shipped, delivered, cancelled',
                    status_label VARCHAR(100) NOT NULL COMMENT 'Nhãn hiển thị tiếng Việt',
                    description TEXT NULL COMMENT 'Mô tả chi tiết',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                    INDEX idx_order_id (order_id),
                    INDEX idx_status (status),
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Lịch sử tracking đơn hàng'
            `);
            console.log('✅ Đã tạo bảng order_tracking_history thành công!');
            
            // Tạo dữ liệu tracking cho các đơn hàng hiện có (nếu có)
            console.log('\n📊 Đang tạo tracking history cho các đơn hàng hiện có...');
            const [orders] = await connection.query('SELECT id, status, created_at FROM orders ORDER BY id');
            
            if (orders.length > 0) {
                console.log(`Tìm thấy ${orders.length} đơn hàng, đang tạo tracking...`);
                
                const statusMap = {
                    'pending': { status: 'order_placed', label: 'Đơn hàng đã đặt' },
                    'processing': { status: 'order_paid', label: 'Đơn hàng đã thanh toán' },
                    'shipped': { status: 'shipped', label: 'Đã giao cho đơn vị vận chuyển' },
                    'delivered': { status: 'delivered', label: 'Đã nhận được hàng' },
                    'cancelled': { status: 'cancelled', label: 'Đơn hàng đã hủy' }
                };
                
                for (const order of orders) {
                    // Tạo tracking entry cho trạng thái hiện tại
                    const statusInfo = statusMap[order.status] || { status: 'order_placed', label: 'Đơn hàng đã đặt' };
                    
                    // Kiểm tra xem đã có tracking chưa
                    const [existing] = await connection.query(
                        'SELECT id FROM order_tracking_history WHERE order_id = ? AND status = ?',
                        [order.id, statusInfo.status]
                    );
                    
                    if (existing.length === 0) {
                        await connection.query(
                            'INSERT INTO order_tracking_history (order_id, status, status_label, created_at) VALUES (?, ?, ?, ?)',
                            [order.id, statusInfo.status, statusInfo.label, order.created_at]
                        );
                    }
                }
                
                console.log(`✅ Đã tạo tracking cho ${orders.length} đơn hàng`);
            } else {
                console.log('Không có đơn hàng nào để tạo tracking');
            }
        }
        
        console.log('\n✅ Hoàn thành!');
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        if (error.sqlMessage) {
            console.error('SQL Error:', error.sqlMessage);
        }
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Đã đóng kết nối database.');
        }
    }
}

// Chạy script
createOrderTrackingTable();


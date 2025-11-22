# HƯỚNG DẪN TRIỂN KHAI ORDERS API - STEP BY STEP

## 📋 TỔNG QUAN

Hướng dẫn chi tiết từng bước để tạo Orders API hoàn chỉnh, từ database đến routes.

---

## BƯỚC 1: TẠO DATABASE SCHEMA

### 1.1. Tạo file SQL

Tạo file: `database/orders_schema.sql`

### 1.2. Copy và chạy SQL sau:

```sql
-- Bảng orders: Lưu thông tin đơn hàng
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total DECIMAL(15, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng order_items: Lưu các sản phẩm trong đơn hàng
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(15, 2) NOT NULL COMMENT 'Giá tại thời điểm đặt hàng',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 1.3. Chạy SQL trong MySQL:

- Mở MySQL Workbench hoặc phpMyAdmin
- Chọn database `tttn2025`
- Copy và paste SQL vào
- Execute

**Kiểm tra**: Chạy `SHOW TABLES;` để xem có `orders` và `order_items` chưa.

---

## BƯỚC 2: TẠO FILE ROUTES/ORDERS.JS

### 2.1. Tạo file mới

Tạo file: `routes/order.js` (hoặc `routes/orders.js`)

### 2.2. Copy code cơ bản:

```javascript
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

// Tất cả routes đều cần authenticateToken
// Code sẽ được thêm vào các bước sau

module.exports = router;
```

### 2.3. Lưu file

---

## BƯỚC 3: TẠO API POST /api/orders (Tạo đơn hàng)

### 3.1. Thêm vào `routes/order.js`:

```javascript
// POST /api/orders - Tạo đơn hàng từ cart
router.post('/', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    const { shipping_address, phone } = req.body;

    try {
        // 1. Lấy cart active của user
        const [carts] = await pool.query(
            'SELECT * FROM carts WHERE user_id = ? AND status = ?',
            [userId, 'active']
        );

        if (carts.length === 0) {
            return res.status(404).json({ message: 'Giỏ hàng trống' });
        }

        const cartId = carts[0].id;

        // 2. Lấy items trong cart
        const [cartItems] = await pool.query(
            'SELECT * FROM cart_items WHERE cart_id = ?',
            [cartId]
        );

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng không có sản phẩm' });
        }

        // 3. Tính tổng tiền
        const [totalRows] = await pool.query(
            'SELECT SUM(price * quantity) as total FROM cart_items WHERE cart_id = ?',
            [cartId]
        );
        const total = totalRows[0].total || 0;

        // 4. Tạo đơn hàng
        const [orderResult] = await pool.query(
            'INSERT INTO orders (user_id, total, shipping_address, phone, status) VALUES (?, ?, ?, ?, ?)',
            [userId, total, shipping_address, phone, 'pending']
        );
        const orderId = orderResult.insertId;

        // 5. Tạo order_items từ cart_items
        for (const item of cartItems) {
            await pool.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );
        }

        // 6. Xóa cart_items và đánh dấu cart là completed
        await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
        await pool.query('UPDATE carts SET status = ? WHERE id = ?', ['completed', cartId]);

        // 7. Lấy đơn hàng vừa tạo với items
        const [orders] = await pool.query(
            `SELECT o.*, 
                COUNT(oi.id) as item_count
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.id = ?
            GROUP BY o.id`,
            [orderId]
        );

        const [orderItems] = await pool.query(
            `SELECT oi.*, p.name as product_name, p.category
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?`,
            [orderId]
        );

        res.status(201).json({
            message: 'Đặt hàng thành công',
            order: {
                ...orders[0],
                total: parseFloat(orders[0].total),
                items: orderItems.map(item => ({
                    ...item,
                    price: parseFloat(item.price)
                }))
            }
        });

    } catch (error) {
        console.error('Lỗi khi tạo đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});
```

### 3.2. Lưu file

---

## BƯỚC 4: TẠO API GET /api/orders (Lấy danh sách đơn hàng)

### 4.1. Thêm vào `routes/order.js`:

```javascript
// GET /api/orders - Lấy danh sách đơn hàng của user
router.get('/', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;

    try {
        const [orders] = await pool.query(
            `SELECT o.*, 
                COUNT(oi.id) as item_count,
                SUM(oi.quantity) as total_quantity
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC`,
            [userId]
        );

        const formattedOrders = orders.map(order => ({
            ...order,
            total: parseFloat(order.total),
            item_count: parseInt(order.item_count || 0),
            total_quantity: parseInt(order.total_quantity || 0)
        }));

        res.json({
            orders: formattedOrders,
            count: orders.length
        });

    } catch (error) {
        console.error('Lỗi khi lấy danh sách đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});
```

---

## BƯỚC 5: TẠO API GET /api/orders/:id (Chi tiết đơn hàng)

### 5.1. Thêm vào `routes/order.js`:

```javascript
// GET /api/orders/:id - Lấy chi tiết đơn hàng
router.get('/:id', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    const orderId = req.params.id;

    try {
        // Kiểm tra đơn hàng thuộc về user
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE id = ? AND user_id = ?',
            [orderId, userId]
        );

        if (orders.length === 0) {
            return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
        }

        const order = orders[0];

        // Lấy items
        const [orderItems] = await pool.query(
            `SELECT oi.*, 
                p.name as product_name, 
                p.category,
                (oi.price * oi.quantity) as subtotal
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?`,
            [orderId]
        );

        const formattedItems = orderItems.map(item => ({
            ...item,
            price: parseFloat(item.price),
            subtotal: parseFloat(item.subtotal)
        }));

        res.json({
            order: {
                ...order,
                total: parseFloat(order.total),
                items: formattedItems,
                item_count: formattedItems.length
            }
        });

    } catch (error) {
        console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});
```

---

## BƯỚC 6: TẠO API PUT /api/orders/:id/status (Cập nhật trạng thái - Admin)

### 6.1. Thêm vào `routes/order.js`:

```javascript
// PUT /api/orders/:id/status - Cập nhật trạng thái đơn hàng (Admin only)
router.put('/:id/status', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    const orderId = req.params.id;
    const { status } = req.body;

    try {
        // Kiểm tra quyền admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Chỉ admin mới có quyền cập nhật trạng thái đơn hàng' });
        }

        // Validate status
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: 'Trạng thái không hợp lệ',
                valid_statuses: validStatuses
            });
        }

        // Kiểm tra đơn hàng tồn tại
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE id = ?',
            [orderId]
        );

        if (orders.length === 0) {
            return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
        }

        // Cập nhật status
        await pool.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, orderId]
        );

        // Lấy đơn hàng đã cập nhật
        const [updatedOrders] = await pool.query(
            'SELECT * FROM orders WHERE id = ?',
            [orderId]
        );

        res.json({
            message: 'Đã cập nhật trạng thái đơn hàng',
            order: {
                ...updatedOrders[0],
                total: parseFloat(updatedOrders[0].total)
            }
        });

    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});
```

---

## BƯỚC 7: CẬP NHẬT SERVER.JS

### 7.1. Mở file `server.js`

### 7.2. Thêm import:

Tìm dòng:
```javascript
const cartRouter = require('./routes/cart');
```

Thêm ngay sau đó:
```javascript
const orderRouter = require('./routes/order');
```

### 7.3. Thêm route:

Tìm dòng:
```javascript
app.use('/api/cart', cartRouter);
```

Thêm ngay sau đó:
```javascript
app.use('/api/orders', orderRouter);
```

### 7.4. Cập nhật log (tùy chọn):

Thêm vào phần console.log:
```javascript
console.log(`POST Tạo đơn hàng: http://localhost:${PORT}/api/orders`);
console.log(`GET Danh sách đơn hàng: http://localhost:${PORT}/api/orders`);
```

---

## BƯỚC 8: TEST API

### 8.1. Restart server:

```bash
# Dừng server (Ctrl+C)
node server.js
```

### 8.2. Test trong Postman:

#### Test 1: Tạo đơn hàng
- Method: `POST`
- URL: `http://localhost:5000/api/orders`
- Headers:
  ```
  Authorization: Bearer [TOKEN]
  Content-Type: application/json
  ```
- Body:
  ```json
  {
      "shipping_address": "123 Đường ABC, Quận 1, TP.HCM",
      "phone": "0901234567"
  }
  ```
- Expected: 201 Created

#### Test 2: Lấy danh sách đơn hàng
- Method: `GET`
- URL: `http://localhost:5000/api/orders`
- Headers:
  ```
  Authorization: Bearer [TOKEN]
  ```
- Expected: 200 OK với danh sách orders

#### Test 3: Lấy chi tiết đơn hàng
- Method: `GET`
- URL: `http://localhost:5000/api/orders/1`
- Headers:
  ```
  Authorization: Bearer [TOKEN]
  ```
- Expected: 200 OK với chi tiết order + items

#### Test 4: Cập nhật trạng thái (Admin)
- Method: `PUT`
- URL: `http://localhost:5000/api/orders/1/status`
- Headers:
  ```
  Authorization: Bearer [ADMIN_TOKEN]
  Content-Type: application/json
  ```
- Body:
  ```json
  {
      "status": "processing"
  }
  ```
- Expected: 200 OK

---

## BƯỚC 9: KIỂM TRA LỖI

### 9.1. Lỗi thường gặp:

**Lỗi: "Giỏ hàng trống"**
- Nguyên nhân: Chưa có sản phẩm trong cart
- Giải pháp: Thêm sản phẩm vào cart trước

**Lỗi: "Đơn hàng không tồn tại"**
- Nguyên nhân: Order ID sai hoặc không thuộc user
- Giải pháp: Kiểm tra order ID và user_id

**Lỗi: 403 "Chỉ admin mới có quyền"**
- Nguyên nhân: User không phải admin
- Giải pháp: Đăng nhập với tài khoản admin

### 9.2. Kiểm tra database:

```sql
-- Xem đơn hàng
SELECT * FROM orders;

-- Xem order items
SELECT * FROM order_items;

-- Xem cart đã được đánh dấu completed chưa
SELECT * FROM carts WHERE status = 'completed';
```

---

## BƯỚC 10: HOÀN THIỆN (TÙY CHỌN)

### 10.1. Thêm validation:
- Validate shipping_address không rỗng
- Validate phone format
- Validate cart có items

### 10.2. Thêm tính năng:
- Hủy đơn hàng (user)
- Xem đơn hàng theo status
- Phân trang cho danh sách đơn hàng

---

## ✅ CHECKLIST

- [ ] Đã tạo bảng `orders` và `order_items`
- [ ] Đã tạo file `routes/order.js`
- [ ] Đã thêm POST /api/orders
- [ ] Đã thêm GET /api/orders
- [ ] Đã thêm GET /api/orders/:id
- [ ] Đã thêm PUT /api/orders/:id/status
- [ ] Đã cập nhật server.js
- [ ] Đã restart server
- [ ] Đã test tất cả endpoints
- [ ] Đã kiểm tra database

---

## 🎉 HOÀN THÀNH!

Sau khi hoàn thành tất cả các bước, bạn sẽ có Orders API hoàn chỉnh!

**Lưu ý**: Nếu gặp lỗi, kiểm tra:
1. Database đã có bảng chưa
2. Routes đã được import vào server.js chưa
3. Token có hợp lệ không
4. Cart có items chưa


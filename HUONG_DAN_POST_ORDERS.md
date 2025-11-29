# HƯỚNG DẪN HOÀN THIỆN POST /api/orders

## 📋 TỔNG QUAN

API này cho phép user tạo đơn hàng từ giỏ hàng (cart) của họ. Khi tạo đơn hàng thành công, cart sẽ được đánh dấu là `completed` và các items trong cart sẽ được chuyển sang `order_items`.

---

## ✅ ĐÃ HOÀN THÀNH

File `routes/orders.js` đã được cập nhật với code đầy đủ cho POST /api/orders.

---

## 🔍 CÁC BƯỚC THỰC HIỆN

### BƯỚC 1: Kiểm tra file routes/orders.js

File đã được cập nhật với:
- ✅ Import `authenticateToken` middleware
- ✅ Code đầy đủ cho POST /api/orders
- ✅ Xử lý lỗi đầy đủ

### BƯỚC 2: Kiểm tra Database

**QUAN TRỌNG**: Đảm bảo các bảng đã được tạo:

```sql
-- Kiểm tra bảng orders
SHOW TABLES LIKE 'orders';

-- Kiểm tra bảng order_items
SHOW TABLES LIKE 'order_items';

-- Kiểm tra bảng carts và cart_items
SHOW TABLES LIKE 'carts';
SHOW TABLES LIKE 'cart_items';
```

**Nếu chưa có bảng**, chạy SQL từ file `database/orders_schema.sql`:
1. Mở MySQL Workbench hoặc phpMyAdmin
2. Chọn database `tttn2025`
3. Copy nội dung từ `database/orders_schema.sql`
4. Execute

### BƯỚC 3: Cập nhật server.js

Kiểm tra xem `server.js` đã có route cho orders chưa:

```javascript
// Tìm dòng này trong server.js
const cartRouter = require('./routes/cart');

// Thêm ngay sau đó:
const orderRouter = require('./routes/orders');

// Tìm dòng này:
app.use('/api/cart', cartRouter);

// Thêm ngay sau đó:
app.use('/api/orders', orderRouter);
```

**Nếu chưa có**, thêm vào `server.js`.

### BƯỚC 4: Restart Server

```bash
# Dừng server hiện tại (Ctrl+C)
# Sau đó chạy lại:
node server.js
```

---

## 🧪 CÁCH TEST API

### Chuẩn bị:

1. **Có token hợp lệ**: Đăng nhập để lấy token
2. **Có sản phẩm trong cart**: Thêm sản phẩm vào cart trước

### Test với Postman:

#### 1. Kiểm tra cart có sản phẩm:

**GET** `http://localhost:5000/api/cart`
- Headers: `Authorization: Bearer [TOKEN]`
- Expected: Cart có ít nhất 1 item

#### 2. Tạo đơn hàng:

**POST** `http://localhost:5000/api/orders`

**Headers:**
```
Authorization: Bearer [TOKEN]
Content-Type: application/json
```

**Body (JSON):**
```json
{
    "shipping_address": "123 Đường ABC, Quận 1, TP.HCM",
    "phone": "0901234567"
}
```

**Expected Response (201 Created):**
```json
{
    "message": "Đặt hàng thành công",
    "order": {
        "id": 1,
        "user_id": 1,
        "total": 500000.00,
        "status": "pending",
        "shipping_address": "123 Đường ABC, Quận 1, TP.HCM",
        "phone": "0901234567",
        "created_at": "2025-01-XX...",
        "updated_at": "2025-01-XX...",
        "item_count": 2,
        "items": [
            {
                "id": 1,
                "order_id": 1,
                "product_id": 1,
                "quantity": 2,
                "price": 250000.00,
                "product_name": "Tên sản phẩm",
                "category": "Danh mục"
            }
        ]
    }
}
```

---

## ⚠️ CÁC TRƯỜNG HỢP LỖI

### 1. Lỗi 404: "Giỏ hàng trống"

**Nguyên nhân**: User chưa có cart active hoặc cart đã bị xóa.

**Giải pháp**:
- Thêm sản phẩm vào cart trước: `POST /api/cart/items`
- Hoặc kiểm tra cart: `GET /api/cart`

### 2. Lỗi 400: "Giỏ hàng không có sản phẩm"

**Nguyên nhân**: Cart tồn tại nhưng không có items.

**Giải pháp**:
- Thêm sản phẩm vào cart: `POST /api/cart/items`

### 3. Lỗi 401: "Không có token truy cập"

**Nguyên nhân**: Thiếu header Authorization hoặc token không hợp lệ.

**Giải pháp**:
- Đăng nhập để lấy token: `POST /api/login`
- Thêm header: `Authorization: Bearer [TOKEN]`

### 4. Lỗi 500: "Lỗi máy chủ nội bộ"

**Nguyên nhân có thể**:
- Database chưa có bảng `orders` hoặc `order_items`
- Foreign key constraint bị lỗi
- Connection pool lỗi

**Giải pháp**:
- Kiểm tra database đã có bảng chưa
- Kiểm tra console log để xem lỗi chi tiết
- Verify foreign keys trong database

---

## 🔄 LUỒNG HOẠT ĐỘNG

```
1. User gửi POST /api/orders với shipping_address và phone
   ↓
2. API kiểm tra cart active của user
   ↓
3. Nếu không có cart → Trả về 404
   ↓
4. Lấy items trong cart
   ↓
5. Nếu không có items → Trả về 400
   ↓
6. Tính tổng tiền từ cart_items
   ↓
7. Tạo record mới trong bảng orders
   ↓
8. Copy tất cả cart_items sang order_items
   ↓
9. Xóa cart_items và đánh dấu cart là 'completed'
   ↓
10. Trả về đơn hàng vừa tạo kèm items
```

---

## 📊 KIỂM TRA DATABASE SAU KHI TẠO ĐƠN HÀNG

```sql
-- Xem đơn hàng vừa tạo
SELECT * FROM orders ORDER BY created_at DESC LIMIT 1;

-- Xem order_items của đơn hàng
SELECT oi.*, p.name as product_name
FROM order_items oi
JOIN products p ON oi.product_id = p.id
WHERE oi.order_id = 1;  -- Thay 1 bằng order_id vừa tạo

-- Kiểm tra cart đã được đánh dấu completed chưa
SELECT * FROM carts WHERE status = 'completed';

-- Kiểm tra cart_items đã bị xóa chưa
SELECT * FROM cart_items WHERE cart_id = [CART_ID];
```

---

## ✅ CHECKLIST

- [ ] File `routes/orders.js` đã có code POST /api/orders
- [ ] Database đã có bảng `orders` và `order_items`
- [ ] `server.js` đã import và sử dụng `orderRouter`
- [ ] Server đã được restart
- [ ] Đã test với Postman
- [ ] Đã kiểm tra database sau khi tạo đơn hàng
- [ ] Cart đã được đánh dấu `completed`
- [ ] Cart_items đã bị xóa
- [ ] Order_items đã được tạo đúng

---

## 💡 LƯU Ý

1. **Transaction**: Code hiện tại chưa dùng transaction. Nếu muốn đảm bảo tính nhất quán, có thể wrap các query trong transaction.

2. **Validation**: Có thể thêm validation cho:
   - `shipping_address` không được rỗng
   - `phone` phải đúng format số điện thoại Việt Nam

3. **Stock check**: Có thể thêm kiểm tra số lượng sản phẩm còn trong kho trước khi tạo đơn hàng.

4. **Email notification**: Có thể thêm gửi email xác nhận đơn hàng sau khi tạo thành công.

---

## 🎉 HOÀN THÀNH!

Sau khi hoàn thành các bước trên, bạn đã có API POST /api/orders hoạt động đầy đủ!

**Bước tiếp theo**: Hoàn thiện GET /api/orders để xem danh sách đơn hàng.


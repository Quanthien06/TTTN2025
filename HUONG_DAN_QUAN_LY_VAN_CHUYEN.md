# 📦 Hướng Dẫn Quản Lý Vận Chuyển (Shipment Management)

## Tổng Quan

Hệ thống quản lý vận chuyển cho phép:
- **Admin**: Tạo, cập nhật, và theo dõi vận chuyển của các đơn hàng
- **Customer**: Xem trạng thái vận chuyển của đơn hàng của mình
- **Tích hợp Webhook**: Nhận cập nhật trạng thái tự động từ các đơn vị vận chuyển

---

## 🔧 Thiết Lập Ban Đầu

### 1. Tạo Bảng Database

Chạy migration script để tạo các bảng shipments:

```bash
node database/run_shipments_migration.js
```

Hoặc chạy SQL trực tiếp:

```bash
mysql -u root -p tttn2025 < database/05_shipments_schema.sql
```

Kiểm tra bảng được tạo:

```sql
SHOW TABLES LIKE 'shipment%';
```

### 2. Khởi Động Server

```bash
npm install  # Nếu chưa install
node server.js
```

---

## 📊 API Endpoints

### Admin Endpoints

#### 1. Lấy danh sách vận chuyển

```http
GET /api/shipments/admin/list
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `page`: Số trang (mặc định: 1)
- `limit`: Số bản ghi/trang (mặc định: 20)
- `status`: Lọc theo trạng thái (pending, picked_up, in_transit, out_for_delivery, delivered, failed, returned)
- `search`: Tìm kiếm theo tracking number hoặc order ID

**Ví dụ:**

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/shipments/admin/list?page=1&status=delivered"
```

**Response:**

```json
{
  "shipments": [
    {
      "id": 1,
      "order_id": 5,
      "carrier_name": "GHN",
      "tracking_number": "GHN123456789",
      "status": "delivered",
      "estimated_delivery_date": "2025-01-15",
      "actual_delivery_date": "2025-01-15",
      "shipping_cost": 25000,
      "username": "john_doe",
      "order_status": "shipped",
      "created_at": "2025-01-12T10:00:00.000Z",
      "updated_at": "2025-01-15T15:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 92,
    "itemsPerPage": 20
  }
}
```

#### 2. Tạo vận chuyển mới

```http
POST /api/shipments
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "order_id": 5,
  "carrier_name": "GHN",
  "tracking_number": "GHN123456789",
  "estimated_delivery_date": "2025-01-20",
  "shipping_cost": 25000
}
```

**Response:**

```json
{
  "id": 1,
  "order_id": 5,
  "carrier_name": "GHN",
  "tracking_number": "GHN123456789",
  "status": "pending",
  "estimated_delivery_date": "2025-01-20",
  "shipping_cost": 25000,
  "created_at": "2025-01-12T10:00:00.000Z"
}
```

#### 3. Cập nhật trạng thái vận chuyển

```http
PUT /api/shipments/:id/update-status
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "status": "out_for_delivery",
  "event_label": "Đơn hàng đang được giao tới địa chỉ",
  "location": "Quận 1, TP HCM"
}
```

**Response:**

```json
{
  "id": 1,
  "shipment_id": 1,
  "status": "out_for_delivery",
  "event_label": "Đơn hàng đang được giao tới địa chỉ",
  "location": "Quận 1, TP HCM",
  "event_time": "2025-01-15T14:00:00.000Z"
}
```

### Customer Endpoints

#### Lấy thông tin vận chuyển của đơn hàng

```http
GET /api/shipments/:orderId
Authorization: Bearer <customer-token>
```

**Response:**

```json
{
  "shipment": {
    "id": 1,
    "order_id": 5,
    "carrier_name": "GHN",
    "tracking_number": "GHN123456789",
    "status": "out_for_delivery"
  },
  "events": [
    {
      "id": 1,
      "status": "pending",
      "event_label": "Đơn hàng chưa được xử lý",
      "location": "Kho giao dịch GHN",
      "event_time": "2025-01-12T10:00:00.000Z"
    },
    {
      "id": 2,
      "status": "picked_up",
      "event_label": "Đơn hàng đã được nhặt",
      "location": "Kho GHN Tân Bình",
      "event_time": "2025-01-13T08:00:00.000Z"
    }
  ]
}
```

---

## 🎯 Admin Panel

### Truy Cập

```
http://localhost:3000/admin-shipments.html
```

### Chức Năng

#### Tab 1: Danh Sách Vận Chuyển

- **Tìm kiếm**: Nhập tracking number hoặc order ID
- **Lọc**: Chọn trạng thái từ dropdown
- **Làm mới**: Cập nhật danh sách
- **Phân trang**: Chuyển sang trang khác
- **Cập nhật**: Click "Cập nhật" để thay đổi trạng thái

#### Tab 2: Tạo Vận Chuyển

- **Mã Đơn Hàng** (bắt buộc): ID của đơn hàng
- **Đơn vị Vận chuyển** (bắt buộc): Chọn từ: GHN, GHTK, Viettel, Vietnam Post, J&T, AhaMove
- **Mã Vận Chuyển** (bắt buộc): Tracking number từ đơn vị
- **Ngày Dự Kiến Giao**: Chọn từ date picker
- **Phí Vận Chuyển**: Nhập số tiền (₫)

---

## 🔔 Webhook Integration

### Webhook Receiver

```
POST /api/shipments/webhook/:carrier
```

**Supported Carriers:**
- `ghn` - GHN Express
- `ghtk` - Giao Hàng Tiết Kiệm
- `viettel` - Viettel Post

### GHN Webhook Payload Example

```json
{
  "code": "GHN123456789",
  "order_id": 5,
  "status": "ready_to_pick",
  "message": "Đơn hàng chưa được xử lý",
  "location": "Kho GHN Tân Bình",
  "timestamp": 1673520000
}
```

Webhook này sẽ được mapping thành:

```json
{
  "shipment_id": 1,
  "status": "pending",
  "event_label": "Đơn hàng chưa được xử lý",
  "location": "Kho GHN Tân Bình",
  "event_time": "2025-01-12T10:00:00.000Z"
}
```

### Setup Webhook tại GHN

1. Đăng nhập vào [GHN Partner Portal](https://partner.ghn.vn/)
2. Vào **Settings** → **Webhook**
3. Click **Add Webhook**
4. Nhập URL: `http://your-domain.com/api/shipments/webhook/ghn`
5. Chọn events: Status Update
6. Save

---

## 🎨 Frontend UI

### Customer: Order Tracking Page

```
http://localhost:3000/?page=orders
```

**Hiển thị:**
- Danh sách đơn hàng của customer
- Timeline tracking với các status icons
- Estimated vs actual delivery date
- Event history từ shipment_events table

### Status Timeline

```
[Pending] → [Picked Up] → [In Transit] → [Out for Delivery] → [Delivered]
```

---

## 📝 Statuses

| Status | Mô tả | Mã GHN | Mã GHTK | Mã Viettel |
|--------|-------|--------|---------|-----------|
| `pending` | Chờ xử lý | ready_to_pick | waiting_for_pickup | 0 |
| `picked_up` | Đã nhặt | picking | picked_up | 1 |
| `in_transit` | Đang vận chuyển | on_way | holding | 2 |
| `out_for_delivery` | Đang giao | out_for_delivery | delivering | 3 |
| `delivered` | Đã giao | delivered | delivered | 5 |
| `failed` | Giao thất bại | return | failed | 6 |
| `returned` | Hoàn trả | returned | returned | 7 |

---

## 🧪 Testing

### 1. Test API với curl

```bash
# Get list
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/shipments/admin/list"

# Create shipment
curl -X POST http://localhost:3000/api/shipments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": 5,
    "carrier_name": "GHN",
    "tracking_number": "GHN123456789",
    "estimated_delivery_date": "2025-01-20",
    "shipping_cost": 25000
  }'

# Update status
curl -X PUT http://localhost:3000/api/shipments/1/update-status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "delivered",
    "event_label": "Đã giao cho khách",
    "location": "123 Nguyễn Hữu Cảnh, Q1"
  }'
```

### 2. Test Webhook

```bash
# Simulate GHN webhook
curl -X POST http://localhost:3000/api/shipments/webhook/ghn \
  -H "Content-Type: application/json" \
  -d '{
    "code": "GHN123456789",
    "status": "out_for_delivery",
    "message": "Đơn hàng đang được giao",
    "location": "Quận 1, TP HCM"
  }'
```

### 3. Test Script

```bash
node test_admin_shipments.js
```

---

## 🐛 Troubleshooting

### "Table 'shipments' doesn't exist"

```bash
# Run migration again
node database/run_shipments_migration.js
```

### "Unauthorized" error (403)

- Đảm bảo token của bạn là admin token
- Check `users.role` = 'admin' trong database

### Webhook không nhận được sự kiện

1. Kiểm tra server logs: `node server.js`
2. Đảm bảo domain công khai (không localhost)
3. Kiểm tra firewall/whitelist IP của carrier
4. Test manual: `curl -X POST http://your-domain/api/shipments/webhook/ghn ...`

---

## 📚 Database Schema

### shipments table

```sql
CREATE TABLE shipments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL UNIQUE,
  carrier_name VARCHAR(100),
  tracking_number VARCHAR(100) UNIQUE,
  status ENUM(...),
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  shipping_cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### shipment_events table

```sql
CREATE TABLE shipment_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  shipment_id INT NOT NULL,
  status ENUM(...),
  event_label VARCHAR(255),
  location VARCHAR(255),
  event_time TIMESTAMP,
  created_at TIMESTAMP
);
```

---

## 🚀 Tiếp Theo

- [ ] Email notifications khi status thay đổi
- [ ] Shipment event polling cho carriers không hỗ trợ webhook
- [ ] Real-time tracking map integration
- [ ] SMS notifications
- [ ] Return/Refund integration

---

## 📞 Hỗ Trợ

Có câu hỏi? Check:
- [x] Admin panel at `/admin-shipments.html`
- [x] API docs in this file
- [x] Test file: `test_admin_shipments.js`
- [x] Database guide: `database/WEBHOOK_INTEGRATION_GUIDE.js`

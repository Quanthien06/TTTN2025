# HƯỚNG DẪN TEST ORDERS API

## 📋 CHUẨN BỊ

### 1. Đảm bảo Server đang chạy

```bash
# Kiểm tra server đang chạy
# Nếu chưa, chạy lệnh:
node server.js
```

### 2. Đảm bảo Database đã có bảng

```sql
-- Chạy trong MySQL Workbench hoặc phpMyAdmin
-- Kiểm tra bảng đã tồn tại chưa:
SHOW TABLES LIKE 'orders';
SHOW TABLES LIKE 'order_items';

-- Nếu chưa có, chạy file: database/orders_schema.sql
```

### 3. Chuẩn bị Token

**Bước 1: Đăng nhập để lấy token**

```bash
# POST /api/login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"your_username\",\"password\":\"your_password\"}"
```

**Response sẽ có token:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

**Lưu token vào biến (PowerShell):**
```powershell
$TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Lưu token vào biến (Bash/Linux/Mac):**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🧪 TEST CÁC API ENDPOINTS

### TEST 1: POST /api/orders - Tạo đơn hàng

**Yêu cầu:**
- Phải có sản phẩm trong cart trước
- Nếu chưa có, thêm sản phẩm vào cart: `POST /api/cart/items`

**Lệnh cURL:**
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"shipping_address\":\"123 Đường ABC, Quận 1, TP.HCM\",\"phone\":\"0901234567\"}"
```

**Lệnh PowerShell:**
```powershell
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}
$body = @{
    shipping_address = "123 Đường ABC, Quận 1, TP.HCM"
    phone = "0901234567"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/orders" -Method POST -Headers $headers -Body $body
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

**Test với Postman:**
- Method: `POST`
- URL: `http://localhost:5000/api/orders`
- Headers:
  - `Authorization: Bearer [TOKEN]`
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "shipping_address": "123 Đường ABC, Quận 1, TP.HCM",
  "phone": "0901234567"
}
```

---

### TEST 2: GET /api/orders - Lấy danh sách đơn hàng

**Lệnh cURL:**
```bash
curl -X GET http://localhost:5000/api/orders \
  -H "Authorization: Bearer $TOKEN"
```

**Lệnh PowerShell:**
```powershell
$headers = @{
    "Authorization" = "Bearer $TOKEN"
}
Invoke-RestMethod -Uri "http://localhost:5000/api/orders" -Method GET -Headers $headers
```

**Expected Response (200 OK):**
```json
{
  "orders": [
    {
      "id": 1,
      "user_id": 1,
      "total": 500000.00,
      "status": "pending",
      "shipping_address": "123 Đường ABC, Quận 1, TP.HCM",
      "phone": "0901234567",
      "created_at": "2025-01-XX...",
      "item_count": 2,
      "total_quantity": 3
    }
  ],
  "count": 1
}
```

**Test với Postman:**
- Method: `GET`
- URL: `http://localhost:5000/api/orders`
- Headers:
  - `Authorization: Bearer [TOKEN]`

---

### TEST 3: GET /api/orders/:id - Chi tiết đơn hàng

**Lưu ý:** Thay `1` bằng order_id thực tế từ TEST 1

**Lệnh cURL:**
```bash
curl -X GET http://localhost:5000/api/orders/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Lệnh PowerShell:**
```powershell
$headers = @{
    "Authorization" = "Bearer $TOKEN"
}
Invoke-RestMethod -Uri "http://localhost:5000/api/orders/1" -Method GET -Headers $headers
```

**Expected Response (200 OK):**
```json
{
  "order": {
    "id": 1,
    "user_id": 1,
    "total": 500000.00,
    "status": "pending",
    "shipping_address": "123 Đường ABC, Quận 1, TP.HCM",
    "phone": "0901234567",
    "created_at": "2025-01-XX...",
    "item_count": 2,
    "items": [
      {
        "id": 1,
        "order_id": 1,
        "product_id": 1,
        "quantity": 2,
        "price": 250000.00,
        "product_name": "Tên sản phẩm",
        "category": "Danh mục",
        "subtotal": 500000.00
      }
    ]
  }
}
```

**Test với Postman:**
- Method: `GET`
- URL: `http://localhost:5000/api/orders/1`
- Headers:
  - `Authorization: Bearer [TOKEN]`

---

### TEST 4: PUT /api/orders/:id/status - Cập nhật trạng thái (Admin)

**Lưu ý:** 
- Cần token của user có role = 'admin'
- Thay `1` bằng order_id thực tế

**Lệnh cURL:**
```bash
curl -X PUT http://localhost:5000/api/orders/1/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"processing\"}"
```

**Lệnh PowerShell:**
```powershell
$headers = @{
    "Authorization" = "Bearer $ADMIN_TOKEN"
    "Content-Type" = "application/json"
}
$body = @{
    status = "processing"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/orders/1/status" -Method PUT -Headers $headers -Body $body
```

**Các status hợp lệ:**
- `pending`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

**Expected Response (200 OK):**
```json
{
  "message": "Đã cập nhật trạng thái đơn hàng",
  "order": {
    "id": 1,
    "user_id": 1,
    "total": 500000.00,
    "status": "processing",
    ...
  }
}
```

**Test với Postman:**
- Method: `PUT`
- URL: `http://localhost:5000/api/orders/1/status`
- Headers:
  - `Authorization: Bearer [ADMIN_TOKEN]`
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "status": "processing"
}
```

---

## ⚠️ TEST CÁC TRƯỜNG HỢP LỖI

### TEST 5: Tạo đơn hàng khi cart trống

**Lệnh:**
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"shipping_address\":\"123 ABC\",\"phone\":\"0901234567\"}"
```

**Expected Response (404):**
```json
{
  "message": "Giỏ hàng trống"
}
```

---

### TEST 6: Lấy đơn hàng không tồn tại

**Lệnh:**
```bash
curl -X GET http://localhost:5000/api/orders/999 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (404):**
```json
{
  "message": "Đơn hàng không tồn tại"
}
```

---

### TEST 7: User thường cập nhật status (không phải admin)

**Lệnh:**
```bash
curl -X PUT http://localhost:5000/api/orders/1/status \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"processing\"}"
```

**Expected Response (403):**
```json
{
  "message": "Chỉ admin mới có quyền cập nhật trạng thái đơn hàng"
}
```

---

### TEST 8: Cập nhật status không hợp lệ

**Lệnh:**
```bash
curl -X PUT http://localhost:5000/api/orders/1/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"invalid_status\"}"
```

**Expected Response (400):**
```json
{
  "message": "Trạng thái không hợp lệ",
  "valid_statuses": ["pending", "processing", "shipped", "delivered", "cancelled"]
}
```

---

### TEST 9: Thiếu token

**Lệnh:**
```bash
curl -X GET http://localhost:5000/api/orders
```

**Expected Response (401):**
```json
{
  "message": "Không có token truy cập. Vui lòng thêm header Authorization: Bearer [token]"
}
```

---

## 📝 SCRIPT TEST TỰ ĐỘNG (PowerShell)

Tạo file `test_orders_api.ps1`:

```powershell
# Test Orders API Script
$BASE_URL = "http://localhost:5000"
$TOKEN = "YOUR_TOKEN_HERE"  # Thay bằng token thực tế

Write-Host "=== TEST ORDERS API ===" -ForegroundColor Green

# Test 1: Tạo đơn hàng
Write-Host "`n1. Test POST /api/orders" -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}
$body = @{
    shipping_address = "123 Đường ABC, Quận 1, TP.HCM"
    phone = "0901234567"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/orders" -Method POST -Headers $headers -Body $body
    Write-Host "✓ Tạo đơn hàng thành công!" -ForegroundColor Green
    Write-Host "Order ID: $($response.order.id)" -ForegroundColor Cyan
    $ORDER_ID = $response.order.id
} catch {
    Write-Host "✗ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Lấy danh sách đơn hàng
Write-Host "`n2. Test GET /api/orders" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/orders" -Method GET -Headers $headers
    Write-Host "✓ Lấy danh sách thành công! Số đơn hàng: $($response.count)" -ForegroundColor Green
} catch {
    Write-Host "✗ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Lấy chi tiết đơn hàng
if ($ORDER_ID) {
    Write-Host "`n3. Test GET /api/orders/$ORDER_ID" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/api/orders/$ORDER_ID" -Method GET -Headers $headers
        Write-Host "✓ Lấy chi tiết thành công!" -ForegroundColor Green
        Write-Host "Status: $($response.order.status)" -ForegroundColor Cyan
    } catch {
        Write-Host "✗ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== HOÀN THÀNH ===" -ForegroundColor Green
```

**Chạy script:**
```powershell
.\test_orders_api.ps1
```

---

## 📝 SCRIPT TEST TỰ ĐỘNG (Bash)

Tạo file `test_orders_api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000"
TOKEN="YOUR_TOKEN_HERE"  # Thay bằng token thực tế

echo "=== TEST ORDERS API ==="

# Test 1: Tạo đơn hàng
echo ""
echo "1. Test POST /api/orders"
response=$(curl -s -X POST "$BASE_URL/api/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"shipping_address":"123 Đường ABC, Quận 1, TP.HCM","phone":"0901234567"}')

if echo "$response" | grep -q "Đặt hàng thành công"; then
  echo "✓ Tạo đơn hàng thành công!"
  ORDER_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  echo "Order ID: $ORDER_ID"
else
  echo "✗ Lỗi: $response"
fi

# Test 2: Lấy danh sách đơn hàng
echo ""
echo "2. Test GET /api/orders"
response=$(curl -s -X GET "$BASE_URL/api/orders" \
  -H "Authorization: Bearer $TOKEN")

if echo "$response" | grep -q "orders"; then
  echo "✓ Lấy danh sách thành công!"
else
  echo "✗ Lỗi: $response"
fi

# Test 3: Lấy chi tiết đơn hàng
if [ ! -z "$ORDER_ID" ]; then
  echo ""
  echo "3. Test GET /api/orders/$ORDER_ID"
  response=$(curl -s -X GET "$BASE_URL/api/orders/$ORDER_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo "$response" | grep -q "order"; then
    echo "✓ Lấy chi tiết thành công!"
  else
    echo "✗ Lỗi: $response"
  fi
fi

echo ""
echo "=== HOÀN THÀNH ==="
```

**Chạy script:**
```bash
chmod +x test_orders_api.sh
./test_orders_api.sh
```

---

## ✅ CHECKLIST TEST

- [ ] Test POST /api/orders (thành công)
- [ ] Test POST /api/orders (cart trống - lỗi 404)
- [ ] Test GET /api/orders (thành công)
- [ ] Test GET /api/orders/:id (thành công)
- [ ] Test GET /api/orders/:id (không tồn tại - lỗi 404)
- [ ] Test PUT /api/orders/:id/status (admin - thành công)
- [ ] Test PUT /api/orders/:id/status (user thường - lỗi 403)
- [ ] Test PUT /api/orders/:id/status (status không hợp lệ - lỗi 400)
- [ ] Test thiếu token (lỗi 401)
- [ ] Kiểm tra database sau khi tạo đơn hàng
- [ ] Kiểm tra cart đã được đánh dấu completed
- [ ] Kiểm tra cart_items đã bị xóa

---

## 🔍 KIỂM TRA DATABASE

Sau khi test, kiểm tra database:

```sql
-- Xem tất cả đơn hàng
SELECT * FROM orders ORDER BY created_at DESC;

-- Xem order_items
SELECT oi.*, p.name as product_name
FROM order_items oi
JOIN products p ON oi.product_id = p.id
ORDER BY oi.created_at DESC;

-- Xem cart đã completed
SELECT * FROM carts WHERE status = 'completed';

-- Kiểm tra cart_items đã bị xóa
SELECT * FROM cart_items WHERE cart_id IN (
    SELECT id FROM carts WHERE status = 'completed'
);
```

---

## 💡 LƯU Ý

1. **Thay TOKEN**: Tất cả các lệnh cần thay `$TOKEN` hoặc `YOUR_TOKEN_HERE` bằng token thực tế
2. **Thay ORDER_ID**: Thay `1` bằng order_id thực tế từ kết quả test
3. **Kiểm tra Server**: Đảm bảo server đang chạy ở `http://localhost:5000`
4. **Kiểm tra Database**: Đảm bảo đã chạy SQL schema
5. **Có sản phẩm trong cart**: Trước khi test POST /api/orders, cần có sản phẩm trong cart

---

## 🎉 HOÀN THÀNH!

Sau khi test tất cả các API, bạn đã hoàn thành Orders API!


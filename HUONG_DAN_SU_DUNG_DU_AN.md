# 📚 HƯỚNG DẪN SỬ DỤNG DỰ ÁN TTTN2025 - TỔNG HỢP

## 📋 MỤC LỤC

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Khởi động dự án](#2-khởi-động-dự-án)
   - [Monolith (Cách cũ)](#monolith-cách-cũ)
   - [Microservices (Cách mới)](#microservices-cách-mới)
3. [Sử dụng Frontend](#3-sử-dụng-frontend)
4. [Test API với Postman](#4-test-api-với-postman)
5. [Test Cart API](#5-test-cart-api)
6. [Test Orders API](#6-test-orders-api)
7. [Database Schema](#7-database-schema)
8. [Cấu trúc API](#8-cấu-trúc-api)
9. [Troubleshooting](#9-troubleshooting)

---

# 1. TỔNG QUAN DỰ ÁN

## Mô tả
Dự án TTTN2025 là một ứng dụng e-commerce với:
- **Backend**: Node.js + Express + MySQL
- **Frontend**: HTML, CSS, JavaScript (SPA)
- **Architecture**: Hỗ trợ cả Monolith và Microservices
- **Authentication**: JWT Token

## Các tính năng chính
- ✅ Đăng ký/Đăng nhập
- ✅ Quản lý sản phẩm (CRUD)
- ✅ Quản lý danh mục (Categories)
- ✅ Quản lý giỏ hàng (Cart)
- ✅ Đặt hàng (Orders)
- ✅ Tìm kiếm và lọc sản phẩm
- ✅ Phân trang
- ✅ Hồ sơ cá nhân

---

# 2. KHỞI ĐỘNG DỰ ÁN

## MONOLITH (Cách cũ)

### Bước 1: Cài đặt dependencies
```bash
npm install
```

### Bước 2: Setup Database
1. Mở MySQL Workbench hoặc phpMyAdmin
2. Tạo database: `tttn2025`
3. Chạy các file SQL trong thư mục `database/`:
   - `cart_schema.sql` (hoặc `cart_simple.sql`)
   - `orders_schema.sql`
   - `categories_schema.sql` (nếu chưa có)

### Bước 3: Cấu hình Database
Kiểm tra file `server.js`:
```javascript
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',  // Thay đổi nếu có password
    database: 'tttn2025'
});
```

### Bước 4: Khởi động Server
```bash
node server.js
```

Server sẽ chạy tại: `http://localhost:5000`

---

## MICROSERVICES (Cách mới)

### Bước 1: Cài đặt dependencies cho từng service

```bash
# Gateway
cd gateway && npm install

# Auth Service
cd ../services/auth-service && npm install

# Product Service
cd ../services/product-service && npm install

# Cart Service
cd ../services/cart-service && npm install

# Order Service
cd ../services/order-service && npm install
```

### Bước 2: Khởi động services

**Windows (PowerShell):**
```powershell
.\start-services.ps1
```

**Linux/Mac:**
```bash
chmod +x start-services.sh
./start-services.sh
```

**Hoặc khởi động thủ công từng service:**

Mở 5 terminal windows:

```bash
# Terminal 1: Auth Service
cd services/auth-service && npm start

# Terminal 2: Product Service
cd services/product-service && npm start

# Terminal 3: Cart Service
cd services/cart-service && npm start

# Terminal 4: Order Service
cd services/order-service && npm start

# Terminal 5: API Gateway
cd gateway && npm start
```

### Bước 3: Kiểm tra services

```bash
# Health checks
curl http://localhost:5001/health  # Auth Service
curl http://localhost:5002/health  # Product Service
curl http://localhost:5003/health  # Cart Service
curl http://localhost:5004/health  # Order Service
```

**Frontend:** Mở `http://localhost:5000`

---

# 3. SỬ DỤNG FRONTEND

## Truy cập
Mở trình duyệt: `http://localhost:5000`

## Các chức năng

### 3.1. Đăng ký/Đăng nhập
- Click nút **"Đăng ký"** ở góc trên bên phải
- Nhập username và password (tối thiểu 6 ký tự)
- Sau khi đăng ký thành công, modal đăng nhập sẽ tự động mở
- Đăng nhập để lấy token và sử dụng các tính năng

### 3.2. Xem sản phẩm
- Click **"Sản phẩm"** trên menu
- Sử dụng:
  - **Tìm kiếm**: Nhập keyword vào ô tìm kiếm
  - **Lọc**: Chọn category, nhập khoảng giá
  - **Sắp xếp**: Chọn theo giá hoặc tên
  - **Phân trang**: Chuyển trang ở cuối danh sách

### 3.3. Xem danh mục
- Click **"Danh mục"** trên menu
- Xem tất cả categories
- Click vào category để lọc sản phẩm

### 3.4. Giỏ hàng
- **Xem giỏ hàng**: Click **"Giỏ hàng"** (có badge số lượng)
- **Thêm vào giỏ**: Click **"Thêm vào giỏ"** ở mỗi sản phẩm
- **Cập nhật số lượng**: Dùng nút +/- hoặc nhập trực tiếp
- **Xóa sản phẩm**: Click nút **"Xóa"**
- **Đặt hàng**: Click **"Đặt hàng"** → Nhập địa chỉ và số điện thoại

### 3.5. Đơn hàng
- Click **"Đơn hàng"** trên menu
- Xem tất cả đơn hàng đã đặt
- Xem trạng thái: Chờ xử lý, Đang xử lý, Đã giao hàng, v.v.

### 3.6. Hồ sơ
- Click tên user → **"Hồ sơ"**
- **Xem thông tin**: Username, role, ngày tạo
- **Cập nhật username**: Nhập username mới → Click **"Cập nhật"**
- **Đổi mật khẩu**: Nhập mật khẩu hiện tại và mật khẩu mới → Click **"Đổi mật khẩu"**

---

# 4. TEST API VỚI POSTMAN

## Bước 1: Khởi động Server

```bash
# Monolith
node server.js

# Hoặc Microservices (Gateway)
cd gateway && npm start
```

## Bước 2: Đăng ký tài khoản (Nếu chưa có)

**Method:** `POST`  
**URL:** `http://localhost:5000/api/register`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
    "username": "testuser",
    "password": "password123",
    "role": "user"
}
```

**Response (201):**
```json
{
    "message": "Đăng ký thành công! Vui lòng đăng nhập."
}
```

## Bước 3: Đăng nhập để lấy Token

**Method:** `POST`  
**URL:** `http://localhost:5000/api/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
    "username": "testuser",
    "password": "password123"
}
```

**Response (200):**
```json
{
    "message": "Đăng nhập thành công",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "username": "testuser",
        "role": "user"
    }
}
```

**QUAN TRỌNG:** Copy token để dùng cho các request sau.

## Bước 4: Test API Public (Không cần token)

### GET Danh sách sản phẩm
**Method:** `GET`  
**URL:** `http://localhost:5000/api/products`

**Response:**
```json
{
    "products": [...],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 50,
        "totalPages": 3
    }
}
```

### GET Sản phẩm theo ID
**Method:** `GET`  
**URL:** `http://localhost:5000/api/products/1`

### GET Danh sách Categories
**Method:** `GET`  
**URL:** `http://localhost:5000/api/categories`

## Bước 5: Test API Private (Cần token)

### Thêm sản phẩm (Admin only)

**Method:** `POST`  
**URL:** `http://localhost:5000/api/products`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer [TOKEN]
```

**Body (JSON):**
```json
{
    "name": "iPhone 15 Pro",
    "category": "Điện thoại",
    "price": 25000000,
    "description": "Điện thoại thông minh cao cấp"
}
```

### Cập nhật sản phẩm (Admin only)

**Method:** `PUT`  
**URL:** `http://localhost:5000/api/products/1`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer [TOKEN]
```

**Body (JSON):**
```json
{
    "name": "iPhone 15 Pro Max",
    "category": "Điện thoại",
    "price": 30000000,
    "description": "Điện thoại thông minh cao cấp - Phiên bản nâng cấp"
}
```

### Xóa sản phẩm (Admin only)

**Method:** `DELETE`  
**URL:** `http://localhost:5000/api/products/1`

**Headers:**
```
Authorization: Bearer [TOKEN]
```

---

# 5. TEST CART API

## Lấy giỏ hàng
**Method:** `GET`  
**URL:** `http://localhost:5000/api/cart`

**Headers:**
```
Authorization: Bearer [TOKEN]
```

**Response:**
```json
{
    "cart": {
        "id": 1,
        "user_id": 1,
        "status": "active",
        "items": [
            {
                "id": 1,
                "product_id": 1,
                "quantity": 2,
                "price": 25000000,
                "product_name": "iPhone 15 Pro",
                "product_category": "Điện thoại",
                "subtotal": 50000000
            }
        ],
        "total": 50000000,
        "item_count": 1
    }
}
```

## Thêm sản phẩm vào giỏ

**Method:** `POST`  
**URL:** `http://localhost:5000/api/cart/items`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer [TOKEN]
```

**Body (JSON):**
```json
{
    "product_id": 1,
    "quantity": 2
}
```

**Response (201):**
```json
{
    "message": "Đã thêm sản phẩm vào giỏ hàng",
    "item": {
        "id": 1,
        "cart_id": 1,
        "product_id": 1,
        "quantity": 2,
        "price": 25000000
    }
}
```

## Cập nhật số lượng

**Method:** `PUT`  
**URL:** `http://localhost:5000/api/cart/items/1`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer [TOKEN]
```

**Body (JSON):**
```json
{
    "quantity": 5
}
```

## Xóa item

**Method:** `DELETE`  
**URL:** `http://localhost:5000/api/cart/items/1`

**Headers:**
```
Authorization: Bearer [TOKEN]
```

## Xóa toàn bộ giỏ hàng

**Method:** `DELETE`  
**URL:** `http://localhost:5000/api/cart`

**Headers:**
```
Authorization: Bearer [TOKEN]
```

## Tính tổng tiền

**Method:** `GET`  
**URL:** `http://localhost:5000/api/cart/total`

**Headers:**
```
Authorization: Bearer [TOKEN]
```

**Response:**
```json
{
    "total": 50000000,
    "item_count": 2
}
```

---

# 6. TEST ORDERS API

## Tạo đơn hàng

**Yêu cầu:** Phải có sản phẩm trong cart trước.

**Method:** `POST`  
**URL:** `http://localhost:5000/api/orders`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer [TOKEN]
```

**Body (JSON):**
```json
{
    "shipping_address": "123 Đường ABC, Quận 1, TP.HCM",
    "phone": "0901234567"
}
```

**Response (201):**
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

## Lấy danh sách đơn hàng

**Method:** `GET`  
**URL:** `http://localhost:5000/api/orders`

**Headers:**
```
Authorization: Bearer [TOKEN]
```

**Response (200):**
```json
{
    "orders": [
        {
            "id": 1,
            "user_id": 1,
            "total": 500000.00,
            "status": "pending",
            "shipping_address": "123 Đường ABC...",
            "phone": "0901234567",
            "created_at": "2025-01-XX...",
            "item_count": 2,
            "total_quantity": 3
        }
    ],
    "count": 1
}
```

## Lấy chi tiết đơn hàng

**Method:** `GET`  
**URL:** `http://localhost:5000/api/orders/1`

**Headers:**
```
Authorization: Bearer [TOKEN]
```

**Response (200):**
```json
{
    "order": {
        "id": 1,
        "user_id": 1,
        "total": 500000.00,
        "status": "pending",
        "shipping_address": "123 Đường ABC...",
        "phone": "0901234567",
        "created_at": "2025-01-XX...",
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
        ],
        "item_count": 2
    }
}
```

## Cập nhật trạng thái đơn hàng (Admin only)

**Method:** `PUT`  
**URL:** `http://localhost:5000/api/orders/1/status`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer [ADMIN_TOKEN]
```

**Body (JSON):**
```json
{
    "status": "processing"
}
```

**Các status hợp lệ:**
- `pending` - Chờ xử lý
- `processing` - Đang xử lý
- `shipped` - Đang giao hàng
- `delivered` - Đã giao hàng
- `cancelled` - Đã hủy

---

# 7. DATABASE SCHEMA

## Các bảng cần có

### 1. Users
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Products
```sql
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    price DECIMAL(15, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Categories
```sql
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Carts
```sql
CREATE TABLE carts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    status ENUM('active', 'completed', 'abandoned') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 5. Cart Items
```sql
CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

### 6. Orders
```sql
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total DECIMAL(15, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 7. Order Items
```sql
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

## Chạy SQL Schema

Các file SQL đã có sẵn trong thư mục `database/`:
- `cart_schema.sql` hoặc `cart_simple.sql`
- `orders_schema.sql`
- `categories_schema.sql`

**Cách chạy:**
1. Mở MySQL Workbench hoặc phpMyAdmin
2. Chọn database `tttn2025`
3. Copy nội dung từ file SQL
4. Execute

---

# 8. CẤU TRÚC API

## Public API (Không cần token)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/products` | Danh sách sản phẩm (có search, filter, sort, pagination) |
| GET | `/api/products/:id` | Chi tiết sản phẩm |
| GET | `/api/categories` | Danh sách categories |
| GET | `/api/categories/:id` | Sản phẩm theo category |
| POST | `/api/register` | Đăng ký |
| POST | `/api/login` | Đăng nhập |

## Private API (Cần token)

### Auth
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/me` | Thông tin user hiện tại |
| PUT | `/api/profile` | Cập nhật username |
| PUT | `/api/change-password` | Đổi mật khẩu |
| POST | `/api/logout` | Đăng xuất |

### Products (Admin only)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/products` | Thêm sản phẩm |
| PUT | `/api/products/:id` | Cập nhật sản phẩm |
| DELETE | `/api/products/:id` | Xóa sản phẩm |

### Categories (Admin only)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/categories` | Tạo category |
| PUT | `/api/categories/:id` | Cập nhật category |
| DELETE | `/api/categories/:id` | Xóa category |

### Cart
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/cart` | Lấy giỏ hàng |
| POST | `/api/cart/items` | Thêm sản phẩm vào giỏ |
| PUT | `/api/cart/items/:id` | Cập nhật số lượng |
| DELETE | `/api/cart/items/:id` | Xóa item |
| DELETE | `/api/cart` | Xóa toàn bộ giỏ |
| GET | `/api/cart/total` | Tính tổng tiền |

### Orders
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/orders` | Tạo đơn hàng |
| GET | `/api/orders` | Danh sách đơn hàng |
| GET | `/api/orders/:id` | Chi tiết đơn hàng |
| PUT | `/api/orders/:id/status` | Cập nhật trạng thái (Admin) |

---

# 9. TROUBLESHOOTING

## Lỗi thường gặp

### 1. Lỗi kết nối database
**Triệu chứng:** 
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Giải pháp:**
- Kiểm tra MySQL đã chạy chưa
- Kiểm tra host, user, password trong code
- Kiểm tra database `tttn2025` đã tồn tại chưa

### 2. Lỗi 401: Không có token
**Triệu chứng:**
```json
{
    "message": "Không có token truy cập"
}
```

**Giải pháp:**
- Đăng nhập để lấy token: `POST /api/login`
- Thêm header: `Authorization: Bearer [TOKEN]`

### 3. Lỗi 403: Token không hợp lệ
**Triệu chứng:**
```json
{
    "message": "Token không hợp lệ"
}
```

**Giải pháp:**
- Token đã hết hạn → Đăng nhập lại
- Token bị copy không đầy đủ → Copy lại toàn bộ token
- JWT_SECRET không khớp (với microservices) → Kiểm tra JWT_SECRET ở tất cả services

### 4. Lỗi 404: Không tìm thấy
**Triệu chứng:**
```json
{
    "message": "Không tìm thấy sản phẩm"
}
```

**Giải pháp:**
- Kiểm tra ID có tồn tại không
- Kiểm tra user có quyền truy cập không (với orders)

### 5. Lỗi 500: Lỗi server
**Triệu chứng:**
```json
{
    "message": "Lỗi máy chủ nội bộ"
}
```

**Giải pháp:**
- Kiểm tra console log để xem lỗi chi tiết
- Kiểm tra database đã có bảng chưa
- Kiểm tra foreign keys

### 6. Microservices không kết nối được
**Triệu chứng:** Gateway báo lỗi khi gọi service

**Giải pháp:**
- Kiểm tra tất cả services đã chạy chưa
- Kiểm tra ports không bị conflict
- Kiểm tra URLs trong `gateway/server.js`

---

## Kiểm tra nhanh

### Kiểm tra server đang chạy
```bash
# Windows
netstat -ano | findstr :5000

# Linux/Mac
lsof -i :5000
```

### Kiểm tra database
```sql
-- Kiểm tra bảng
SHOW TABLES;

-- Kiểm tra users
SELECT * FROM users;

-- Kiểm tra products
SELECT * FROM products;

-- Kiểm tra carts
SELECT * FROM carts;
```

### Test API nhanh
```bash
# Test public API
curl http://localhost:5000/api/products

# Test với token (PowerShell)
$token = "YOUR_TOKEN"
$headers = @{
    "Authorization" = "Bearer $token"
}
Invoke-RestMethod -Uri "http://localhost:5000/api/me" -Headers $headers
```

---

# 10. POSTMAN COLLECTION

## Import Collection

1. Mở Postman
2. Click **"Import"**
3. Chọn file: `postman/Cart_API_Collection.json`
4. Collection sẽ xuất hiện trong sidebar

## Tạo Environment (Tùy chọn)

1. Click **"Environments"**
2. Click **"Create Environment"**
3. Thêm biến:
   - `base_url` = `http://localhost:5000`
   - `token` = (để trống, sẽ tự động điền sau khi login)
4. Save và chọn environment

## Cách sử dụng

1. **Đăng nhập**: Chạy request "Login" → Token tự động lưu vào biến
2. **Test API**: Các request khác tự động dùng token từ biến
3. **Thay đổi base_url**: Chỉ cần thay trong environment

---

# 11. SCRIPT TEST TỰ ĐỘNG

## Test Auth API
```powershell
.\test_auth_api.ps1
```

## Test Products Filter
```powershell
.\test_products_filter.ps1
```

## Test Categories API
```powershell
.\test_categories_api.ps1
```

**Lưu ý:** Cần thay `TOKEN` trong script bằng token thực tế của bạn.

---

# 12. LƯU Ý QUAN TRỌNG

## Với Monolith
- Tất cả code trong 1 file `server.js`
- Routes trong thư mục `routes/`
- Dễ quản lý, nhưng khó scale

## Với Microservices
- Mỗi service độc lập
- Gateway route requests
- Dễ scale, nhưng phức tạp hơn
- **QUAN TRỌNG**: Tất cả services phải cùng JWT_SECRET

## Token
- Token hết hạn sau 100 ngày
- Token được lưu ở client (localStorage)
- Logout chỉ xóa token ở client (JWT stateless)

## Database
- Tất cả services dùng chung database (với microservices)
- Đảm bảo foreign keys đúng
- Backup database thường xuyên

---

# 13. HỖ TRỢ VÀ TÀI LIỆU

## Files tham khảo
- `README.md` - Tổng quan dự án
- `MICROSERVICES_README.md` - Hướng dẫn microservices
- `HUONG_DAN_MICROSERVICES.md` - Tài liệu chi tiết microservices
- `TOM_TAT_IMPLEMENTATION.md` - Tóm tắt implementation

## API Documentation
Xem file `HUONG_DAN_TEST_API.md` (nội dung đã được gom vào file này)

---

# 14. CHECKLIST TRƯỚC KHI DEMO

- [ ] Database đã setup đầy đủ
- [ ] Server (hoặc services) đã khởi động
- [ ] Frontend truy cập được: `http://localhost:5000`
- [ ] Đã test đăng ký/đăng nhập
- [ ] Đã test xem sản phẩm
- [ ] Đã test thêm vào giỏ hàng
- [ ] Đã test đặt hàng
- [ ] Đã test xem đơn hàng
- [ ] Đã test các API với Postman

---

**Chúc bạn sử dụng dự án thành công! 🎉**

Nếu có vấn đề, kiểm tra phần **Troubleshooting** hoặc xem console log để debug.


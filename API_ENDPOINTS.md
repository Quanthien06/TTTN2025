# 📋 DANH SÁCH API ENDPOINTS - TechStore System

## 📌 TỔNG QUAN

Tài liệu này liệt kê tất cả các API endpoints trong hệ thống TechStore, được tổ chức theo từng module/service.

**Base URL:** `http://localhost:5000` (Gateway)

**Authentication:** 
- Public: Không cần token
- Auth Required: Cần header `Authorization: Bearer <token>`
- Admin Only: Cần token và role = 'admin'

---

## 🔐 1. AUTHENTICATION API

**Service:** `auth-service` (Port 5001)

### 1.1. Đăng Ký
- **Method:** `POST`
- **Endpoint:** `/api/register`
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "username": "string (required)",
    "password": "string (required)",
    "role": "string (optional, default: 'user')"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Đăng ký thành công! Vui lòng đăng nhập."
  }
  ```
- **Error Codes:**
  - `400`: Thiếu thông tin
  - `409`: Username đã tồn tại
  - `500`: Lỗi server

### 1.2. Đăng Nhập
- **Method:** `POST`
- **Endpoint:** `/api/login`
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "username": "string (required)",
    "password": "string (required)"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Đăng nhập thành công",
    "token": "jwt_token_string",
    "user": {
      "id": 1,
      "username": "user123",
      "role": "user"
    }
  }
  ```
- **Error Codes:**
  - `400`: Thiếu thông tin
  - `401`: Username hoặc password không đúng

### 1.3. Lấy Thông Tin User Hiện Tại
- **Method:** `GET`
- **Endpoint:** `/api/me`
- **Auth:** Required
- **Response:**
  ```json
  {
    "user": {
      "id": 1,
      "username": "user123",
      "role": "user",
      "email": "user@example.com",
      "full_name": "Nguyễn Văn A",
      "phone": "0123456789",
      "address": "123 Đường ABC",
      "date_of_birth": "1990-01-01",
      "avatar_url": "https://...",
      "loyalty_points": 100,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### 1.4. Cập Nhật Profile
- **Method:** `PUT`
- **Endpoint:** `/api/profile`
- **Auth:** Required
- **Request Body:**
  ```json
  {
    "username": "string (optional)",
    "full_name": "string (optional)",
    "phone": "string (optional)",
    "address": "string (optional)",
    "date_of_birth": "YYYY-MM-DD (optional)",
    "avatar_url": "string (optional)"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Cập nhật thông tin thành công",
    "user": { ... }
  }
  ```

### 1.5. Đổi Mật Khẩu
- **Method:** `PUT`
- **Endpoint:** `/api/change-password`
- **Auth:** Required
- **Request Body:**
  ```json
  {
    "currentPassword": "string (required)",
    "newPassword": "string (required, min 6 chars)"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Đổi mật khẩu thành công"
  }
  ```

### 1.6. Đăng Xuất
- **Method:** `POST`
- **Endpoint:** `/api/logout`
- **Auth:** Required
- **Response:**
  ```json
  {
    "message": "Đăng xuất thành công",
    "note": "Vui lòng xóa token ở client"
  }
  ```

### 1.7. Quên Mật Khẩu (Gửi OTP)
- **Method:** `POST`
- **Endpoint:** `/api/forgot-password`
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "email": "string (required)"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Mã OTP đã được gửi đến email của bạn",
    "sent": true
  }
  ```

### 1.8. Đặt Lại Mật Khẩu (Với OTP)
- **Method:** `POST`
- **Endpoint:** `/api/reset-password`
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "email": "string (required)",
    "otp": "string (required, 6 digits)",
    "newPassword": "string (required, min 6 chars)"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Đặt lại mật khẩu thành công"
  }
  ```

### 1.9. Lấy Username Từ Email
- **Method:** `GET`
- **Endpoint:** `/api/user-by-email?email=user@example.com`
- **Auth:** Public
- **Response:**
  ```json
  {
    "exists": true,
    "username": "user123"
  }
  ```

---

## 📦 2. PRODUCTS API

**Service:** `product-service` (Port 5002)

### 2.1. Lấy Danh Sách Sản Phẩm
- **Method:** `GET`
- **Endpoint:** `/api/products`
- **Auth:** Public
- **Query Parameters:**
  - `q`: Từ khóa tìm kiếm (optional)
  - `category`: Lọc theo category (optional)
  - `minPrice`: Giá tối thiểu (optional)
  - `maxPrice`: Giá tối đa (optional)
  - `sort`: Sắp xếp theo (id, name, price, created_at) (optional, default: 'id')
  - `order`: Thứ tự (asc, desc) (optional, default: 'asc')
  - `page`: Số trang (optional, default: 1)
  - `limit`: Số lượng mỗi trang (optional, default: 20)
- **Example:** `/api/products?q=laptop&category=laptop&minPrice=10000000&maxPrice=30000000&sort=price&order=asc&page=1&limit=20`
- **Response:**
  ```json
  {
    "products": [
      {
        "id": 1,
        "name": "Laptop Asus",
        "slug": "laptop-asus",
        "category": "Laptop",
        "price": 15000000,
        "original_price": 18000000,
        "description": "...",
        "images": ["img1.jpg", "img2.jpg"],
        "stock": 10
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
  ```

### 2.2. Lấy Chi Tiết Sản Phẩm (Theo ID)
- **Method:** `GET`
- **Endpoint:** `/api/products/:id`
- **Auth:** Public
- **Response:**
  ```json
  {
    "id": 1,
    "name": "Laptop Asus",
    "slug": "laptop-asus",
    "category": "Laptop",
    "price": 15000000,
    "original_price": 18000000,
    "description": "...",
    "images": ["img1.jpg", "img2.jpg"],
    "stock": 10,
    "specifications": { ... }
  }
  ```

### 2.3. Lấy Chi Tiết Sản Phẩm (Theo Slug)
- **Method:** `GET`
- **Endpoint:** `/api/products/by-slug/:slug`
- **Auth:** Public
- **Response:** Tương tự như 2.2

### 2.4. Tạo Sản Phẩm (Admin)
- **Method:** `POST`
- **Endpoint:** `/api/products`
- **Auth:** Admin Only
- **Request Body:**
  ```json
  {
    "name": "string (required)",
    "category": "string (required)",
    "price": "number (required)",
    "description": "string (optional)",
    "original_price": "number (optional)",
    "stock": "number (optional)",
    "images": "array (optional)",
    "specifications": "object (optional)"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Thêm sản phẩm thành công",
    "id": 123,
    "name": "...",
    "category": "...",
    "price": 15000000
  }
  ```

### 2.5. Cập Nhật Sản Phẩm (Admin)
- **Method:** `PUT`
- **Endpoint:** `/api/products/:id`
- **Auth:** Admin Only
- **Request Body:** Tương tự như 2.4
- **Response:**
  ```json
  {
    "message": "Cập nhật sản phẩm ID 123 thành công!"
  }
  ```

### 2.6. Xóa Sản Phẩm (Admin)
- **Method:** `DELETE`
- **Endpoint:** `/api/products/:id`
- **Auth:** Admin Only
- **Response:**
  ```json
  {
    "message": "Xóa sản phẩm ID 123 thành công!"
  }
  ```

---

## 🏷️ 3. CATEGORIES API

**Service:** `product-service` (Port 5002)

### 3.1. Lấy Danh Sách Categories
- **Method:** `GET`
- **Endpoint:** `/api/categories`
- **Auth:** Public
- **Response:**
  ```json
  {
    "categories": [
      {
        "id": 1,
        "name": "Điện thoại, Tablet",
        "slug": "phone-tablet",
        "product_count": 50,
        "icon": "📱",
        "route": "phone-tablet"
      }
    ]
  }
  ```

### 3.2. Lấy Sản Phẩm Theo Category
- **Method:** `GET`
- **Endpoint:** `/api/categories/:id`
- **Auth:** Public
- **Response:**
  ```json
  {
    "category": {
      "id": 1,
      "name": "Laptop",
      "slug": "laptop"
    },
    "products": [ ... ],
    "count": 25
  }
  ```

### 3.3. Tạo Category (Admin)
- **Method:** `POST`
- **Endpoint:** `/api/categories`
- **Auth:** Admin Only
- **Request Body:**
  ```json
  {
    "name": "string (required)",
    "slug": "string (optional, auto-generated)",
    "description": "string (optional)"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Tạo danh mục thành công",
    "category": { ... }
  }
  ```

### 3.4. Cập Nhật Category (Admin)
- **Method:** `PUT`
- **Endpoint:** `/api/categories/:id`
- **Auth:** Admin Only
- **Request Body:**
  ```json
  {
    "name": "string (optional)",
    "slug": "string (optional)",
    "description": "string (optional)"
  }
  ```

### 3.5. Xóa Category (Admin)
- **Method:** `DELETE`
- **Endpoint:** `/api/categories/:id`
- **Auth:** Admin Only

---

## 🛒 4. CART API

**Service:** `cart-service` (Port 5003)

### 4.1. Lấy Giỏ Hàng
- **Method:** `GET`
- **Endpoint:** `/api/cart`
- **Auth:** Required
- **Response:**
  ```json
  {
    "cart": {
      "id": 1,
      "user_id": 1,
      "status": "active",
      "items": [
        {
          "id": 1,
          "product_id": 123,
          "quantity": 2,
          "price": 15000000,
          "product_name": "Laptop Asus",
          "product_slug": "laptop-asus",
          "product_main_image_url": "img1.jpg",
          "subtotal": 30000000
        }
      ],
      "total": 30000000,
      "item_count": 1
    }
  }
  ```

### 4.2. Thêm Sản Phẩm Vào Giỏ
- **Method:** `POST`
- **Endpoint:** `/api/cart/items`
- **Auth:** Required
- **Request Body:**
  ```json
  {
    "product_id": 123,
    "quantity": 2
  }
  ```
- **Response:**
  ```json
  {
    "message": "Đã thêm sản phẩm vào giỏ hàng",
    "item": {
      "id": 1,
      "product_id": 123,
      "quantity": 2,
      "price": 15000000
    }
  }
  ```

### 4.3. Cập Nhật Số Lượng
- **Method:** `PUT`
- **Endpoint:** `/api/cart/items/:itemId`
- **Auth:** Required
- **Request Body:**
  ```json
  {
    "quantity": 3
  }
  ```
- **Response:**
  ```json
  {
    "message": "Đã cập nhật số lượng",
    "item": { ... }
  }
  ```

### 4.4. Xóa Item Khỏi Giỏ
- **Method:** `DELETE`
- **Endpoint:** `/api/cart/items/:itemId`
- **Auth:** Required
- **Response:**
  ```json
  {
    "message": "Đã xóa sản phẩm khỏi giỏ hàng"
  }
  ```

### 4.5. Xóa Toàn Bộ Giỏ Hàng
- **Method:** `DELETE`
- **Endpoint:** `/api/cart`
- **Auth:** Required
- **Response:**
  ```json
  {
    "message": "Đã xóa toàn bộ giỏ hàng"
  }
  ```

### 4.6. Tính Tổng Tiền
- **Method:** `GET`
- **Endpoint:** `/api/cart/total`
- **Auth:** Required
- **Response:**
  ```json
  {
    "total": 30000000,
    "item_count": 2
  }
  ```

---

## 💳 5. ORDERS API

**Service:** `order-service` (Port 5004)

### 5.1. Tạo Đơn Hàng
- **Method:** `POST`
- **Endpoint:** `/api/orders`
- **Auth:** Required
- **Request Body:**
  ```json
  {
    "shipping_address": "string (required)",
    "phone": "string (optional)",
    "payment_method": "string (optional)",
    "payment_details": "object (optional)",
    "coupon_code": "string (optional)",
    "use_loyalty_points": "number (optional)"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Đặt hàng thành công",
    "order": {
      "id": 123,
      "user_id": 1,
      "total": 28000000,
      "shipping_address": "...",
      "status": "pending",
      "items": [ ... ],
      "item_count": 2
    }
  }
  ```

### 5.2. Lấy Danh Sách Đơn Hàng (User)
- **Method:** `GET`
- **Endpoint:** `/api/orders`
- **Auth:** Required
- **Query Parameters:**
  - `page`: Số trang (optional, default: 1)
  - `limit`: Số lượng mỗi trang (optional, default: 10)
- **Response:**
  ```json
  {
    "orders": [
      {
        "id": 123,
        "total": 28000000,
        "status": "pending",
        "shipping_address": "...",
        "created_at": "2024-01-01T00:00:00.000Z",
        "item_count": 2,
        "total_quantity": 3
      }
    ],
    "count": 5,
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 5,
      "limit": 10
    }
  }
  ```

### 5.3. Lấy Chi Tiết Đơn Hàng
- **Method:** `GET`
- **Endpoint:** `/api/orders/:id`
- **Auth:** Required (chỉ xem được đơn hàng của mình)
- **Response:**
  ```json
  {
    "order": {
      "id": 123,
      "total": 28000000,
      "status": "pending",
      "items": [
        {
          "id": 1,
          "product_id": 123,
          "product_name": "Laptop Asus",
          "quantity": 2,
          "price": 15000000,
          "subtotal": 30000000
        }
      ],
      "item_count": 2
    }
  }
  ```

### 5.4. Lấy Danh Sách Đơn Hàng (Admin)
- **Method:** `GET`
- **Endpoint:** `/api/orders/admin`
- **Auth:** Admin Only
- **Query Parameters:**
  - `page`: Số trang (optional, default: 1)
  - `limit`: Số lượng mỗi trang (optional, default: 20)
- **Response:**
  ```json
  {
    "orders": [
      {
        "id": 123,
        "user_id": 1,
        "user": {
          "id": 1,
          "username": "user123",
          "email": "user@example.com"
        },
        "total": 28000000,
        "status": "pending",
        "item_count": 2
      }
    ],
    "total": 100,
    "pagination": { ... }
  }
  ```

### 5.5. Lấy Chi Tiết Đơn Hàng (Admin)
- **Method:** `GET`
- **Endpoint:** `/api/orders/admin/:id`
- **Auth:** Admin Only
- **Response:** Tương tự như 5.3, nhưng có thêm thông tin user

### 5.6. Cập Nhật Trạng Thái Đơn Hàng (Admin)
- **Method:** `PUT`
- **Endpoint:** `/api/orders/:id/status`
- **Auth:** Admin Only
- **Request Body:**
  ```json
  {
    "status": "pending|processing|shipped|delivered|cancelled"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Đã cập nhật trạng thái đơn hàng",
    "order": { ... }
  }
  ```

### 5.7. Hủy Đơn Hàng (User)
- **Method:** `PUT`
- **Endpoint:** `/api/orders/:id/cancel`
- **Auth:** Required (chỉ hủy được đơn hàng của mình, và chỉ khi status = pending)
- **Request Body:**
  ```json
  {
    "reason": "string (optional)"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Đã hủy đơn hàng thành công",
    "order": { ... }
  }
  ```

### 5.8. Chỉnh Sửa Đơn Hàng (User)
- **Method:** `PUT`
- **Endpoint:** `/api/orders/:id`
- **Auth:** Required (chỉ sửa được đơn hàng của mình, và chỉ khi status = pending)
- **Request Body:**
  ```json
  {
    "shipping_address": "string (optional)",
    "phone": "string (optional)",
    "payment_method": "string (optional)",
    "payment_details": "object (optional)"
  }
  ```

### 5.9. Đặt Lại Đơn Hàng
- **Method:** `POST`
- **Endpoint:** `/api/orders/:id/reorder`
- **Auth:** Required
- **Response:**
  ```json
  {
    "message": "Đã thêm X sản phẩm vào giỏ hàng",
    "redirect_to_cart": true,
    "items_added": 2,
    "items_skipped": 0
  }
  ```

---

## 🎟️ 6. COUPONS API

**Service:** `order-service` (Port 5004)

### 6.1. Validate Coupon Code
- **Method:** `POST`
- **Endpoint:** `/api/coupons/validate`
- **Auth:** Public (có thể có token để check usage limit per user)
- **Request Body:**
  ```json
  {
    "code": "SALE10",
    "total_amount": 15000000
  }
  ```
- **Response:**
  ```json
  {
    "valid": true,
    "coupon": {
      "id": 1,
      "code": "SALE10",
      "name": "Giảm 10%",
      "description": "...",
      "discount_type": "percentage",
      "discount_value": 10,
      "discount_amount": 1500000,
      "original_amount": 15000000,
      "final_amount": 13500000
    }
  }
  ```

### 6.2. Lấy Danh Sách Coupons Đang Hoạt Động
- **Method:** `GET`
- **Endpoint:** `/api/coupons/active`
- **Auth:** Public
- **Response:**
  ```json
  {
    "coupons": [
      {
        "id": 1,
        "code": "SALE10",
        "name": "Giảm 10%",
        "description": "...",
        "discount_type": "percentage",
        "discount_value": 10,
        "min_purchase_amount": 1000000,
        "max_discount_amount": 5000000,
        "valid_until": "2024-12-31T23:59:59.000Z"
      }
    ]
  }
  ```

### 6.3. Tạo Coupon (Admin)
- **Method:** `POST`
- **Endpoint:** `/api/coupons`
- **Auth:** Admin Only
- **Request Body:**
  ```json
  {
    "code": "SALE10",
    "name": "Giảm 10%",
    "description": "string (optional)",
    "discount_type": "percentage|fixed",
    "discount_value": 10,
    "min_purchase_amount": 1000000,
    "max_discount_amount": 5000000,
    "usage_limit": 100,
    "valid_from": "2024-01-01T00:00:00.000Z",
    "valid_until": "2024-12-31T23:59:59.000Z"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Tạo mã giảm giá thành công",
    "coupon": {
      "id": 1,
      "code": "SALE10"
    }
  }
  ```

---

## 🎁 7. LOYALTY POINTS API

**Service:** `order-service` (Port 5004)

### 7.1. Lấy Số Điểm Tích Lũy
- **Method:** `GET`
- **Endpoint:** `/api/loyalty/balance`
- **Auth:** Required
- **Response:**
  ```json
  {
    "balance": 100,
    "total_earned": 500,
    "total_redeemed": 400,
    "points_value": 100000
  }
  ```
- **Note:** 1 point = 1,000 VNĐ

### 7.2. Lấy Lịch Sử Giao Dịch Điểm
- **Method:** `GET`
- **Endpoint:** `/api/loyalty/transactions`
- **Auth:** Required
- **Query Parameters:**
  - `page`: Số trang (optional, default: 1)
  - `limit`: Số lượng mỗi trang (optional, default: 20)
- **Response:**
  ```json
  {
    "transactions": [
      {
        "id": 1,
        "user_id": 1,
        "points": 50,
        "type": "earn|redeem",
        "description": "Tích lũy từ đơn hàng #123",
        "order_id": 123,
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": { ... }
  }
  ```

### 7.3. Tính Điểm Sẽ Tích Lũy
- **Method:** `POST`
- **Endpoint:** `/api/loyalty/calculate`
- **Auth:** Required
- **Request Body:**
  ```json
  {
    "order_amount": 15000000
  }
  ```
- **Response:**
  ```json
  {
    "points_to_earn": 1500,
    "points_value": 1500000
  }
  ```
- **Note:** Earn 1 point per 10,000 VNĐ spent

### 7.4. Đổi Điểm (Redeem)
- **Method:** `POST`
- **Endpoint:** `/api/loyalty/redeem`
- **Auth:** Required
- **Request Body:**
  ```json
  {
    "points": 100,
    "order_id": 123,
    "description": "string (optional)"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Đổi điểm thành công",
    "points_redeemed": 100,
    "discount_amount": 100000,
    "new_balance": 0
  }
  ```

---

## 📰 8. NEWS API

**Service:** `news-service` (Port 5005)

### 8.1. Lấy Danh Sách Tin Tức
- **Method:** `GET`
- **Endpoint:** `/api/news`
- **Auth:** Public
- **Query Parameters:**
  - `page`: Số trang (optional, default: 1)
  - `limit`: Số lượng mỗi trang (optional, default: 5)
- **Response:**
  ```json
  {
    "news": [
      {
        "id": 1,
        "title": "Tin tức công nghệ",
        "slug": "tin-tuc-cong-nghe",
        "summary": "...",
        "content": "...",
        "thumbnail_url": "https://...",
        "category": "Tech",
        "tags": ["laptop", "tech"],
        "author": "Admin",
        "source_url": "https://...",
        "published_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "totalItems": 50,
      "totalPages": 10
    }
  }
  ```

### 8.2. Lấy Chi Tiết Tin Tức
- **Method:** `GET`
- **Endpoint:** `/api/news/:slug`
- **Auth:** Public
- **Response:**
  ```json
  {
    "news": {
      "id": 1,
      "title": "Tin tức công nghệ",
      "slug": "tin-tuc-cong-nghe",
      "summary": "...",
      "content": "...",
      "thumbnail_url": "https://...",
      "category": "Tech",
      "tags": ["laptop", "tech"],
      "author": "Admin",
      "source_url": "https://...",
      "published_at": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

---

## 💬 9. COMMENTS API

**Service:** Gateway (Direct DB Query)

### 9.1. Lấy Bình Luận Sản Phẩm
- **Method:** `GET`
- **Endpoint:** `/api/comments/product/:productId`
- **Auth:** Public
- **Response:**
  ```json
  {
    "comments": [
      {
        "id": 1,
        "product_id": 123,
        "user_id": 1,
        "username": "user123",
        "comment": "Sản phẩm rất tốt!",
        "rating": 5,
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "count": 10
  }
  ```

### 9.2. Thêm Bình Luận
- **Method:** `POST`
- **Endpoint:** `/api/comments`
- **Auth:** Required
- **Request Body:**
  ```json
  {
    "product_id": 123,
    "comment": "Sản phẩm rất tốt!",
    "rating": 5
  }
  ```
- **Response:**
  ```json
  {
    "message": "Thêm comment thành công",
    "comment": { ... }
  }
  ```

### 9.3. Xóa Bình Luận
- **Method:** `DELETE`
- **Endpoint:** `/api/comments/:id`
- **Auth:** Required (chỉ xóa được comment của mình hoặc admin)
- **Response:**
  ```json
  {
    "message": "Xóa comment thành công"
  }
  ```

---

## 📊 10. STATS API (Admin)

**Service:** Gateway (Direct DB Query)

### 10.1. Thống Kê Tổng Quan
- **Method:** `GET`
- **Endpoint:** `/api/stats/overview`
- **Auth:** Admin Only
- **Response:**
  ```json
  {
    "totalUsers": 150,
    "totalProducts": 500,
    "totalOrders": 1200,
    "totalRevenue": 1500000000
  }
  ```

### 10.2. Thống Kê Doanh Thu
- **Method:** `GET`
- **Endpoint:** `/api/stats/revenue`
- **Auth:** Admin Only
- **Response:**
  ```json
  {
    "months": ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"],
    "revenue": [10000000, 20000000, 30000000, ...],
    "ordersByStatus": {
      "pending": 10,
      "processing": 5,
      "shipped": 20,
      "delivered": 100,
      "cancelled": 5
    }
  }
  ```

---

## 💳 11. PAYMENT API

**Service:** Gateway (Direct DB Query)

### 11.1. Kiểm Tra Tài Khoản Thanh Toán
- **Method:** `GET`
- **Endpoint:** `/api/payment/check-account`
- **Auth:** Public
- **Query Parameters:**
  - `bank`: Loại ngân hàng (bank_transfer, momo, visa)
  - `account_number`: Số tài khoản
- **Response:**
  ```json
  {
    "success": true,
    "account": {
      "id": 1,
      "bank_type": "bank_transfer",
      "account_number": "1234567890",
      "account_name": "TechStore",
      "balance": 100000000
    }
  }
  ```

---

## 👥 12. USERS API (Admin)

**Service:** `auth-service` (Port 5001)

### 12.1. Lấy Danh Sách Users (Admin)
- **Method:** `GET`
- **Endpoint:** `/api/users`
- **Auth:** Admin Only
- **Query Parameters:**
  - `page`: Số trang (optional)
  - `limit`: Số lượng mỗi trang (optional)
- **Response:**
  ```json
  {
    "users": [
      {
        "id": 1,
        "username": "user123",
        "email": "user@example.com",
        "role": "user",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": { ... }
  }
  ```

### 12.2. Lấy Chi Tiết User (Admin)
- **Method:** `GET`
- **Endpoint:** `/api/users/:id`
- **Auth:** Admin Only

### 12.3. Cập Nhật User (Admin)
- **Method:** `PUT`
- **Endpoint:** `/api/users/:id`
- **Auth:** Admin Only

### 12.4. Xóa User (Admin)
- **Method:** `DELETE`
- **Endpoint:** `/api/users/:id`
- **Auth:** Admin Only

---

## ❓ 13. FAQs API

**Service:** Gateway (Read from config file)

### 13.1. Lấy Danh Sách FAQs
- **Method:** `GET`
- **Endpoint:** `/api/faqs`
- **Auth:** Public
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "question": "Câu hỏi?",
        "answer": "Câu trả lời..."
      }
    ]
  }
  ```

---

## 🔍 14. HEALTH CHECK

Tất cả services đều có endpoint health check:

### 14.1. Auth Service
- **Method:** `GET`
- **Endpoint:** `http://localhost:5001/health`
- **Response:**
  ```json
  {
    "status": "ok",
    "service": "auth-service"
  }
  ```

### 14.2. Product Service
- **Method:** `GET`
- **Endpoint:** `http://localhost:5002/health`
- **Response:**
  ```json
  {
    "status": "ok",
    "service": "product-service"
  }
  ```

### 14.3. Cart Service
- **Method:** `GET`
- **Endpoint:** `http://localhost:5003/health`
- **Response:**
  ```json
  {
    "status": "ok",
    "service": "cart-service"
  }
  ```

### 14.4. Order Service
- **Method:** `GET`
- **Endpoint:** `http://localhost:5004/health`
- **Response:**
  ```json
  {
    "status": "ok",
    "service": "order-service"
  }
  ```

### 14.5. News Service
- **Method:** `GET`
- **Endpoint:** `http://localhost:5005/health`
- **Response:**
  ```json
  {
    "status": "ok",
    "service": "news-service"
  }
  ```

---

## 📝 GHI CHÚ QUAN TRỌNG

### Authentication
- **Public Routes:** Không cần token
- **Auth Required:** Cần header `Authorization: Bearer <token>`
- **Admin Only:** Cần token và `role === 'admin'`

### Error Response Format
```json
{
  "message": "Mô tả lỗi",
  "error": "Error code (optional)"
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate entry)
- `500`: Internal Server Error
- `502`: Bad Gateway (service unavailable)

### Pagination Format
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Date Format
- ISO 8601: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Date only: `YYYY-MM-DD`

---

## 🔄 CẬP NHẬT

**Phiên bản:** 1.0  
**Cập nhật lần cuối:** 2024-01-01  
**Tác giả:** TechStore Development Team









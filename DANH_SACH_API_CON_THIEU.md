# 📋 DANH SÁCH API CÒN THIẾU TRONG BACKEND

## ✅ CÁC API ĐÃ CÓ (HOÀN THÀNH)

### 1. **Auth API** (Cơ bản)
- ✅ `POST /api/register` - Đăng ký user
- ✅ `POST /api/login` - Đăng nhập

### 2. **Products API** (Cơ bản)
- ✅ `GET /api/products` - Lấy tất cả sản phẩm
- ✅ `GET /api/products/:id` - Lấy chi tiết sản phẩm
- ✅ `POST /api/products` - Thêm sản phẩm (admin)
- ✅ `PUT /api/products/:id` - Cập nhật sản phẩm (admin)
- ✅ `DELETE /api/products/:id` - Xóa sản phẩm (admin)

### 3. **Cart API** (Đầy đủ)
- ✅ `GET /api/cart` - Lấy giỏ hàng
- ✅ `POST /api/cart/items` - Thêm sản phẩm vào giỏ
- ✅ `PUT /api/cart/items/:itemId` - Cập nhật số lượng
- ✅ `DELETE /api/cart/items/:itemId` - Xóa item khỏi giỏ
- ✅ `DELETE /api/cart` - Xóa toàn bộ giỏ hàng
- ✅ `GET /api/cart/total` - Tính tổng tiền

### 4. **Orders API** (Đầy đủ)
- ✅ `POST /api/orders` - Tạo đơn hàng từ cart
- ✅ `GET /api/orders` - Lấy danh sách đơn hàng của user
- ✅ `GET /api/orders/:id` - Lấy chi tiết đơn hàng
- ✅ `PUT /api/orders/:id/status` - Cập nhật trạng thái (admin)

---

## ❌ CÁC API CÒN THIẾU

### 🎯 PHASE 1 - CẦN THIẾT (Ưu tiên cao)

#### 1. **Auth API - Bổ sung** ⭐⭐⭐⭐⭐
Các endpoint quan trọng cho authentication:

- ❌ `POST /api/logout` - Đăng xuất
  - Thêm token vào blacklist (hoặc xử lý ở client)
  
- ❌ `GET /api/me` - Lấy thông tin user hiện tại
  - Trả về: `{ id, username, role, created_at }`
  - Cần: `authenticateToken`
  
- ❌ `PUT /api/profile` - Cập nhật thông tin cá nhân
  - Cập nhật: username, email (nếu có)
  - Cần: `authenticateToken`
  
- ❌ `PUT /api/change-password` - Đổi mật khẩu
  - Body: `{ currentPassword, newPassword }`
  - Cần: `authenticateToken`
  - Validate: currentPassword phải đúng

**File cần sửa:**
- `routes/auth.js` - Thêm các endpoint trên

---

### 🚀 PHASE 2 - QUAN TRỌNG (Ưu tiên trung bình)

#### 2. **Products API - Tìm kiếm & Lọc** ⭐⭐⭐⭐
Cải thiện trải nghiệm tìm kiếm sản phẩm:

- ❌ `GET /api/products/search?q=keyword` - Tìm kiếm sản phẩm
  - Tìm trong: name, description, category
  - Trả về: danh sách sản phẩm khớp
  
- ❌ `GET /api/products?category=laptop` - Lọc theo danh mục
  - Filter: `WHERE category = ?`
  
- ❌ `GET /api/products?minPrice=1000000&maxPrice=5000000` - Lọc theo giá
  - Filter: `WHERE price BETWEEN ? AND ?`
  
- ❌ `GET /api/products?sort=price&order=asc` - Sắp xếp
  - Sort: `price`, `name`, `created_at`
  - Order: `asc`, `desc`
  
- ❌ `GET /api/products?page=1&limit=10` - Phân trang
  - Trả về: `{ products, total, page, limit, totalPages }`
  - Tính: `OFFSET = (page - 1) * limit`

**File cần sửa:**
- `routes/product.js` - Cập nhật `GET /api/products` để hỗ trợ query parameters

**Ví dụ kết hợp:**
```
GET /api/products?category=laptop&minPrice=1000000&maxPrice=5000000&sort=price&order=asc&page=1&limit=10&q=macbook
```

---

#### 3. **Categories API** ⭐⭐⭐⭐
Quản lý danh mục sản phẩm:

- ❌ `GET /api/categories` - Lấy danh sách danh mục
  - Trả về: `[{ id, name, slug, description, product_count }]`
  
- ❌ `GET /api/categories/:id` - Lấy sản phẩm theo danh mục
  - Trả về: Danh sách sản phẩm thuộc category đó
  
- ❌ `POST /api/categories` - Tạo danh mục (admin)
  - Body: `{ name, slug, description }`
  
- ❌ `PUT /api/categories/:id` - Cập nhật danh mục (admin)
  
- ❌ `DELETE /api/categories/:id` - Xóa danh mục (admin)

**File cần tạo:**
- `routes/categories.js` - Tạo file mới
- `database/categories_schema.sql` - Tạo bảng categories

**Database schema cần:**
```sql
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 💡 PHASE 3 - HỮU ÍCH (Ưu tiên thấp)

#### 4. **User Management API** ⭐⭐⭐
Quản lý users (dành cho admin):

- ❌ `GET /api/users` - Lấy danh sách users (admin)
  - Filter: `?role=admin`, `?search=keyword`
  - Pagination: `?page=1&limit=10`
  
- ❌ `GET /api/users/:id` - Lấy thông tin user (admin)
  
- ❌ `PUT /api/users/:id` - Cập nhật user (admin)
  
- ❌ `DELETE /api/users/:id` - Xóa user (admin)
  
- ❌ `PUT /api/users/:id/role` - Thay đổi role (admin)
  - Body: `{ role: 'admin' | 'user' }`

**File cần tạo:**
- `routes/users.js` - Tạo file mới

---

#### 5. **Reviews/Ratings API** ⭐⭐
Đánh giá sản phẩm:

- ❌ `POST /api/products/:id/reviews` - Thêm đánh giá
  - Body: `{ rating: 1-5, comment }`
  
- ❌ `GET /api/products/:id/reviews` - Lấy đánh giá của sản phẩm
  - Trả về: `[{ id, user_id, username, rating, comment, created_at }]`
  
- ❌ `PUT /api/reviews/:id` - Cập nhật đánh giá (chỉ user tạo)
  
- ❌ `DELETE /api/reviews/:id` - Xóa đánh giá (user tạo hoặc admin)

**File cần tạo:**
- `routes/reviews.js` - Tạo file mới
- `database/reviews_schema.sql` - Tạo bảng reviews

**Database schema cần:**
```sql
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

#### 6. **Statistics/Dashboard API** ⭐⭐
Thống kê cho admin:

- ❌ `GET /api/stats/overview` - Tổng quan (admin)
  - Trả về: `{ total_users, total_products, total_orders, total_revenue }`
  
- ❌ `GET /api/stats/products` - Thống kê sản phẩm (admin)
  - Top sản phẩm bán chạy, sản phẩm theo category
  
- ❌ `GET /api/stats/orders` - Thống kê đơn hàng (admin)
  - Orders theo status, theo tháng
  
- ❌ `GET /api/stats/revenue` - Doanh thu (admin)
  - Doanh thu theo tháng, theo năm

**File cần tạo:**
- `routes/stats.js` - Tạo file mới

---

## 📊 TỔNG KẾT

### Số lượng API:
- ✅ Đã có: **17 endpoints**
- ❌ Còn thiếu: **~23 endpoints**

### Theo độ ưu tiên:
- 🎯 **Phase 1** (Cần thiết): 4 endpoints
- 🚀 **Phase 2** (Quan trọng): 9 endpoints  
- 💡 **Phase 3** (Hữu ích): 10 endpoints

---

## 🎯 ĐỀ XUẤT TRIỂN KHAI

### Bước 1: Auth bổ sung (QUAN TRỌNG NHẤT)
```
✅ GET /api/me
✅ POST /api/logout (hoặc xử lý ở client)
✅ PUT /api/profile
✅ PUT /api/change-password
```

### Bước 2: Products Search/Filter
```
✅ Cập nhật GET /api/products để hỗ trợ:
   - ?q=keyword (search)
   - ?category=...
   - ?minPrice=...&maxPrice=...
   - ?sort=...&order=...
   - ?page=...&limit=... (pagination)
```

### Bước 3: Categories API
```
✅ Tạo database schema
✅ Tạo routes/categories.js
✅ CRUD đầy đủ cho categories
```

### Bước 4: Các tính năng khác (tùy nhu cầu)
- User Management
- Reviews
- Statistics

---

## 💡 LƯU Ý

1. **Auth bổ sung** nên làm đầu tiên vì các tính năng khác có thể cần
2. **Products Search/Filter** cải thiện UX đáng kể
3. **Categories** giúp tổ chức sản phẩm tốt hơn
4. Các tính năng khác làm sau nếu có thời gian

---

**Bạn muốn tôi implement API nào trước?**


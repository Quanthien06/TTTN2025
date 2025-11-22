# ĐỀ XUẤT CÁC API CÒN THIẾU

## 📊 TỔNG QUAN API HIỆN CÓ

### ✅ Đã có:
- **Auth**: Register, Login
- **Products**: GET, POST, PUT, DELETE
- **Cart**: GET, POST items, PUT items, DELETE items, DELETE cart, GET total

---

## 🚀 CÁC API QUAN TRỌNG CẦN BỔ SUNG

### 1. **ORDERS (ĐẶT HÀNG)** - ⭐ QUAN TRỌNG NHẤT

**Mục đích**: Cho phép user đặt hàng từ giỏ hàng

**Endpoints cần có:**
- `POST /api/orders` - Tạo đơn hàng từ cart
- `GET /api/orders` - Lấy danh sách đơn hàng của user
- `GET /api/orders/:id` - Lấy chi tiết đơn hàng
- `PUT /api/orders/:id/status` - Cập nhật trạng thái đơn hàng (admin)
- `GET /api/orders/user/:userId` - Lấy đơn hàng của user (admin)

**Database cần:**
- Bảng `orders` (id, user_id, total, status, created_at)
- Bảng `order_items` (id, order_id, product_id, quantity, price)

**Priority**: ⭐⭐⭐⭐⭐ (Rất quan trọng)

---

### 2. **AUTH - BỔ SUNG**

**Endpoints cần có:**
- `POST /api/logout` - Đăng xuất (thêm token vào blacklist)
- `GET /api/me` - Lấy thông tin user hiện tại
- `PUT /api/profile` - Cập nhật thông tin cá nhân
- `PUT /api/change-password` - Đổi mật khẩu
- `POST /api/refresh-token` - Làm mới token (nếu dùng refresh token)

**Priority**: ⭐⭐⭐⭐ (Quan trọng)

---

### 3. **PRODUCTS - BỔ SUNG**

**Endpoints cần có:**
- `GET /api/products/search?q=keyword` - Tìm kiếm sản phẩm
- `GET /api/products?category=laptop` - Lọc theo danh mục
- `GET /api/products?minPrice=1000000&maxPrice=5000000` - Lọc theo giá
- `GET /api/products?sort=price&order=asc` - Sắp xếp
- `GET /api/products?page=1&limit=10` - Phân trang

**Priority**: ⭐⭐⭐⭐ (Quan trọng cho UX)

---

### 4. **CATEGORIES (DANH MỤC)**

**Endpoints cần có:**
- `GET /api/categories` - Lấy danh sách danh mục
- `GET /api/categories/:id` - Lấy sản phẩm theo danh mục
- `POST /api/categories` - Tạo danh mục (admin)
- `PUT /api/categories/:id` - Cập nhật danh mục (admin)
- `DELETE /api/categories/:id` - Xóa danh mục (admin)

**Database cần:**
- Bảng `categories` (id, name, description, slug)

**Priority**: ⭐⭐⭐ (Hữu ích)

---

### 5. **USER MANAGEMENT**

**Endpoints cần có:**
- `GET /api/users` - Lấy danh sách users (admin)
- `GET /api/users/:id` - Lấy thông tin user (admin)
- `PUT /api/users/:id` - Cập nhật user (admin)
- `DELETE /api/users/:id` - Xóa user (admin)
- `PUT /api/users/:id/role` - Thay đổi role (admin)

**Priority**: ⭐⭐⭐ (Cần cho admin)

---

### 6. **REVIEWS/RATINGS (ĐÁNH GIÁ)**

**Endpoints cần có:**
- `POST /api/products/:id/reviews` - Thêm đánh giá
- `GET /api/products/:id/reviews` - Lấy đánh giá của sản phẩm
- `PUT /api/reviews/:id` - Cập nhật đánh giá
- `DELETE /api/reviews/:id` - Xóa đánh giá

**Database cần:**
- Bảng `reviews` (id, product_id, user_id, rating, comment, created_at)

**Priority**: ⭐⭐ (Tùy chọn)

---

### 7. **STATISTICS/DASHBOARD (THỐNG KÊ)**

**Endpoints cần có:**
- `GET /api/stats/overview` - Tổng quan (admin)
- `GET /api/stats/products` - Thống kê sản phẩm (admin)
- `GET /api/stats/orders` - Thống kê đơn hàng (admin)
- `GET /api/stats/revenue` - Doanh thu (admin)

**Priority**: ⭐⭐ (Tùy chọn, cần cho admin)

---

## 🎯 THỨ TỰ ƯU TIÊN TRIỂN KHAI

### Phase 1 - CẦN THIẾT (Làm ngay):
1. ✅ **Orders API** - Quan trọng nhất, hoàn thiện flow mua hàng
2. ✅ **Auth bổ sung** - Logout, Get current user

### Phase 2 - QUAN TRỌNG (Làm tiếp theo):
3. ✅ **Products Search/Filter** - Cải thiện UX
4. ✅ **Categories** - Tổ chức sản phẩm tốt hơn

### Phase 3 - HỮU ÍCH (Làm sau):
5. ✅ **User Management** - Quản lý users
6. ✅ **Reviews** - Tăng tương tác
7. ✅ **Statistics** - Dashboard admin

---

## 📝 GỢI Ý CẤU TRÚC DATABASE

### Bảng `orders`:
```sql
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total DECIMAL(15, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Bảng `order_items`:
```sql
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### Bảng `categories`:
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

## 💡 LƯU Ý

1. **Orders API** là quan trọng nhất - nó hoàn thiện flow mua hàng
2. **Search/Filter** cải thiện trải nghiệm người dùng đáng kể
3. **Categories** giúp tổ chức sản phẩm tốt hơn
4. Các API khác có thể làm sau tùy nhu cầu

---

## 🚀 BẮT ĐẦU TỪ ĐÂU?

**Khuyến nghị**: Bắt đầu với **Orders API** vì:
- Hoàn thiện flow mua hàng (Cart → Order)
- User có thể xem lịch sử đơn hàng
- Admin có thể quản lý đơn hàng

Bạn muốn tôi tạo code cho API nào trước?


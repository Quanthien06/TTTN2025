# 📱 HƯỚNG DẪN SỬ DỤNG GIAO DIỆN TRANG CHỦ

## ✅ ĐÃ TẠO LẠI GIAO DIỆN

Giao diện mới đã được tạo lại hoàn toàn, match với tất cả các API trong backend:

### Các tính năng đã implement:

1. ✅ **Đăng nhập / Đăng ký**
   - Modal đăng nhập
   - Modal đăng ký
   - Tự động lưu token
   - Kiểm tra authentication

2. ✅ **Trang chủ**
   - Hiển thị categories (6 danh mục đầu tiên)
   - Hiển thị sản phẩm nổi bật (8 sản phẩm mới nhất)
   - Navigation dễ dàng

3. ✅ **Trang sản phẩm**
   - Tìm kiếm sản phẩm theo keyword
   - Lọc theo category
   - Lọc theo giá (min/max)
   - Sắp xếp (giá, tên)
   - Phân trang
   - Thêm vào giỏ hàng

4. ✅ **Trang danh mục**
   - Xem tất cả categories
   - Click vào category để lọc sản phẩm

5. ✅ **Giỏ hàng**
   - Xem giỏ hàng
   - Cập nhật số lượng
   - Xóa sản phẩm
   - Tính tổng tiền
   - Đặt hàng

6. ✅ **Đơn hàng**
   - Xem danh sách đơn hàng
   - Xem chi tiết từng đơn
   - Trạng thái đơn hàng

7. ✅ **Hồ sơ cá nhân**
   - Xem thông tin user
   - Cập nhật username
   - Đổi mật khẩu

---

## 🚀 CÁCH SỬ DỤNG

### 1. Khởi động Server

```bash
node server.js
```

Server sẽ chạy tại: `http://localhost:5000`

### 2. Mở trình duyệt

Truy cập: `http://localhost:5000`

### 3. Các bước sử dụng:

#### Bước 1: Đăng ký tài khoản
- Click nút "Đăng ký" ở góc trên bên phải
- Nhập username và password (tối thiểu 6 ký tự)
- Click "Đăng ký"
- Sau khi đăng ký thành công, modal đăng nhập sẽ tự động mở

#### Bước 2: Đăng nhập
- Nhập username và password
- Click "Đăng nhập"
- Sau khi đăng nhập, bạn sẽ thấy menu user với các tùy chọn:
  - Giỏ hàng
  - Đơn hàng
  - Hồ sơ

#### Bước 3: Xem sản phẩm
- Click "Sản phẩm" trên menu
- Sử dụng thanh tìm kiếm để tìm sản phẩm
- Lọc theo category, giá
- Sắp xếp theo giá hoặc tên
- Click "Thêm vào giỏ" để thêm sản phẩm

#### Bước 4: Quản lý giỏ hàng
- Click "Giỏ hàng" trên menu (có badge số lượng)
- Xem tất cả sản phẩm trong giỏ
- Thay đổi số lượng bằng nút +/- hoặc nhập trực tiếp
- Xóa sản phẩm bằng nút "Xóa"
- Click "Đặt hàng" khi đã sẵn sàng

#### Bước 5: Đặt hàng
- Trong giỏ hàng, click "Đặt hàng"
- Nhập địa chỉ giao hàng
- Nhập số điện thoại
- Click "Xác nhận đặt hàng"
- Sau khi đặt hàng thành công, bạn sẽ được chuyển đến trang "Đơn hàng"

#### Bước 6: Xem đơn hàng
- Click "Đơn hàng" trên menu
- Xem tất cả đơn hàng đã đặt
- Xem trạng thái: Chờ xử lý, Đang xử lý, Đã giao hàng, v.v.

#### Bước 7: Quản lý hồ sơ
- Click tên user → "Hồ sơ"
- Xem thông tin tài khoản
- Cập nhật username
- Đổi mật khẩu

---

## 🎨 GIAO DIỆN

### Design:
- **Dark theme** hiện đại, dễ nhìn
- **Responsive** - hoạt động tốt trên mobile
- **Smooth animations** - chuyển trang mượt mà
- **Toast notifications** - thông báo rõ ràng

### Màu sắc:
- Background: Dark blue (#0b1120)
- Accent: Blue (#3b82f6)
- Cards: Dark gray (#1e293b)
- Text: Light gray (#e2e8f0)

---

## 📋 CÁC API ĐƯỢC SỬ DỤNG

### Authentication:
- `POST /api/register` - Đăng ký
- `POST /api/login` - Đăng nhập
- `GET /api/me` - Lấy thông tin user
- `PUT /api/profile` - Cập nhật profile
- `PUT /api/change-password` - Đổi mật khẩu
- `POST /api/logout` - Đăng xuất (client-side)

### Products:
- `GET /api/products` - Danh sách sản phẩm (với search, filter, sort, pagination)
- `GET /api/products/:id` - Chi tiết sản phẩm (chưa dùng trong UI hiện tại)

### Categories:
- `GET /api/categories` - Danh sách categories

### Cart:
- `GET /api/cart` - Lấy giỏ hàng
- `POST /api/cart/items` - Thêm sản phẩm vào giỏ
- `PUT /api/cart/items/:id` - Cập nhật số lượng
- `DELETE /api/cart/items/:id` - Xóa sản phẩm khỏi giỏ

### Orders:
- `GET /api/orders` - Danh sách đơn hàng
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders/:id` - Chi tiết đơn hàng (chưa dùng trong UI hiện tại)

---

## 🔧 CẤU HÌNH

### Thay đổi API URL:

Nếu server chạy ở port khác, sửa trong `public/app.js`:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

### Thay đổi số sản phẩm mỗi trang:

Trong `public/app.js`, tìm:

```javascript
let currentPagination = { page: 1, limit: 12, total: 0, totalPages: 0 };
```

Thay đổi `limit: 12` thành số bạn muốn.

---

## ⚠️ LƯU Ý

1. **Token được lưu trong localStorage**
   - Token tự động lưu khi đăng nhập
   - Token tự động xóa khi đăng xuất
   - Token hết hạn sau 100 ngày (theo cấu hình backend)

2. **Cần đăng nhập để:**
   - Thêm sản phẩm vào giỏ
   - Xem giỏ hàng
   - Đặt hàng
   - Xem đơn hàng
   - Quản lý hồ sơ

3. **Lỗi có thể gặp:**
   - Nếu API không trả về dữ liệu, kiểm tra server đã chạy chưa
   - Nếu token hết hạn, đăng nhập lại
   - Nếu gặp lỗi CORS, đảm bảo server và client cùng domain/port

---

## 🎯 TÍNH NĂNG TƯƠNG LAI (Có thể bổ sung)

- [ ] Xem chi tiết sản phẩm (trang riêng)
- [ ] Xem chi tiết đơn hàng (trang riêng)
- [ ] Hủy đơn hàng (nếu status = pending)
- [ ] Quản lý categories (admin)
- [ ] Quản lý sản phẩm (admin)
- [ ] Tìm kiếm nâng cao
- [ ] So sánh sản phẩm
- [ ] Yêu thích / Wishlist

---

## 📝 FILES ĐÃ TẠO/CẬP NHẬT

1. `public/index.html` - HTML structure mới
2. `public/styles.css` - CSS styling mới
3. `public/app.js` - JavaScript xử lý tất cả logic

---

## 🎉 HOÀN THÀNH!

Giao diện đã sẵn sàng sử dụng! Chỉ cần:

1. Khởi động server: `node server.js`
2. Mở browser: `http://localhost:5000`
3. Bắt đầu sử dụng!


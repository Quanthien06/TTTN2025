# Project Summary (living document)

> Mô tả ngắn gọn về công nghệ và tính năng hiện có. Có thể cập nhật dần khi dự án thay đổi.

## Kiến trúc & công nghệ
- **Frontend:** HTML/Tailwind CSS + Bootstrap 5 + Font Awesome; single-page-style điều hướng qua `public/app.js`, dữ liệu fetch từ API.
- **Backend:** Node.js/Express; nhiều service (auth, product, cart, order) + gateway; REST API.
- **CSDL:** MySQL (các script import/seed trong thư mục `database/`).
- **Triển khai/dev:** Docker Compose cho các service; script PowerShell/JS hỗ trợ cấu hình OAuth, import dữ liệu, khởi động dịch vụ.
- **Auth:** JWT lưu trong `localStorage`; có OAuth/Google (các hướng dẫn và script cấu hình OIDC/OAuth2).

## Tính năng frontend đã có
- **Trang chủ:** Banner slider 3 ảnh; danh mục sản phẩm nổi bật; sản phẩm nổi bật; nút quay lại đầu trang.
- **Điều hướng:** Menu có các route động cho trang chủ, khuyến mãi, tin công nghệ, và các nhóm danh mục (Điện thoại/Tablet, Laptop, Âm thanh, Đồng hồ/Camera, Phụ kiện, PC/Màn hình/Máy in + phân nhánh).
- **Sản phẩm:** Trang sản phẩm với tìm kiếm, lọc theo danh mục, giá min/max, sắp xếp, phân trang; render card sản phẩm, hiển thị giảm giá nếu có.
- **Danh mục:** Trang danh mục hiển thị lưới categories, liên kết xem sản phẩm theo category.
- **Giỏ hàng:** Điều hướng tới `cart.html`, kiểm tra token trước khi vào.
- **Đơn hàng / Hồ sơ:** Trang đơn hàng và trang hồ sơ (profile) yêu cầu đăng nhập; hiển thị thông tin user, vai trò, thống kê đơn hàng (UI mẫu).
- **Auth UI:** Modal đăng nhập/đăng ký/đổi mật khẩu; cập nhật UI theo trạng thái đăng nhập; xử lý token từ URL (OAuth callback).
- **Admin redirect:** Nếu user role là `admin`, tự động chuyển sang `/admin.html` khi đăng nhập hoặc khi đã có token hợp lệ.

## API & luồng dữ liệu (frontend)
- Tất cả call qua `apiCall` (fetch kèm JWT nếu có, trừ các endpoint mở).
- Endpoints chính: `/login`, `/register`, `/me`, `/products`, `/categories`, `/cart`, `/orders`, `/profile`, … (xem chi tiết trong `public/app.js` và các service backend).
- Bộ lọc sản phẩm dùng query string: `q`, `category`, `minPrice`, `maxPrice`, `sort`, `page`, `limit`.

## Thư mục đáng chú ý
- `public/`: `index.html`, `app.js`, `styles.css`, assets (`img/slider`, `img/logo`, …), trang auth/cart/login/register.
- `services/`: auth-service, product-service, cart-service, order-service (Express).
- `gateway/`: API gateway (Express).
- `routes/`: các route server tổng hợp (nếu chạy chế độ monolith).
- `database/`: script import/seed sản phẩm, thêm ảnh, v.v.
- `docs hướng dẫn`: nhiều file `HUONG_DAN_*.md` cho OAuth, restart server, lấy secret.

## Bảo mật & phân quyền
- JWT lưu `localStorage` (`token`); user info cache `user_info`.
- Guard điều hướng: cart/orders/profile kiểm tra đăng nhập; admin auto-redirect `admin.html`.
- OAuth Google: cần config client id/secret (xem file hướng dẫn).

## Hướng dẫn cập nhật file này
- Thêm công nghệ mới: ghi rõ stack và phạm vi áp dụng.
- Thêm tính năng mới: mô tả ngắn, vị trí code (file chính), hành vi chính.
- Nếu thay đổi kiến trúc: cập nhật phần Kiến trúc & công nghệ.


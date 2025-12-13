# System Workflow & Roles

## Actors
- **User**: Đăng ký/đăng nhập, quản lý hồ sơ, xem sản phẩm, thêm giỏ hàng, thanh toán, theo dõi đơn hàng.
- **Admin**: Toàn quyền của User **+** quản trị danh mục/sản phẩm/đơn hàng, duyệt & cập nhật trạng thái.

## Authentication & Profile
- Đăng ký, đăng nhập, JWT lưu ở client (localStorage); mỗi request API kèm `Authorization: Bearer <token>`.
- User có thể cập nhật hồ sơ: họ tên, số điện thoại, địa chỉ, ngày sinh, avatar.
- Middleware `authenticateToken` bắt buộc cho các API bảo vệ (cart, orders, profile,…).

## Catalog (Categories & Products)
- **User**:
  - Xem danh mục chính (6 nhóm) và sản phẩm.
  - Xem chi tiết sản phẩm.
- **Admin**:
  - CRUD danh mục.
  - CRUD sản phẩm.

## Cart & Checkout
- **User**:
  - Thêm/xóa/cập nhật số lượng sản phẩm trong giỏ (`/api/cart`).
  - Chọn phương thức vận chuyển (standard/express/overnight).
  - Thanh toán qua `/checkout.html`: chọn phương thức (ngân hàng nội địa, MoMo, Visa/Mastercard), nhập địa chỉ giao hàng.
  - Gửi đơn hàng tạo `/api/orders` (pending).
- **Admin**:
  - Xem tất cả đơn hàng, cập nhật trạng thái: pending → processing → shipped → delivered hoặc cancelled.

## Orders
- **User**:
  - Xem danh sách đơn hàng của mình, xem chi tiết, theo dõi trạng thái.
- **Admin**:
  - Cập nhật trạng thái, xử lý phát sinh.

## News (Tech News)
- **User**: Xem tin công nghệ.
- **Admin**: (tuỳ hệ thống) có thể đăng/sửa/xoá tin.

## Role Permissions (tóm tắt)
| Tính năng                      | User | Admin |
|--------------------------------|:----:|:-----:|
| Đăng ký/Đăng nhập              |  ✔   |  ✔    |
| Xem/chỉnh sửa hồ sơ            |  ✔   |  ✔    |
| Xem danh mục/sản phẩm          |  ✔   |  ✔    |
| Thêm giỏ hàng/Thanh toán       |  ✔   |  ✔    |
| Xem đơn hàng của mình          |  ✔   |  ✔    |
| CRUD danh mục                  |      |  ✔    |
| CRUD sản phẩm                  |      |  ✔    |
| Xem tất cả đơn hàng            |      |  ✔    |
| Cập nhật trạng thái đơn hàng   |      |  ✔    |
| CRUD tin tức (nếu bật)         |      |  ✔    |

## High-level Flow
1) User đăng nhập → JWT lưu client.
2) User duyệt danh mục/sản phẩm → thêm vào giỏ.
3) User vào giỏ (`/cart.html`) → chọn vận chuyển, áp mã giảm giá (nếu có) → chuyển `checkout.html`.
4) User nhập địa chỉ + chọn phương thức thanh toán → gửi `/api/orders` (status `pending`).
5) Admin duyệt/ xử lý đơn → cập nhật `processing/shipped/delivered` hoặc `cancelled`.
6) User theo dõi trạng thái đơn hàng.

## Notes
- Tất cả API nhạy cảm yêu cầu JWT hợp lệ; admin-only kiểm tra `role === 'admin'`.
- Địa chỉ + thông tin thanh toán được gửi cùng đơn hàng; có thể mở rộng cột `payment_method` riêng trong DB khi cần.

## Hướng phát triển tiếp theo
- Tách cột riêng cho `payment_method`, `payment_status`, `payment_details` trong DB thay vì nhúng vào `shipping_address`.
- Bổ sung luồng hoàn tiền/đổi trả và đối soát thanh toán (webhook từ cổng thanh toán).
- Thêm mã giảm giá động, cấu hình từ admin (hiệu lực, %/đồng, điều kiện).
- Thêm theo dõi vận chuyển (tracking code), thông báo email/SMS/notification.
- Bổ sung unit test / integration test cho API orders/cart/auth.
- Thêm phân quyền chi tiết hơn (staff/chăm sóc khách hàng) và audit log.

Câu hỏi nhờ thầy tư vấn 
1. Quy trình hoàn tiền/đổi trả cần hỗ trợ mức nào? Có cần trạng thái refund/return trong đơn hàng?
2. Vận chuyển: có cần tích hợp API hãng vận chuyển thực tế (GHN, GHTK) hay chỉ mô phỏng phí cố định?



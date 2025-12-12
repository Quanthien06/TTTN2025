# Hướng dẫn cập nhật Profile User

## Tổng quan
Đã thêm các trường mới cho profile user:
- `full_name` (VARCHAR 255): Họ và tên đầy đủ
- `phone` (VARCHAR 20): Số điện thoại
- `address` (TEXT): Địa chỉ
- `date_of_birth` (DATE): Ngày sinh

## Các bước thực hiện

### 1. Chạy script để thêm các cột mới vào database

```bash
node database/add_profile_fields.js
```

Script sẽ:
- Kiểm tra các cột đã tồn tại
- Chỉ thêm các cột chưa có
- Hiển thị cấu trúc bảng sau khi cập nhật

### 2. Khởi động lại server (nếu đang chạy)

Nếu đang dùng Docker:
```bash
docker-compose restart auth-service
```

Hoặc nếu chạy trực tiếp:
```bash
# Dừng server và khởi động lại
```

### 3. Kiểm tra

1. Đăng nhập vào hệ thống
2. Vào trang "Hồ sơ" (Profile)
3. Click "Chỉnh sửa" hoặc "Cập nhật thông tin"
4. Điền và lưu các thông tin mới:
   - Họ và tên
   - Số điện thoại
   - Địa chỉ
   - Ngày sinh

## API Endpoints

### GET /api/me
Trả về thông tin user bao gồm các trường mới:
```json
{
  "user": {
    "id": 1,
    "username": "user123",
    "full_name": "Nguyễn Văn A",
    "phone": "0912345678",
    "address": "123 Đường ABC, Quận XYZ",
    "date_of_birth": "1990-01-01",
    ...
  }
}
```

### PUT /api/profile
Cập nhật thông tin profile (có thể cập nhật một hoặc nhiều trường):
```json
{
  "username": "user123",
  "full_name": "Nguyễn Văn A",
  "phone": "0912345678",
  "address": "123 Đường ABC",
  "date_of_birth": "1990-01-01"
}
```

## Validation

- **Phone**: Phải có 10-11 chữ số
- **Date of Birth**: Không thể lớn hơn ngày hiện tại, tuổi hợp lệ (13-120)
- **Username**: Bắt buộc, không được trùng với user khác

## Lưu ý

- Tất cả các trường mới đều là **optional** (có thể NULL)
- Có thể cập nhật từng trường riêng lẻ hoặc tất cả cùng lúc
- Frontend đã được cập nhật để hiển thị và chỉnh sửa các trường mới


# Hướng dẫn cấu hình Email để gửi OTP

## Cấu hình Email với Gmail

### Bước 1: Tạo App Password cho Gmail

1. Đăng nhập vào tài khoản Google của bạn
2. Truy cập: https://myaccount.google.com/apppasswords
3. Chọn "Mail" và "Other (Custom name)"
4. Nhập tên: "TechStore"
5. Click "Generate"
6. Copy mật khẩu ứng dụng (16 ký tự) - **LƯU Ý: Đây KHÔNG phải mật khẩu Gmail của bạn**

### Bước 2: Cấu hình trong Docker Compose

Có 2 cách:

#### Cách 1: Sử dụng file .env (Khuyến nghị)

1. Tạo file `.env` trong thư mục gốc của project:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-16-chars
EMAIL_FROM=your-email@gmail.com
```

2. Docker Compose sẽ tự động đọc file `.env`

#### Cách 2: Sử dụng environment variables trực tiếp

Sửa file `docker-compose.yml`:
```yaml
auth-service:
  environment:
    EMAIL_USER: your-email@gmail.com
    EMAIL_PASS: your-app-password-16-chars
    EMAIL_FROM: your-email@gmail.com
```

### Bước 3: Rebuild và restart service

```powershell
docker-compose up -d --build auth-service
```

### Bước 4: Kiểm tra logs

```powershell
docker logs tttn2025-auth --tail 20
```

Nếu thấy dòng `✅ Email service đã sẵn sàng` thì đã cấu hình thành công!

## Cấu hình Email với các dịch vụ khác

### Outlook/Hotmail

```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### Yahoo Mail

```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

### SendGrid (Production)

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

## Lưu ý

- **Nếu không cấu hình email**: Mã OTP sẽ được log ra console của container để test
- **Gmail App Password**: Phải dùng App Password, không dùng mật khẩu Gmail thông thường
- **Bảo mật**: Không commit file `.env` vào Git
- **Production**: Nên dùng dịch vụ email chuyên nghiệp như SendGrid, AWS SES, hoặc Mailgun

## Test Email

Sau khi cấu hình xong:

1. Truy cập trang quên mật khẩu: http://localhost:5000/forgot-password.html
2. Nhập email đã đăng ký
3. Click "GỬI MÃ OTP"
4. Kiểm tra hộp thư email (có thể ở thư mục Spam)

## Troubleshooting

### Lỗi: "Email service không khả dụng"

- Kiểm tra lại EMAIL_USER và EMAIL_PASS trong `.env`
- Đảm bảo đã tạo App Password cho Gmail
- Kiểm tra firewall có chặn port 587 không

### Email không đến

- Kiểm tra thư mục Spam
- Xem logs: `docker logs tttn2025-auth`
- Kiểm tra email có đúng định dạng không

### Lỗi authentication

- Đảm bảo đã bật "Less secure app access" (nếu dùng Gmail cũ)
- Hoặc tạo App Password mới


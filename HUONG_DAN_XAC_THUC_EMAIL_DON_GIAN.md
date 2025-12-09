# 📧 Hướng dẫn xác thực email đơn giản và tiện nhất

## 🎯 Có 2 cách chính:

### Cách 1: Publish OAuth App (Không cần Test Users) ⭐ Khuyến nghị

**Ưu điểm:**
- ✅ Không cần thêm test users
- ✅ Mọi user đều có thể đăng nhập
- ✅ Đơn giản, nhanh chóng

**Cách làm:**
1. Vào OAuth Consent Screen: https://console.cloud.google.com/apis/credentials/consent
2. Scroll xuống phần **"Publishing status"**
3. Click nút **"PUBLISH APP"** hoặc **"Make available to everyone"**
4. Xác nhận publish
5. **Lưu ý**: Có thể mất vài phút để Google xử lý

**Sau khi publish:**
- Không cần test users nữa
- Mọi user đều có thể đăng nhập bằng Google

---

### Cách 2: Xác thực email bằng OTP (Không dùng OAuth)

**Ưu điểm:**
- ✅ Hoàn toàn tự chủ, không phụ thuộc Google
- ✅ Đơn giản, dễ quản lý
- ✅ Đã có sẵn trong code (routes/auth.js)

**Cách hoạt động:**
1. User đăng ký → Nhập email
2. Hệ thống gửi OTP qua email
3. User nhập OTP để xác thực
4. Xác thực thành công → Tài khoản được kích hoạt

**Đã có sẵn:**
- ✅ API `/api/register` - Đăng ký và gửi OTP
- ✅ API `/api/register/verify-otp` - Xác thực OTP
- ✅ API `/api/register/resend-otp` - Gửi lại OTP

**Cần kiểm tra:**
- File `config/email.js` đã cấu hình đúng chưa?
- Gmail App Password đã tạo chưa?

---

## 🔧 Cách 2: Cấu hình Email OTP (Chi tiết)

### Bước 1: Tạo Gmail App Password

1. Vào: https://myaccount.google.com/apppasswords
2. Chọn app: **Mail**
3. Chọn device: **Other (Custom name)**
4. Nhập tên: `TechStore`
5. Click **Generate**
6. **Copy password** (16 ký tự, có khoảng trắng - xóa khoảng trắng khi dùng)

### Bước 2: Cấu hình file `.env`

Thêm vào file `.env`:
```env
# Email Configuration
EMAIL_USER=giakiethcb1@gmail.com
EMAIL_PASS=your-16-char-app-password
```

**Lưu ý**: `EMAIL_PASS` là App Password (16 ký tự), KHÔNG phải mật khẩu Gmail thường.

### Bước 3: Kiểm tra config/email.js

File `config/email.js` đã có sẵn, chỉ cần đảm bảo:
- Sử dụng `process.env.EMAIL_USER`
- Sử dụng `process.env.EMAIL_PASS`

### Bước 4: Test

1. Restart server
2. Đăng ký tài khoản mới
3. Kiểm tra email có nhận được OTP không
4. Nhập OTP để xác thực

---

## 📊 So sánh 2 cách

| Tiêu chí | OAuth (Publish) | Email OTP |
|----------|----------------|-----------|
| Độ phức tạp | ⭐⭐ | ⭐⭐⭐ |
| Tốc độ setup | ⚡⚡⚡ (5 phút) | ⚡⚡ (10 phút) |
| Phụ thuộc | Google | Gmail SMTP |
| User experience | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Bảo mật | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 🎯 Khuyến nghị

**Nếu muốn nhanh nhất:**
→ **Publish OAuth App** (Cách 1)

**Nếu muốn tự chủ hoàn toàn:**
→ **Email OTP** (Cách 2)

---

## 🆘 Vẫn lỗi OAuth sau khi publish?

1. **Đợi 5-10 phút** sau khi publish (Google cần thời gian xử lý)
2. **Xóa cache browser** và thử lại
3. **Kiểm tra lại Client ID và Secret** trong file `.env`
4. **Restart server** sau khi publish


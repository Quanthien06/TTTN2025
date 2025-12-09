# 📧 Hướng dẫn xác thực OTP khi đăng ký

## ✅ Hệ thống đã có sẵn

### Backend APIs:
- ✅ `POST /api/register` - Đăng ký và gửi OTP qua email
- ✅ `POST /api/verify-email` - Xác thực OTP
- ✅ `POST /api/resend-verification` - Gửi lại OTP

### Frontend:
- ✅ Form đăng ký với email
- ✅ Form nhập OTP (hiển thị sau khi đăng ký thành công)
- ✅ Nút "Gửi lại OTP"

---

## 🔄 Flow hoạt động

### Bước 1: Đăng ký
1. User điền form đăng ký:
   - Tên đăng nhập
   - Email
   - Mật khẩu
   - Xác nhận mật khẩu

2. Click "Đăng ký"
   - Backend tạo tài khoản với `email_verified = false`
   - Tạo mã OTP (6 chữ số, hiệu lực 10 phút)
   - Gửi OTP qua email
   - Trả về success

3. Frontend:
   - Ẩn form đăng ký
   - Hiển thị form nhập OTP
   - Hiển thị email đã đăng ký

### Bước 2: Xác thực OTP
1. User kiểm tra email và lấy mã OTP
2. Nhập mã OTP vào form (6 chữ số)
3. Click "Xác nhận"
   - Backend kiểm tra OTP:
     - Email có đúng không?
     - OTP có đúng không?
     - OTP còn hiệu lực không? (10 phút)
   - Nếu đúng:
     - Cập nhật `email_verified = true`
     - Xóa OTP
     - Trả về success
   - Nếu sai:
     - Trả về lỗi

4. Frontend:
   - Nếu thành công: Redirect đến trang đăng nhập
   - Nếu thất bại: Hiển thị lỗi, cho phép nhập lại

### Bước 3: Đăng nhập
- User chỉ có thể đăng nhập sau khi xác thực email
- Backend kiểm tra `email_verified = true` khi đăng nhập

---

## ⚙️ Cấu hình Email

### Bước 1: Tạo Gmail App Password

1. Vào: https://myaccount.google.com/apppasswords
2. Chọn:
   - **App**: Mail
   - **Device**: Other (Custom name)
   - **Name**: TechStore
3. Click **Generate**
4. **Copy password** (16 ký tự, xóa khoảng trắng)

### Bước 2: Cập nhật file `.env`

Thêm vào file `.env`:
```env
EMAIL_USER=giakiethcb1@gmail.com
EMAIL_PASS=your-16-char-app-password
```

**Lưu ý:**
- `EMAIL_PASS` là **App Password**, KHÔNG phải mật khẩu Gmail thường
- Xóa tất cả khoảng trắng trong App Password

### Bước 3: Restart Server

Sau khi cập nhật `.env`:
```bash
# Dừng server (Ctrl+C)
node server.js
```

---

## 🧪 Test Flow

### Test 1: Đăng ký và nhận OTP
1. Mở: http://localhost:5000/register.html
2. Điền form đăng ký
3. Click "Đăng ký"
4. Kiểm tra:
   - ✅ Form đăng ký bị ẩn
   - ✅ Form OTP hiển thị
   - ✅ Email nhận được OTP

### Test 2: Xác thực OTP
1. Lấy mã OTP từ email
2. Nhập mã OTP
3. Click "Xác nhận"
4. Kiểm tra:
   - ✅ Redirect đến trang đăng nhập
   - ✅ Tài khoản đã được kích hoạt

### Test 3: Đăng nhập sau khi xác thực
1. Đăng nhập với tài khoản vừa tạo
2. Kiểm tra:
   - ✅ Đăng nhập thành công
   - ✅ Hiển thị "Xin chào, {tên người dùng}"

---

## ⚠️ Lưu ý quan trọng

1. **OTP chỉ hiệu lực 10 phút**
   - Sau 10 phút, OTP hết hạn
   - Phải yêu cầu gửi lại OTP

2. **Email phải được xác thực trước khi đăng nhập**
   - User không thể đăng nhập nếu `email_verified = false`
   - Phải xác thực OTP trước

3. **Có thể gửi lại OTP**
   - Click "Gửi lại OTP" nếu không nhận được email
   - OTP mới sẽ được tạo và gửi

4. **Kiểm tra Spam/Junk folder**
   - Email có thể vào thư mục Spam
   - Kiểm tra cả Inbox và Spam

---

## 🆘 Xử lý lỗi

### Lỗi: "Không thể gửi email"
- **Nguyên nhân**: Chưa cấu hình EMAIL_USER và EMAIL_PASS
- **Giải pháp**: Cập nhật file `.env` và restart server

### Lỗi: "OTP không hợp lệ hoặc đã hết hạn"
- **Nguyên nhân**: OTP sai hoặc đã quá 10 phút
- **Giải pháp**: Click "Gửi lại OTP" và nhập mã mới

### Lỗi: "Email đã được sử dụng"
- **Nguyên nhân**: Email đã được đăng ký trước đó
- **Giải pháp**: Dùng email khác hoặc đăng nhập

### Lỗi: "Vui lòng xác nhận email trước khi đăng nhập"
- **Nguyên nhân**: Chưa xác thực OTP
- **Giải pháp**: Vào email và xác thực OTP trước

---

## 📝 Tóm tắt

✅ **Hệ thống đã có đầy đủ chức năng xác thực OTP**
- Backend: Gửi OTP, xác thực OTP, gửi lại OTP
- Frontend: Form đăng ký, form OTP, nút gửi lại

⚠️ **Cần cấu hình:**
- File `.env` với `EMAIL_USER` và `EMAIL_PASS`
- Gmail App Password

🔄 **Flow:**
1. Đăng ký → Nhận OTP qua email
2. Nhập OTP → Xác thực thành công
3. Đăng nhập → Sử dụng tài khoản


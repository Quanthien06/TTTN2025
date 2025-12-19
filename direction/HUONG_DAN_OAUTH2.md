# Hướng dẫn cấu hình OAuth2 với Google

## Bước 1: Cập nhật Database

Chạy script để thêm cột `google_id`:

```bash
node database/add_google_id.js
```

Hoặc chạy SQL trực tiếp:

```bash
mysql -u root -p tttn2025 < database/add_google_id.sql
```

## Bước 2: Tạo Google OAuth2 Credentials

### 2.1. Truy cập Google Cloud Console

1. Đi đến: https://console.cloud.google.com/
2. Tạo project mới hoặc chọn project hiện có
3. Bật **Google+ API** hoặc **Google Identity Services**

### 2.2. Tạo OAuth 2.0 Client ID

1. Vào **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Chọn **Web application**
4. Điền thông tin:
   - **Name**: TechStore OAuth2
   - **Authorized JavaScript origins**: 
     - `http://localhost:5000`
     - `http://localhost:3000` (nếu có frontend riêng)
   - **Authorized redirect URIs**:
     - `http://localhost:5000/api/auth/google/callback`
5. Click **Create**
6. Copy **Client ID** và **Client Secret**

## Bước 3: Cấu hình trong Code

### Cách 1: Sử dụng biến môi trường (Khuyến nghị)

Tạo file `.env` trong thư mục gốc:

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

Cài đặt dotenv:

```bash
npm install dotenv
```

Cập nhật `server.js` để load biến môi trường:

```javascript
require('dotenv').config();
```

### Cách 2: Cấu hình trực tiếp trong code

Sửa file `routes/oauth.js`:

```javascript
passport.use(new GoogleStrategy({
    clientID: 'your-google-client-id.apps.googleusercontent.com',
    clientSecret: 'your-google-client-secret',
    callbackURL: 'http://localhost:5000/api/auth/google/callback'
}, ...));
```

## Bước 4: Test OAuth2

1. Khởi động server:
   ```bash
   node server.js
   ```

2. Truy cập trang đăng nhập hoặc đăng ký
3. Click nút **"Đăng nhập với Google"** hoặc **"Đăng ký với Google"**
4. Chọn tài khoản Google
5. Cho phép ứng dụng truy cập
6. Sẽ được redirect về trang chủ với token đã được lưu

## Lưu ý

- **Callback URL phải khớp chính xác** với URL đã đăng ký trong Google Console
- Nếu deploy lên production, cần cập nhật **Authorized redirect URIs** trong Google Console
- User đăng nhập bằng Google sẽ tự động được tạo tài khoản nếu chưa có
- Email từ Google sẽ tự động được xác nhận (`email_verified = TRUE`)
- Username sẽ được tạo tự động từ email + Google ID

## Troubleshooting

### Lỗi: "redirect_uri_mismatch"
- Kiểm tra callback URL trong Google Console phải khớp chính xác
- Đảm bảo protocol (http/https) và port đúng

### Lỗi: "invalid_client"
- Kiểm tra Client ID và Client Secret đã đúng chưa
- Đảm bảo đã copy đầy đủ không thiếu ký tự

### Không redirect về trang chủ
- Kiểm tra console browser để xem có lỗi JavaScript không
- Kiểm tra token có được lưu vào localStorage không



# Hướng dẫn tạo và cấu hình file .env

## Cách 1: Tạo file .env thủ công (Đơn giản nhất)

### Bước 1: Tạo file `.env` trong thư mục gốc

1. Mở thư mục project: `D:\DoAn TTTN\TTTN2025`
2. Tạo file mới tên `.env` (không có phần mở rộng, chỉ là `.env`)
3. Copy nội dung sau vào file:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### Bước 2: Lấy Google OAuth Credentials

1. **Truy cập Google Cloud Console**:
   - Đi đến: https://console.cloud.google.com/
   - Đăng nhập bằng tài khoản Google

2. **Tạo Project** (nếu chưa có):
   - Click "Select a project" > "New Project"
   - Tên: `TechStore` (hoặc tên khác)
   - Click "Create"

3. **Cấu hình OAuth Consent Screen** (BẮT BUỘC):
   - Vào **APIs & Services** > **OAuth consent screen**
   - Chọn **External** > Click **Create**
   - Điền:
     - **App name**: TechStore
     - **User support email**: Email của bạn
     - **Developer contact information**: Email của bạn
   - Click **Save and Continue** (3 lần)
   - Ở màn hình **Test users**, click **+ ADD USERS**
   - Thêm email của bạn: `giakiethcb1@gmail.com`
   - Click **Save**

4. **Tạo OAuth Client ID**:
   - Vào **APIs & Services** > **Credentials**
   - Click **+ CREATE CREDENTIALS** > **OAuth client ID**
   - Chọn **Application type**: **Web application**
   - Điền:
     - **Name**: `TechStore OAuth2`
     - **Authorized JavaScript origins**: 
       ```
       http://localhost:5000
       ```
     - **Authorized redirect URIs**: 
       ```
       http://localhost:5000/api/auth/google/callback
       ```
   - Click **CREATE**
   - **QUAN TRỌNG**: Copy ngay **Client ID** và **Client Secret** (chỉ hiển thị 1 lần!)

### Bước 3: Cập nhật file .env

Mở file `.env` và thay thế:

```env
GOOGLE_CLIENT_ID=dán-client-id-vào-đây.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=dán-client-secret-vào-đây
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

**Ví dụ thực tế**:
```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### Bước 4: Lưu file và restart server

1. **Lưu file `.env`**
2. **Restart server**:
   ```bash
   # Dừng server (Ctrl+C)
   # Chạy lại:
   node server.js
   ```

### Bước 5: Kiểm tra

Chạy lệnh để kiểm tra:
```bash
node check-oauth-config.js
```

Nếu thấy ✅ thì đã cấu hình đúng!

---

## Cách 2: Dùng script tự động

Chạy lệnh:
```bash
node setup-oauth.js
```

Script sẽ hỏi bạn nhập Client ID và Client Secret, sau đó tự động tạo file `.env`.

---

## Lưu ý quan trọng:

1. **File `.env` phải ở thư mục gốc** của project (cùng cấp với `server.js`)
2. **Không có khoảng trắng** xung quanh dấu `=`
3. **Không có dấu ngoặc kép** (`"` hoặc `'`) trong file .env
4. **Client ID** thường có dạng: `xxxxx.apps.googleusercontent.com`
5. **Client Secret** là chuỗi dài các ký tự
6. **KHÔNG commit file `.env` vào Git** (đã có trong .gitignore)

---

## Kiểm tra file .env đã đúng chưa:

File `.env` đúng sẽ có dạng:
```
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdef123456
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

**KHÔNG đúng** nếu có:
- Khoảng trắng: `GOOGLE_CLIENT_ID = value` ❌
- Dấu ngoặc: `GOOGLE_CLIENT_ID="value"` ❌
- Giá trị mặc định: `GOOGLE_CLIENT_ID=your-google-client-id` ❌



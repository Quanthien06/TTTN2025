# Hướng dẫn chi tiết cấu hình OAuth2 với Google

## Lỗi hiện tại: "OAuth client was not found" (401: invalid_client)

Lỗi này xảy ra vì **Google Client ID và Client Secret chưa được cấu hình**.

## Các bước khắc phục:

### Bước 1: Tạo OAuth 2.0 Client ID trong Google Cloud Console

1. **Truy cập Google Cloud Console**:
   - Đi đến: https://console.cloud.google.com/
   - Đăng nhập bằng tài khoản Google của bạn

2. **Tạo hoặc chọn Project**:
   - Nếu chưa có project, click **"Select a project"** > **"New Project"**
   - Đặt tên project: `TechStore` (hoặc tên khác)
   - Click **"Create"**

3. **Cấu hình OAuth Consent Screen** (Bắt buộc):
   - Vào **APIs & Services** > **OAuth consent screen**
   - Chọn **External** (cho testing) hoặc **Internal** (nếu dùng Google Workspace)
   - Click **Create**
   - Điền thông tin:
     - **App name**: TechStore
     - **User support email**: Email của bạn
     - **Developer contact information**: Email của bạn
   - Click **Save and Continue**
   - Ở màn hình **Scopes**, click **Save and Continue**
   - Ở màn hình **Test users**, thêm email của bạn (nếu chọn External)
   - Click **Save and Continue** > **Back to Dashboard**

4. **Tạo OAuth 2.0 Client ID**:
   - Vào **APIs & Services** > **Credentials**
   - Click **+ CREATE CREDENTIALS** > **OAuth client ID**
   - Chọn **Application type**: **Web application**
   - Điền thông tin:
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
   - **QUAN TRỌNG**: Copy **Client ID** và **Client Secret** ngay lập tức (chỉ hiển thị 1 lần!)

### Bước 2: Cấu hình trong Code

1. **Tạo file `.env`** trong thư mục gốc của project:
   ```bash
   # Copy file mẫu
   copy .env.example .env
   ```
   
   Hoặc tạo file `.env` mới với nội dung:
   ```env
   GOOGLE_CLIENT_ID=paste-your-client-id-here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=paste-your-client-secret-here
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```

2. **Paste Client ID và Client Secret** vào file `.env`:
   - Mở file `.env`
   - Thay `paste-your-client-id-here` bằng Client ID đã copy
   - Thay `paste-your-client-secret-here` bằng Client Secret đã copy
   - **Lưu file**

3. **Kiểm tra cấu hình**:
   ```bash
   node check-oauth-config.js
   ```
   
   Nếu thấy ✅ thì đã cấu hình đúng!

### Bước 3: Restart Server

1. **Dừng server hiện tại** (Ctrl+C trong terminal)
2. **Khởi động lại**:
   ```bash
   node server.js
   ```
3. Kiểm tra console có thông báo:
   ```
   OAuth2 Google Strategy đã được khởi tạo
   ```

### Bước 4: Test OAuth2

1. Truy cập: `http://localhost:5000/login.html`
2. Click nút **"Đăng nhập với Google"**
3. Chọn tài khoản Google
4. Cho phép ứng dụng truy cập
5. Sẽ được redirect về trang chủ với token đã được lưu

## Lưu ý quan trọng:

1. **Callback URL phải khớp chính xác**:
   - Trong Google Console: `http://localhost:5000/api/auth/google/callback`
   - Trong code: `http://localhost:5000/api/auth/google/callback`
   - Không được có khoảng trắng, không được thiếu `/`

2. **Client ID và Client Secret**:
   - Client ID thường có dạng: `xxxxx.apps.googleusercontent.com`
   - Client Secret là chuỗi dài các ký tự
   - Không được để trống hoặc có khoảng trắng

3. **OAuth Consent Screen**:
   - Phải được cấu hình trước khi tạo OAuth Client ID
   - Nếu chọn "External", cần thêm test users

4. **File `.env`**:
   - Không commit file `.env` vào Git (đã có trong `.gitignore`)
   - Giữ bí mật Client Secret

## Troubleshooting:

### Vẫn lỗi "invalid_client" sau khi cấu hình:
1. Kiểm tra lại Client ID và Client Secret có đúng không
2. Đảm bảo đã restart server sau khi tạo file `.env`
3. Kiểm tra file `.env` có trong thư mục gốc không
4. Kiểm tra không có khoảng trắng thừa trong `.env`

### Lỗi "redirect_uri_mismatch":
- Kiểm tra callback URL trong Google Console phải khớp chính xác với code
- Đảm bảo protocol (http/https) và port đúng

### Không thấy nút "Đăng nhập với Google":
- Kiểm tra console browser có lỗi JavaScript không
- Kiểm tra route `/api/auth/google` có hoạt động không: `http://localhost:5000/api/auth/status`



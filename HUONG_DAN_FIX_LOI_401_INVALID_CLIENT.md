# 🔧 Hướng dẫn sửa lỗi 401: invalid_client

## ❌ Lỗi
```
The OAuth client was not found.
Lỗi 401: invalid_client
```

## 🔍 Nguyên nhân có thể

1. **Client ID hoặc Client Secret không đúng**
2. **Server chưa restart sau khi cập nhật .env**
3. **Callback URL không khớp với Google Console**
4. **OAuth Consent Screen chưa được cấu hình**
5. **User chưa được thêm vào Test Users**

---

## ✅ Các bước kiểm tra và sửa

### Bước 1: Kiểm tra file .env

File `.env` phải ở **root** (cùng cấp với `server.js`):
```env
GOOGLE_CLIENT_ID=658343730766-f5hik99ljbgrb2n1vjkscrsoav5b21ve.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

**Kiểm tra:**
```bash
node check-oauth-config.js
```

### Bước 2: Restart Server

⚠️ **QUAN TRỌNG**: Sau khi cập nhật `.env`, **PHẢI restart server**!

1. Dừng server hiện tại (Ctrl+C)
2. Khởi động lại:
   ```bash
   node server.js
   ```

### Bước 3: Kiểm tra Google Cloud Console

#### 3.1. Kiểm tra OAuth Client ID

1. Vào: https://console.cloud.google.com/apis/credentials
2. Click vào OAuth Client "TechStore OAuth2"
3. Kiểm tra:
   - **Client ID** phải khớp với file `.env`
   - **Authorized JavaScript origins**: `http://localhost:5000`
   - **Authorized redirect URIs**: `http://localhost:5000/api/auth/google/callback`

#### 3.2. Kiểm tra OAuth Consent Screen

1. Vào: **APIs & Services** > **OAuth consent screen**
2. Kiểm tra:
   - **User type**: External (hoặc Internal)
   - **App name**: Đã điền
   - **User support email**: Đã điền
   - **Developer contact information**: Đã điền

#### 3.3. Kiểm tra Test Users (QUAN TRỌNG!)

Nếu OAuth Consent Screen ở chế độ **Testing**:
1. Vào **OAuth consent screen**
2. Scroll xuống phần **Test users**
3. Click **+ ADD USERS**
4. Thêm email: `giakiethcb1@gmail.com`
5. Click **SAVE**

⚠️ **LƯU Ý**: Nếu không thêm user vào Test users, Google sẽ từ chối đăng nhập!

---

## 🔄 Các bước sửa lỗi

### Cách 1: Kiểm tra lại Client ID và Secret

1. Vào Google Cloud Console
2. OAuth Client > Click vào "TechStore OAuth2"
3. So sánh **Client ID** với file `.env`
4. Nếu không khớp, cập nhật file `.env`

### Cách 2: Tạo lại OAuth Client (nếu cần)

1. Xóa OAuth Client cũ
2. Tạo OAuth Client mới:
   - **Name**: TechStore OAuth2
   - **Authorized JavaScript origins**: `http://localhost:5000`
   - **Authorized redirect URIs**: `http://localhost:5000/api/auth/google/callback`
3. Copy **Client ID** và **Client Secret** (chỉ hiển thị 1 lần!)
4. Cập nhật file `.env`
5. **Restart server**

### Cách 3: Kiểm tra Callback URL

Callback URL trong file `.env` phải **KHỚP CHÍNH XÁC** với Google Console:
- ✅ Đúng: `http://localhost:5000/api/auth/google/callback`
- ❌ Sai: `http://localhost:5000/api/auth/google/callback/` (có dấu `/` cuối)
- ❌ Sai: `http://127.0.0.1:5000/api/auth/google/callback` (dùng IP thay vì localhost)

---

## 🧪 Test sau khi sửa

1. **Restart server**:
   ```bash
   node server.js
   ```

2. **Kiểm tra OAuth status**:
   ```bash
   curl http://localhost:5000/api/auth/status
   ```
   Hoặc mở: http://localhost:5000/api/auth/status

3. **Test đăng nhập**:
   - Mở: http://localhost:5000/login.html
   - Click "Đăng nhập với Google"
   - Chọn tài khoản Google
   - Cho phép ứng dụng truy cập

---

## ⚠️ Lưu ý quan trọng

1. **File .env phải ở root** (cùng cấp với `server.js`)
2. **Sau khi sửa .env, PHẢI restart server**
3. **Client Secret chỉ hiển thị 1 lần** - phải copy ngay
4. **Test users phải được thêm** nếu OAuth Consent Screen ở chế độ Testing
5. **Callback URL phải khớp chính xác** (không có khoảng trắng, không có dấu `/` thừa)

---

## 🆘 Vẫn lỗi?

Nếu vẫn lỗi sau khi làm tất cả các bước trên:

1. **Kiểm tra console log của server** khi click "Đăng nhập với Google"
2. **Kiểm tra Network tab** trong browser DevTools
3. **Xem log chi tiết** trong Google Cloud Console > APIs & Services > Credentials


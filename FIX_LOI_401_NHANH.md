# 🔧 Sửa lỗi 401: invalid_client - Hướng dẫn nhanh

## ⚠️ Vẫn lỗi 401 sau khi thêm test user?

Có thể do:
1. **OAuth Consent Screen chưa được publish** (nguyên nhân phổ biến nhất)
2. Server chưa restart sau khi cập nhật .env
3. Client ID/Secret không đúng
4. Callback URL không khớp

---

## ✅ GIẢI PHÁP NHANH NHẤT: Publish OAuth App

### Bước 1: Vào OAuth Consent Screen

**URL trực tiếp:**
```
https://console.cloud.google.com/apis/credentials/consent?project=molten-kit-480617-s0
```

**Hoặc:**
1. Menu ☰ → APIs & Services → OAuth consent screen

### Bước 2: Publish App

1. Scroll xuống phần **"Publishing status"**
2. Xem trạng thái hiện tại:
   - **"Testing"** → Cần publish
   - **"In production"** → Đã publish rồi
3. Nếu là "Testing", click nút **"PUBLISH APP"**
4. Xác nhận publish
5. **Đợi 5-10 phút** để Google xử lý

### Bước 3: Kiểm tra lại

1. **Restart server**:
   ```bash
   # Dừng server (Ctrl+C)
   node server.js
   ```

2. **Test đăng nhập**:
   - Mở: http://localhost:5000/login.html
   - Click "Đăng nhập với Google"

---

## 🔍 Kiểm tra các nguyên nhân khác

### 1. Server đã restart chưa?

⚠️ **QUAN TRỌNG**: Sau khi sửa `.env`, PHẢI restart server!

```bash
# Dừng server (Ctrl+C)
node server.js
```

### 2. Kiểm tra OAuth Status

Mở trong browser hoặc chạy:
```bash
node kiem-tra-oauth-status.js
```

Hoặc mở: http://localhost:5000/api/auth/status

**Kết quả mong đợi:**
```json
{
  "google": {
    "enabled": true,
    "credentialsConfigured": true,
    "strategyInitialized": true
  }
}
```

### 3. Kiểm tra Callback URL

**Trong Google Console:**
- OAuth Client → Authorized redirect URIs
- Phải có: `http://localhost:5000/api/auth/google/callback`
- **KHÔNG có** dấu `/` cuối
- **KHÔNG có** khoảng trắng

**Trong file .env:**
```env
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### 4. Kiểm tra Client ID và Secret

**Trong Google Console:**
- OAuth Client → Client ID
- So sánh với file `.env`

**Trong file .env:**
```env
GOOGLE_CLIENT_ID=658343730766-f5hik99ljbgrb2n1vjkscrsoav5b21ve.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

---

## 🎯 Checklist sửa lỗi 401

- [ ] File `.env` có đầy đủ GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL
- [ ] Server đã restart sau khi sửa `.env`
- [ ] OAuth Consent Screen đã được **PUBLISH** (không phải Testing)
- [ ] Callback URL trong Google Console khớp với `.env`
- [ ] Client ID trong Google Console khớp với `.env`
- [ ] Đã đợi 5-10 phút sau khi publish OAuth app
- [ ] Đã xóa cache browser và thử lại

---

## 🆘 Vẫn lỗi sau khi làm tất cả?

1. **Kiểm tra console log của server** khi click "Đăng nhập với Google"
2. **Kiểm tra Network tab** trong browser DevTools (F12)
3. **Xem log chi tiết** trong Google Cloud Console:
   - APIs & Services → Credentials → OAuth Client
   - Xem phần "OAuth 2.0 Playground" để test

4. **Thử tạo lại OAuth Client**:
   - Xóa OAuth Client cũ
   - Tạo OAuth Client mới
   - Copy Client ID và Secret mới
   - Cập nhật file `.env`
   - Restart server

---

## 📝 Lưu ý quan trọng

1. **Publish OAuth App** là cách nhanh nhất để fix lỗi 401
2. **Không cần test users** sau khi publish
3. **Đợi 5-10 phút** sau khi publish để Google xử lý
4. **Restart server** sau mọi thay đổi trong `.env`


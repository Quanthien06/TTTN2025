# 🔄 Hướng dẫn Restart Server để load biến môi trường

## ⚠️ Vấn đề

Server đang chạy **KHÔNG load được** biến môi trường từ file `.env`, dù file `.env` đã đúng.

**Dấu hiệu:**
- `/api/auth/status` trả về:
  ```json
  {
    "google": {
      "credentialsConfigured": false,
      "enabled": false
    }
  }
  ```

## ✅ Giải pháp: Restart Server

### Bước 1: Dừng server hiện tại

1. **Tìm terminal đang chạy server**
   - Thường là terminal có dòng: `Server is running on port 5000`
   - Hoặc terminal đang chạy: `node server.js`

2. **Dừng server:**
   - Nhấn `Ctrl + C` trong terminal đó
   - Hoặc đóng terminal

### Bước 2: Khởi động lại server

1. **Mở terminal mới** (hoặc dùng terminal cũ)

2. **Chạy server:**
   ```bash
   node server.js
   ```

3. **Kiểm tra log:**
   - Phải thấy: `Server is running on port 5000`
   - Không có lỗi về biến môi trường

### Bước 3: Kiểm tra lại

1. **Mở browser:**
   ```
   http://localhost:5000/api/auth/status
   ```

2. **Kết quả mong đợi:**
   ```json
   {
     "google": {
       "enabled": true,
       "credentialsConfigured": true,
       "strategyInitialized": true,
       "authUrl": "/api/auth/google",
       "callbackUrl": "http://localhost:5000/api/auth/google/callback"
     }
   }
   ```

3. **Nếu vẫn `false`:**
   - Kiểm tra file `.env` có ở đúng vị trí (cùng cấp với `server.js`)
   - Kiểm tra file `.env` có đúng format không
   - Xem log của server khi khởi động

---

## 📝 Lưu ý quan trọng

1. **Mỗi lần sửa file `.env`** → **PHẢI restart server**
2. **File `.env` phải ở root** (cùng cấp với `server.js`)
3. **Không có khoảng trắng** xung quanh dấu `=`
4. **Không có dấu ngoặc kép** (`"` hoặc `'`) trong file `.env`

---

## 🔍 Kiểm tra file .env đúng format

File `.env` đúng:
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

**KHÔNG đúng:**
```env
GOOGLE_CLIENT_ID = value  ❌ (có khoảng trắng)
GOOGLE_CLIENT_ID="value"  ❌ (có dấu ngoặc)
GOOGLE_CLIENT_ID= value   ❌ (có khoảng trắng)
```

---

## 🆘 Vẫn không được sau khi restart?

1. **Kiểm tra file `.env` có ở đúng vị trí:**
   ```bash
   # Phải thấy file .env
   ls .env
   # Hoặc
   dir .env
   ```

2. **Kiểm tra server có load được .env:**
   ```bash
   node -e "require('dotenv').config(); console.log(process.env.GOOGLE_CLIENT_ID);"
   ```

3. **Xem log khi khởi động server:**
   - Có lỗi gì không?
   - Có thông báo về biến môi trường không?

4. **Thử chạy script kiểm tra:**
   ```bash
   node check-oauth-config.js
   ```


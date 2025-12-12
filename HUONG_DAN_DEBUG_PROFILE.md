# Hướng dẫn Debug Profile Page

## Vấn đề: Lỗi "Lỗi máy chủ nội bộ" khi load profile

### Các bước kiểm tra:

1. **Kiểm tra Server có đang chạy không:**
   ```bash
   # Kiểm tra server đang chạy trên port 5000
   netstat -ano | findstr :5000
   ```

2. **Kiểm tra Database connection:**
   ```bash
   node test_profile_api.js
   ```
   Script này sẽ test kết nối database và query users table.

3. **Kiểm tra Console trong Browser:**
   - Mở Developer Tools (F12)
   - Vào tab Console
   - Xem các log khi load profile
   - Kiểm tra Network tab để xem request/response

4. **Kiểm tra Server Logs:**
   - Xem console của server Node.js
   - Tìm các log từ `GET /api/me`
   - Kiểm tra error messages

### Các lỗi thường gặp:

#### 1. Lỗi "Cannot connect to server"
- **Nguyên nhân:** Server chưa chạy hoặc đã dừng
- **Giải pháp:** Khởi động lại server
  ```bash
  node server.js
  # hoặc
  npm start
  ```

#### 2. Lỗi "Token không hợp lệ" hoặc 401
- **Nguyên nhân:** Token đã hết hạn hoặc không hợp lệ
- **Giải pháp:** Đăng nhập lại

#### 3. Lỗi "User không tồn tại" hoặc 404
- **Nguyên nhân:** User ID trong token không tồn tại trong database
- **Giải pháp:** Kiểm tra database có user với ID đó không

#### 4. Lỗi Database Connection
- **Nguyên nhân:** MySQL chưa chạy hoặc cấu hình sai
- **Giải pháp:** 
  - Kiểm tra MySQL đang chạy
  - Kiểm tra config trong `server.js`:
    ```javascript
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tttn2025'
    ```

### Test API trực tiếp:

Sử dụng curl hoặc Postman để test API:

```bash
# Lấy token từ localStorage sau khi đăng nhập
# Sau đó test API:
curl -X GET http://localhost:5000/api/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### Kiểm tra Database Schema:

Đảm bảo các cột sau tồn tại trong bảng `users`:
- `id`
- `username`
- `email`
- `email_verified`
- `full_name`
- `phone`
- `address`
- `date_of_birth`
- `created_at` hoặc `createdAt`

Nếu thiếu, chạy:
```bash
node database/add_profile_fields.js
```

### Restart Server:

Sau khi sửa code, **LUÔN restart server**:
```bash
# Dừng server (Ctrl+C)
# Khởi động lại
node server.js
```

### Debug trong Browser:

1. Mở `profile.html`
2. Mở Developer Tools (F12)
3. Vào tab Console
4. Xem các log:
   - `Loading profile...`
   - `Token: ...`
   - `API URL: ...`
   - `Response status: ...`
   - `Response data: ...`

5. Vào tab Network:
   - Tìm request đến `/api/me`
   - Xem Status code
   - Xem Response body
   - Xem Headers (đặc biệt là Authorization header)

### Nếu vẫn lỗi:

1. Kiểm tra server logs để xem error chi tiết
2. Kiểm tra database có đang chạy không
3. Kiểm tra token có hợp lệ không (decode JWT)
4. Thử test API trực tiếp với Postman/curl


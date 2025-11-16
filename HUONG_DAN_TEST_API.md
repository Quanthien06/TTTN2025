# HƯỚNG DẪN TEST API - CÁC BƯỚC THEO THỨ TỰ

## 📋 BƯỚC 1: KHỞI ĐỘNG SERVER

### 1.1. Mở Terminal/Command Prompt
- Mở terminal trong thư mục dự án: `d:\DoAn TTTN\TTTN2025`

### 1.2. Chạy server
```bash
node server.js
```

### 1.3. Kiểm tra server đã chạy
- Bạn sẽ thấy thông báo:
```
Server đang chạy tại http://localhost:5000
--- PUBLIC API ---
GET Danh sách sản phẩm: http://localhost:5000/api/products
POST Đăng ký: http://localhost:5000/api/register
POST Đăng nhập: http://localhost:5000/api/login

--- PRIVATE API (Cần Token) ---
Sử dụng Header "Authorization: Bearer [TOKEN]"
```

---

## 📋 BƯỚC 2: ĐĂNG KÝ TÀI KHOẢN (Nếu chưa có)

### 2.1. Mở Postman
- Tạo request mới

### 2.2. Cấu hình request
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/register`

### 2.3. Headers
```
Content-Type: application/json
```

### 2.4. Body (raw JSON)
```json
{
    "username": "testuser",
    "password": "password123",
    "role": "admin"
}
```

### 2.5. Gửi request
- Click **Send**
- Response thành công: `201 Created`
- Message: "Đăng ký thành công! Vui lòng đăng nhập."

---

## 📋 BƯỚC 3: ĐĂNG NHẬP ĐỂ LẤY TOKEN

### 3.1. Tạo request mới trong Postman
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/login`

### 3.2. Headers
```
Content-Type: application/json
```

### 3.3. Body (raw JSON)
```json
{
    "username": "testuser",
    "password": "password123"
}
```

### 3.4. Gửi request
- Click **Send**
- Response thành công: `200 OK`

### 3.5. Copy TOKEN từ response
Response sẽ trả về:
```json
{
    "message": "Đăng nhập thành công",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJnaWFraWV0aXQiLCJyb2xlljoiYWRtaW4iLCJpYXQiOjE3NjMzMDk5NjQslmV4cCI6MTc3MTk0OTk2NH0.igZ2aSdPid5xmK704Y7CHs2hEQP6DeOvMp6jpGt0iF0",
    "user": {
        "id": 3,
        "username": "testuser",
        "role": "admin"
    }
}
```

**QUAN TRỌNG:** Copy toàn bộ token (chuỗi dài sau "token":)
- ✅ Đúng: Copy từ `eyJ...` đến hết
- ❌ Sai: Không copy dấu ngoặc kép `"` (nếu có, middleware sẽ tự xử lý)

---

## 📋 BƯỚC 4: TEST API PUBLIC (KHÔNG CẦN TOKEN)

### 4.1. GET Danh sách sản phẩm
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/products`
- **Headers:** Không cần
- Response: Danh sách tất cả sản phẩm

### 4.2. GET Sản phẩm theo ID
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/products/1`
- **Headers:** Không cần
- Response: Thông tin sản phẩm có ID = 1

---

## 📋 BƯỚC 5: TEST API PRIVATE (CẦN TOKEN)

### 5.1. POST - Thêm sản phẩm mới

#### Cấu hình request:
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/products`

#### Headers:
```
Content-Type: application/json
Authorization: Bearer [DÁN_TOKEN_Ở_ĐÂY]
```

**Lưu ý:**
- Thay `[DÁN_TOKEN_Ở_ĐÂY]` bằng token bạn đã copy ở Bước 3.5
- Phải có khoảng trắng giữa `Bearer` và token
- Ví dụ: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### Body (raw JSON):
```json
{
    "name": "iPhone 15 Pro",
    "category": "Điện thoại",
    "price": 25000000,
    "description": "Điện thoại thông minh cao cấp"
}
```

#### Gửi request:
- Click **Send**
- Response thành công: `201 Created`
- Response sẽ trả về sản phẩm vừa tạo

---

### 5.2. PUT - Cập nhật sản phẩm

#### Cấu hình request:
- **Method:** `PUT`
- **URL:** `http://localhost:5000/api/products/1` (thay 1 bằng ID sản phẩm muốn cập nhật)

#### Headers:
```
Content-Type: application/json
Authorization: Bearer [TOKEN]
```

#### Body (raw JSON):
```json
{
    "name": "iPhone 15 Pro Max",
    "category": "Điện thoại",
    "price": 30000000,
    "description": "Điện thoại thông minh cao cấp - Phiên bản nâng cấp"
}
```

#### Gửi request:
- Click **Send**
- Response thành công: `200 OK`

---

### 5.3. DELETE - Xóa sản phẩm

#### Cấu hình request:
- **Method:** `DELETE`
- **URL:** `http://localhost:5000/api/products/1` (thay 1 bằng ID sản phẩm muốn xóa)

#### Headers:
```
Authorization: Bearer [TOKEN]
```

#### Body: Không cần

#### Gửi request:
- Click **Send**
- Response thành công: `204 No Content` hoặc `200 OK`

---

## 🔍 KIỂM TRA LOG TRONG CONSOLE

Khi test API, bạn sẽ thấy log trong console của server:

### Khi đăng nhập:
```
Đang tạo token với JWT_SECRET length: 50
Token đã được tạo thành công cho user: testuser
Token length: 200+
```

### Khi gửi request với token:
```
Authorization Header: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Token sau khi xử lý (first 30 chars): eyJhbGciOiJIUzI1NiIsInR5cCI6...
Token length: 200+
JWT_SECRET length: 50
Token decoded successfully (without verification)
Token verified successfully for user: testuser
```

---

## ⚠️ XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi 401: Không có token
- **Nguyên nhân:** Thiếu header Authorization
- **Giải pháp:** Thêm header `Authorization: Bearer [TOKEN]`

### Lỗi 403: Token không hợp lệ
- **Nguyên nhân:** 
  - Token cũ hoặc đã hết hạn
  - Token bị copy không đầy đủ
  - Token được tạo với JWT_SECRET khác
- **Giải pháp:** 
  - Đăng nhập lại để lấy token mới
  - Copy toàn bộ token (không bỏ sót ký tự)

### Lỗi 403: Không có quyền
- **Nguyên nhân:** User không phải admin
- **Giải pháp:** Đăng nhập với tài khoản có role = "admin"

---

## 📝 TÓM TẮT THỨ TỰ CÁC BƯỚC

1. ✅ **Khởi động server** (`node server.js`)
2. ✅ **Đăng ký tài khoản** (POST `/api/register`) - Nếu chưa có
3. ✅ **Đăng nhập lấy token** (POST `/api/login`)
4. ✅ **Copy token** từ response
5. ✅ **Test API Public** (GET `/api/products`) - Không cần token
6. ✅ **Test API Private** (POST/PUT/DELETE `/api/products`) - Cần token trong header

---

## 💡 MẸO SỬ DỤNG POSTMAN

1. **Lưu token vào biến:** 
   - Tạo Environment trong Postman
   - Lưu token vào biến `{{token}}`
   - Sử dụng: `Bearer {{token}}` trong header

2. **Tạo Collection:**
   - Tạo collection "TTTN2025 API"
   - Thêm các request vào collection
   - Dễ quản lý và test lại

3. **Sử dụng Pre-request Script:**
   - Tự động lấy token khi đăng nhập
   - Lưu vào biến tự động

---

**Chúc bạn test API thành công! 🎉**


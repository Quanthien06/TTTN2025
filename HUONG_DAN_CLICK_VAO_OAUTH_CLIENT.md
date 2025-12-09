# 🔍 HƯỚNG DẪN: Click vào OAuth Client để xem Client Secret

## ⚠️ Vấn đề
Trong **bảng danh sách** OAuth 2.0 Client IDs, bạn **CHỈ THẤY Client ID**, không thấy Client Secret.

## ✅ Giải pháp: Click vào OAuth Client

### Bước 1: Click vào tên OAuth Client
- Trong bảng **OAuth 2.0 Client IDs**
- Click vào tên **"TechStore OAuth2"** (màu xanh, có thể click được)
- Hoặc click vào biểu tượng **✏️ Edit** (bút chì) ở cuối dòng

### Bước 2: Xem trang chi tiết
Sau khi click, bạn sẽ thấy trang **chi tiết** của OAuth Client với các thông tin:
- **Name**: TechStore OAuth2
- **Client ID**: 658343730766-f5hi...
- **Client Secret**: ⬅️ **Tìm ở đây!**

### Bước 3: Kiểm tra Client Secret

**Nếu THẤY Client Secret:**
- ✅ Copy ngay và dán vào file `.env`
- Client Secret thường bắt đầu bằng `GOCSPX-`
- Có thể có nút **👁️ Show** để hiển thị Secret

**Nếu KHÔNG THẤY Client Secret:**
- ⚠️ **Google chỉ hiển thị Secret 1 lần** khi tạo client
- Nếu đã đóng cửa sổ, **KHÔNG THỂ xem lại**
- **Giải pháp**: Phải **TẠO LẠI** OAuth Client mới

---

## 🔄 Nếu không thấy Secret: Tạo lại OAuth Client

### Cách 1: Xóa và tạo lại (Khuyến nghị)

1. **Trong trang chi tiết OAuth Client**:
   - Click nút **DELETE** (hoặc biểu tượng thùng rác 🗑️)
   - Xác nhận xóa

2. **Tạo client mới**:
   - Quay lại trang **Credentials**
   - Click **+ CREATE CREDENTIALS** > **OAuth client ID**
   - **Application type**: **Web application**
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

3. **Copy CẢ HAI** (quan trọng!):
   - **Client ID**: Copy ngay
   - **Client Secret**: Copy ngay (chỉ hiển thị 1 lần!)
   - **Lưu vào Notepad** trước khi đóng cửa sổ

4. **Cập nhật file `.env`**:
   ```env
   GOOGLE_CLIENT_ID=658343730766-f5hik99ljbgrb2n1vjkscrsoav5b21ve.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-paste-secret-here
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```

### Cách 2: Tạo client mới (không xóa cái cũ)
- Có thể tạo nhiều OAuth clients trong 1 project
- Làm tương tự như trên, nhưng **KHÔNG xóa** client cũ

---

## 📝 Lưu ý về vị trí file .env

**File `.env` phải ở thư mục gốc** (cùng cấp với `server.js`):
```
TTTN2025/
  ├── server.js
  ├── .env          ← Phải ở đây
  ├── config/
  │   └── .env      ← KHÔNG phải ở đây
  └── ...
```

Nếu file `.env` đang ở `config/.env`, cần:
1. Di chuyển về root
2. Hoặc cập nhật `server.js` để load từ `config/.env`

---

## ✅ Sau khi có Secret

1. **Cập nhật file `.env`** (ở root, không phải `config/.env`)
2. **Kiểm tra**:
   ```bash
   node check-oauth-config.js
   ```
3. **Restart server**:
   ```bash
   node server.js
   ```


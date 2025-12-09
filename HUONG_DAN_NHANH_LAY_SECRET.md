# ⚡ HƯỚNG DẪN NHANH: Lấy Client Secret

## ❌ Vấn đề
File `.env` chỉ có Client ID, **KHÔNG có Client Secret**

## ✅ Giải pháp: Lấy từ Google Cloud Console

### Bước 1: Vào Google Cloud Console
1. Truy cập: **https://console.cloud.google.com/apis/credentials**
2. Đăng nhập bằng tài khoản Google của bạn
3. Chọn project của bạn

### Bước 2: Tìm OAuth Client của bạn
- Trong danh sách **OAuth 2.0 Client IDs**, tìm client bạn đã tạo
- Click vào tên client đó để xem chi tiết

### Bước 3: Kiểm tra Client Secret

**Nếu thấy Client Secret:**
- Copy ngay và dán vào file `.env`:
  ```env
  GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx-xxxxx  ← Dán Secret vào đây
  GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
  ```

**Nếu KHÔNG thấy Client Secret:**
- ⚠️ **Google chỉ hiển thị Secret 1 lần** khi tạo client
- Nếu đã đóng cửa sổ, **KHÔNG THỂ xem lại**
- **Giải pháp**: Tạo lại OAuth Client mới

---

## 🔄 Tạo lại OAuth Client để lấy Secret

### Cách 1: Xóa và tạo lại (Khuyến nghị)

1. **Xóa client cũ**:
   - Vào **Credentials** > Click vào OAuth client của bạn
   - Click nút **DELETE** (hoặc biểu tượng thùng rác 🗑️)
   - Xác nhận xóa

2. **Tạo client mới**:
   - Click **+ CREATE CREDENTIALS** > **OAuth client ID**
   - **Application type**: Chọn **Web application**
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
   GOOGLE_CLIENT_ID=paste-client-id-here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=paste-client-secret-here
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```

### Cách 2: Tạo client mới (không xóa cái cũ)

- Có thể tạo nhiều OAuth clients trong 1 project
- Làm tương tự như trên, nhưng **KHÔNG xóa** client cũ

---

## 📝 Nhận biết Client Secret

**Client Secret có đặc điểm:**
- Bắt đầu bằng `GOCSPX-`
- Dài khoảng 40-50 ký tự
- Ví dụ: `GOCSPX-abcdefghijklmnopqrstuvwxyz123456`

**KHÔNG phải Secret nếu:**
- Chỉ có Client ID (dạng: `xxxxx.apps.googleusercontent.com`)
- Là dòng "Client ID" chứ không phải "Client Secret"

---

## ✅ Sau khi có Secret

1. **Cập nhật file `.env`** với Secret
2. **Kiểm tra**:
   ```bash
   node check-oauth-config.js
   ```
3. **Restart server**:
   ```bash
   node server.js
   ```

---

## 🆘 Vẫn không thấy Secret?

Nếu trong Google Cloud Console không thấy Secret:
- **Chắc chắn**: Secret chỉ hiển thị 1 lần khi tạo
- **Giải pháp duy nhất**: Tạo lại OAuth Client mới
- **Lưu ý**: Copy Secret ngay khi tạo, đừng đóng cửa sổ!


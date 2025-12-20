# 🔑 HƯỚNG DẪN: Tạo Client Secret mới

## ⚠️ Vấn đề
Google **KHÔNG cho phép xem lại** Client Secret cũ. Trong trang "Client secrets", bạn chỉ thấy:
- Secret bị ẩn: `****EGcN` (chỉ thấy vài ký tự cuối)
- Cảnh báo: "Viewing and downloading client secrets is no longer available"

## ✅ Giải pháp: Tạo Secret mới

### Bước 1: Click nút "+ Add secret"
- Trong trang **"Client secrets"**
- Click nút màu xanh **"+ Add secret"** ở dưới bảng

### Bước 2: Xác nhận tạo Secret mới
- Google sẽ hiển thị popup xác nhận
- Click **"Add"** hoặc **"Create"**

### Bước 3: Copy Secret ngay lập tức ⚠️ QUAN TRỌNG!
- Sau khi tạo, Google sẽ hiển thị **Client Secret mới**
- **CHỈ HIỂN THỊ 1 LẦN DUY NHẤT!**
- **Copy ngay** và lưu vào Notepad trước khi đóng cửa sổ
- Secret thường bắt đầu bằng `GOCSPX-`

### Bước 4: Cập nhật file .env
- Mở file `.env` (đã ở root)
- Thay dòng:
  ```env
  GOOGLE_CLIENT_SECRET=your-client-secret
  ```
- Bằng:
  ```env
  GOOGLE_CLIENT_SECRET=GOCSPX-paste-secret-moi-vao-day
  ```

### Bước 5: Lưu và kiểm tra
1. **Lưu file .env**
2. Chạy lệnh kiểm tra:
   ```bash
   node check-oauth-config.js
   ```
3. Nếu thấy ✅ thì đã đúng!

---

## 📝 Lưu ý quan trọng

- ⚠️ **Secret chỉ hiển thị 1 lần** - phải copy ngay
- ⚠️ **Đừng đóng cửa sổ** cho đến khi đã copy và lưu Secret
- ✅ Có thể có **nhiều secrets** cho cùng 1 OAuth client (không sao)
- ✅ Secret cũ vẫn hoạt động cho đến khi bạn xóa nó

---

## 🔄 Nếu đã đóng cửa sổ và mất Secret

Nếu bạn đã đóng cửa sổ mà chưa copy Secret:
- **KHÔNG THỂ xem lại** Secret mới
- **Giải pháp**: Tạo lại Secret mới (làm lại từ Bước 1)

---

## ✅ Sau khi có Secret mới

1. **Cập nhật file `.env`**:
   ```env
   GOOGLE_CLIENT_ID=658343730766-f5hik99ljbgrb2n1vjkscrsoav5b21ve.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-secret-moi-cua-ban
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```

2. **Kiểm tra**:
   ```bash
   node check-oauth-config.js
   ```

3. **Restart server**:
   ```bash
   node server.js
   ```


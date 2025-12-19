# Hướng dẫn lấy Google OAuth Client Secret

## Vấn đề: Chỉ thấy Client ID, không thấy Client Secret

**Lý do**: Google chỉ hiển thị Client Secret **một lần duy nhất** khi tạo OAuth client. Nếu đã đóng cửa sổ, bạn không thể xem lại được.

## Giải pháp: Tạo lại OAuth Client

### Cách 1: Xóa và tạo lại OAuth Client (Khuyến nghị)

1. **Truy cập Google Cloud Console**:
   - Đi đến: https://console.cloud.google.com/
   - Chọn project của bạn

2. **Vào Credentials**:
   - Vào **APIs & Services** > **Credentials**
   - Tìm OAuth client bạn đã tạo (có Client ID bạn đã copy)

3. **Xóa OAuth Client cũ**:
   - Click vào OAuth client đó
   - Click nút **DELETE** (hoặc biểu tượng thùng rác)
   - Xác nhận xóa

4. **Tạo OAuth Client mới**:
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

5. **Copy CẢ HAI** (quan trọng!):
   - **Client ID**: Copy ngay
   - **Client Secret**: Copy ngay (chỉ hiển thị 1 lần!)
   - **Lưu vào file tạm** hoặc Notepad trước khi đóng cửa sổ

6. **Cập nhật file .env**:
   ```env
   GOOGLE_CLIENT_ID=paste-client-id-here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=paste-client-secret-here
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```

### Cách 2: Tạo OAuth Client mới (không xóa cái cũ)

Nếu không muốn xóa, có thể tạo OAuth client mới:

1. Vào **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Điền thông tin như trên
4. **Copy CẢ HAI** Client ID và Client Secret
5. Cập nhật file `.env`

**Lưu ý**: Có thể có nhiều OAuth clients trong cùng 1 project, không sao cả.

---

## Cách nhận biết Client Secret

Client Secret thường có các đặc điểm:
- Bắt đầu bằng `GOCSPX-` (Google OAuth Client Secret Prefix)
- Dài khoảng 40-50 ký tự
- Ví dụ: `GOCSPX-abcdefghijklmnopqrstuvwxyz123456`

**KHÔNG phải Client Secret** nếu:
- Chỉ có Client ID (dạng: `xxxxx.apps.googleusercontent.com`)
- Là "Client ID" chứ không phải "Client Secret"

---

## Sau khi có Client Secret

1. **Tạo file `.env`** trong thư mục gốc (cùng cấp với `server.js`):
   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```

2. **Kiểm tra file .env**:
   ```bash
   node check-oauth-config.js
   ```
   
   Nếu thấy ✅ thì đã đúng!

3. **Restart server**:
   ```bash
   node server.js
   ```

---

## Lưu ý quan trọng

- ⚠️ **Client Secret chỉ hiển thị 1 lần** - phải copy ngay khi tạo
- ⚠️ **Không thể xem lại** Client Secret sau khi đóng cửa sổ
- ✅ Có thể tạo nhiều OAuth clients trong 1 project
- ✅ Nếu mất Secret, chỉ cần tạo lại OAuth client mới



# 👥 Hướng dẫn thêm Test User cho OAuth

## 📍 Vị trí Test Users

Test Users được quản lý trong **OAuth Consent Screen**, không phải trong OAuth Overview.

---

## 🗺️ Cách tìm Test Users

### Cách 1: Từ OAuth Overview (trang bạn đang xem)

1. **Trong menu bên trái**, tìm và click vào:
   - **"Audience"** (hoặc "OAuth consent screen")
   - Hoặc **"Branding"** → sau đó tìm "OAuth consent screen"

2. **Hoặc dùng URL trực tiếp**:
   ```
   https://console.cloud.google.com/apis/credentials/consent?project=molten-kit-480617-s0
   ```

### Cách 2: Từ menu chính Google Cloud

1. Click vào menu **☰** (3 gạch ngang) ở góc trên bên trái
2. Chọn **"APIs & Services"**
3. Chọn **"OAuth consent screen"**
4. Scroll xuống phần **"Test users"**

---

## ✅ Các bước thêm Test User

1. **Vào OAuth Consent Screen** (theo một trong các cách trên)

2. **Scroll xuống** tìm phần **"Test users"**

3. **Click nút "+ ADD USERS"** (hoặc "Add users")

4. **Nhập email** của bạn:
   ```
   giakiethcb1@gmail.com
   ```

5. **Click "ADD"** hoặc "SAVE"

6. **Xác nhận**: Email sẽ xuất hiện trong danh sách Test users

---

## ⚠️ Lưu ý quan trọng

### Khi nào cần Test Users?

- **OAuth Consent Screen ở chế độ "Testing"** → **BẮT BUỘC** phải thêm Test Users
- **OAuth Consent Screen ở chế độ "In production"** → Không cần Test Users (mọi user đều có thể đăng nhập)

### Kiểm tra chế độ OAuth Consent Screen

1. Vào OAuth Consent Screen
2. Xem phần **"Publishing status"** ở đầu trang:
   - **"Testing"** → Cần thêm Test Users
   - **"In production"** → Không cần Test Users

### Nếu không thấy phần "Test users"

- Có thể OAuth Consent Screen đang ở chế độ **"In production"**
- Hoặc chưa cấu hình OAuth Consent Screen (cần điền App name, email, v.v.)

---

## 🔍 Cách kiểm tra đã thêm Test User chưa

1. Vào OAuth Consent Screen
2. Scroll xuống phần **"Test users"**
3. Kiểm tra xem có email `giakiethcb1@gmail.com` trong danh sách không

---

## 📝 URL trực tiếp

Thay `molten-kit-480617-s0` bằng Project ID của bạn:

```
https://console.cloud.google.com/apis/credentials/consent?project=YOUR_PROJECT_ID
```

Hoặc:

```
https://console.cloud.google.com/apis/credentials/consent
```

---

## 🆘 Vẫn không thấy Test Users?

1. **Kiểm tra OAuth Consent Screen đã được cấu hình chưa**:
   - App name đã điền chưa?
   - User support email đã điền chưa?
   - Developer contact information đã điền chưa?

2. **Kiểm tra Publishing status**:
   - Nếu là "In production", không cần Test Users
   - Nếu là "Testing", phải có Test Users

3. **Thử cách khác**:
   - Vào menu ☰ → APIs & Services → OAuth consent screen
   - Hoặc tìm "OAuth consent screen" trong thanh tìm kiếm


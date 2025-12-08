# Hướng dẫn Push Code lên GitHub với Token

## Bước 1: Tạo Personal Access Token (PAT)

1. Vào GitHub: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Đặt tên token: `TTTN2025-Push-Token`
4. Chọn quyền: ✅ **repo** (full control of private repositories)
5. Click **"Generate token"**
6. **COPY TOKEN NGAY** (chỉ hiển thị 1 lần, dạng: `ghp_xxxxxxxxxxxxxxxxxxxx`)

## Bước 2: Cập nhật Remote URL với Token

### Cách A: Nhúng token vào URL (Dễ nhất)

```powershell
# Thay YOUR_TOKEN bằng token vừa tạo
git remote set-url origin https://YOUR_TOKEN@github.com/Quanthien06/TTTN2025.git
```

**Ví dụ:**
```powershell
git remote set-url origin https://ghp_abc123xyz@github.com/Quanthien06/TTTN2025.git
```

### Cách B: Dùng Git Credential Manager (An toàn hơn)

```powershell
# Xóa credentials cũ (nếu có)
git credential-manager-core erase https://github.com

# Push và nhập token khi được hỏi
git push origin main
# Username: Quanthien06
# Password: [paste token của bạn]
```

## Bước 3: Push code

```powershell
git push origin main
```

## Kiểm tra Remote URL

```powershell
git remote -v
```

## Lưu ý

⚠️ **Cảnh báo bảo mật:**
- Token trong URL có thể bị lộ trong git history
- Nên dùng Git Credential Manager hoặc SSH key thay vì nhúng token vào URL
- Token có quyền full access, giữ bí mật!

## Nếu vẫn lỗi

1. Kiểm tra repository có tồn tại: https://github.com/Quanthien06/TTTN2025
2. Kiểm tra token còn hiệu lực: https://github.com/settings/tokens
3. Thử tạo repository mới nếu repository bị xóa



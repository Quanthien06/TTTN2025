# 📸 Hướng dẫn quản lý ảnh sản phẩm

## Cấu trúc folder

```
public/
  img/
    products/
      iphone-15-pro-max-256gb/
        1.jpg  (Ảnh chính - main image)
        2.jpg  (Ảnh phụ 1)
        3.jpg  (Ảnh phụ 2)
        4.jpg  (Ảnh phụ 3)
      laptop-dell-xps-15/
        1.jpg
        2.jpg
        3.jpg
        4.jpg
      ...
```

## Quy tắc đặt tên

1. **Tên folder**: Tự động tạo từ tên sản phẩm (slug)
   - Ví dụ: "iPhone 15 Pro Max 256GB" → `iphone-15-pro-max-256gb`
   - Tự động xóa dấu, chuyển thành chữ thường, thay space bằng dấu gạch ngang

2. **Tên file ảnh**: 
   - `1.jpg` - Ảnh chính (main image)
   - `2.jpg`, `3.jpg`, `4.jpg` - Ảnh phụ

3. **Kích thước ảnh**: Tất cả ảnh sẽ được resize về **800x800px** (tự động)

## Cách sử dụng

### Bước 1: Cài đặt dependencies

```bash
npm install sharp
```

### Bước 2: Chuẩn bị ảnh

1. Tạo folder tạm chứa ảnh gốc (ví dụ: `temp-images/iphone-15/`)
2. Đặt ảnh vào folder đó (tên file không quan trọng, script sẽ tự đánh số)

### Bước 3: Chạy script resize và tạo folder

**Xử lý một sản phẩm:**
```bash
node scripts/setup-product-images.js "iPhone 15 Pro Max 256GB" "./temp-images/iphone-15"
```

**Xử lý nhiều sản phẩm:**
Chỉnh sửa array `products` trong file `scripts/setup-product-images.js` rồi chạy:
```bash
node scripts/setup-product-images.js
```

### Bước 4: Cập nhật database (tùy chọn)

Nếu muốn cập nhật đường dẫn ảnh trong database tự động:
```bash
node scripts/update-product-image-paths.js
```

Script này sẽ:
- Tự động tìm ảnh trong folder `public/img/products/[slug]/`
- Cập nhật `main_image_url` và `images` trong database

## Cách hoạt động

1. **Frontend tự động load ảnh:**
   - Ưu tiên load từ folder structure: `/img/products/[slug]/1.jpg`
   - Nếu không tìm thấy, fallback về ảnh trong database
   - Tự động xử lý lỗi 404

2. **Resize ảnh:**
   - Tất cả ảnh được resize về 800x800px
   - Giữ tỷ lệ, crop từ center
   - Format: JPEG, quality 90%

## Ví dụ

```bash
# Xử lý ảnh cho iPhone
node scripts/setup-product-images.js "iPhone 15 Pro Max 256GB" "./temp-images/iphone"

# Kết quả:
# ✓ Đã tạo folder: iphone-15-pro-max-256gb
#   ✓ Đã resize: 1.jpg
#   ✓ Đã resize: 2.jpg
#   ✓ Đã resize: 3.jpg
#   ✓ Đã resize: 4.jpg
# ✅ Hoàn thành: 4/4 ảnh đã được xử lý
```

## Lưu ý

- Tên folder sẽ tự động tạo từ tên sản phẩm (slug)
- Nếu sản phẩm đã có slug trong database, sẽ dùng slug đó
- Ảnh sẽ được resize và tối ưu tự động
- Frontend sẽ tự động fallback nếu không tìm thấy ảnh trong folder


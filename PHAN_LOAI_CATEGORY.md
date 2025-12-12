# Cách Phân Loại Category

## Cấu trúc phân loại

Hệ thống phân loại sản phẩm theo **2 cấp độ**:

### 1. Category chính (Main Categories) - 6 mục
Các category này được hiển thị trong navigation và trang danh mục:

1. **Điện thoại, Tablet** 📱
   - Route: `phone-tablet`
   - Bao gồm: "Điện thoại, Tablet", "Điện thoại", "Tablet", "Phụ kiện điện thoại"

2. **Laptop** 💻
   - Route: `laptop`
   - Bao gồm: "Laptop", "Laptop Apple", "Laptop Asus", "Laptop Dell", "Laptop Gaming", "Laptop HP", "Laptop Lenovo", "Laptop Văn phòng"

3. **Âm thanh, Mic thu âm** 🎵
   - Route: `audio`
   - Bao gồm: "Âm thanh, Mic thu âm"

4. **Đồng hồ, Camera** 📷
   - Route: `watch-camera`
   - Bao gồm: "Đồng hồ, Camera"

5. **Phụ kiện** 🔌
   - Route: `accessories`
   - Bao gồm: "Phụ kiện"

6. **PC, Màn hình, Máy in** 🖥️
   - Route: `pc-monitor-printer`
   - Bao gồm: "PC, Màn hình, Máy in", "PC", "Màn hình", "Máy in", "Máy tính để bàn", "Linh kiện PC"

### 2. Sub-category (Trong database)
Các sub-category được lưu trong bảng `products.category` nhưng **KHÔNG** được hiển thị riêng trong danh mục. Chúng được gộp vào category chính tương ứng.

## Cách hoạt động

1. **Trang danh mục** chỉ hiển thị **6 category chính**
2. **Số lượng sản phẩm** được tính bằng cách đếm tất cả sản phẩm có `category` thuộc category chính hoặc sub-category của nó
3. **Khi click vào category**, hệ thống sẽ filter sản phẩm theo category chính và tất cả sub-category liên quan

## Ví dụ

- Category "Laptop" sẽ hiển thị **17 sản phẩm** (tổng của tất cả sản phẩm có category là "Laptop", "Laptop Apple", "Laptop Asus", v.v.)
- Khi click vào "Laptop", trang sản phẩm sẽ hiển thị tất cả sản phẩm laptop (bao gồm cả Apple, Asus, Dell, v.v.)

## Lưu ý

- Các sub-category như "Laptop Apple", "Laptop Asus" **KHÔNG** được hiển thị riêng trong danh mục
- Chúng chỉ được dùng để filter và phân loại sản phẩm bên trong category chính


# Hướng dẫn Import dữ liệu Laptop từ CSV

## Bước 1: Cập nhật Schema

Chạy file SQL để tạo/cập nhật bảng products:

```bash
mysql -u root -p tttn2025 < database/02_products_schema.sql
```

Hoặc import qua phpMyAdmin/MySQL Workbench.

## Bước 2: Cài đặt dependencies

```bash
npm install mysql2
```

## Bước 3: Cấu hình database

Sửa file `database/import_laptop_data.js`:

```javascript
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'YOUR_PASSWORD', // Điền password MySQL của bạn
    database: 'tttn2025',
    multipleStatements: true
};
```

## Bước 4: Chạy script import

```bash
node database/import_laptop_data.js
```

## Cấu trúc dữ liệu

### Bảng products mới bao gồm:

**Thông tin cơ bản:**
- `name`: Tên sản phẩm (model_name)
- `brand`: Thương hiệu (Lenovo, HP, Dell, Asus, Apple, etc.)
- `category`: Danh mục (tự động phân loại)

**Thông tin kỹ thuật:**
- `processor_name`: CPU
- `ram_gb`: RAM (GB)
- `ssd_gb`: SSD (GB)
- `hard_disk_gb`: HDD (GB)
- `operating_system`: Hệ điều hành
- `graphics`: Card đồ họa
- `screen_size_inches`: Kích thước màn hình
- `resolution`: Độ phân giải
- `no_of_cores`: Số nhân CPU
- `no_of_threads`: Số luồng CPU
- `spec_score`: Điểm đánh giá

**Thông tin bán hàng:**
- `price`: Giá bán
- `original_price`: Giá gốc (tự động tính với giảm giá 5-15%)
- `stock`: Số lượng tồn kho (random 5-25)
- `description`: Mô tả tự động từ thông tin kỹ thuật
- `image_url`: URL hình ảnh placeholder

## Categories được tạo tự động:

- Laptop (danh mục chính)
- Laptop Lenovo
- Laptop HP
- Laptop Dell
- Laptop Asus
- Laptop Apple
- Laptop Gaming (tự động phân loại nếu có từ "gaming", "tuf", "victus")
- Laptop Văn phòng

## Lưu ý:

1. Script sẽ xóa tất cả sản phẩm laptop cũ trước khi import
2. Giá gốc (original_price) được tự động tính với giảm giá 5-15%
3. Stock được random từ 5-25 sản phẩm
4. Image URL là placeholder, bạn có thể cập nhật sau


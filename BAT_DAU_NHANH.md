# 🚀 HƯỚNG DẪN BẮT ĐẦU NHANH - DOCKER CHO NGƯỜI MỚI

## Bước 1: Kiểm tra Docker đã cài đặt ✅

```bash
docker --version
docker-compose --version
```

Nếu thấy version hiển thị → Docker đã sẵn sàng!

## Bước 2: Khởi động tất cả services 🐳

**Lệnh duy nhất bạn cần nhớ:**

```bash
docker-compose up -d
```

**Lệnh này sẽ:**
- Tự động build tất cả services (lần đầu sẽ mất vài phút)
- Tạo database MySQL
- Khởi động tất cả microservices
- Chạy ở chế độ nền (background)

**Chờ 1-2 phút** để tất cả services khởi động xong.

## Bước 3: Kiểm tra services đã chạy chưa ✅

```bash
docker-compose ps
```

Bạn sẽ thấy 6 containers:
- ✅ tttn2025-mysql (database)
- ✅ tttn2025-auth (service xác thực)
- ✅ tttn2025-product (service sản phẩm)
- ✅ tttn2025-cart (service giỏ hàng)
- ✅ tttn2025-order (service đơn hàng)
- ✅ tttn2025-gateway (API gateway)

Tất cả phải có status là **"Up"** hoặc **"Up (healthy)"**

## Bước 4: Xem logs (nếu cần) 📋

```bash
# Xem logs tất cả services
docker-compose logs -f

# Nhấn Ctrl+C để thoát
```

## Bước 5: Truy cập ứng dụng 🌐

Mở trình duyệt và vào:
- **Frontend/Gateway:** http://localhost:5000
- **API:** http://localhost:5000/api/*

## Các lệnh quan trọng khác 🔧

### Dừng tất cả services
```bash
docker-compose stop
```

### Dừng và xóa containers (giữ lại dữ liệu)
```bash
docker-compose down
```

### Dừng và xóa TẤT CẢ (kể cả database - CẨN THẬN!)
```bash
docker-compose down -v
```

### Khởi động lại sau khi sửa code
```bash
docker-compose up -d --build
```

### Xem logs một service cụ thể
```bash
docker-compose logs -f gateway
docker-compose logs -f mysql
```

## Troubleshooting 🔍

### Nếu services không chạy:
1. Xem logs: `docker-compose logs [tên-service]`
2. Rebuild: `docker-compose up -d --build`
3. Restart: `docker-compose restart [tên-service]`

### Nếu port bị chiếm:
- Đóng các ứng dụng đang dùng port 5000, 5001, 5002, 5003, 5004, 3306
- Hoặc đổi port trong file `docker-compose.yml`

### Nếu lỗi kết nối database:
- Đợi MySQL khởi động xong (30-60 giây)
- Kiểm tra: `docker-compose ps mysql` (phải là "healthy")

## Tóm tắt - 3 lệnh cần nhớ 💡

```bash
# 1. Khởi động
docker-compose up -d

# 2. Xem trạng thái
docker-compose ps

# 3. Dừng
docker-compose down
```

---

**Xem hướng dẫn chi tiết tại:** `HUONG_DAN_DOCKER.md`


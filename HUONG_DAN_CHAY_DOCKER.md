# 🐳 Hướng Dẫn Chạy Dự Án Bằng Docker

## 📋 Yêu Cầu

- **Docker Desktop** đã cài đặt và đang chạy
- **Docker Compose** (thường đi kèm với Docker Desktop)
- Tối thiểu **4GB RAM** trống

## 🚀 Cách Chạy Nhanh

### Bước 1: Kiểm Tra Docker

```powershell
docker --version
docker-compose --version
```

### Bước 2: Build và Chạy Tất Cả Services

Từ thư mục gốc dự án (`D:\DoAn TTTN\TTTN2025`):

```powershell
docker-compose up --build
```

Lệnh này sẽ:
- Build tất cả Docker images
- Tạo network và volumes
- Khởi động tất cả services (MySQL, Auth, Product, Cart, Order, News, Gateway)

### Bước 3: Chạy Ở Chế Độ Background (Detached)

```powershell
docker-compose up -d --build
```

### Bước 4: Truy Cập Website

Mở trình duyệt: **http://localhost:5000**

## 📊 Kiểm Tra Trạng Thái Services

### Xem Logs Tất Cả Services:
```powershell
docker-compose logs -f
```

### Xem Logs Một Service Cụ Thể:
```powershell
docker-compose logs -f gateway
docker-compose logs -f news-service
docker-compose logs -f auth-service
```

### Xem Trạng Thái Containers:
```powershell
docker-compose ps
```

### Kiểm Tra Health Check:
```powershell
# Gateway
curl http://localhost:5000

# Auth Service
curl http://localhost:5001/health

# Product Service
curl http://localhost:5002/health

# Cart Service
curl http://localhost:5003/health

# Order Service
curl http://localhost:5004/health

# News Service
curl http://localhost:5005/health
```

## 🛑 Dừng Services

### Dừng Tất Cả (Giữ Containers):
```powershell
docker-compose stop
```

### Dừng và Xóa Containers:
```powershell
docker-compose down
```

### Dừng và Xóa Containers + Volumes (Xóa Database):
```powershell
docker-compose down -v
```

## 🔄 Restart Services

### Restart Tất Cả:
```powershell
docker-compose restart
```

### Restart Một Service Cụ Thể:
```powershell
docker-compose restart gateway
docker-compose restart news-service
```

## 🗄️ Seed Dữ Liệu

### Kết Nối Vào MySQL Container:
```powershell
docker exec -it tttn2025-mysql mysql -u tttn_user -pttn_pass tttn2025
```

### Hoặc Chạy Script Seed Từ Host:
```powershell
# Copy script vào container và chạy
docker cp database/seed_news.js tttn2025-mysql:/tmp/
docker exec -it tttn2025-mysql node /tmp/seed_news.js
```

### Hoặc Chạy Từ Host (Nếu có Node.js):
```powershell
# Kết nối đến MySQL trong Docker (port 3307)
# Sửa DB_HOST trong script thành localhost:3307
node database/seed_news.js
```

## 🐛 Xử Lý Lỗi

### Lỗi: Port Đã Được Sử Dụng

Nếu port 5000 đã được sử dụng:
```powershell
# Tìm process đang dùng port
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F

# Hoặc đổi port trong docker-compose.yml
# ports:
#   - "5001:5000"  # Thay vì "5000:5000"
```

### Lỗi: Container Không Khởi Động

Xem logs chi tiết:
```powershell
docker-compose logs <service-name>
```

Ví dụ:
```powershell
docker-compose logs gateway
docker-compose logs mysql
```

### Lỗi: Database Connection Failed

Kiểm tra MySQL đã sẵn sàng:
```powershell
docker-compose logs mysql
```

Đợi thông báo: `MySQL init process done. Ready for start up.`

### Lỗi: Build Failed

Xóa images cũ và build lại:
```powershell
docker-compose down
docker-compose build --no-cache
docker-compose up
```

## 📝 Cấu Trúc Docker

```
D:\DoAn TTTN\TTTN2025\
├── docker-compose.yml          # Cấu hình tất cả services
├── gateway/
│   └── Dockerfile             # Build gateway image
└── services/
    ├── auth-service/
    │   └── Dockerfile
    ├── product-service/
    │   └── Dockerfile
    ├── cart-service/
    │   └── Dockerfile
    ├── order-service/
    │   └── Dockerfile
    └── news-service/
        └── Dockerfile
```

## 🔧 Cấu Hình Môi Trường

Các biến môi trường được định nghĩa trong `docker-compose.yml`:

- **MySQL**: Port 3307 (host) → 3306 (container)
- **Auth Service**: Port 5001
- **Product Service**: Port 5002
- **Cart Service**: Port 5003
- **Order Service**: Port 5004
- **News Service**: Port 5005
- **Gateway**: Port 5000

## 🗑️ Dọn Dẹp

### Xóa Tất Cả Containers, Networks, Volumes:
```powershell
docker-compose down -v --rmi all
```

### Xóa Chỉ Containers Đã Dừng:
```powershell
docker-compose rm
```

### Xóa Images Không Dùng:
```powershell
docker image prune -a
```

## 📊 Monitoring

### Xem Resource Usage:
```powershell
docker stats
```

### Xem Network:
```powershell
docker network ls
docker network inspect tttn2025_tttn-network
```

### Xem Volumes:
```powershell
docker volume ls
docker volume inspect tttn2025_mysql_data
```

## 🚀 Workflow Phát Triển

### 1. Sửa Code
Sửa code trong các service

### 2. Rebuild Service Cụ Thể
```powershell
docker-compose build <service-name>
docker-compose up -d <service-name>
```

Ví dụ:
```powershell
docker-compose build news-service
docker-compose up -d news-service
```

### 3. Xem Logs Real-time
```powershell
docker-compose logs -f <service-name>
```

## ✅ Checklist

- [ ] Docker Desktop đang chạy
- [ ] Ports 5000-5005 và 3307 không bị chiếm
- [ ] Đã chạy `docker-compose up --build`
- [ ] Tất cả containers đang chạy (`docker-compose ps`)
- [ ] Gateway trả về response (`curl http://localhost:5000`)
- [ ] Website load được tại http://localhost:5000

## 🎯 Tóm Tắt Lệnh Quan Trọng

```powershell
# Chạy tất cả services
docker-compose up --build

# Chạy ở background
docker-compose up -d --build

# Xem logs
docker-compose logs -f

# Dừng tất cả
docker-compose stop

# Dừng và xóa
docker-compose down

# Restart một service
docker-compose restart <service-name>

# Rebuild một service
docker-compose build <service-name>
docker-compose up -d <service-name>
```

## 🔍 Troubleshooting

### Container Không Kết Nối Được Database

Kiểm tra network:
```powershell
docker network inspect tttn2025_tttn-network
```

Đảm bảo các service cùng network và MySQL đã sẵn sàng.

### Gateway Không Kết Nối Được Services

Kiểm tra service URLs trong gateway:
- Trong Docker: `http://service-name:port` (ví dụ: `http://auth-service:5001`)
- Từ host: `http://localhost:port` (ví dụ: `http://localhost:5001`)

### Ảnh Slider Không Hiển Thị

Đảm bảo gateway serve static files:
- Kiểm tra `gateway/Dockerfile` có copy `public/` folder
- Kiểm tra logs gateway: `docker-compose logs gateway`


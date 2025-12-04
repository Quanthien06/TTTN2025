# 🐳 HƯỚNG DẪN SỬ DỤNG DOCKER CHO DỰ ÁN TTTN2025

## 📋 MỤC LỤC

1. [Yêu cầu](#1-yêu-cầu)
2. [Cấu trúc Docker](#2-cấu-trúc-docker)
3. [Build và Chạy](#3-build-và-chạy)
4. [Kiểm tra Services](#4-kiểm-tra-services)
5. [Troubleshooting](#5-troubleshooting)
6. [Các lệnh Docker thường dùng](#6-các-lệnh-docker-thường-dùng)
7. [Môi trường Development vs Production](#7-môi-trường-development-vs-production)

---

## 1. YÊU CẦU

### Phần mềm cần cài đặt:
- **Docker Desktop** (Windows/Mac) hoặc **Docker Engine** (Linux)
- **Docker Compose** (thường đi kèm với Docker Desktop)

### Kiểm tra cài đặt:
```bash
docker --version
docker-compose --version
```

**Kết quả mong đợi:**
```
Docker version 24.x.x
Docker Compose version v2.x.x
```

---

## 2. CẤU TRÚC DOCKER

### Các file Docker đã tạo:

```
TTTN2025/
├── docker-compose.yml          # File chính để chạy tất cả services
├── .dockerignore               # File loại trừ khi build
│
├── gateway/
│   └── Dockerfile              # Dockerfile cho API Gateway
│
└── services/
    ├── auth-service/
    │   └── Dockerfile          # Dockerfile cho Auth Service
    ├── product-service/
    │   └── Dockerfile          # Dockerfile cho Product Service
    ├── cart-service/
    │   └── Dockerfile          # Dockerfile cho Cart Service
    └── order-service/
        └── Dockerfile          # Dockerfile cho Order Service
```

### Services trong Docker:

| Service | Container Name | Port | URL (trong Docker) |
|---------|---------------|------|-------------------|
| MySQL | `tttn2025-mysql` | 3306 | `mysql` |
| Auth Service | `tttn2025-auth` | 5001 | `http://auth-service:5001` |
| Product Service | `tttn2025-product` | 5002 | `http://product-service:5002` |
| Cart Service | `tttn2025-cart` | 5003 | `http://cart-service:5003` |
| Order Service | `tttn2025-order` | 5004 | `http://order-service:5004` |
| API Gateway | `tttn2025-gateway` | 5000 | `http://gateway:5000` |

---

## 3. BUILD VÀ CHẠY

### Bước 1: Chuẩn bị Database Schema

Đảm bảo các file SQL trong thư mục `database/` đã sẵn sàng:
- `cart_schema.sql` hoặc `cart_simple.sql`
- `orders_schema.sql`
- `categories_schema.sql`

**Lưu ý:** Docker sẽ tự động chạy các file `.sql` trong thư mục `database/` khi khởi động MySQL container lần đầu.

### Bước 2: Build và Start tất cả services

```bash
# Từ thư mục gốc của dự án
docker-compose up -d
```

**Lệnh này sẽ:**
- Build Docker images cho tất cả services
- Tạo network `tttn-network`
- Tạo volume `mysql_data`
- Start tất cả containers ở chế độ background (`-d`)

**Kết quả mong đợi:**
```
[+] Building 15.2s
[+] Running 6/6
 ✔ Container tttn2025-mysql     Started
 ✔ Container tttn2025-auth      Started
 ✔ Container tttn2025-product   Started
 ✔ Container tttn2025-cart      Started
 ✔ Container tttn2025-order     Started
 ✔ Container tttn2025-gateway   Started
```

### Bước 3: Xem logs

```bash
# Xem logs tất cả services
docker-compose logs -f

# Xem logs một service cụ thể
docker-compose logs -f gateway
docker-compose logs -f auth-service
docker-compose logs -f mysql
```

### Bước 4: Kiểm tra containers đang chạy

```bash
docker-compose ps
```

**Kết quả mong đợi:**
```
NAME                STATUS          PORTS
tttn2025-mysql      Up (healthy)    0.0.0.0:3306->3306/tcp
tttn2025-auth       Up              0.0.0.0:5001->5001/tcp
tttn2025-product    Up              0.0.0.0:5002->5002/tcp
tttn2025-cart       Up              0.0.0.0:5003->5003/tcp
tttn2025-order      Up              0.0.0.0:5004->5004/tcp
tttn2025-gateway    Up              0.0.0.0:5000->5000/tcp
```

---

## 4. CẤU HÌNH GATEWAY CHO DOCKER

**QUAN TRỌNG:** Gateway đã được cấu hình để tự động sử dụng tên service trong Docker hoặc localhost khi chạy ngoài Docker.

Trong `gateway/server.js`:
```javascript
const SERVICES = {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
    product: process.env.PRODUCT_SERVICE_URL || 'http://localhost:5002',
    cart: process.env.CART_SERVICE_URL || 'http://localhost:5003',
    order: process.env.ORDER_SERVICE_URL || 'http://localhost:5004'
};
```

Khi chạy với Docker, các biến môi trường trong `docker-compose.yml` sẽ tự động set:
- `AUTH_SERVICE_URL=http://auth-service:5001`
- `PRODUCT_SERVICE_URL=http://product-service:5002`
- `CART_SERVICE_URL=http://cart-service:5003`
- `ORDER_SERVICE_URL=http://order-service:5004`

---

## 5. KIỂM TRA SERVICES

### Test Health Checks

```bash
# Auth Service
curl http://localhost:5001/health

# Product Service
curl http://localhost:5002/health

# Cart Service
curl http://localhost:5003/health

# Order Service
curl http://localhost:5004/health

# Gateway (qua public API)
curl http://localhost:5000/api/products
```

### Test API qua Gateway

**Đăng ký:**
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123","role":"user"}'
```

**Đăng nhập:**
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

**Lấy sản phẩm:**
```bash
curl http://localhost:5000/api/products
```

### Truy cập Frontend

Mở trình duyệt: **http://localhost:5000**

---

## 6. TROUBLESHOOTING

### Lỗi: Port đã được sử dụng

**Triệu chứng:**
```
Error: bind: address already in use
```

**Giải pháp:**
```bash
# Kiểm tra port đang được sử dụng
# Windows
netstat -ano | findstr :5000

# Linux/Mac
lsof -i :5000

# Dừng process đang dùng port hoặc đổi port trong docker-compose.yml
```

### Lỗi: Container không start được

**Triệu chứng:**
```
Container tttn2025-auth exited with code 1
```

**Giải pháp:**
```bash
# Xem logs chi tiết
docker-compose logs auth-service

# Rebuild và start lại
docker-compose up -d --build auth-service
```

### Lỗi: Kết nối database thất bại

**Triệu chứng:**
```
Error: connect ECONNREFUSED mysql:3306
```

**Giải pháp:**
1. Kiểm tra MySQL container đã healthy chưa:
```bash
docker-compose ps mysql
```

2. Đợi MySQL khởi động hoàn toàn (30-60 giây đầu tiên)

3. Kiểm tra logs MySQL:
```bash
docker-compose logs mysql
```

### Lỗi: Services không giao tiếp được với nhau

**Triệu chứng:**
```
Gateway Error: Could not connect to target service
```

**Giải pháp:**
1. Kiểm tra các services đã join cùng network chưa:
```bash
docker network inspect tttn2025_tttn-network
```

2. Kiểm tra các services đã start chưa:
```bash
docker-compose ps
```

3. Rebuild và restart:
```bash
docker-compose down
docker-compose up -d --build
```

### Lỗi: JWT token không hợp lệ

**Triệu chứng:**
```
Token không hợp lệ
```

**Giải pháp:**
- Đảm bảo tất cả services dùng cùng JWT_SECRET
- Kiểm tra trong `docker-compose.yml`: Tất cả services phải có cùng giá trị `JWT_SECRET`

---

## 7. CÁC LỆNH DOCKER THƯỜNG DÙNG

### Quản lý Containers

```bash
# Start tất cả services
docker-compose up -d

# Stop tất cả services (giữ lại containers)
docker-compose stop

# Start lại services đã stop
docker-compose start

# Stop và xóa containers (giữ lại images và volumes)
docker-compose down

# Stop và xóa tất cả (containers, images, volumes)
docker-compose down -v

# Rebuild và start lại
docker-compose up -d --build

# Restart một service cụ thể
docker-compose restart gateway

# Xem trạng thái
docker-compose ps

# Xem logs
docker-compose logs -f [service-name]

# Execute command trong container
docker-compose exec mysql mysql -u tttn_user -ptttn_pass tttn2025
```

### Quản lý Images

```bash
# Xem images
docker images

# Xóa image không dùng
docker image prune

# Xóa tất cả images không dùng
docker image prune -a
```

### Quản lý Volumes

```bash
# Xem volumes
docker volume ls

# Xem chi tiết volume
docker volume inspect tttn2025_mysql_data

# Xóa volume (CẨN THẬN: Sẽ mất dữ liệu)
docker volume rm tttn2025_mysql_data
```

### Quản lý Networks

```bash
# Xem networks
docker network ls

# Xem chi tiết network
docker network inspect tttn2025_tttn-network

# Xóa network
docker network rm tttn2025_tttn-network
```

### Debug

```bash
# Vào trong container
docker-compose exec gateway sh
docker-compose exec mysql bash

# Xem logs realtime
docker-compose logs -f --tail=100

# Xem resource usage
docker stats

# Kiểm tra health
docker-compose ps
```

---

## 8. MÔI TRƯỜNG DEVELOPMENT VS PRODUCTION

### Development (Hiện tại)

**docker-compose.yml** hiện tại phù hợp cho development:
- Expose tất cả ports ra ngoài
- Không có reverse proxy
- Không có SSL/TLS
- Logs hiển thị đầy đủ

### Production (Khuyến nghị)

Để deploy production, cần:

1. **Thêm Nginx Reverse Proxy:**
```yaml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
  depends_on:
    - gateway
```

2. **Sử dụng Environment Variables:**
- Tạo file `.env` cho secrets
- Không hardcode passwords trong `docker-compose.yml`

3. **Health Checks:**
- Thêm health checks cho tất cả services
- Sử dụng health checks trong depends_on

4. **Logging:**
- Cấu hình logging driver (ví dụ: json-file, syslog)
- Có thể dùng ELK stack hoặc Loki

5. **Backup Database:**
- Tự động backup MySQL volume
- Cron job để backup định kỳ

6. **Monitoring:**
- Thêm Prometheus + Grafana
- Monitor metrics của từng service

---

## 9. WORKFLOW PHÁT TRIỂN VỚI DOCKER

### Workflow 1: Development trên host, test với Docker

```bash
# 1. Develop code trên máy (không cần Docker)
# 2. Khi cần test, build và chạy với Docker
docker-compose up -d --build

# 3. Test API
curl http://localhost:5000/api/products

# 4. Xem logs nếu có lỗi
docker-compose logs -f

# 5. Sửa code, rebuild
docker-compose up -d --build [service-name]
```

### Workflow 2: Development hoàn toàn với Docker

```bash
# 1. Start tất cả services
docker-compose up -d

# 2. Develop và test qua Gateway
# Frontend: http://localhost:5000
# API: http://localhost:5000/api/*

# 3. Khi sửa code, rebuild service đó
docker-compose up -d --build [service-name]
```

### Workflow 3: Hot Reload với Volume Mount

Có thể thêm volumes vào `docker-compose.yml` để hot reload:

```yaml
services:
  gateway:
    volumes:
      - ./gateway:/app
      - /app/node_modules
```

**Lưu ý:** Cần cài nodemon và chạy với `npm run dev` thay vì `npm start`.

---

## 10. BACKUP VÀ RESTORE DATABASE

### Backup Database

```bash
# Backup từ container MySQL
docker-compose exec mysql mysqldump -u tttn_user -ptttn_pass tttn2025 > backup.sql

# Hoặc backup volume
docker run --rm -v tttn2025_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql-backup.tar.gz /data
```

### Restore Database

```bash
# Restore từ file SQL
docker-compose exec -T mysql mysql -u tttn_user -ptttn_pass tttn2025 < backup.sql
```

---

## 11. CẤU HÌNH NÂNG CAO

### Environment Variables

Tạo file `.env` trong thư mục gốc:

```env
# Database
MYSQL_ROOT_PASSWORD=root_password_here
MYSQL_DATABASE=tttn2025
MYSQL_USER=tttn_user
MYSQL_PASSWORD=tttn_pass_here

# JWT
JWT_SECRET=your_secret_key_here

# Service URLs (nếu cần override)
AUTH_SERVICE_URL=http://auth-service:5001
PRODUCT_SERVICE_URL=http://product-service:5002
```

Cập nhật `docker-compose.yml`:
```yaml
services:
  mysql:
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
```

### Resource Limits

Thêm resource limits vào `docker-compose.yml`:

```yaml
services:
  mysql:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Health Checks

Thêm health checks cho services:

```yaml
services:
  auth-service:
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:5001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

---

## 12. CHECKLIST TRƯỚC KHI DEPLOY

- [ ] Đã test tất cả services chạy với Docker
- [ ] Đã test API qua Gateway
- [ ] Đã test kết nối database
- [ ] Đã kiểm tra logs không có lỗi
- [ ] Đã backup database (nếu có dữ liệu)
- [ ] Đã đổi passwords mặc định (production)
- [ ] Đã cấu hình environment variables
- [ ] Đã test restart containers
- [ ] Đã test xóa và tạo lại containers

---

## 13. TÓM TẮT CÁC LỆNH QUAN TRỌNG

```bash
# Khởi động tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng tất cả services
docker-compose down

# Rebuild và start lại
docker-compose up -d --build

# Xem trạng thái
docker-compose ps

# Restart một service
docker-compose restart gateway

# Vào container
docker-compose exec gateway sh

# Xóa tất cả (cẩn thận!)
docker-compose down -v
```

---

**Chúc bạn sử dụng Docker thành công! 🐳**

Nếu có vấn đề, kiểm tra logs với: `docker-compose logs -f [service-name]`


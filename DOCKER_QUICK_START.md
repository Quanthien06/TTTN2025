# 🐳 DOCKER QUICK START GUIDE

## Khởi động nhanh

```bash
# 1. Build và start tất cả services
docker-compose up -d

# 2. Xem logs
docker-compose logs -f  

# 3. Kiểm tra services đã chạy
docker-compose ps

# 4. Truy cập ứng dụng
# Frontend: http://localhost:5000
# API: http://localhost:5000/api/*
```

## Dừng và xóa

```bash
# Dừng tất cả services (giữ lại containers)
docker-compose stop

# Dừng và xóa containers
docker-compose down

# Dừng và xóa tất cả (cả volumes - sẽ mất database!)
docker-compose down -v
```

## Rebuild sau khi sửa code

```bash
# Rebuild và restart một service
docker-compose up -d --build gateway

# Rebuild tất cả
docker-compose up -d --build
```

## Xem logs

```bash
# Tất cả services
docker-compose logs -f

# Một service cụ thể
docker-compose logs -f gateway
docker-compose logs -f mysql
```

## Test API

```bash
# Health check
curl http://localhost:5001/health  # Auth
curl http://localhost:5002/health  # Product
curl http://localhost:5003/health  # Cart
curl http://localhost:5004/health  # Order

# Test API qua Gateway
curl http://localhost:5000/api/products
```

## Vào container

```bash
# Vào MySQL container
docker-compose exec mysql mysql -u tttn_user -ptttn_pass tttn2025

# Vào Gateway container
docker-compose exec gateway sh
```

## Troubleshooting

Nếu services không start:

```bash
# Xem logs chi tiết
docker-compose logs [service-name]

# Restart service
docker-compose restart [service-name]

# Rebuild và start lại
docker-compose up -d --build [service-name]
```

**Xem hướng dẫn chi tiết tại:** `HUONG_DAN_DOCKER.md`



# 🏗️ HƯỚNG DẪN SỬ DỤNG MICROSERVICES

## 📋 CẤU TRÚC DỰ ÁN

```
TTTN2025/
├── gateway/                    # API Gateway (Port 5000)
│   ├── server.js
│   └── package.json
│
├── services/
│   ├── auth-service/          # Auth Service (Port 5001)
│   │   ├── server.js
│   │   ├── routes/
│   │   │   └── auth.js
│   │   └── package.json
│   │
│   ├── product-service/       # Product Service (Port 5002)
│   │   ├── server.js
│   │   ├── routes/
│   │   │   ├── products.js
│   │   │   └── categories.js
│   │   └── package.json
│   │
│   ├── cart-service/          # Cart Service (Port 5003)
│   │   ├── server.js
│   │   ├── routes/
│   │   │   └── cart.js
│   │   └── package.json
│   │
│   └── order-service/         # Order Service (Port 5004)
│       ├── server.js
│       ├── routes/
│       │   └── orders.js
│       └── package.json
│
├── public/                     # Frontend (không đổi)
│   ├── index.html
│   ├── styles.css
│   └── app.js
│
└── start-services.ps1          # Script khởi động (Windows)
```

---

## 🚀 CÁCH KHỞI ĐỘNG

### Bước 1: Cài đặt dependencies cho từng service

```bash
# Cài đặt cho Gateway
cd gateway
npm install

# Cài đặt cho Auth Service
cd ../services/auth-service
npm install

# Cài đặt cho Product Service
cd ../product-service
npm install

# Cài đặt cho Cart Service
cd ../cart-service
npm install

# Cài đặt cho Order Service
cd ../order-service
npm install
```

### Bước 2: Khởi động services

**Option 1: Dùng script (Khuyến nghị)**

**Windows (PowerShell):**
```powershell
.\start-services.ps1
```

**Linux/Mac (Bash):**
```bash
chmod +x start-services.sh
./start-services.sh
```

**Option 2: Khởi động thủ công từng service**

Mở 5 terminal windows riêng biệt:

**Terminal 1 - Auth Service:**
```bash
cd services/auth-service
npm start
```

**Terminal 2 - Product Service:**
```bash
cd services/product-service
npm start
```

**Terminal 3 - Cart Service:**
```bash
cd services/cart-service
npm start
```

**Terminal 4 - Order Service:**
```bash
cd services/order-service
npm start
```

**Terminal 5 - API Gateway:**
```bash
cd gateway
npm start
```

---

## ✅ KIỂM TRA SERVICES ĐÃ CHẠY

Sau khi khởi động, kiểm tra các endpoints:

```bash
# Health checks
curl http://localhost:5001/health  # Auth Service
curl http://localhost:5002/health  # Product Service
curl http://localhost:5003/health  # Cart Service
curl http://localhost:5004/health  # Order Service
```

---

## 🌐 SỬ DỤNG

### Frontend
Mở trình duyệt: `http://localhost:5000`

### API Endpoints (qua Gateway)
Tất cả requests đều qua Gateway tại `http://localhost:5000/api/*`

- `POST /api/register` → Auth Service
- `POST /api/login` → Auth Service
- `GET /api/products` → Product Service
- `GET /api/cart` → Cart Service
- `POST /api/orders` → Order Service

---

## 🔧 CONFIGURATION

### Environment Variables

Mỗi service có thể config qua environment variables:

```bash
# .env file cho mỗi service
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=tttn2025
JWT_SECRET=HhGg78@!kYpQzXcVbNmL1o2P3oI4U5yT6rE7wQ8aZ9sX0cVkGjH
```

---

## ⚠️ LƯU Ý

1. **Database**: Tất cả services dùng chung database `tttn2025`
2. **JWT Secret**: Phải giống nhau ở tất cả services và Gateway
3. **Ports**: Đảm bảo các ports 5000-5004 không bị chiếm
4. **Dependencies**: Mỗi service có `node_modules` riêng

---

## 🐛 TROUBLESHOOTING

### Service không khởi động được
- Kiểm tra port đã bị chiếm chưa: `netstat -ano | findstr :5001`
- Kiểm tra database connection
- Kiểm tra dependencies đã cài chưa

### Gateway không kết nối được services
- Kiểm tra các services đã chạy chưa
- Kiểm tra URLs trong `gateway/server.js`

### Token không hợp lệ
- Đảm bảo JWT_SECRET giống nhau ở tất cả services
- Kiểm tra token format (Bearer token)

---

## 📚 TÀI LIỆU THÊM

Xem file `HUONG_DAN_MICROSERVICES.md` để biết chi tiết về:
- Kiến trúc microservices
- Cách các service giao tiếp
- Best practices

---

**Chúc bạn sử dụng thành công! 🎉**


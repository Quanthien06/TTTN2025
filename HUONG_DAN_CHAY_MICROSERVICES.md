# Hướng Dẫn Chạy Dự Án Microservices

## 📋 Tổng Quan

Dự án sử dụng kiến trúc microservices với các service độc lập:
- **Gateway** (port 5000): Điểm vào chính, route requests đến các service
- **Auth Service** (port 5001): Xác thực, đăng nhập, đăng ký
- **Product Service** (port 5002): Quản lý sản phẩm và danh mục
- **Cart Service** (port 5003): Quản lý giỏ hàng
- **Order Service** (port 5004): Quản lý đơn hàng
- **News Service** (port 5005): Quản lý tin tức công nghệ

## 🚀 Cách Chạy (Windows PowerShell)

### Bước 1: Chuẩn Bị Database

Đảm bảo MySQL đang chạy và có database `tttn2025`:
```sql
CREATE DATABASE IF NOT EXISTS tttn2025;
```

### Bước 2: Seed Dữ Liệu (Nếu Chưa Có)

```powershell
cd "D:\DoAn TTTN\TTTN2025"
node database/seed_news.js
```

### Bước 3: Cài Đặt Dependencies (Chỉ Cần Làm 1 Lần)

Mở **6 cửa sổ PowerShell riêng** và chạy các lệnh sau:

**Cửa sổ 1 - Gateway:**
```powershell
cd "D:\DoAn TTTN\TTTN2025\gateway"
npm install
```

**Cửa sổ 2 - Auth Service:**
```powershell
cd "D:\DoAn TTTN\TTTN2025\services\auth-service"
npm install
```

**Cửa sổ 3 - Product Service:**
```powershell
cd "D:\DoAn TTTN\TTTN2025\services\product-service"
npm install
```

**Cửa sổ 4 - Cart Service:**
```powershell
cd "D:\DoAn TTTN\TTTN2025\services\cart-service"
npm install
```

**Cửa sổ 5 - Order Service:**
```powershell
cd "D:\DoAn TTTN\TTTN2025\services\order-service"
npm install
```

**Cửa sổ 6 - News Service:**
```powershell
cd "D:\DoAn TTTN\TTTN2025\services\news-service"
npm install
```

### Bước 4: Chạy Các Services

**⚠️ QUAN TRỌNG:** Mỗi service phải chạy trong **một cửa sổ PowerShell riêng**

**Cửa sổ 1 - Auth Service (port 5001):**
```powershell
cd "D:\DoAn TTTN\TTTN2025\services\auth-service"
npm start
```
Kết quả mong đợi: `🔐 Auth Service đang chạy tại http://localhost:5001`

**Cửa sổ 2 - Product Service (port 5002):**
```powershell
cd "D:\DoAn TTTN\TTTN2025\services\product-service"
npm start
```
Kết quả mong đợi: `📦 Product Service đang chạy tại http://localhost:5002`

**Cửa sổ 3 - Cart Service (port 5003):**
```powershell
cd "D:\DoAn TTTN\TTTN2025\services\cart-service"
npm start
```
Kết quả mong đợi: `🛒 Cart Service đang chạy tại http://localhost:5003`

**Cửa sổ 4 - Order Service (port 5004):**
```powershell
cd "D:\DoAn TTTN\TTTN2025\services\order-service"
npm start
```
Kết quả mong đợi: `📦 Order Service đang chạy tại http://localhost:5004`

**Cửa sổ 5 - News Service (port 5005):**
```powershell
cd "D:\DoAn TTTN\TTTN2025\services\news-service"
npm start
```
Kết quả mong đợi: `📰 News Service đang chạy tại http://localhost:5005`

**Cửa sổ 6 - Gateway (port 5000) - CHẠY CUỐI CÙNG:**
```powershell
cd "D:\DoAn TTTN\TTTN2025\gateway"
npm start
```
Kết quả mong đợi:
```
🚀 API Gateway đang chạy tại http://localhost:5000
📡 Kết nối đến các services:
   - Auth Service: http://localhost:5001
   - Product Service: http://localhost:5002
   - Cart Service: http://localhost:5003
   - Order Service: http://localhost:5004
   - News Service: http://localhost:5005
```

### Bước 5: Truy Cập Website

Mở trình duyệt và truy cập: **http://localhost:5000**

## ⚠️ Lưu Ý Quan Trọng

### 1. Không Chạy Server Monolith Cùng Lúc
- **KHÔNG** chạy `node server.js` (monolith) khi đang dùng microservices
- Cả hai đều dùng port 5000 → sẽ xung đột

### 2. Thứ Tự Chạy Services
- Chạy các service con **TRƯỚC** (auth, product, cart, order, news)
- Chạy Gateway **SAU CÙNG** (vì gateway cần kết nối đến các service)

### 3. Kiểm Tra Port Đang Dùng
Nếu gặp lỗi `EADDRINUSE: address already in use :::5000`:

```powershell
# Tìm process đang dùng port 5000
netstat -ano | findstr :5000

# Kill process (thay PID bằng số từ lệnh trên)
taskkill /PID <PID> /F
```

### 4. Restart Services
Khi sửa code, cần restart service tương ứng:
- Dừng: Nhấn `Ctrl+C` trong cửa sổ PowerShell của service đó
- Chạy lại: `npm start`

## 🔍 Kiểm Tra Services Đang Chạy

### Kiểm Tra Ports:
```powershell
netstat -ano | findstr ":500"
```

### Kiểm Tra Health Check:
- Auth Service: http://localhost:5001/health
- Product Service: http://localhost:5002/health
- Cart Service: http://localhost:5003/health
- Order Service: http://localhost:5004/health
- News Service: http://localhost:5005/health

## 🐛 Xử Lý Lỗi Thường Gặp

### Lỗi: "Cannot find module 'axios'"
**Giải pháp:** Chạy `npm install` trong thư mục service đó

### Lỗi: "EADDRINUSE: address already in use"
**Giải pháp:** 
1. Tìm process: `netstat -ano | findstr :<PORT>`
2. Kill process: `taskkill /PID <PID> /F`

### Lỗi: "Connection refused" hoặc "ECONNREFUSED"
**Giải pháp:** 
- Kiểm tra service đã chạy chưa
- Kiểm tra port có đúng không
- Kiểm tra firewall

### Ảnh Slider Không Hiển Thị
**Giải pháp:**
- Đảm bảo Gateway đang chạy (port 5000)
- Gateway phải serve static files từ `public/`
- Kiểm tra DevTools → Network tab xem request ảnh có 200 không

## 📝 Script Tự Động (Tùy Chọn)

Tạo file `start-all-services.ps1` để chạy tất cả services:

```powershell
# start-all-services.ps1
Write-Host "Đang khởi động các microservices..." -ForegroundColor Green

# Start Auth Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\DoAn TTTN\TTTN2025\services\auth-service'; npm start"

# Start Product Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\DoAn TTTN\TTTN2025\services\product-service'; npm start"

# Start Cart Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\DoAn TTTN\TTTN2025\services\cart-service'; npm start"

# Start Order Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\DoAn TTTN\TTTN2025\services\order-service'; npm start"

# Start News Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\DoAn TTTN\TTTN2025\services\news-service'; npm start"

# Wait 3 seconds
Start-Sleep -Seconds 3

# Start Gateway
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\DoAn TTTN\TTTN2025\gateway'; npm start"

Write-Host "Đã khởi động tất cả services!" -ForegroundColor Green
Write-Host "Truy cập: http://localhost:5000" -ForegroundColor Cyan
```

Chạy script:
```powershell
.\start-all-services.ps1
```

## ✅ Checklist Trước Khi Chạy

- [ ] MySQL đang chạy
- [ ] Database `tttn2025` đã tồn tại
- [ ] Đã seed dữ liệu tin tức (nếu cần)
- [ ] Đã cài dependencies cho tất cả services (`npm install`)
- [ ] Không có process nào đang dùng ports 5000-5005
- [ ] Đã chuẩn bị 6 cửa sổ PowerShell

## 🎯 Tóm Tắt Nhanh

```powershell
# 1. Cài dependencies (1 lần)
cd gateway && npm install
cd ../services/auth-service && npm install
cd ../product-service && npm install
cd ../cart-service && npm install
cd ../order-service && npm install
cd ../news-service && npm install

# 2. Chạy services (mỗi lệnh trong 1 cửa sổ riêng)
cd services/auth-service && npm start
cd services/product-service && npm start
cd services/cart-service && npm start
cd services/order-service && npm start
cd services/news-service && npm start
cd gateway && npm start

# 3. Truy cập: http://localhost:5000
```


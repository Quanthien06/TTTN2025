# 🏗️ HƯỚNG DẪN TRIỂN KHAI MICROSERVICES CHO DỰ ÁN TTTN2025

## 📋 TỔNG QUAN

### Microservices là gì?
Microservices là một kiến trúc phần mềm trong đó ứng dụng được chia thành nhiều service nhỏ, độc lập, mỗi service chịu trách nhiệm cho một chức năng cụ thể.

### Ưu điểm:
- ✅ **Độc lập**: Mỗi service có thể deploy riêng
- ✅ **Scalable**: Scale từng service theo nhu cầu
- ✅ **Technology Diversity**: Mỗi service có thể dùng công nghệ khác nhau
- ✅ **Fault Isolation**: Lỗi ở 1 service không ảnh hưởng service khác

### Nhược điểm:
- ⚠️ **Phức tạp hơn**: Nhiều service cần quản lý
- ⚠️ **Network overhead**: Giao tiếp qua network
- ⚠️ **Data consistency**: Khó đồng bộ dữ liệu giữa services

---

## 🎯 KIẾN TRÚC ĐỀ XUẤT CHO TTTN2025

### Cấu trúc Services:

```
┌─────────────────────────────────────────┐
│         API Gateway (Port 5000)         │
│     - Routing, Authentication           │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┼──────────┬──────────┐
    │          │          │          │
┌───▼───┐ ┌───▼───┐ ┌───▼───┐ ┌───▼───┐
│ Auth  │ │Product│ │ Cart  │ │Order  │
│Service│ │Service│ │Service│ │Service│
│ :5001 │ │ :5002 │ │ :5003 │ │ :5004 │
└───────┘ └───────┘ └───────┘ └───────┘
    │          │          │          │
    └──────────┼──────────┼──────────┘
               │          │
          ┌────▼──────────▼────┐
          │   MySQL Database   │
          │   (Shared/Sharded) │
          └────────────────────┘
```

### 1. **Auth Service** (Port 5001)
- Chức năng: Xác thực và phân quyền
- Endpoints:
  - `POST /register` - Đăng ký
  - `POST /login` - Đăng nhập
  - `GET /me` - Lấy thông tin user
  - `PUT /profile` - Cập nhật profile
  - `PUT /change-password` - Đổi mật khẩu
  - `POST /verify-token` - Verify JWT token (internal)

### 2. **Product Service** (Port 5002)
- Chức năng: Quản lý sản phẩm và danh mục
- Endpoints:
  - `GET /products` - Danh sách sản phẩm (search, filter, sort, pagination)
  - `GET /products/:id` - Chi tiết sản phẩm
  - `POST /products` - Thêm sản phẩm (admin)
  - `PUT /products/:id` - Cập nhật sản phẩm (admin)
  - `DELETE /products/:id` - Xóa sản phẩm (admin)
  - `GET /categories` - Danh sách categories
  - `GET /categories/:id` - Chi tiết category

### 3. **Cart Service** (Port 5003)
- Chức năng: Quản lý giỏ hàng
- Endpoints:
  - `GET /cart` - Lấy giỏ hàng
  - `POST /cart/items` - Thêm sản phẩm
  - `PUT /cart/items/:id` - Cập nhật số lượng
  - `DELETE /cart/items/:id` - Xóa item
  - `DELETE /cart` - Xóa toàn bộ giỏ
  - `GET /cart/total` - Tính tổng tiền

### 4. **Order Service** (Port 5004)
- Chức năng: Quản lý đơn hàng
- Endpoints:
  - `POST /orders` - Tạo đơn hàng (gọi Cart Service để lấy items)
  - `GET /orders` - Danh sách đơn hàng
  - `GET /orders/:id` - Chi tiết đơn hàng
  - `PUT /orders/:id/status` - Cập nhật trạng thái (admin)

### 5. **API Gateway** (Port 5000)
- Chức năng: Điểm vào chính, routing và authentication
- Xử lý:
  - Nhận request từ client
  - Verify JWT token (gọi Auth Service)
  - Route request đến service tương ứng
  - Trả về response cho client

---

## 📁 CẤU TRÚC THƯ MỤC

```
TTTN2025/
├── gateway/                    # API Gateway
│   ├── server.js
│   ├── routes.js
│   └── package.json
│
├── services/
│   ├── auth-service/          # Auth Service
│   │   ├── server.js
│   │   ├── routes/
│   │   │   └── auth.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   └── package.json
│   │
│   ├── product-service/       # Product Service
│   │   ├── server.js
│   │   ├── routes/
│   │   │   ├── products.js
│   │   │   └── categories.js
│   │   └── package.json
│   │
│   ├── cart-service/          # Cart Service
│   │   ├── server.js
│   │   ├── routes/
│   │   │   └── cart.js
│   │   └── package.json
│   │
│   └── order-service/         # Order Service
│       ├── server.js
│       ├── routes/
│       │   └── orders.js
│       └── package.json
│
├── shared/                    # Code dùng chung
│   ├── db.js                 # Database connection
│   ├── utils.js              # Utilities
│   └── config.js             # Config chung
│
└── public/                    # Frontend (không đổi)
    ├── index.html
    ├── styles.css
    └── app.js
```

---

## 🔧 TRIỂN KHAI TỪNG BƯỚC

### BƯỚC 1: Tạo cấu trúc thư mục

```bash
# Tạo các thư mục services
mkdir -p services/auth-service/routes
mkdir -p services/auth-service/middleware
mkdir -p services/product-service/routes
mkdir -p services/cart-service/routes
mkdir -p services/order-service/routes
mkdir -p gateway shared
```

### BƯỚC 2: Setup Auth Service

Tạo `services/auth-service/package.json`:

```json
{
  "name": "auth-service",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.15.3",
    "bcrypt": "^6.0.0",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.0.3"
  }
}
```

### BƯỚC 3: Setup các service khác tương tự

Mỗi service có `package.json` riêng, độc lập.

---

## 💻 CODE MẪU

### 1. API Gateway - `gateway/server.js`

```javascript
const express = require('express');
const axios = require('axios');
const app = express();

const SERVICES = {
    auth: 'http://localhost:5001',
    product: 'http://localhost:5002',
    cart: 'http://localhost:5003',
    order: 'http://localhost:5004'
};

app.use(express.json());

// Middleware: Verify token với Auth Service
async function verifyToken(req, res, next) {
    // Bỏ qua các route công khai
    const publicRoutes = ['/api/register', '/api/login', '/api/products', '/api/categories'];
    if (publicRoutes.some(route => req.path.startsWith(route))) {
        return next();
    }

    const token = req.headers['authorization']?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Không có token' });
    }

    try {
        // Gọi Auth Service để verify token
        const response = await axios.post(`${SERVICES.auth}/verify-token`, { token });
        req.user = response.data.user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token không hợp lệ' });
    }
}

app.use(verifyToken);

// Route: Auth endpoints → Auth Service
app.use('/api/register', async (req, res) => {
    try {
        const response = await axios.post(`${SERVICES.auth}/register`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'Lỗi server' });
    }
});

app.use('/api/login', async (req, res) => {
    try {
        const response = await axios.post(`${SERVICES.auth}/login`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'Lỗi server' });
    }
});

app.use('/api/me', async (req, res) => {
    try {
        const response = await axios.get(`${SERVICES.auth}/me`, {
            headers: { 'Authorization': `Bearer ${req.headers['authorization']?.replace('Bearer ', '')}` }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'Lỗi server' });
    }
});

// Route: Product endpoints → Product Service
app.use('/api/products', async (req, res) => {
    try {
        const url = `${SERVICES.product}/products${req.url}`;
        const method = req.method.toLowerCase();
        const config = {
            method,
            url,
            ...(method !== 'get' && { data: req.body }),
            headers: req.headers
        };
        const response = await axios(config);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'Lỗi server' });
    }
});

app.use('/api/categories', async (req, res) => {
    try {
        const url = `${SERVICES.product}/categories${req.url}`;
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'Lỗi server' });
    }
});

// Route: Cart endpoints → Cart Service
app.use('/api/cart', async (req, res) => {
    try {
        const url = `${SERVICES.cart}/cart${req.url}`;
        const method = req.method.toLowerCase();
        const config = {
            method,
            url,
            ...(method !== 'get' && { data: req.body }),
            headers: req.headers
        };
        const response = await axios(config);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'Lỗi server' });
    }
});

// Route: Order endpoints → Order Service
app.use('/api/orders', async (req, res) => {
    try {
        const url = `${SERVICES.order}/orders${req.url}`;
        const method = req.method.toLowerCase();
        const config = {
            method,
            url,
            ...(method !== 'get' && { data: req.body }),
            headers: req.headers
        };
        const response = await axios(config);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'Lỗi server' });
    }
});

// Serve static files (Frontend)
app.use(express.static('public'));

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 API Gateway đang chạy tại http://localhost:${PORT}`);
});
```

### 2. Auth Service - `services/auth-service/server.js`

```javascript
const express = require('express');
const authRouter = require('./routes/auth');
const app = express();

app.use(express.json());

// Routes
app.use('/', authRouter);

// Internal endpoint: Verify token (chỉ cho Gateway gọi)
app.post('/verify-token', async (req, res) => {
    const { token } = req.body;
    // Logic verify token
    // ... (code từ middleware/auth.js)
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`🔐 Auth Service đang chạy tại http://localhost:${PORT}`);
});
```

### 3. Product Service - `services/product-service/server.js`

```javascript
const express = require('express');
const productRouter = require('./routes/products');
const categoryRouter = require('./routes/categories');
const app = express();

app.use(express.json());

// Routes
app.use('/products', productRouter);
app.use('/categories', categoryRouter);

const PORT = 5002;
app.listen(PORT, () => {
    console.log(`📦 Product Service đang chạy tại http://localhost:${PORT}`);
});
```

---

## 🔄 SERVICE COMMUNICATION

### 1. Synchronous (HTTP/REST)
- Gateway ↔ Services: HTTP requests
- Service ↔ Service: HTTP requests (khi cần)

### 2. Asynchronous (Message Queue) - Tùy chọn nâng cao
- Sử dụng RabbitMQ, Redis, hoặc Kafka
- Phù hợp cho: Order processing, Notifications

### Ví dụ: Order Service gọi Cart Service

```javascript
// services/order-service/routes/orders.js
const axios = require('axios');

router.post('/', async (req, res) => {
    const userId = req.user.id;
    
    // Gọi Cart Service để lấy giỏ hàng
    try {
        const cartResponse = await axios.get('http://localhost:5003/cart', {
            headers: { 'Authorization': req.headers['authorization'] }
        });
        
        const cart = cartResponse.data.cart;
        // Tạo order từ cart...
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi khi lấy giỏ hàng' });
    }
});
```

---

## 📦 DEPLOYMENT

### Option 1: Chạy riêng lẻ (Development)

```bash
# Terminal 1: Gateway
cd gateway && npm start

# Terminal 2: Auth Service
cd services/auth-service && npm start

# Terminal 3: Product Service
cd services/product-service && npm start

# Terminal 4: Cart Service
cd services/cart-service && npm start

# Terminal 5: Order Service
cd services/order-service && npm start
```

### Option 2: Docker Compose (Production-ready)

Tạo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  gateway:
    build: ./gateway
    ports:
      - "5000:5000"
    depends_on:
      - auth-service
      - product-service
      - cart-service
      - order-service

  auth-service:
    build: ./services/auth-service
    ports:
      - "5001:5001"
    environment:
      - DB_HOST=mysql
      - JWT_SECRET=your_secret

  product-service:
    build: ./services/product-service
    ports:
      - "5002:5002"

  cart-service:
    build: ./services/cart-service
    ports:
      - "5003:5003"

  order-service:
    build: ./services/order-service
    ports:
      - "5004:5004"

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: tttn2025
    ports:
      - "3306:3306"
```

---

## 🎯 CÁC BƯỚC MIGRATION TỪ MONOLITH

### Bước 1: Tách Auth Service
1. Copy `routes/auth.js` → `services/auth-service/`
2. Tạo `server.js` riêng
3. Test độc lập

### Bước 2: Tạo Gateway
1. Setup API Gateway
2. Route `/api/auth/*` → Auth Service
3. Giữ nguyên các route khác trong monolith

### Bước 3: Tách từng service một
1. Product Service
2. Cart Service
3. Order Service

### Bước 4: Update Gateway
1. Route tất cả requests qua Gateway
2. Remove code từ monolith

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Database Strategy
**Option A: Shared Database** (Dễ implement)
- Tất cả services dùng chung 1 database
- ⚠️ Vi phạm nguyên tắc microservices (tight coupling)

**Option B: Database per Service** (Đúng chuẩn)
- Mỗi service có database riêng
- ✅ Độc lập hoàn toàn
- ⚠️ Khó sync dữ liệu

**Đề xuất cho TTTN2025**: Dùng Shared Database (đơn giản hơn cho đồ án)

### 2. Service Discovery
- Development: Hard-code URLs
- Production: Dùng Consul, Eureka, hoặc Kubernetes Service Discovery

### 3. Monitoring & Logging
- Logging: Mỗi service log riêng
- Monitoring: Prometheus + Grafana
- Tracing: Jaeger (distributed tracing)

---

## 🚀 NEXT STEPS

1. **Bắt đầu nhỏ**: Tách Auth Service trước
2. **Test kỹ**: Đảm bảo mỗi service hoạt động độc lập
3. **Dùng Gateway**: Tập trung routing và auth
4. **Dần dần**: Tách các service còn lại

---

## 📚 TÀI LIỆU THAM KHẢO

- [Microservices Patterns - Chris Richardson](https://microservices.io/patterns/)
- [Node.js Microservices](https://www.nodejs-microservices.com/)
- [Docker & Docker Compose](https://docs.docker.com/)

---

**Bạn muốn tôi tạo code cụ thể cho service nào trước?**


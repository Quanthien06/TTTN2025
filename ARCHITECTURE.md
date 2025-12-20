# 🏗️ Kiến Trúc Dự Án TTTN2025

## 📋 Tổng Quan

Dự án hiện tại đang sử dụng **kiến trúc Microservices** với API Gateway làm điểm vào chính.

## ⚠️ Vấn Đề Hiện Tại

### 1. **Có 2 Bộ Code Song Song (Gây Nhầm Lẫn)**

```
❌ VẤN ĐỀ:
├── server.js (root)          ← Monolithic architecture (KHÔNG DÙNG)
├── routes/ (root)            ← Routes cho monolithic (KHÔNG DÙNG)
│
└── gateway/server.js         ← Microservices Gateway (ĐANG DÙNG)
    └── services/             ← Microservices (ĐANG DÙNG)
        ├── auth-service/
        ├── product-service/
        ├── cart-service/
        ├── order-service/
        └── news-service/
```

**Hệ quả:**
- Không rõ file nào đang được sử dụng
- Dễ nhầm lẫn khi maintain code
- Tốn dung lượng và gây rối

### 2. **Cấu Trúc Thư Mục Chưa Rõ Ràng**

```
❌ HIỆN TẠI:
├── direction/          ← 17 file .md hướng dẫn (quá nhiều, rải rác)
├── docs/               ← Documentation chính thức
├── database/           ← Scripts migration/seed (OK)
├── scripts/            ← Utility scripts (OK)
└── config/             ← Config files (OK)
```

**Vấn đề:** Documentation bị phân tán giữa `direction/` và `docs/`

### 3. **File Code Tham Khảo Còn Lại**

```
routes/
├── cart_code_thamkhao.txt    ← File tham khảo (nên xóa)
└── order_code_mau.txt         ← File mẫu (nên xóa)
```

## ✅ Kiến Trúc Đang Sử Dụng (Microservices)

### Cấu Trúc Hiện Tại

```
✅ ĐANG DÙNG:
gateway/
└── server.js              ← API Gateway (port 5000)
    ├── Routes đến services
    ├── Authentication middleware
    └── Static file serving

services/
├── auth-service/          ← Port 5001
│   ├── server.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── users.js
│   └── utils/
│       └── email.js
│
├── product-service/       ← Port 5002
│   ├── server.js
│   └── routes/
│       ├── products.js
│       └── categories.js
│
├── cart-service/          ← Port 5003
│   ├── server.js
│   └── routes/
│       └── cart.js
│
├── order-service/         ← Port 5004
│   ├── server.js
│   └── routes/
│       └── orders.js
│
└── news-service/          ← Port 5005
    ├── server.js
    └── routes/
        └── news.js
```

### Luồng Request

```
Client Request
    ↓
API Gateway (gateway/server.js)
    ├── Verify Token (nếu cần)
    ├── Route đến service tương ứng
    └── Return response
```

## 🎯 Đề Xuất Cải Thiện

### 1. **Xóa Code Monolithic Cũ**

```bash
# Các file nên xóa hoặc di chuyển:
- server.js (root)          → XÓA (không dùng)
- routes/ (root)            → XÓA (không dùng, đã có trong services/)
- middleware/ (root)        → GIỮ LẠI (gateway có thể dùng)
```

### 2. **Tổ Chức Lại Documentation**

```
✅ ĐỀ XUẤT:
docs/
├── README.md                    ← Index chính
├── architecture.md             ← Kiến trúc hệ thống (file này)
├── setup/
│   ├── docker.md
│   ├── oauth-email.md
│   └── deployment.md
├── guides/
│   ├── admin.md
│   ├── payment.md
│   └── shipment.md
└── api/
    └── (API documentation)

# Di chuyển direction/*.md vào docs/guides/ hoặc docs/setup/
```

### 3. **Tạo File Hướng Dẫn Rõ Ràng**

```
✅ NÊN CÓ:
├── README.md                    ← Quick start
├── ARCHITECTURE.md              ← File này
├── CONTRIBUTING.md              ← Hướng dẫn contribute
└── docs/
    └── README.md                ← Documentation index
```

### 4. **Tổ Chức Config**

```
✅ ĐỀ XUẤT:
config/
├── email.js                     ← Email config
├── database.js                  ← DB connection config
├── jwt.js                       ← JWT config
└── services.js                  ← Service URLs config
```

### 5. **Tách Biệt Environment**

```
✅ NÊN CÓ:
.env.example                     ← Template cho .env
.env.local                       ← Local development
.env.production                  ← Production (không commit)
```

## 📊 So Sánh: Trước vs Sau

### ❌ Trước (Hiện Tại)

```
├── server.js                    ← Không rõ dùng hay không
├── routes/                      ← Trùng với services/
├── gateway/server.js            ← Đang dùng
├── services/                    ← Đang dùng
├── direction/                   ← 17 file .md rải rác
└── docs/                        ← Documentation chính thức
```

### ✅ Sau (Đề Xuất)

```
├── gateway/                     ← API Gateway
│   └── server.js
├── services/                    ← Microservices
│   ├── auth-service/
│   ├── product-service/
│   ├── cart-service/
│   ├── order-service/
│   └── news-service/
├── config/                      ← Config files
├── middleware/                  ← Shared middleware
├── database/                    ← Migration/seed scripts
├── scripts/                     ← Utility scripts
├── docs/                        ← Tất cả documentation
│   ├── README.md
│   ├── architecture.md
│   ├── setup/
│   ├── guides/
│   └── api/
├── public/                      ← Frontend static files
├── .env.example                 ← Environment template
├── docker-compose.yml
└── README.md                    ← Quick start
```

## 🚀 Hành Động Khuyến Nghị

### Ưu Tiên Cao

1. ✅ **Xóa `server.js` (root)** - Không còn dùng
2. ✅ **Xóa `routes/` (root)** - Đã có trong services/
3. ✅ **Xóa file tham khảo** - `cart_code_thamkhao.txt`, `order_code_mau.txt`
4. ✅ **Tổ chức lại docs/** - Gộp `direction/` vào `docs/`

### Ưu Tiên Trung Bình

5. ⚠️ **Tạo `.env.example`** - Template cho environment variables
6. ⚠️ **Tổ chức lại `config/`** - Tách các config ra file riêng
7. ⚠️ **Cập nhật README.md** - Làm rõ kiến trúc đang dùng

### Ưu Tiên Thấp

8. 💡 **Tạo CONTRIBUTING.md** - Hướng dẫn contribute
9. 💡 **Tạo CHANGELOG.md** - Theo dõi thay đổi
10. 💡 **Thêm code comments** - Giải thích các phần phức tạp

## 📝 Checklist Cải Thiện

- [ ] Xóa `server.js` (root)
- [ ] Xóa `routes/` (root) 
- [ ] Xóa file tham khảo trong `routes/`
- [ ] Di chuyển `direction/*.md` vào `docs/`
- [ ] Tạo `.env.example`
- [ ] Cập nhật `README.md` với kiến trúc rõ ràng
- [ ] Tạo `ARCHITECTURE.md` (file này)
- [ ] Review và clean up code comments

## 🎓 Kết Luận

**Điểm Mạnh:**
- ✅ Đã có kiến trúc microservices rõ ràng
- ✅ Tách biệt services tốt
- ✅ Có Docker support

**Điểm Yếu:**
- ❌ Có code cũ (monolithic) còn sót lại
- ❌ Documentation phân tán
- ❌ Không rõ file nào đang được dùng

**Khuyến Nghị:**
1. **Ngay lập tức:** Xóa code monolithic cũ
2. **Ngắn hạn:** Tổ chức lại documentation
3. **Dài hạn:** Cải thiện code structure và comments

---

**Cập nhật lần cuối:** $(date)
**Phiên bản:** 1.0


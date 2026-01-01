# 📚 Giải Thích Middleware trong Gateway Server

## 1. `express.json()` Middleware

### Mục đích
Parse JSON từ request body thành JavaScript object.

### Cách hoạt động
```javascript
// Client gửi request:
POST /api/orders
Content-Type: application/json
Body: {"product_id": 123, "quantity": 2}

// Middleware express.json() tự động:
1. Đọc Content-Type header
2. Parse JSON string → JavaScript object
3. Gắn vào req.body

// Kết quả:
req.body = {
    product_id: 123,
    quantity: 2
}
```

### Ví dụ sử dụng
```javascript
// Trong route handler:
app.post('/api/orders', (req, res) => {
    // req.body đã được parse sẵn, không cần JSON.parse()
    const productId = req.body.product_id;  // ✅ Hoạt động
    const quantity = req.body.quantity;      // ✅ Hoạt động
});
```

### Lưu ý
- **Chỉ parse JSON**: Nếu Content-Type không phải `application/json`, middleware sẽ bỏ qua
- **Giới hạn kích thước**: Mặc định tối đa 100kb (có thể config)
- **Lỗi nếu JSON invalid**: Sẽ throw error nếu JSON không hợp lệ

---

## 2. Custom Middleware - Prevent Caching

### Mục đích
**Tắt cache cho HTML, CSS, JS files trong development** để đảm bảo browser luôn tải file mới nhất khi code thay đổi.

### Tại sao cần?
**Vấn đề trong development:**
```
1. Developer sửa file index.html
2. Browser đã cache file cũ
3. Refresh trang → Vẫn thấy file cũ (từ cache)
4. Phải hard refresh (Ctrl+F5) mới thấy thay đổi
```

**Giải pháp:**
- Set headers để browser không cache
- Mỗi request đều tải file mới từ server

### Phân tích từng dòng

#### Dòng 29: Điều kiện kiểm tra
```javascript
if (req.path.endsWith('.html') || 
    req.path.endsWith('.css') || 
    req.path.endsWith('.js') || 
    req.path === '/') {
```
**Giải thích:**
- Chỉ áp dụng cho các file: `.html`, `.css`, `.js` và route `/` (trang chủ)
- **Không áp dụng** cho: images (`.jpg`, `.png`), fonts, API endpoints

**Ví dụ:**
```javascript
// ✅ Áp dụng:
/                    → Áp dụng (trang chủ)
/index.html          → Áp dụng
/styles.css          → Áp dụng
/app.js              → Áp dụng

// ❌ Không áp dụng:
/api/products        → Không áp dụng (API endpoint)
/img/logo.png        → Không áp dụng (image)
/fonts/arial.woff2   → Không áp dụng (font)
```

#### Dòng 30: Cache-Control Header
```javascript
res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
```

**Giải thích từng directive:**

| Directive | Ý nghĩa | Tác dụng |
|-----------|---------|----------|
| `no-cache` | Không dùng cache trực tiếp | Browser phải kiểm tra với server trước khi dùng cache |
| `no-store` | Không lưu cache | Browser không được lưu file vào cache |
| `must-revalidate` | Phải validate lại | Khi cache hết hạn, phải kiểm tra lại với server |
| `max-age=0` | Hết hạn ngay | Cache hết hạn ngay lập tức (0 giây) |

**Kết quả:** Browser sẽ **luôn tải file mới** từ server, không dùng cache.

#### Dòng 31: Pragma Header (HTTP/1.0)
```javascript
res.setHeader('Pragma', 'no-cache');
```

**Giải thích:**
- Header cũ từ HTTP/1.0 (trước khi có Cache-Control)
- Tương đương `Cache-Control: no-cache`
- **Tại sao vẫn dùng?** Để tương thích với các browser/proxy cũ

#### Dòng 32: Expires Header (HTTP/1.0)
```javascript
res.setHeader('Expires', '0');
```

**Giải thích:**
- Header cũ từ HTTP/1.0
- `Expires: 0` = Hết hạn ngay lập tức (tương đương `max-age=0`)
- **Tại sao vẫn dùng?** Tương thích với HTTP/1.0 clients

#### Dòng 33: Last-Modified Header
```javascript
res.setHeader('Last-Modified', new Date().toUTCString());
```

**Giải thích:**
- Thời gian file được "sửa đổi" lần cuối
- **Luôn set = thời gian hiện tại** → Browser nghĩ file vừa mới sửa
- Format: `"Mon, 15 Jan 2025 10:30:00 GMT"`

**Ví dụ:**
```http
Last-Modified: Mon, 15 Jan 2025 10:30:00 GMT
```

#### Dòng 34: ETag Header
```javascript
res.setHeader('ETag', `"${Date.now()}"`);
```

**Giải thích:**
- ETag = "Entity Tag" - Mã định danh duy nhất cho version của file
- **Luôn thay đổi** (dùng `Date.now()`) → Browser nghĩ file luôn mới
- Format: `"1736928600000"` (timestamp)

**Ví dụ:**
```http
ETag: "1736928600000"
```

**Cách hoạt động:**
```
1. Browser request: GET /index.html
2. Server trả về: ETag: "1736928600000"
3. Browser lần sau request: GET /index.html
   Headers: If-None-Match: "1736928600000"
4. Server so sánh ETag mới (Date.now()) với ETag cũ
5. ETag khác nhau → Trả về file mới (200 OK)
```

#### Dòng 36: next()
```javascript
next();
```

**Giải thích:**
- Gọi middleware/route handler tiếp theo
- **Quan trọng:** Phải gọi `next()` để request tiếp tục, nếu không request sẽ bị "treo"

---

## 📊 So Sánh: Có vs Không có Middleware

### ❌ Không có middleware (Browser cache)
```
Request 1: GET /index.html
Response: 200 OK, Cache-Control: public, max-age=3600
Browser: Lưu vào cache

Request 2: GET /index.html (sau khi sửa file)
Browser: Dùng cache cũ → Không thấy thay đổi ❌
```

### ✅ Có middleware (No cache)
```
Request 1: GET /index.html
Response: 200 OK, Cache-Control: no-cache, no-store
Browser: Không lưu cache

Request 2: GET /index.html (sau khi sửa file)
Browser: Tải file mới từ server → Thấy thay đổi ngay ✅
```

---

## 🎯 Khi Nào Dùng?

### ✅ Nên dùng trong:
- **Development mode** (đang code, test)
- **Staging environment** (test trước khi deploy)
- **File thường xuyên thay đổi** (HTML, CSS, JS)

### ❌ Không nên dùng trong:
- **Production mode** (cần cache để tăng tốc độ)
- **Static assets ít thay đổi** (images, fonts)
- **API responses** (đã có cache riêng)

---

## 🔧 Cải Thiện: Chỉ áp dụng trong Development

```javascript
// Chỉ prevent cache trong development
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        if (req.path.endsWith('.html') || 
            req.path.endsWith('.css') || 
            req.path.endsWith('.js') || 
            req.path === '/') {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.setHeader('Last-Modified', new Date().toUTCString());
            res.setHeader('ETag', `"${Date.now()}"`);
        }
        next();
    });
}
```

**Lợi ích:**
- Development: Luôn thấy thay đổi mới nhất
- Production: Browser cache để tăng tốc độ

---

## 📝 Tóm Tắt

| Middleware | Mục đích | Khi nào chạy |
|------------|----------|-------------|
| `express.json()` | Parse JSON body | Mọi request có `Content-Type: application/json` |
| Prevent cache | Tắt browser cache | Request đến `.html`, `.css`, `.js`, `/` |

**Kết quả:**
- ✅ API có thể đọc JSON từ `req.body`
- ✅ Browser luôn tải file mới trong development
- ✅ Không cần hard refresh (Ctrl+F5)


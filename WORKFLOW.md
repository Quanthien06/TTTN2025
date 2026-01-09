# 📋 WORKFLOW TOÀN BỘ DỰ ÁN TTTN2025 (TechStore)

## 🎯 TỔNG QUAN DỰ ÁN

**TechStore** là một hệ thống thương mại điện tử (E-commerce) được xây dựng theo kiến trúc **Microservices**, phục vụ việc mua bán các sản phẩm công nghệ như điện thoại, laptop, phụ kiện, v.v.

### Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                         │
│  - HTML/CSS/JavaScript (SPA-style)                        │
│  - Tailwind CSS + Bootstrap 5                              │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP Requests
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              API GATEWAY (Port 5000)                        │
│  - gateway/server.js                                        │
│  - Xử lý routing, authentication, static files            │
└──────┬──────────┬──────────┬──────────┬──────────┬──────────┘
       │          │          │          │          │
       ↓          ↓          ↓          ↓          ↓
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  Auth    │ │ Product  │ │   Cart   │ │  Order   │ │  News    │
│ Service  │ │ Service  │ │ Service  │ │ Service  │ │ Service  │
│ :5001    │ │ :5002    │ │ :5003    │ │ :5004    │ │ :5005    │
└────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
     │            │            │            │            │
     └────────────┴────────────┴────────────┴────────────┘
                          │
                          ↓
              ┌───────────────────────┐
              │   MySQL Database      │
              │   (localhost:3306)    │
              │   Database: tttn2025  │
              └───────────────────────┘
```

---

## 💻 CHI TIẾT TRIỂN KHAI CODE

### 📁 Cấu Trúc File Chính

```
gateway/
  └── server.js          # API Gateway - Entry point, routing, auth middleware
services/
  ├── auth-service/
  │   ├── server.js      # Auth service entry point
  │   └── routes/
  │       ├── auth.js    # Routes: register, login, profile, forgot-password
  │       └── users.js   # Routes: user management (admin)
  ├── product-service/
  │   ├── server.js      # Product service entry point
  │   └── routes/
  │       ├── products.js    # Routes: CRUD products
  │       └── categories.js  # Routes: categories management
  ├── cart-service/
  │   ├── server.js      # Cart service entry point
  │   └── routes/
  │       └── cart.js    # Routes: cart operations
  ├── order-service/
  │   ├── server.js      # Order service entry point
  │   └── routes/
  │       ├── orders.js     # Routes: order management
  │       ├── coupons.js    # Routes: coupon management
  │       └── loyalty.js    # Routes: loyalty points
  └── news-service/
      ├── server.js      # News service entry point
      └── routes/
          └── news.js    # Routes: news management
```

### 🔧 Gateway Server (gateway/server.js)

**Chức năng chính:**
- Route requests đến các microservices
- Xác thực token với Auth Service
- Serve static files
- Xử lý một số endpoints trực tiếp (stats, comments, FAQs)

**Code chính:**

```javascript
// Cấu hình services
const SERVICES = {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
    product: process.env.PRODUCT_SERVICE_URL || 'http://localhost:5002',
    cart: process.env.CART_SERVICE_URL || 'http://localhost:5003',
    order: process.env.ORDER_SERVICE_URL || 'http://localhost:5004',
    news: process.env.NEWS_SERVICE_URL || 'http://localhost:5005'
};

// Middleware verify token
async function verifyToken(req, res, next) {
    // Bỏ qua static files
    if (!req.path.startsWith('/api')) {
        return next();
    }

    // Danh sách public routes (không cần token)
    const publicRoutes = [
        '/api/register',
        '/api/login',
        '/api/products',
        '/api/categories',
        '/api/news',
        '/api/forgot-password',
        '/api/reset-password',
        '/api/faqs'
    ];

    // Kiểm tra nếu route là public
    const isPublicRoute = publicRoutes.some(route => {
        if (req.path === route) return true;
        if (req.path.startsWith(route) && route.includes('/products')) return true;
        return false;
    });

    if (isPublicRoute) {
        return next();
    }

    // Lấy token từ header
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ 
            message: 'Không có token truy cập. Vui lòng đăng nhập.' 
        });
    }

    let token = authHeader.replace('Bearer ', '').trim();

    // Verify token với Auth Service
    try {
        const verifyUrl = `${SERVICES.auth}/verify-token`;
        const response = await axios.post(verifyUrl, { token }, { timeout: 8000 });
        req.user = response.data.user || response.data;
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Token không hợp lệ' });
        }
        next();
    } catch (error) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            return res.status(502).json({ message: 'Auth service không phản hồi' });
        }
        return res.status(401).json({ message: 'Token không hợp lệ' });
    }
}

// Apply middleware
app.use(verifyToken);

// Route đến Auth Service
app.post('/api/register', async (req, res) => {
    try {
        const response = await axios.post(`${SERVICES.auth}/register`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(
            error.response?.data || { message: 'Lỗi server' }
        );
    }
});

// Route đến Product Service
app.use('/api/products', async (req, res) => {
    try {
        const url = `${SERVICES.product}/products${req.url}`;
        const config = {
            method: req.method.toLowerCase(),
            url,
            headers: { 'Content-Type': 'application/json' },
            data: req.method !== 'GET' ? req.body : undefined
        };
        if (req.headers['authorization']) {
            config.headers['Authorization'] = req.headers['authorization'];
        }
        const response = await axios(config);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(
            error.response?.data || { message: 'Lỗi server' }
        );
    }
});
```

### 🔐 Auth Service (services/auth-service/)

**File: server.js**
```javascript
const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5001;
const JWT_SECRET = process.env.JWT_SECRET || '...';

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tttn2025'
});

// Lưu pool và config vào app.locals
app.locals.pool = pool;
app.locals.JWT_SECRET = JWT_SECRET;

// Routes
app.use('/', authRouter);
app.use('/users', usersRouter);

// Internal endpoint: Verify token (cho Gateway gọi)
app.post('/verify-token', async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(401).json({ message: 'Không có token' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const [rows] = await pool.query(
            'SELECT id, username, role FROM users WHERE id = ?',
            [decoded.id]
        );
        if (rows.length === 0) {
            return res.status(401).json({ message: 'User không tồn tại' });
        }
        res.json({ user: rows[0] });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Token đã hết hạn',
                error: 'TokenExpiredError'
            });
        }
        return res.status(401).json({ message: 'Token không hợp lệ' });
    }
});
```

**File: routes/auth.js - Đăng ký**
```javascript
// POST /register - Đăng ký
router.post('/register', async (req, res) => {
    const pool = req.app.locals.pool;
    
    try {
        const { username, password, role = 'user' } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username và password là bắt buộc' });
        }

        // Hash password với bcrypt (salt rounds = 10)
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert vào database
        const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
        await pool.query(sql, [username, hashedPassword, role]);

        res.status(201).json({ message: 'Đăng ký thành công! Vui lòng đăng nhập.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Username đã tồn tại' });
        }
        console.error('Lỗi khi đăng ký:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});
```

**File: routes/auth.js - Đăng nhập**
```javascript
// POST /login - Đăng nhập
router.post('/login', async (req, res) => {
    const pool = req.app.locals.pool;
    const JWT_SECRET = req.app.locals.JWT_SECRET;

    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username và password là bắt buộc' });
        }

        // Tìm user trong database
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Username hoặc password không đúng' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Username hoặc password không đúng' });
        }

        // Tạo JWT token (expires in 100 days)
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '100d' }
        );

        res.json({
            message: 'Đăng nhập thành công',
            token,
            user: { id: user.id, username: user.username, role: user.role }
        });
    } catch (error) {
        console.error('Lỗi khi đăng nhập:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});
```

**File: routes/auth.js - Quên mật khẩu (OTP)**
```javascript
// POST /forgot-password - Gửi mã OTP
router.post('/forgot-password', async (req, res) => {
    const pool = req.app.locals.pool;
    
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email là bắt buộc' });
        }

        // Tìm user theo email
        const [rows] = await pool.query('SELECT id, username, email FROM users WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            // Không trả về lỗi để tránh email enumeration
            return res.json({ 
                message: 'Nếu email tồn tại, mã OTP đã được gửi',
                sent: true 
            });
        }

        const user = rows[0];
        
        // Tạo mã OTP 6 chữ số
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

        // Lưu OTP vào database
        await pool.query(
            'UPDATE users SET otp_code = ?, otp_expires = ? WHERE id = ?',
            [otpCode, otpExpires, user.id]
        );

        // Gửi email với mã OTP
        await sendOTPEmail(email, otpCode, user.username);

        res.json({ 
            message: 'Mã OTP đã được gửi đến email của bạn',
            sent: true
        });
    } catch (error) {
        console.error('Lỗi khi gửi mã OTP:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// POST /reset-password - Đặt lại mật khẩu với OTP
router.post('/reset-password', async (req, res) => {
    const pool = req.app.locals.pool;
    
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Email, OTP và mật khẩu mới là bắt buộc' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
        }

        // Tìm user và kiểm tra OTP
        const [rows] = await pool.query(
            'SELECT id, otp_code, otp_expires FROM users WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Email không tồn tại' });
        }

        const user = rows[0];

        if (!user.otp_code || user.otp_code !== otp) {
            return res.status(401).json({ message: 'Mã OTP không đúng' });
        }

        if (!user.otp_expires || new Date(user.otp_expires) < new Date()) {
            return res.status(401).json({ message: 'Mã OTP đã hết hạn' });
        }

        // Hash mật khẩu mới và cập nhật
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query(
            'UPDATE users SET password = ?, otp_code = NULL, otp_expires = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );

        res.json({ message: 'Đặt lại mật khẩu thành công' });
    } catch (error) {
        console.error('Lỗi khi đặt lại mật khẩu:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});
```

### 🛒 Cart Service (services/cart-service/)

**File: routes/cart.js - Thêm sản phẩm vào giỏ**
```javascript
// POST /cart/items - Thêm sản phẩm
router.post('/items', async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id; // Từ verifyToken middleware
    const productId = req.body.product_id || req.body.productId;
    const { quantity } = req.body;

    try {
        if (!productId || quantity == null) {
            return res.status(400).json({ message: 'product_id và quantity hợp lệ là bắt buộc' });
        }

        if (quantity <= 0) {
            return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
        }

        // Kiểm tra sản phẩm tồn tại
        const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
        if (products.length === 0) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        const product = products[0];
        const productPrice = parseFloat(product.price);

        // Lấy hoặc tạo cart
        const cartId = await getOrCreateCart(pool, userId);
        
        // Kiểm tra item đã có trong cart chưa
        const [existingItems] = await pool.query(
            'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
            [cartId, productId]
        );
        
        if (existingItems.length > 0) {
            // Cập nhật quantity
            const newQuantity = existingItems[0].quantity + quantity;
            await pool.query(
                'UPDATE cart_items SET quantity = ?, price = ? WHERE id = ?',
                [newQuantity, productPrice, existingItems[0].id]
            );
            res.json({ message: 'Đã cập nhật số lượng sản phẩm trong giỏ hàng' });
        } else {
            // Thêm mới
            await pool.query(
                'INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [cartId, productId, quantity, productPrice]
            );
            res.status(201).json({ message: 'Đã thêm sản phẩm vào giỏ hàng' });
        }
    } catch (error) {
        console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});
```

**File: routes/cart.js - Xem giỏ hàng**
```javascript
// GET /cart - Lấy giỏ hàng
router.get('/', async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;

    try {
        const cartId = await getOrCreateCart(pool, userId);

        // Lấy cart items với thông tin sản phẩm
        const [items] = await pool.query(
            `SELECT 
                ci.id,
                ci.cart_id,
                ci.product_id,
                ci.quantity,
                ci.price,
                p.name as product_name,
                p.slug as product_slug,
                p.category as product_category,
                p.main_image_url as product_main_image_url,
                (ci.price * ci.quantity) as subtotal
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = ?
            ORDER BY ci.created_at DESC`,
            [cartId]
        );

        // Tính tổng tiền
        const [totalRows] = await pool.query(
            'SELECT SUM(price * quantity) as total FROM cart_items WHERE cart_id = ?',
            [cartId]
        );

        const total = (totalRows[0] && totalRows[0].total) ? totalRows[0].total : 0;

        res.json({
            cart: {
                id: cartId,
                user_id: userId,
                items: items.map(item => ({
                    ...item,
                    price: parseFloat(item.price),
                    subtotal: parseFloat(item.subtotal)
                })),
                total: parseFloat(total),
                item_count: items.length
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy giỏ hàng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});
```

### 📦 Order Service (services/order-service/)

**File: routes/orders.js - Tạo đơn hàng**
```javascript
// POST /orders - Tạo đơn hàng từ cart
router.post('/', async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    const { shipping_address, phone, payment_method, coupon_code, use_loyalty_points } = req.body;
    const CART_SERVICE_URL = req.app.locals.CART_SERVICE_URL;

    try {
        // 1. Lấy cart items từ Cart Service
        const cartResponse = await axios.get(`${CART_SERVICE_URL}/cart`, {
            headers: { 'Authorization': req.headers['authorization'] }
        });
        const cartData = cartResponse.data.cart;

        if (!cartData.items || cartData.items.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng không có sản phẩm' });
        }

        let subtotal = parseFloat(cartData.total || 0);
        let discountAmount = 0;
        let loyaltyDiscount = 0;
        let finalTotal = subtotal;

        // 2. Áp dụng coupon nếu có
        if (coupon_code && coupon_code.trim()) {
            const couponResponse = await axios.post(`${baseUrl}/coupons/validate`, {
                code: coupon_code,
                total_amount: subtotal
            });
            if (couponResponse.data.valid) {
                discountAmount = couponResponse.data.coupon.discount_amount;
                finalTotal = subtotal - discountAmount;
            }
        }

        // 3. Áp dụng loyalty points nếu có
        if (use_loyalty_points && use_loyalty_points > 0) {
            const [userPoints] = await pool.query(
                'SELECT balance FROM loyalty_points WHERE user_id = ?',
                [userId]
            );
            if (userPoints.length > 0 && userPoints[0].balance >= use_loyalty_points) {
                loyaltyDiscount = use_loyalty_points * 1000; // 1 point = 1000 VNĐ
                finalTotal = Math.max(0, finalTotal - loyaltyDiscount);
            }
        }

        // 4. Tạo đơn hàng
        const [orderResult] = await pool.query(
            'INSERT INTO orders (user_id, total, shipping_address, shipping_phone, status) VALUES (?, ?, ?, ?, ?)',
            [userId, finalTotal, shipping_address, phone || null, 'pending']
        );
        const orderId = orderResult.insertId;

        // 5. Tạo order_items từ cart items
        for (const item of cartData.items) {
            await pool.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );
        }

        // 6. Trừ loyalty points nếu dùng
        if (use_loyalty_points && use_loyalty_points > 0) {
            await pool.query(
                'UPDATE loyalty_points SET balance = balance - ? WHERE user_id = ?',
                [use_loyalty_points, userId]
            );
        }

        // 7. Tích điểm (1 point per 10,000 VNĐ)
        await earnPoints(pool, userId, orderId, finalTotal);

        // 8. Xóa cart items
        const [carts] = await pool.query(
            'SELECT id FROM carts WHERE user_id = ? AND status = ?',
            [userId, 'active']
        );
        if (carts.length > 0) {
            const cartId = carts[0].id;
            await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
            await pool.query('UPDATE carts SET status = ? WHERE id = ?', ['completed', cartId]);
        }

        res.status(201).json({
            message: 'Đặt hàng thành công',
            order: { id: orderId, total: finalTotal, ... }
        });
    } catch (error) {
        console.error('Lỗi khi tạo đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});
```

### 📦 Product Service (services/product-service/)

**File: routes/products.js - Lấy danh sách sản phẩm với filter**
```javascript
// GET /products - Lấy danh sách sản phẩm (với search, filter, sort, pagination)
router.get('/', async (req, res) => {
    const pool = req.app.locals.pool;

    try {
        const {
            q, category, minPrice, maxPrice,
            sort = 'id', order = 'asc',
            page = 1, limit = 20
        } = req.query;

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const offset = (pageNum - 1) * limitNum;

        // Build WHERE conditions
        let whereConditions = [];
        let queryParams = [];

        if (q && q.trim() !== '') {
            whereConditions.push('(slug = ? OR name LIKE ? OR description LIKE ? OR category LIKE ?)');
            const searchTerm = `%${q.trim()}%`;
            queryParams.push(q.trim(), searchTerm, searchTerm, searchTerm);
        }

        if (category && category.trim() !== '') {
            whereConditions.push('category = ?');
            queryParams.push(category.trim());
        }

        if (minPrice) {
            const min = parseFloat(minPrice);
            if (!isNaN(min)) {
                whereConditions.push('price >= ?');
                queryParams.push(min);
            }
        }

        if (maxPrice) {
            const max = parseFloat(maxPrice);
            if (!isNaN(max)) {
                whereConditions.push('price <= ?');
                queryParams.push(max);
            }
        }

        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}` 
            : '';

        // Count total
        const countQuery = `SELECT COUNT(*) as total FROM products ${whereClause}`;
        const [countRows] = await pool.query(countQuery, queryParams);
        const total = countRows[0].total;

        // Get data
        const dataQuery = `
            SELECT * FROM products 
            ${whereClause}
            ORDER BY ${sort} ${order}
            LIMIT ? OFFSET ?
        `;
        queryParams.push(limitNum, offset);
        const [rows] = await pool.query(dataQuery, queryParams);

        res.json({
            products: rows.map(p => ({
                ...p,
                price: parseFloat(p.price)
            })),
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});
```

### 🔑 Middleware Authentication

**File: middleware/auth.js**
```javascript
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ 
            message: 'Không có token truy cập' 
        });
    }

    let token = authHeader.replace('Bearer ', '').trim();
    
    const JWT_SECRET = req.app.locals.JWT_SECRET;
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(403).json({ 
                    message: 'Token đã hết hạn',
                    error: 'TokenExpiredError'
                });
            }
            return res.status(403).json({ 
                message: 'Token không hợp lệ',
                error: 'JsonWebTokenError'
            });
        }
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
```

### 🗄️ Database Connection

**Tất cả services sử dụng connection pool:**
```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tttn2025',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Sử dụng trong routes
const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
```

---

## 🔄 WORKFLOW CHI TIẾT THEO TỪNG MODULE

### 1. 🔐 WORKFLOW XÁC THỰC (Authentication)

#### 1.1. Đăng Ký Tài Khoản

**Flow:**
```
User → Frontend (register.html)
  ↓
  Nhập: username, email, password
  ↓
POST /api/register
  ↓
Gateway → Auth Service (:5001)
  ↓
Auth Service:
  - Validate dữ liệu
  - Hash password (bcrypt)
  - Kiểm tra username/email đã tồn tại
  - Tạo user trong DB (users table)
  ↓
Response: { message: "Đăng ký thành công! Vui lòng đăng nhập." }
  ↓
Frontend:
  - Hiển thị thông báo thành công
  - Redirect đến trang đăng nhập
```

**Code Implementation:**

**Frontend (register.html):**
```javascript
// Gửi request đăng ký
async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            window.location.href = '/login.html';
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Lỗi:', error);
    }
}
```

**Gateway (gateway/server.js):**
```javascript
app.post('/api/register', async (req, res) => {
    try {
        // Forward request đến Auth Service
        const response = await axios.post(`${SERVICES.auth}/register`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(
            error.response?.data || { message: 'Lỗi server' }
        );
    }
});
```

**Auth Service (services/auth-service/routes/auth.js):**
```javascript
router.post('/register', async (req, res) => {
    const pool = req.app.locals.pool;
    
    try {
        const { username, password, role = 'user' } = req.body;

        // Validate
        if (!username || !password) {
            return res.status(400).json({ 
                message: 'Username và password là bắt buộc' 
            });
        }

        // Hash password với bcrypt (salt rounds = 10)
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert vào database
        const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
        await pool.query(sql, [username, hashedPassword, role]);

        res.status(201).json({ 
            message: 'Đăng ký thành công! Vui lòng đăng nhập.' 
        });
    } catch (error) {
        // Xử lý lỗi duplicate entry
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ 
                message: 'Username đã tồn tại' 
            });
        }
        console.error('Lỗi khi đăng ký:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});
```

#### 1.2. Đăng Nhập

**Flow:**
```
User → Frontend (login.html hoặc modal)
  ↓
  Nhập: username/email, password
  ↓
POST /api/login
  ↓
Gateway → Auth Service (:5001)
  ↓
Auth Service:
  - Tìm user theo username/email
  - Verify password (bcrypt.compare)
  - Tạo JWT token (expires in 100d)
  ↓
Response: { token, user: { id, username, email, role } }
  ↓
Frontend:
  - Lưu token vào localStorage
  - Lưu user_info vào localStorage
  - Nếu role=admin → redirect /admin.html
  - Nếu role=user → redirect trang chủ
```

**Code Implementation:**

**Frontend (login.html):**
```javascript
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        if (response.ok) {
            // Lưu token và user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user_info', JSON.stringify(data.user));
            
            // Redirect theo role
            if (data.user.role === 'admin') {
                window.location.href = '/admin.html';
            } else {
                window.location.href = '/';
            }
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Lỗi:', error);
    }
}
```

**Auth Service (services/auth-service/routes/auth.js):**
```javascript
router.post('/login', async (req, res) => {
    const pool = req.app.locals.pool;
    const JWT_SECRET = req.app.locals.JWT_SECRET;

    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 
                message: 'Username và password là bắt buộc' 
            });
        }

        // Tìm user trong database
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE username = ?', 
            [username]
        );
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ 
                message: 'Username hoặc password không đúng' 
            });
        }

        // Verify password với bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: 'Username hoặc password không đúng' 
            });
        }

        // Tạo JWT token (expires in 100 days)
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '100d' }
        );

        res.json({
            message: 'Đăng nhập thành công',
            token,
            user: { 
                id: user.id, 
                username: user.username, 
                role: user.role 
            }
        });
    } catch (error) {
        console.error('Lỗi khi đăng nhập:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});
```

#### 1.3. Xác Thực Token (Mỗi Request)

**Flow:**
```
Client Request với Header: Authorization: Bearer <token>
  ↓
Gateway Middleware (verifyToken):
  - Kiểm tra route có trong publicRoutes?
    ├─ YES → Cho phép tiếp tục
    └─ NO → Kiểm tra token
         ↓
         POST /api/verify-token → Auth Service
         ↓
         Auth Service:
           - Verify JWT signature
           - Kiểm tra expiration
           - Trả về user info
         ↓
         Gateway:
           - Gắn req.user = { id, username, role }
           - Cho phép tiếp tục
```

**Code Implementation:**

**Gateway (gateway/server.js):**
```javascript
// Middleware: Verify token với Auth Service
async function verifyToken(req, res, next) {
    // Bỏ qua các file static
    if (!req.path.startsWith('/api')) {
        return next();
    }

    // Danh sách các route công khai (không cần token)
    const publicRoutes = [
        '/api/register',
        '/api/login',
        '/api/products',
        '/api/categories',
        '/api/news',
        '/api/forgot-password',
        '/api/reset-password',
        '/api/faqs'
    ];

    // Kiểm tra nếu route là public
    const isPublicRoute = publicRoutes.some(route => {
        if (req.path === route) return true;
        if (req.path.startsWith(route) && route.includes('/products')) return true;
        return false;
    });

    if (isPublicRoute) {
        return next();
    }

    // Lấy token từ header
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ 
            message: 'Không có token truy cập. Vui lòng đăng nhập.' 
        });
    }

    let token = authHeader.replace('Bearer ', '').trim();

    // Verify token với Auth Service
    try {
        const verifyUrl = `${SERVICES.auth}/verify-token`;
        const response = await axios.post(verifyUrl, { token }, { timeout: 8000 });
        req.user = response.data.user || response.data;
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Token không hợp lệ' });
        }
        next();
    } catch (error) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            return res.status(502).json({ 
                message: 'Auth service không phản hồi' 
            });
        }
        return res.status(401).json({ message: 'Token không hợp lệ' });
    }
}

// Apply middleware cho tất cả routes
app.use(verifyToken);
```

**Auth Service (services/auth-service/server.js):**
```javascript
// Internal endpoint: Verify token (cho Gateway gọi)
app.post('/verify-token', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(401).json({ message: 'Không có token' });
    }

    try {
        // Verify JWT signature và expiration
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Lấy thông tin user từ database
        const [rows] = await pool.query(
            'SELECT id, username, role FROM users WHERE id = ?',
            [decoded.id]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'User không tồn tại' });
        }

        res.json({ user: rows[0] });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Token đã hết hạn',
                error: 'TokenExpiredError'
            });
        }
        return res.status(401).json({ 
            message: 'Token không hợp lệ',
            error: 'InvalidToken'
        });
    }
});
```

#### 1.4. Quên Mật Khẩu (Forgot Password)

```
User → Frontend (forgot-password.html)
  ↓
  Nhập email
  ↓
POST /api/forgot-password
  ↓
Gateway → Auth Service (:5001)
  ↓
Auth Service:
  - Tìm user theo email
  - Tạo mã OTP (6 số, expires 10 phút)
  - Lưu OTP vào DB (users.otp_code, users.otp_expires)
  - Gửi email OTP qua SMTP (Gmail)
  ↓
Response: { message: "Mã OTP đã được gửi đến email" }
  ↓
User nhận email → Nhập OTP
  ↓
POST /api/reset-password
  ↓
Auth Service:
  - Verify OTP và expiration
  - Hash password mới
  - Cập nhật password trong DB
  - Xóa OTP
  ↓
Response: { message: "Đặt lại mật khẩu thành công" }
```

#### 1.5. OAuth2 Google Login

```
User → Click "Đăng nhập với Google"
  ↓
GET /api/auth/google
  ↓
Gateway → Auth Service (:5001)
  ↓
Auth Service:
  - Redirect đến Google OAuth consent screen
  ↓
User xác thực với Google
  ↓
Google Callback → GET /api/auth/google/callback?code=...
  ↓
Auth Service:
  - Exchange code lấy access_token
  - Lấy user info từ Google API
  - Kiểm tra google_id trong DB
    ├─ Tồn tại → Tạo JWT và đăng nhập
    └─ Chưa tồn tại → Tạo user mới → Tạo JWT
  ↓
Response: Redirect với token trong URL
  ↓
Frontend:
  - Extract token từ URL
  - Lưu vào localStorage
  - Redirect trang chủ/admin
```

---

### 2. 📦 WORKFLOW SẢN PHẨM (Products)

#### 2.1. Xem Danh Sách Sản Phẩm (Public)

```
User → Frontend (index.html hoặc products page)
  ↓
GET /api/products?category=laptop&minPrice=10000000&maxPrice=30000000&sort=price_asc&page=1
  ↓
Gateway → Product Service (:5002)
  ↓
Product Service:
  - Query DB với filters:
    * category_id
    * price BETWEEN minPrice AND maxPrice
    * ORDER BY (sort: price_asc, price_desc, name_asc, created_desc)
    * LIMIT/OFFSET cho pagination
  - Tính toán discount_price nếu có discount
  ↓
Response: {
  products: [...],
  pagination: { page, limit, total, totalPages }
}
  ↓
Frontend:
  - Render product cards
  - Hiển thị giá gốc, giá giảm, % discount
```

#### 2.2. Xem Chi Tiết Sản Phẩm

```
User → Click vào sản phẩm
  ↓
GET /api/products/:id
  ↓
Gateway → Product Service (:5002)
  ↓
Product Service:
  - Query DB: SELECT * FROM products WHERE id = ?
  - Lấy 4 images từ img/products/{id}/
  - Lấy category info
  ↓
Response: {
  id, name, description, price, discount_price,
  category_id, category_name,
  images: [img1.jpg, img2.jpg, ...],
  stock, specifications: {...}
}
  ↓
Frontend:
  - Hiển thị chi tiết sản phẩm
  - Hiển thị images slider
  - Nút "Thêm vào giỏ hàng"
```

#### 2.3. Admin: Tạo/Sửa/Xóa Sản Phẩm

```
Admin → Admin Panel (/admin.html)
  ↓
POST /api/products (Tạo mới)
PUT /api/products/:id (Cập nhật)
DELETE /api/products/:id (Xóa)
  ↓
Gateway Middleware:
  - Verify token
  - Kiểm tra role === 'admin'
  ↓
Gateway → Product Service (:5002)
  ↓
Product Service:
  - Validate dữ liệu
  - Upload images (nếu có)
  - INSERT/UPDATE/DELETE trong DB
  ↓
Response: { message: "Thành công", product: {...} }
```

---

### 3. 🛒 WORKFLOW GIỎ HÀNG (Cart)

#### 3.1. Thêm Sản Phẩm Vào Giỏ

**Flow:**
```
User (đã đăng nhập) → Click "Thêm vào giỏ"
  ↓
POST /api/cart/items
Headers: Authorization: Bearer <token>
Body: { product_id, quantity }
  ↓
Gateway Middleware:
  - Verify token → req.user = { id, username, role }
  ↓
Gateway → Cart Service (:5003)
  ↓
Cart Service:
  - Kiểm tra sản phẩm tồn tại và còn hàng
  - Lấy hoặc tạo cart (getOrCreateCart)
  - Kiểm tra item đã có trong cart?
    ├─ Có → UPDATE quantity = quantity + new_quantity
    └─ Chưa → INSERT vào cart_items
  ↓
Response: { message: "Đã thêm vào giỏ hàng", item: {...} }
```

**Code Implementation:**

**Frontend:**
```javascript
async function addToCart(productId, quantity = 1) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
        return;
    }

    try {
        const response = await fetch('/api/cart/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ product_id: productId, quantity })
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            updateCartCount(); // Cập nhật số lượng trong giỏ
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Lỗi:', error);
    }
}
```

**Cart Service (services/cart-service/routes/cart.js):**
```javascript
// Helper: Lấy hoặc tạo cart active
async function getOrCreateCart(pool, userId) {
    const [carts] = await pool.query(
        'SELECT * FROM carts WHERE user_id = ? AND status = ?',
        [userId, 'active']
    );

    if (carts.length > 0) {
        return carts[0].id;
    }

    // Tạo cart mới nếu chưa có
    const [result] = await pool.query(
        'INSERT INTO carts (user_id, status) VALUES (?, ?)',
        [userId, 'active']
    );
    return result.insertId;
}

// POST /cart/items - Thêm sản phẩm
router.post('/items', async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id; // Từ verifyToken middleware
    const productId = req.body.product_id || req.body.productId;
    const { quantity } = req.body;

    try {
        if (!productId || quantity == null) {
            return res.status(400).json({ 
                message: 'product_id và quantity hợp lệ là bắt buộc' 
            });
        }

        if (quantity <= 0) {
            return res.status(400).json({ 
                message: 'Số lượng phải lớn hơn 0' 
            });
        }

        // Kiểm tra sản phẩm tồn tại
        const [products] = await pool.query(
            'SELECT * FROM products WHERE id = ?',
            [productId]
        );

        if (products.length === 0) {
            return res.status(404).json({ 
                message: 'Sản phẩm không tồn tại' 
            });
        }

        const product = products[0];
        const productPrice = parseFloat(product.price);

        // Lấy hoặc tạo cart
        const cartId = await getOrCreateCart(pool, userId);
        
        // Kiểm tra item đã có trong cart chưa
        const [existingItems] = await pool.query(
            'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
            [cartId, productId]
        );
        
        if (existingItems.length > 0) {
            // Cập nhật quantity
            const newQuantity = existingItems[0].quantity + quantity;
            await pool.query(
                'UPDATE cart_items SET quantity = ?, price = ? WHERE id = ?',
                [newQuantity, productPrice, existingItems[0].id]
            );
            
            res.json({
                message: 'Đã cập nhật số lượng sản phẩm trong giỏ hàng',
                item: { ...existingItems[0], quantity: newQuantity }
            });
        } else {
            // Thêm mới
            const [result] = await pool.query(
                'INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [cartId, productId, quantity, productPrice]
            );
            
            res.status(201).json({
                message: 'Đã thêm sản phẩm vào giỏ hàng',
                item: { id: result.insertId, product_id: productId, quantity }
            });
        }
    } catch (error) {
        console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});
```

#### 3.2. Xem Giỏ Hàng

```
User → Navigate to /cart.html
  ↓
GET /api/cart
Headers: Authorization: Bearer <token>
  ↓
Gateway → Cart Service (:5003)
  ↓
Cart Service:
  - Query: SELECT * FROM cart_items WHERE user_id = ?
  - JOIN với products để lấy thông tin sản phẩm
  - Tính tổng tiền (quantity * discount_price)
  ↓
Response: {
  items: [
    { product_id, name, price, discount_price, quantity, subtotal },
    ...
  ],
  total: 15000000
}
  ↓
Frontend:
  - Hiển thị danh sách items
  - Cho phép cập nhật quantity
  - Cho phép xóa item
  - Hiển thị tổng tiền
```

#### 3.3. Cập Nhật/Xóa Item Trong Giỏ

```
User → Thay đổi quantity hoặc xóa item
  ↓
PUT /api/cart/:itemId
Body: { quantity: 2 }
  ↓
DELETE /api/cart/:itemId
  ↓
Cart Service:
  - UPDATE/DELETE trong cart_items
  ↓
Response: { message: "Cập nhật thành công", cart: {...} }
```

---

### 4. 💳 WORKFLOW ĐẶT HÀNG (Orders)

#### 4.1. Tạo Đơn Hàng (Checkout) - Chi Tiết

**Flow Diagram:**
```
User → /cart.html → Click "Thanh toán"
  ↓
Navigate to /checkout.html
  ↓
Frontend: Load cart data từ localStorage hoặc API
  ↓
User nhập thông tin:
  ├─ Thông tin giao hàng:
  │   ├─ Họ tên (required)
  │   ├─ Số điện thoại (required, format: 10-11 số)
  │   ├─ Địa chỉ (required)
  │   ├─ Quận/Huyện (optional)
  │   ├─ Thành phố (optional)
  │   └─ Ghi chú (optional)
  │
  ├─ Phương thức vận chuyển:
  │   ├─ Standard (3-5 ngày, 25,000₫)
  │   ├─ Express (1-2 ngày, 50,000₫)
  │   └─ Overnight (24h, 100,000₫)
  │
  ├─ Phương thức thanh toán:
  │   ├─ Bank Transfer (Ngân hàng nội địa)
  │   │   ├─ Chọn ngân hàng (Vietcombank, Techcombank, ACB, ...)
  │   │   └─ Nhập số tài khoản (16 số)
  │   │   └─ Validate account → Hiển thị tên chủ TK
  │   │
  │   ├─ MoMo (Ví điện tử)
  │   │   └─ Nhập số điện thoại MoMo (10 số)
  │   │
  │   └─ Visa/Mastercard
  │       ├─ Số thẻ (16 số)
  │       ├─ Tên chủ thẻ
  │       ├─ Ngày hết hạn (MM/YY)
  │       └─ CVV (3 số)
  │
  ├─ Mã giảm giá (optional):
  │   └─ Nhập code → Validate → Hiển thị discount
  │
  └─ Điểm thưởng (optional):
      └─ Chọn số điểm muốn dùng → Tính discount
  ↓
Frontend Validation:
  ├─ Kiểm tra đầy đủ thông tin bắt buộc
  ├─ Validate format (phone, email, account number)
  ├─ Kiểm tra số dư tài khoản (nếu bank transfer)
  └─ Tính toán tổng tiền cuối cùng
  ↓
POST /api/orders
Headers: 
  - Authorization: Bearer <token>
  - Content-Type: application/json
Body: {
  shipping_address: "123 Đường ABC, Quận 1, TP.HCM",
  phone: "0123456789",
  payment_method: "bank_transfer" | "momo" | "visa",
  payment_details: {
    bank: "vietcombank" (nếu bank_transfer),
    account_number: "9704151234567890" (nếu bank_transfer),
    phone: "0123456789" (nếu momo),
    card_number: "4111111111111111" (nếu visa),
    card_name: "NGUYEN VAN A" (nếu visa),
    card_expiry: "12/25" (nếu visa),
    card_cvv: "123" (nếu visa)
  },
  coupon_code: "SALE10" (optional),
  use_loyalty_points: 100 (optional, số điểm muốn dùng)
}
  ↓
Gateway Middleware:
  ├─ Verify token → req.user = { id, username, role }
  └─ Forward request đến Order Service
  ↓
Order Service (:5004) - routes/orders.js:
  
  Step 1: Lấy cart items từ Cart Service
  ├─ GET ${CART_SERVICE_URL}/cart
  ├─ Headers: Authorization từ request
  └─ Response: { cart: { items: [...], total: 15000000 } }
  
  Step 2: Validate cart
  ├─ Kiểm tra cart có items không
  └─ Nếu rỗng → Return 400: "Giỏ hàng không có sản phẩm"
  
  Step 3: Tính toán giá
  ├─ Subtotal = cart.total (tổng giá sản phẩm)
  ├─ Shipping fee = calculateShippingFee(shipping_method)
  │   ├─ standard: 25,000₫
  │   ├─ express: 50,000₫
  │   └─ overnight: 100,000₫
  ├─ Discount từ coupon (nếu có)
  │   ├─ POST /api/coupons/validate
  │   ├─ Body: { code: "SALE10", total_amount: subtotal }
  │   └─ Response: { valid: true, discount_amount: 1500000 }
  ├─ Discount từ loyalty points (nếu có)
  │   ├─ 1 point = 1,000 VNĐ
  │   ├─ Kiểm tra user có đủ điểm không
  │   └─ Tính discount = use_loyalty_points * 1000
  └─ Final Total = subtotal + shipping - coupon_discount - loyalty_discount
  
  Step 4: Validate Payment (nếu cần)
  ├─ Nếu payment_method = "bank_transfer":
  │   ├─ GET /api/payment/check-account?bank=vietcombank&account_number=9704151234567890
  │   ├─ Verify account tồn tại và active
  │   ├─ Verify balance >= final_total
  │   └─ Nếu không đủ → Return 400: "Số dư không đủ"
  │
  ├─ Nếu payment_method = "momo":
  │   ├─ Validate phone format (10 số)
  │   └─ (Demo: Không check balance thật)
  │
  └─ Nếu payment_method = "visa":
      ├─ Validate card format (Luhn algorithm)
      ├─ Validate expiry date
      └─ (Demo: Không check thật với bank)
  
  Step 5: Tạo đơn hàng trong Database
  ├─ BEGIN TRANSACTION
  ├─ INSERT INTO orders:
  │   ├─ user_id = req.user.id
  │   ├─ total = final_total
  │   ├─ shipping_address = req.body.shipping_address
  │   ├─ shipping_phone = req.body.phone
  │   ├─ payment_method = req.body.payment_method
  │   ├─ payment_details = JSON.stringify(req.body.payment_details)
  │   ├─ status = 'pending'
  │   └─ created_at = NOW()
  ├─ Lấy order_id từ insertId
  │
  ├─ INSERT INTO order_items (từ cart items):
  │   ├─ FOR EACH item IN cart.items:
  │   │   ├─ INSERT INTO order_items:
  │   │   │   ├─ order_id = order_id
  │   │   │   ├─ product_id = item.product_id
  │   │   │   ├─ quantity = item.quantity
  │   │   │   └─ price = item.price
  │   │   └─ (Lưu snapshot giá tại thời điểm đặt hàng)
  │
  ├─ Trừ loyalty points (nếu dùng):
  │   ├─ UPDATE loyalty_points SET balance = balance - use_loyalty_points
  │   └─ WHERE user_id = req.user.id
  │
  ├─ Tích điểm mới (nếu đơn hàng thành công):
  │   ├─ earned_points = Math.floor(final_total / 10000) (1 point per 10,000₫)
  │   ├─ INSERT INTO loyalty_points_history:
  │   │   ├─ user_id, order_id, points, type = 'earned'
  │   └─ UPDATE loyalty_points SET balance = balance + earned_points
  │
  ├─ Xóa cart items:
  │   ├─ DELETE FROM cart_items WHERE cart_id = user_cart_id
  │   └─ UPDATE carts SET status = 'completed' WHERE id = user_cart_id
  │
  ├─ Tạo order tracking record:
  │   ├─ INSERT INTO order_tracking:
  │   │   ├─ order_id = order_id
  │   │   ├─ status = 'pending'
  │   │   ├─ note = 'Đơn hàng đã được tạo'
  │   │   └─ created_at = NOW()
  │
  └─ COMMIT TRANSACTION
  
  Step 6: Gửi email xác nhận (nếu có cấu hình)
  ├─ Lấy email từ users table
  ├─ Gọi sendOrderConfirmationEmail(email, order)
  └─ (Không block nếu email fail)
  
  Step 7: Return Response
  ↓
Response: {
  message: "Đặt hàng thành công",
  order: {
    id: 123,
    order_number: "ORD-2025-00123",
    total: 13500000,
    status: "pending",
    shipping_address: "...",
    payment_method: "bank_transfer",
    items: [...],
    created_at: "2025-01-15T10:30:00Z"
  }
}
  ↓
Frontend:
  ├─ Hiển thị toast success: "Đặt hàng thành công!"
  ├─ Lưu order_id vào localStorage (nếu cần)
  ├─ Clear cart data từ localStorage
  └─ Redirect đến /orders.html?order_id=123
```

**Code Implementation:**

**Frontend (checkout.html):**
```javascript
// Validate payment account (Bank Transfer)
async function validateBankAccount(bank, accountNumber) {
    try {
        const response = await fetch(
            `/api/payment/check-account?bank=${bank}&account_number=${accountNumber}`
        );
        const data = await response.json();
        
        if (data.success) {
            // Hiển thị tên chủ tài khoản
            document.getElementById('accountName').textContent = 
                `Chủ tài khoản: ${data.account.account_name}`;
            document.getElementById('accountName').classList.add('text-green-600');
            return true;
        } else {
            document.getElementById('accountName').textContent = 
                data.message || 'Không tìm thấy tài khoản';
            document.getElementById('accountName').classList.add('text-red-600');
            return false;
        }
    } catch (error) {
        console.error('Lỗi validate account:', error);
        return false;
    }
}

// Process payment
async function processPayment() {
    // ... validation code ...
    
    const orderData = {
        shipping_address: fullAddress,
        phone: phone,
        payment_method: selectedPaymentMethod,
        payment_details: {},
        coupon_code: checkoutData.couponCode || null,
        use_loyalty_points: checkoutData.useLoyaltyPoints || null
    };
    
    // Add payment details
    if (selectedPaymentMethod === 'bank') {
        orderData.payment_details = {
            bank: document.getElementById('bankSelect').value,
            account_number: document.getElementById('accountNumber').value
        };
    } else if (selectedPaymentMethod === 'momo') {
        orderData.payment_details = {
            phone: document.getElementById('momoPhone').value
        };
    } else if (selectedPaymentMethod === 'visa') {
        orderData.payment_details = {
            card_number: document.getElementById('cardNumber').value,
            card_name: document.getElementById('cardName').value,
            card_expiry: document.getElementById('cardExpiry').value,
            card_cvv: document.getElementById('cardCVV').value
        };
    }
    
    try {
        const response = await apiCall('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
        
        if (response.order) {
            showToast('Đặt hàng thành công!', 'success');
            setTimeout(() => {
                window.location.href = `/orders.html?order_id=${response.order.id}`;
            }, 1500);
        }
    } catch (error) {
        showToast(error.message || 'Có lỗi xảy ra khi đặt hàng', 'error');
    }
}
```

**Order Service (services/order-service/routes/orders.js):**
```javascript
// POST /orders - Tạo đơn hàng
router.post('/', async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    const CART_SERVICE_URL = req.app.locals.CART_SERVICE_URL;
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
        // Step 1: Lấy cart items
        const cartResponse = await axios.get(`${CART_SERVICE_URL}/cart`, {
            headers: { 'Authorization': req.headers['authorization'] }
        });
        const cartData = cartResponse.data.cart;
        
        if (!cartData.items || cartData.items.length === 0) {
            await connection.rollback();
            return res.status(400).json({ 
                message: 'Giỏ hàng không có sản phẩm' 
            });
        }
        
        // Step 2: Tính toán giá
        let subtotal = parseFloat(cartData.total || 0);
        let shippingFee = calculateShippingFee(req.body.shipping_method);
        let discountAmount = 0;
        let loyaltyDiscount = 0;
        
        // Validate coupon
        if (req.body.coupon_code) {
            const couponResponse = await axios.post(`${baseUrl}/coupons/validate`, {
                code: req.body.coupon_code,
                total_amount: subtotal
            });
            if (couponResponse.data.valid) {
                discountAmount = couponResponse.data.coupon.discount_amount;
            }
        }
        
        // Validate loyalty points
        if (req.body.use_loyalty_points && req.body.use_loyalty_points > 0) {
            const [userPoints] = await connection.query(
                'SELECT balance FROM loyalty_points WHERE user_id = ?',
                [userId]
            );
            if (userPoints.length > 0 && 
                userPoints[0].balance >= req.body.use_loyalty_points) {
                loyaltyDiscount = req.body.use_loyalty_points * 1000;
            }
        }
        
        const finalTotal = subtotal + shippingFee - discountAmount - loyaltyDiscount;
        
        // Step 3: Validate payment (nếu bank transfer)
        if (req.body.payment_method === 'bank_transfer') {
            const { bank, account_number } = req.body.payment_details || {};
            if (!bank || !account_number) {
                await connection.rollback();
                return res.status(400).json({ 
                    message: 'Thiếu thông tin thanh toán' 
                });
            }
            
            // Check account và balance
            const [accounts] = await connection.query(
                'SELECT * FROM payment_demo_accounts WHERE bank_type = ? AND account_number = ? AND is_active = TRUE',
                [bank, account_number]
            );
            
            if (accounts.length === 0) {
                await connection.rollback();
                return res.status(400).json({ 
                    message: 'Tài khoản không tồn tại hoặc không hợp lệ' 
                });
            }
            
            if (parseFloat(accounts[0].balance) < finalTotal) {
                await connection.rollback();
                return res.status(400).json({ 
                    message: 'Số dư tài khoản không đủ' 
                });
            }
        }
        
        // Step 4: Tạo đơn hàng
        const [orderResult] = await connection.query(
            `INSERT INTO orders 
            (user_id, total, shipping_address, shipping_phone, payment_method, payment_details, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                finalTotal,
                req.body.shipping_address,
                req.body.phone,
                req.body.payment_method,
                JSON.stringify(req.body.payment_details || {}),
                'pending'
            ]
        );
        const orderId = orderResult.insertId;
        
        // Step 5: Tạo order items
        for (const item of cartData.items) {
            await connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );
        }
        
        // Step 6: Trừ loyalty points
        if (loyaltyDiscount > 0) {
            await connection.query(
                'UPDATE loyalty_points SET balance = balance - ? WHERE user_id = ?',
                [req.body.use_loyalty_points, userId]
            );
        }
        
        // Step 7: Tích điểm mới
        const earnedPoints = Math.floor(finalTotal / 10000);
        if (earnedPoints > 0) {
            await connection.query(
                'UPDATE loyalty_points SET balance = balance + ? WHERE user_id = ?',
                [earnedPoints, userId]
            );
            await connection.query(
                'INSERT INTO loyalty_points_history (user_id, order_id, points, type, description) VALUES (?, ?, ?, ?, ?)',
                [userId, orderId, earnedPoints, 'earned', `Tích điểm từ đơn hàng #${orderId}`]
            );
        }
        
        // Step 8: Xóa cart
        const [carts] = await connection.query(
            'SELECT id FROM carts WHERE user_id = ? AND status = ?',
            [userId, 'active']
        );
        if (carts.length > 0) {
            const cartId = carts[0].id;
            await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
            await connection.query('UPDATE carts SET status = ? WHERE id = ?', ['completed', cartId]);
        }
        
        // Step 9: Tạo tracking record
        await connection.query(
            'INSERT INTO order_tracking (order_id, status, note) VALUES (?, ?, ?)',
            [orderId, 'pending', 'Đơn hàng đã được tạo']
        );
        
        await connection.commit();
        
        // Step 10: Gửi email (async, không block)
        sendOrderConfirmationEmail(userId, orderId).catch(err => {
            console.error('Lỗi gửi email:', err);
        });
        
        res.status(201).json({
            message: 'Đặt hàng thành công',
            order: {
                id: orderId,
                total: finalTotal,
                status: 'pending'
            }
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Lỗi khi tạo đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    } finally {
        connection.release();
    }
});
```

#### 4.2. Xem Danh Sách Đơn Hàng (User)

```
User → /orders.html
  ↓
GET /api/orders
Headers: Authorization: Bearer <token>
  ↓
Gateway → Order Service (:5004)
  ↓
Order Service:
  - Query: SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
  - Lấy order tracking status
  ↓
Response: {
  orders: [
    {
      id, order_number, total, status,
      shipping_address, payment_method,
      created_at, tracking: {...}
    },
    ...
  ]
}
  ↓
Frontend:
  - Hiển thị danh sách đơn hàng
  - Hiển thị trạng thái (pending, processing, shipped, delivered, cancelled)
  - Link đến chi tiết đơn hàng
```

#### 4.3. Admin: Quản Lý Đơn Hàng

```
Admin → Admin Panel → Orders Management
  ↓
GET /api/orders (Tất cả đơn hàng)
  ↓
Gateway Middleware:
  - Verify token
  - Kiểm tra role === 'admin'
  ↓
Order Service:
  - Query: SELECT * FROM orders ORDER BY created_at DESC
  ↓
Admin cập nhật trạng thái:
  ↓
PUT /api/orders/:id/status
Body: { status: "processing" | "shipped" | "delivered" | "cancelled" }
  ↓
Order Service:
  - UPDATE orders SET status = ?
  - Tạo tracking record mới
  - Gửi email thông báo (nếu có)
  ↓
Response: { message: "Cập nhật thành công", order: {...} }
```

#### 4.4. Theo Dõi Đơn Hàng (Order Tracking)

```
User → /orders.html → Click vào đơn hàng
  ↓
GET /api/orders/:id/tracking
  ↓
Order Service:
  - Query: SELECT * FROM order_tracking WHERE order_id = ? ORDER BY created_at
  ↓
Response: {
  order_id: 123,
  tracking: [
    { status: "pending", note: "Đơn hàng đã được tạo", created_at: "..." },
    { status: "processing", note: "Đang chuẩn bị hàng", created_at: "..." },
    { status: "shipped", note: "Đã giao cho đơn vị vận chuyển", created_at: "..." },
    ...
  ]
}
```

#### 4.5. 💳 WORKFLOW THANH TOÁN (Payment Processing)

**4.5.1. Thanh Toán Qua Ngân Hàng Nội Địa (Bank Transfer)**

```
User → Checkout → Chọn "Ngân hàng nội địa"
  ↓
Frontend:
  ├─ Hiển thị dropdown chọn ngân hàng:
  │   ├─ Vietcombank
  │   ├─ Techcombank
  │   ├─ ACB
  │   ├─ BIDV
  │   ├─ VietinBank
  │   ├─ Agribank
  │   ├─ Sacombank
  │   └─ MB Bank
  │
  └─ Input số tài khoản (16 số)
  ↓
Real-time Validation (on input change):
  ├─ GET /api/payment/check-account?bank=vietcombank&account_number=9704151234567890
  ├─ Gateway → Direct DB Query (payment_demo_accounts table)
  ├─ Response:
  │   ├─ success: true
  │   ├─ account: {
  │   │   ├─ account_name: "NGUYEN VAN A"
  │   │   ├─ balance: 100000000
  │   │   └─ bank_type: "vietcombank"
  │   └─ }
  └─ Frontend: Hiển thị "Chủ tài khoản: NGUYEN VAN A" (màu xanh)
  ↓
Khi đặt hàng:
  ├─ Order Service validate balance >= order_total
  ├─ Nếu đủ: Tạo đơn hàng với status = 'pending'
  └─ Nếu không đủ: Return error "Số dư không đủ"
  ↓
(Demo: Không trừ tiền thật, chỉ validate)
```

**4.5.2. Thanh Toán Qua MoMo (Ví Điện Tử)**

```
User → Checkout → Chọn "Ví điện tử MoMo"
  ↓
Frontend:
  └─ Input số điện thoại MoMo (10 số)
  ↓
Validation:
  ├─ Format: 10 số (0xxxxxxxxx)
  ├─ (Demo: Không validate với MoMo API thật)
  └─ Chỉ validate format
  ↓
Khi đặt hàng:
  ├─ Lưu phone vào payment_details
  ├─ Tạo đơn hàng với status = 'pending'
  └─ (Demo: Không gọi MoMo API thật)
```

**4.5.3. Thanh Toán Qua Visa/Mastercard**

```
User → Checkout → Chọn "Thẻ tín dụng/ghi nợ"
  ↓
Frontend:
  ├─ Input số thẻ (16 số)
  ├─ Input tên chủ thẻ
  ├─ Input ngày hết hạn (MM/YY)
  └─ Input CVV (3 số)
  ↓
Validation:
  ├─ Card number: Luhn algorithm check
  ├─ Expiry: Format MM/YY, không quá hạn
  ├─ CVV: 3 số
  └─ (Demo: Không validate với bank thật)
  ↓
Khi đặt hàng:
  ├─ Lưu card info vào payment_details (không lưu CVV)
  ├─ Tạo đơn hàng với status = 'pending'
  └─ (Demo: Không gọi payment gateway thật)
```

**4.5.4. Danh Sách Tài Khoản Demo (Bank Transfer)**

| Ngân hàng | Số tài khoản | Chủ tài khoản | Số dư |
|-----------|--------------|---------------|-------|
| Vietcombank | 9704151234567890 | NGUYEN VAN A | 100,000,000 ₫ |
| Vietcombank | 9704159876543210 | TRAN THI B | 50,000,000 ₫ |
| Techcombank | 9704071234567890 | LE VAN C | 75,000,000 ₫ |
| Techcombank | 9704079876543210 | PHAM THI D | 200,000,000 ₫ |
| ACB | 9704155555555555 | HOANG VAN E | 150,000,000 ₫ |
| ACB | 9704156666666666 | VU THI F | 80,000,000 ₫ |
| BIDV | 9704157777777777 | DAO VAN G | 120,000,000 ₫ |
| VietinBank | 9704158888888888 | BUI THI H | 90,000,000 ₫ |
| Agribank | 9704159999999999 | DANG VAN I | 60,000,000 ₫ |
| Sacombank | 9704151111111111 | NGUYEN THI K | 300,000,000 ₫ |
| MB Bank | 9704152222222222 | TRAN VAN L | 180,000,000 ₫ |

**Code Implementation:**

**Gateway (gateway/server.js) - Payment Check Endpoint:**
```javascript
// GET /api/payment/check-account
app.get('/api/payment/check-account', async (req, res) => {
    try {
        const { bank, account_number } = req.query;
        
        if (!bank || !account_number) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp bank và account_number'
            });
        }

        // Query payment_demo_accounts table
        const [rows] = await dbPool.query(
            `SELECT id, bank_type, account_number, account_name, balance, is_active 
             FROM payment_demo_accounts 
             WHERE bank_type = ? AND account_number = ? AND is_active = TRUE`,
            [bank, account_number]
        );

        if (rows && rows.length > 0) {
            const account = rows[0];
            return res.json({
                success: true,
                account: {
                    id: account.id,
                    bank_type: account.bank_type,
                    account_number: account.account_number,
                    account_name: account.account_name,
                    balance: parseFloat(account.balance)
                }
            });
        } else {
            return res.json({
                success: false,
                message: 'Không tìm thấy tài khoản với số tài khoản này'
            });
        }
    } catch (error) {
        console.error('Error checking account:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi kiểm tra tài khoản'
        });
    }
});
```

---

### 5. 📦 WORKFLOW VẬN CHUYỂN & THEO DÕI (Shipment & Tracking)

#### 5.1. Admin: Tạo Vận Chuyển

```
Admin → Admin Panel → Shipments Management → Tab "Tạo Vận Chuyển"
  ↓
Form nhập thông tin:
  ├─ Mã đơn hàng (order_id) - Required
  ├─ Đơn vị vận chuyển (carrier_name) - Required
  │   ├─ GHN (Giao Hàng Nhanh)
  │   ├─ GHTK (Giao Hàng Tiết Kiệm)
  │   ├─ Viettel Post
  │   ├─ Vietnam Post
  │   ├─ J&T Express
  │   └─ AhaMove
  │
  ├─ Mã vận chuyển (tracking_number) - Required, Unique
  ├─ Ngày dự kiến giao (estimated_delivery_date) - Required
  └─ Phí vận chuyển (shipping_cost) - Optional
  ↓
POST /api/shipments
Headers: Authorization: Bearer <admin_token>
Body: {
  order_id: 123,
  carrier_name: "GHN",
  tracking_number: "GHN123456789",
  estimated_delivery_date: "2025-01-20",
  shipping_cost: 25000
}
  ↓
Gateway → Shipments Route (gateway/server.js hoặc routes/shipments.js)
  ↓
Validation:
  ├─ Kiểm tra order tồn tại
  ├─ Kiểm tra order chưa có shipment
  ├─ Kiểm tra tracking_number unique
  └─ Validate date format
  ↓
Database Operations (Transaction):
  ├─ BEGIN TRANSACTION
  ├─ INSERT INTO shipments:
  │   ├─ order_id = 123
  │   ├─ carrier_name = "GHN"
  │   ├─ tracking_number = "GHN123456789"
  │   ├─ status = "pending"
  │   ├─ estimated_delivery_date = "2025-01-20"
  │   ├─ shipping_cost = 25000
  │   └─ created_at = NOW()
  │
  ├─ INSERT INTO shipment_events (Event đầu tiên):
  │   ├─ shipment_id = new_shipment_id
  │   ├─ status = "pending"
  │   ├─ event_label = "Đơn hàng đã được tạo, chờ lấy hàng"
  │   ├─ location = "Kho hàng TechStore"
  │   ├─ event_time = NOW()
  │   └─ created_at = NOW()
  │
  ├─ UPDATE orders:
  │   └─ status = "shipped" (từ "pending" hoặc "processing")
  │
  └─ COMMIT TRANSACTION
  ↓
Response: {
  message: "Tạo vận chuyển thành công",
  shipment: {
    id: 1,
    order_id: 123,
    carrier_name: "GHN",
    tracking_number: "GHN123456789",
    status: "pending",
    estimated_delivery_date: "2025-01-20",
    shipping_cost: 25000
  }
}
  ↓
Frontend:
  ├─ Hiển thị toast success
  ├─ Refresh danh sách shipments
  └─ Reset form
```

#### 5.2. Admin: Cập Nhật Trạng Thái Vận Chuyển

```
Admin → Shipments List → Click "Cập nhật" trên một shipment
  ↓
Modal hiển thị:
  ├─ Trạng thái hiện tại
  ├─ Dropdown chọn trạng thái mới:
  │   ├─ pending (Chờ lấy hàng)
  │   ├─ picked_up (Đã lấy hàng)
  │   ├─ in_transit (Đang vận chuyển)
  │   ├─ out_for_delivery (Đang giao hàng)
  │   ├─ delivered (Đã giao hàng)
  │   ├─ failed (Giao thất bại)
  │   └─ returned (Hoàn trả)
  │
  ├─ Ghi chú (event_label) - Optional
  └─ Địa điểm (location) - Optional
  ↓
PUT /api/shipments/:id/update-status
Headers: Authorization: Bearer <admin_token>
Body: {
  status: "in_transit",
  event_label: "Đơn hàng đang được vận chuyển đến trung tâm phân phối",
  location: "Trung tâm GHN Hà Nội"
}
  ↓
Gateway → Shipments Route
  ↓
Validation:
  ├─ Kiểm tra shipment tồn tại
  ├─ Validate status (phải là 1 trong 7 status hợp lệ)
  └─ Kiểm tra status mới khác status hiện tại
  ↓
Database Operations (Transaction):
  ├─ BEGIN TRANSACTION
  ├─ UPDATE shipments:
  │   ├─ status = "in_transit"
  │   ├─ updated_at = NOW()
  │   └─ (Nếu status = "delivered": actual_delivery_date = NOW())
  │
  ├─ INSERT INTO shipment_events:
  │   ├─ shipment_id = shipment_id
  │   ├─ status = "in_transit"
  │   ├─ event_label = "Đơn hàng đang được vận chuyển đến trung tâm phân phối"
  │   ├─ location = "Trung tâm GHN Hà Nội"
  │   ├─ event_time = NOW()
  │   └─ created_at = NOW()
  │
  ├─ UPDATE orders (Map shipment status → order status):
  │   ├─ pending/picked_up → "processing"
  │   ├─ in_transit/out_for_delivery → "shipped"
  │   ├─ delivered → "delivered"
  │   ├─ failed → "cancelled"
  │   └─ returned → "cancelled"
  │
  └─ COMMIT TRANSACTION
  ↓
Response: {
  message: "Cập nhật trạng thái thành công",
  shipment: {
    id: 1,
    status: "in_transit",
    events: [...]
  }
}
  ↓
Frontend:
  ├─ Hiển thị toast success
  ├─ Refresh danh sách shipments
  └─ Close modal
```

#### 5.3. Customer: Xem Theo Dõi Vận Chuyển

```
User → /orders.html → Click "Theo dõi" trên một đơn hàng
  ↓
GET /api/shipments/:orderId
Headers: Authorization: Bearer <token>
  ↓
Gateway → Shipments Route
  ↓
Query Database:
  ├─ SELECT * FROM shipments WHERE order_id = ?
  ├─ SELECT * FROM shipment_events WHERE shipment_id = ? ORDER BY event_time ASC
  └─ JOIN với orders để lấy thông tin đơn hàng
  ↓
Response: {
  shipment: {
    id: 1,
    order_id: 123,
    carrier_name: "GHN",
    tracking_number: "GHN123456789",
    status: "in_transit",
    estimated_delivery_date: "2025-01-20",
    actual_delivery_date: null,
    shipping_cost: 25000
  },
  events: [
    {
      id: 1,
      status: "pending",
      event_label: "Đơn hàng đã được tạo, chờ lấy hàng",
      location: "Kho hàng TechStore",
      event_time: "2025-01-15T10:00:00Z"
    },
    {
      id: 2,
      status: "picked_up",
      event_label: "Đơn hàng đã được lấy",
      location: "Kho hàng TechStore",
      event_time: "2025-01-15T14:30:00Z"
    },
    {
      id: 3,
      status: "in_transit",
      event_label: "Đơn hàng đang được vận chuyển đến trung tâm phân phối",
      location: "Trung tâm GHN Hà Nội",
      event_time: "2025-01-16T09:00:00Z"
    }
  ],
  order: {
    id: 123,
    status: "shipped",
    total: 13500000
  }
}
  ↓
Frontend (orders.html):
  ├─ Hiển thị Modal Tracking
  ├─ Progress Bar (4 bước):
  │   ├─ Step 1: Pending → Picked Up (✓ nếu đã qua)
  │   ├─ Step 2: In Transit (⏳ nếu đang ở)
  │   ├─ Step 3: Out for Delivery (⏳ nếu đang ở)
  │   └─ Step 4: Delivered (✓ nếu đã giao)
  │
  ├─ Timeline Events:
  │   ├─ Hiển thị tất cả events theo thời gian
  │   ├─ Icon theo status:
  │   │   ├─ pending: ⏳ (clock)
  │   │   ├─ picked_up: 📦 (package)
  │   │   ├─ in_transit: 🚚 (truck)
  │   │   ├─ out_for_delivery: 🚛 (delivery)
  │   │   ├─ delivered: ✅ (check)
  │   │   ├─ failed: ❌ (cross)
  │   │   └─ returned: ↩️ (return)
  │   │
  │   ├─ Event Label (tiếng Việt)
  │   ├─ Location (nếu có)
  │   └─ Event Time (formatted: "15/01/2025 14:30")
  │
  └─ Thông tin đơn hàng:
      ├─ Mã đơn hàng: #123
      ├─ Mã vận chuyển: GHN123456789
      ├─ Đơn vị: GHN
      ├─ Ngày dự kiến: 20/01/2025
      └─ Ngày giao thực tế: (nếu đã giao)
```

#### 5.4. Webhook Integration (Tự Động Cập Nhật Từ Đơn Vị Vận Chuyển)

**5.4.1. GHN Webhook**

```
GHN Server → POST /api/shipments/webhook/ghn
Body: {
  code: "GHN123456789",  // Tracking number
  status: "out_for_delivery",  // GHN status code
  location: "Q1, TP.HCM",
  timestamp: "2025-01-18T10:30:00Z"
}
  ↓
Gateway → Shipments Route
  ↓
Parse & Map Status:
  ├─ GHN Status Mapping:
  │   ├─ "ready_to_pick" → "pending"
  │   ├─ "picking" → "picked_up"
  │   ├─ "on_way" → "in_transit"
  │   ├─ "out_for_delivery" → "out_for_delivery"
  │   ├─ "delivered" → "delivered"
  │   ├─ "return" → "failed"
  │   └─ "returned" → "returned"
  │
  └─ Standard Status = "out_for_delivery"
  ↓
Database Operations:
  ├─ Tìm shipment theo tracking_number
  ├─ Kiểm tra status mới khác status hiện tại
  ├─ UPDATE shipments SET status = "out_for_delivery"
  ├─ INSERT INTO shipment_events:
  │   ├─ status = "out_for_delivery"
  │   ├─ event_label = "Đơn hàng đang được giao đến bạn"
  │   ├─ location = "Q1, TP.HCM"
  │   └─ event_time = timestamp từ webhook
  │
  └─ UPDATE orders SET status = "shipped"
  ↓
Response: {
  success: true,
  message: "Webhook processed successfully",
  shipment_id: 1
}
```

**5.4.2. GHTK Webhook**

```
GHTK Server → POST /api/shipments/webhook/ghtk
Body: {
  tracking_number: "GHTK789012345",
  status_code: 3,  // GHTK status code (số)
  location: "Hà Nội",
  time: "2025-01-18 10:30:00"
}
  ↓
Gateway → Shipments Route
  ↓
Parse & Map Status:
  ├─ GHTK Status Mapping:
  │   ├─ 0 → "pending" (waiting)
  │   ├─ 1 → "picked_up"
  │   ├─ 2 → "in_transit" (holding)
  │   ├─ 3 → "out_for_delivery" (delivering)
  │   ├─ 5 → "delivered"
  │   ├─ 6 → "failed"
  │   └─ 7 → "returned"
  │
  └─ Standard Status = "out_for_delivery"
  ↓
(Same database operations as GHN)
```

**5.4.3. Viettel Post Webhook**

```
Viettel Server → POST /api/shipments/webhook/viettel
Body: {
  tracking_code: "VT123456789",
  status: 3,  // Viettel status code
  location_name: "Hà Nội",
  event_time: "2025-01-18T10:30:00Z"
}
  ↓
Gateway → Shipments Route
  ↓
Parse & Map Status:
  ├─ Viettel Status Mapping:
  │   ├─ 0 → "pending"
  │   ├─ 1 → "picked_up"
  │   ├─ 2 → "in_transit"
  │   ├─ 3 → "out_for_delivery"
  │   ├─ 5 → "delivered"
  │   ├─ 6 → "failed"
  │   └─ 7 → "returned"
  ↓
(Same database operations)
```

**Code Implementation:**

**Shipments Route (routes/shipments.js hoặc gateway/server.js):**
```javascript
// Helper: Map carrier status to standard status
function mapCarrierStatus(carrier, carrierStatus) {
    const statusMaps = {
        'ghn': {
            'ready_to_pick': 'pending',
            'picking': 'picked_up',
            'on_way': 'in_transit',
            'out_for_delivery': 'out_for_delivery',
            'delivered': 'delivered',
            'return': 'failed',
            'returned': 'returned'
        },
        'ghtk': {
            '0': 'pending',
            '1': 'picked_up',
            '2': 'in_transit',
            '3': 'out_for_delivery',
            '5': 'delivered',
            '6': 'failed',
            '7': 'returned'
        },
        'viettel': {
            '0': 'pending',
            '1': 'picked_up',
            '2': 'in_transit',
            '3': 'out_for_delivery',
            '5': 'delivered',
            '6': 'failed',
            '7': 'returned'
        }
    };
    
    return statusMaps[carrier]?.[carrierStatus] || 'pending';
}

// POST /api/shipments/webhook/:carrier
router.post('/webhook/:carrier', async (req, res) => {
    const pool = req.app.locals.pool;
    const carrier = req.params.carrier.toLowerCase();
    
    try {
        // Parse payload theo từng carrier
        let trackingNumber, carrierStatus, location, eventTime;
        
        if (carrier === 'ghn') {
            trackingNumber = req.body.code;
            carrierStatus = req.body.status;
            location = req.body.location || '';
            eventTime = req.body.timestamp ? new Date(req.body.timestamp) : new Date();
        } else if (carrier === 'ghtk') {
            trackingNumber = req.body.tracking_number;
            carrierStatus = String(req.body.status_code);
            location = req.body.location || '';
            eventTime = req.body.time ? new Date(req.body.time) : new Date();
        } else if (carrier === 'viettel') {
            trackingNumber = req.body.tracking_code;
            carrierStatus = String(req.body.status);
            location = req.body.location_name || '';
            eventTime = req.body.event_time ? new Date(req.body.event_time) : new Date();
        }
        
        // Map to standard status
        const standardStatus = mapCarrierStatus(carrier, carrierStatus);
        
        // Find shipment
        const [shipments] = await pool.query(
            'SELECT * FROM shipments WHERE tracking_number = ?',
            [trackingNumber]
        );
        
        if (shipments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Shipment not found'
            });
        }
        
        const shipment = shipments[0];
        
        // Skip if status unchanged
        if (shipment.status === standardStatus) {
            return res.json({
                success: true,
                message: 'Status unchanged'
            });
        }
        
        // Update shipment
        await pool.query(
            `UPDATE shipments 
             SET status = ?, 
                 updated_at = NOW(),
                 actual_delivery_date = CASE WHEN ? = 'delivered' THEN NOW() ELSE actual_delivery_date END
             WHERE id = ?`,
            [standardStatus, standardStatus, shipment.id]
        );
        
        // Create event
        const eventLabel = getDefaultLabel(standardStatus);
        await pool.query(
            `INSERT INTO shipment_events 
             (shipment_id, status, event_label, location, event_time) 
             VALUES (?, ?, ?, ?, ?)`,
            [shipment.id, standardStatus, eventLabel, location, eventTime]
        );
        
        // Update order status
        const orderStatus = mapShipmentToOrderStatus(standardStatus);
        await pool.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [orderStatus, shipment.order_id]
        );
        
        res.json({
            success: true,
            message: 'Webhook processed successfully',
            shipment_id: shipment.id
        });
        
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing webhook'
        });
    }
});
```

---

### 6. 🎟️ WORKFLOW MÃ GIẢM GIÁ (Coupons)

#### 5.1. Validate Mã Giảm Giá

```
User → Checkout page → Nhập coupon code
  ↓
GET /api/coupons/validate?code=SALE10&total=15000000
  ↓
Gateway → Order Service (:5004)
  ↓
Order Service:
  - Query: SELECT * FROM coupons WHERE code = ? AND is_active = TRUE
  - Kiểm tra:
    * Expiration date
    * Usage limit
    * Minimum order amount
  - Tính discount amount
  ↓
Response: {
  valid: true,
  discount_type: "percentage" | "fixed",
  discount_value: 10,
  discount_amount: 1500000,
  final_total: 13500000
}
```

#### 5.2. Admin: Quản Lý Coupons

```
Admin → Admin Panel → Coupons Management
  ↓
POST /api/coupons (Tạo mới)
Body: {
  code: "SALE10",
  discount_type: "percentage",
  discount_value: 10,
  min_order_amount: 1000000,
  max_usage: 100,
  expires_at: "2025-12-31"
}
  ↓
Order Service:
  - INSERT INTO coupons
  ↓
PUT /api/coupons/:id (Cập nhật)
DELETE /api/coupons/:id (Xóa)
```

---

### 6. 📧 WORKFLOW EMAIL NOTIFICATIONS

#### 6.1. Email OTP Đặt Lại Mật Khẩu

```
User → /forgot-password.html → Nhập email
  ↓
POST /api/forgot-password
Body: { email: "user@example.com" }
  ↓
Auth Service:
  ├─ Tìm user theo email
  ├─ Tạo mã OTP 6 chữ số: Math.floor(100000 + Math.random() * 900000)
  ├─ Lưu OTP vào DB:
  │   ├─ UPDATE users SET 
  │   │   ├─ otp_code = "123456"
  │   │   └─ otp_expires = NOW() + 10 minutes
  │
  └─ Gọi sendOTPEmail(email, otpCode, username)
  ↓
Email Service (services/auth-service/utils/email.js):
  ├─ Kiểm tra cấu hình email:
  │   ├─ EMAIL_USER (Gmail address)
  │   └─ EMAIL_PASS (App Password)
  │
  ├─ Nếu chưa cấu hình:
  │   └─ Log OTP ra console (để test)
  │
  ├─ Nếu đã cấu hình:
  │   ├─ Tạo transporter (nodemailer):
  │   │   ├─ service: "gmail"
  │   │   ├─ auth: { user: EMAIL_USER, pass: EMAIL_PASS }
  │   │
  │   ├─ Tạo email template (HTML):
  │   │   ├─ Header: "🛍️ TechStore"
  │   │   ├─ OTP Code (large, red, bold): "123456"
  │   │   ├─ Warning: "Mã có hiệu lực 10 phút"
  │   │   └─ Footer: "Email tự động, không trả lời"
  │   │
  │   └─ Gửi email qua SMTP
  │
  └─ Return: true (success) hoặc false (fail, nhưng không block flow)
  ↓
Response: {
  message: "Mã OTP đã được gửi đến email của bạn",
  sent: true
}
  ↓
User nhận email → Nhập OTP
  ↓
POST /api/reset-password
Body: {
  email: "user@example.com",
  otp: "123456",
  newPassword: "newpass123"
}
  ↓
Auth Service:
  ├─ Verify OTP:
  │   ├─ Kiểm tra OTP đúng không
  │   └─ Kiểm tra OTP chưa hết hạn
  │
  ├─ Hash password mới (bcrypt)
  ├─ UPDATE users SET password = hashedPassword, otp_code = NULL
  └─ Return success
```

#### 6.2. Email Xác Nhận Đơn Hàng

```
Order Service tạo đơn hàng thành công
  ↓
Gọi sendOrderConfirmationEmail(userId, orderId) (async, không block)
  ↓
Email Service:
  ├─ Lấy thông tin user và order từ DB
  ├─ Tạo email template:
  │   ├─ Subject: "Xác nhận đơn hàng #123 - TechStore"
  │   ├─ Order details:
  │   │   ├─ Mã đơn hàng: #123
  │   │   ├─ Ngày đặt: 15/01/2025
  │   │   ├─ Tổng tiền: 13,500,000 ₫
  │   │   ├─ Phương thức thanh toán: Ngân hàng nội địa
  │   │   ├─ Địa chỉ giao hàng: ...
  │   │   └─ Danh sách sản phẩm (table)
  │   │
  │   └─ Link: "Xem chi tiết đơn hàng"
  │
  └─ Gửi email qua SMTP
```

#### 6.3. Email Thông Báo Cập Nhật Trạng Thái Đơn Hàng

```
Admin cập nhật order status hoặc shipment status
  ↓
Order Service / Shipment Service:
  ├─ Kiểm tra status mới
  ├─ Nếu status quan trọng (shipped, delivered, cancelled):
  │   └─ Gọi sendOrderStatusUpdateEmail(userId, orderId, newStatus)
  │
  └─ Email template theo status:
      ├─ "shipped": "Đơn hàng của bạn đã được giao cho đơn vị vận chuyển"
      ├─ "delivered": "Đơn hàng của bạn đã được giao thành công!"
      └─ "cancelled": "Đơn hàng của bạn đã bị hủy"
```

**Code Implementation:**

**Email Service (services/auth-service/utils/email.js):**
```javascript
const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// Tạo transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

// Gửi OTP email
async function sendOTPEmail(to, otpCode, username = '') {
    const mailOptions = {
        from: `"TechStore" <${EMAIL_USER}>`,
        to: to,
        subject: 'Mã OTP đặt lại mật khẩu - TechStore',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
                    .content { background: #f9fafb; padding: 30px; }
                    .otp-box { background: white; border: 2px dashed #dc2626; padding: 20px; text-align: center; }
                    .otp-code { font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🛍️ TechStore</h1>
                    </div>
                    <div class="content">
                        <h2>Xin chào${username ? `, ${username}` : ''}!</h2>
                        <p>Bạn đã yêu cầu đặt lại mật khẩu.</p>
                        <div class="otp-box">
                            <p>Mã OTP của bạn:</p>
                            <div class="otp-code">${otpCode}</div>
                        </div>
                        <p><strong>Lưu ý:</strong> Mã này có hiệu lực trong 10 phút.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        if (!EMAIL_USER || !EMAIL_PASS) {
            // Log ra console nếu chưa cấu hình
            console.log('\n📧 ===== EMAIL OTP (NOT SENT - No email config) =====');
            console.log(`To: ${to}`);
            console.log(`OTP Code: ${otpCode}`);
            console.log('==================================================\n');
            return true;
        }

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email OTP đã được gửi đến ${to}`);
        return true;
    } catch (error) {
        console.error('❌ Lỗi khi gửi email:', error.message);
        // Log OTP ra console để có thể test
        console.log('\n📧 ===== EMAIL OTP (FALLBACK) =====');
        console.log(`To: ${to}`);
        console.log(`OTP Code: ${otpCode}`);
        console.log('==================================================\n');
        return false;
    }
}

module.exports = { sendOTPEmail };
```

---

### 7. 📰 WORKFLOW TIN TỨC (News)

#### 6.1. Xem Danh Sách Tin Tức

```
User → Navigate to Tech News
  ↓
GET /api/news?page=1&limit=10
  ↓
Gateway → News Service (:5005)
  ↓
News Service:
  - Query: SELECT * FROM news ORDER BY created_at DESC LIMIT/OFFSET
  ↓
Response: {
  news: [
    { id, title, summary, image, created_at },
    ...
  ],
  pagination: {...}
}
```

#### 6.2. Xem Chi Tiết Tin Tức

```
User → Click vào tin tức
  ↓
GET /api/news/:id
  ↓
News Service:
  - Query: SELECT * FROM news WHERE id = ?
  ↓
Response: {
  id, title, content, image, author, created_at, views
}
```

---

### 7. 👨‍💼 WORKFLOW ADMIN MANAGEMENT

#### 7.1. Admin Dashboard - Thống Kê Tổng Quan

```
Admin → /admin.html → Dashboard Tab
  ↓
GET /api/stats/overview
Headers: Authorization: Bearer <admin_token>
  ↓
Gateway → Direct DB Query (gateway/server.js)
  ↓
Query Multiple Statistics:
  ├─ Total Users:
  │   └─ SELECT COUNT(*) FROM users WHERE role = 'user'
  │
  ├─ Total Products:
  │   └─ SELECT COUNT(*) FROM products
  │
  ├─ Total Orders:
  │   └─ SELECT COUNT(*) FROM orders
  │
  ├─ Total Revenue:
  │   └─ SELECT SUM(total) FROM orders WHERE status != 'cancelled'
  │
  ├─ Orders by Status:
  │   └─ SELECT status, COUNT(*) FROM orders GROUP BY status
  │
  └─ Recent Orders (10 mới nhất):
      └─ SELECT * FROM orders ORDER BY created_at DESC LIMIT 10
  ↓
Response: {
  totalUsers: 150,
  totalProducts: 500,
  totalOrders: 1200,
  totalRevenue: 1500000000,
  ordersByStatus: {
    pending: 10,
    processing: 5,
    shipped: 20,
    delivered: 100,
    cancelled: 5
  },
  recentOrders: [...]
}
  ↓
Frontend:
  ├─ Hiển thị cards với số liệu
  ├─ Hiển thị biểu đồ (Chart.js hoặc tương tự)
  └─ Hiển thị bảng đơn hàng gần đây
```

#### 7.2. Admin: Quản Lý Sản Phẩm

```
Admin → Admin Panel → Products Management
  ↓
GET /api/products?page=1&limit=20
Headers: Authorization: Bearer <admin_token>
  ↓
Gateway → Product Service (:5002)
  ↓
Product Service:
  ├─ Verify token → req.user.role === 'admin'
  ├─ Query với pagination:
  │   └─ SELECT * FROM products ORDER BY created_at DESC LIMIT 20 OFFSET 0
  │
  └─ Return products list
  ↓
Admin Actions:
  ├─ Tạo sản phẩm mới:
  │   └─ POST /api/products
  │       ├─ Body: { name, price, category, description, images, stock, ... }
  │       ├─ Upload images → Lưu vào public/img/products/{id}/
  │       └─ INSERT INTO products
  │
  ├─ Cập nhật sản phẩm:
  │   └─ PUT /api/products/:id
  │       ├─ Validate product exists
  │       ├─ Update images (nếu có)
  │       └─ UPDATE products SET ...
  │
  └─ Xóa sản phẩm:
      └─ DELETE /api/products/:id
          ├─ Validate product exists
          ├─ (Soft delete: UPDATE products SET deleted_at = NOW())
          └─ Hoặc hard delete: DELETE FROM products
```

#### 7.3. Admin: Quản Lý Đơn Hàng

```
Admin → Admin Panel → Orders Management
  ↓
GET /api/orders?page=1&limit=20&status=&search=
Headers: Authorization: Bearer <admin_token>
  ↓
Gateway → Order Service (:5004)
  ↓
Order Service:
  ├─ Verify admin role
  ├─ Query với filters:
  │   ├─ Status filter (nếu có)
  │   ├─ Search by order_id hoặc customer name
  │   ├─ Pagination
  │   └─ JOIN với users để lấy customer info
  │
  └─ Return orders list
  ↓
Admin Actions:
  ├─ Xem chi tiết đơn hàng:
  │   └─ GET /api/orders/:id
  │       ├─ Lấy order + order_items + user info
  │       └─ Lấy shipment info (nếu có)
  │
  ├─ Cập nhật trạng thái:
  │   └─ PUT /api/orders/:id/status
  │       ├─ Body: { status: "processing" | "shipped" | "delivered" | "cancelled" }
  │       ├─ UPDATE orders SET status = ?
  │       ├─ INSERT INTO order_tracking
  │       └─ Gửi email thông báo (nếu cần)
  │
  └─ Hủy đơn hàng:
      └─ PUT /api/orders/:id/status
          ├─ Body: { status: "cancelled", reason: "..." }
          ├─ UPDATE orders SET status = 'cancelled'
          ├─ Hoàn lại điểm loyalty (nếu đã dùng)
          └─ Gửi email thông báo
```

#### 7.4. Admin: Quản Lý Người Dùng

```
Admin → Admin Panel → Users Management
  ↓
GET /api/users?page=1&limit=20&role=&search=
Headers: Authorization: Bearer <admin_token>
  ↓
Gateway → Auth Service (:5001)
  ↓
Auth Service (routes/users.js):
  ├─ Verify admin role
  ├─ Query với filters:
  │   ├─ Role filter (user/admin)
  │   ├─ Search by username hoặc email
  │   └─ Pagination
  │
  └─ Return users list (không trả về password)
  ↓
Admin Actions:
  ├─ Xem chi tiết user:
  │   └─ GET /api/users/:id
  │       ├─ Lấy user info + orders count + loyalty points
  │
  ├─ Cập nhật user:
  │   └─ PUT /api/users/:id
  │       ├─ Body: { role, full_name, phone, address, ... }
  │       └─ UPDATE users SET ... (không cho update password)
  │
  ├─ Khóa/Mở khóa user:
  │   └─ PUT /api/users/:id/status
  │       ├─ Body: { is_active: true/false }
  │       └─ UPDATE users SET is_active = ?
  │
  └─ Xóa user (soft delete):
      └─ DELETE /api/users/:id
          └─ UPDATE users SET deleted_at = NOW()
```

#### 7.5. Admin: Quản Lý Vận Chuyển

```
Admin → Admin Panel → Shipments Management
  ↓
GET /api/shipments/admin/list?page=1&limit=20&status=&search=
Headers: Authorization: Bearer <admin_token>
  ↓
Gateway → Shipments Route
  ↓
Query với filters:
  ├─ Status filter (pending, in_transit, delivered, ...)
  ├─ Search by tracking_number hoặc order_id
  ├─ Pagination
  └─ JOIN với orders và users
  ↓
Admin Actions:
  ├─ Tạo shipment mới (xem 5.1)
  ├─ Cập nhật status (xem 5.2)
  └─ Xem chi tiết shipment:
      └─ GET /api/shipments/:id
          ├─ Lấy shipment + events + order info
          └─ Hiển thị timeline đầy đủ
```

---

### 8. 👤 WORKFLOW HỒ SƠ NGƯỜI DÙNG (Profile)

#### 7.1. Xem Hồ Sơ

```
User → /profile.html
  ↓
GET /api/me
Headers: Authorization: Bearer <token>
  ↓
Gateway → Auth Service (:5001)
  ↓
Auth Service:
  - Extract user_id từ token
  - Query: SELECT * FROM users WHERE id = ?
  ↓
Response: {
  id, username, email, full_name, phone, address,
  date_of_birth, avatar_url, role, loyalty_points
}
```

#### 7.2. Cập Nhật Hồ Sơ

```
User → /profile.html → Chỉnh sửa thông tin
  ↓
PUT /api/profile
Headers: Authorization: Bearer <token>
Body: {
  full_name: "...",
  phone: "...",
  address: "...",
  date_of_birth: "...",
  avatar: "base64_image" (optional)
}
  ↓
Auth Service:
  - Upload avatar (nếu có)
  - UPDATE users SET ...
  ↓
Response: { message: "Cập nhật thành công", user: {...} }
```

#### 7.3. Đổi Mật Khẩu

```
User → Profile → Đổi mật khẩu
  ↓
PUT /api/change-password
Body: {
  current_password: "...",
  new_password: "..."
}
  ↓
Auth Service:
  - Verify current_password
  - Hash new_password
  - UPDATE users SET password = ?
  ↓
Response: { message: "Đổi mật khẩu thành công" }
```

---

### 8. 💬 WORKFLOW BÌNH LUẬN & ĐÁNH GIÁ (Comments & Reviews)

#### 8.1. Xem Bình Luận Sản Phẩm (Public)

```
User → Product detail page
  ↓
GET /api/comments/product/:productId
  ↓
Gateway (Direct DB Query):
  - Query: SELECT * FROM product_comments WHERE product_id = ? ORDER BY created_at DESC
  ↓
Response: {
  comments: [
    { id, username, comment, rating, created_at },
    ...
  ]
}
```

#### 8.2. Thêm Bình Luận

```
User (đã đăng nhập) → Product detail → Nhập comment
  ↓
POST /api/comments
Headers: Authorization: Bearer <token>
Body: {
  product_id: 123,
  comment: "Sản phẩm rất tốt!",
  rating: 5
}
  ↓
Gateway:
  - Verify token → req.user
  - Validate: rating 1-5, comment không rỗng
  - INSERT INTO product_comments
  ↓
Response: { message: "Thêm comment thành công", comment: {...} }
```

---

### 9. 🎁 WORKFLOW ĐIỂM THƯỜNG (Loyalty Points)

#### 9.1. Tích Điểm

```
User hoàn thành đơn hàng
  ↓
Order Service:
  - Tính điểm tích lũy (ví dụ: 1% tổng đơn)
  - UPDATE users SET loyalty_points = loyalty_points + earned_points
  - INSERT INTO loyalty_points_history
  ↓
Response: { message: "Bạn đã tích được X điểm" }
```

#### 9.2. Đổi Điểm Lấy Giảm Giá

```
User → Checkout → Chọn "Dùng điểm thưởng"
  ↓
POST /api/loyalty/use
Body: { points: 1000 }
  ↓
Order Service:
  - Kiểm tra user có đủ điểm
  - Tính discount (ví dụ: 1000 điểm = 10,000 VNĐ)
  - Trừ điểm: UPDATE users SET loyalty_points = loyalty_points - points
  ↓
Response: { discount_amount: 10000, remaining_points: 500 }
```

---

### 10. 🔍 WORKFLOW TÌM KIẾM & LỌC

#### 10.1. Tìm Kiếm Sản Phẩm

```
User → Search box → Nhập từ khóa
  ↓
GET /api/products?q=laptop+asus&category=laptop&minPrice=10000000
  ↓
Product Service:
  - Query với LIKE: WHERE name LIKE '%laptop asus%'
  - Kết hợp filters (category, price range)
  ↓
Response: { products: [...], pagination: {...} }
```

#### 10.2. Lọc Theo Danh Mục

```
User → Click vào category "Laptop"
  ↓
GET /api/products?category=laptop
  ↓
Product Service:
  - Query: WHERE category_id = (SELECT id FROM categories WHERE slug = 'laptop')
  ↓
Response: { products: [...], category_name: "Laptop" }
```

---

### 11. ⚠️ WORKFLOW XỬ LÝ LỖI & RETRY (Error Handling)

#### 11.1. Error Handling Flow

```
Request → Gateway → Service → Database
  ↓
Nếu có lỗi:
  ├─ Database Error:
  │   ├─ Connection timeout → 502 Bad Gateway
  │   ├─ Query error → 500 Internal Server Error
  │   ├─ Duplicate entry → 409 Conflict
  │   └─ Not found → 404 Not Found
  │
  ├─ Authentication Error:
  │   ├─ No token → 401 Unauthorized
  │   ├─ Invalid token → 401 Unauthorized
  │   ├─ Expired token → 401 Unauthorized (với error: "TokenExpiredError")
  │   └─ User not found → 401 Unauthorized
  │
  ├─ Authorization Error:
  │   ├─ Not admin → 403 Forbidden
  │   └─ Not owner → 403 Forbidden
  │
  ├─ Validation Error:
  │   ├─ Missing required field → 400 Bad Request
  │   ├─ Invalid format → 400 Bad Request
  │   └─ Invalid value → 400 Bad Request
  │
  ├─ Service Error:
  │   ├─ Service unavailable → 502 Bad Gateway
  │   ├─ Service timeout → 504 Gateway Timeout
  │   └─ Service error → 500 Internal Server Error
  │
  └─ Business Logic Error:
      ├─ Cart empty → 400 Bad Request
      ├─ Insufficient balance → 400 Bad Request
      ├─ Product out of stock → 400 Bad Request
      └─ Coupon expired → 400 Bad Request
  ↓
Service trả về error response:
  {
    message: "Mô tả lỗi bằng tiếng Việt",
    error: "ErrorCode" (optional),
    details: {...} (optional, chỉ trong development)
  }
  ↓
Gateway forward error đến client:
  ├─ Giữ nguyên status code
  ├─ Giữ nguyên message
  └─ Log error (console hoặc file)
  ↓
Frontend xử lý:
  ├─ 401 Unauthorized:
  │   ├─ Clear localStorage (token, user_info)
  │   ├─ Redirect đến /login.html
  │   └─ Hiển thị: "Phiên đăng nhập đã hết hạn"
  │
  ├─ 403 Forbidden:
  │   ├─ Hiển thị: "Bạn không có quyền truy cập"
  │   └─ Redirect về trang chủ
  │
  ├─ 400 Bad Request:
  │   ├─ Hiển thị message từ server
  │   └─ Highlight field lỗi (nếu có)
  │
  ├─ 404 Not Found:
  │   └─ Hiển thị: "Không tìm thấy tài nguyên"
  │
  ├─ 500/502/504:
  │   ├─ Hiển thị: "Lỗi server, vui lòng thử lại sau"
  │   └─ Log error để báo cáo
  │
  └─ Network Error:
      ├─ Hiển thị: "Không thể kết nối đến server"
      └─ Retry button (nếu có)
```

#### 11.2. Retry Logic (Frontend)

```
API Call failed (network error hoặc 5xx)
  ↓
Frontend:
  ├─ Retry counter = 0
  ├─ Max retries = 3
  ├─ Retry delay = 1000ms * (retry_counter + 1) (exponential backoff)
  │
  └─ Retry logic:
      ├─ Retry 1: Wait 1s → Retry
      ├─ Retry 2: Wait 2s → Retry
      ├─ Retry 3: Wait 3s → Retry
      └─ Nếu vẫn fail → Show error message
```

#### 11.3. Error Logging

```
Service gặp lỗi:
  ↓
Log vào console:
  ├─ Timestamp
  ├─ Error message
  ├─ Stack trace (nếu có)
  ├─ Request details (method, path, body)
  └─ User info (nếu có)
  ↓
(Production: Có thể gửi đến logging service như Sentry, LogRocket)
```

**Code Implementation:**

**Gateway Error Handling (gateway/server.js):**
```javascript
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Gateway Error:', {
        path: req.path,
        method: req.method,
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
    
    res.status(err.status || 500).json({
        message: err.message || 'Lỗi server nội bộ',
        error: err.name || 'InternalServerError'
    });
});

// Service call với error handling
async function forwardToService(serviceUrl, req, res) {
    try {
        const response = await axios({
            method: req.method.toLowerCase(),
            url: `${serviceUrl}${req.url}`,
            headers: {
                'Content-Type': 'application/json',
                ...(req.headers['authorization'] && {
                    'Authorization': req.headers['authorization']
                })
            },
            data: req.method !== 'GET' ? req.body : undefined,
            timeout: 10000 // 10 seconds
        });
        
        res.json(response.data);
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            return res.status(502).json({
                message: 'Service không phản hồi',
                error: 'ServiceUnavailable'
            });
        }
        
        if (error.code === 'ETIMEDOUT') {
            return res.status(504).json({
                message: 'Service timeout',
                error: 'GatewayTimeout'
            });
        }
        
        if (error.response) {
            // Service trả về error
            return res.status(error.response.status).json(
                error.response.data || { message: 'Lỗi từ service' }
            );
        }
        
        // Unknown error
        return res.status(500).json({
            message: 'Lỗi server nội bộ',
            error: 'InternalServerError'
        });
    }
}
```

**Frontend Error Handling (public/app.js):**
```javascript
// API call với retry logic
async function apiCall(endpoint, options = {}, retries = 3) {
    const token = localStorage.getItem('token');
    
    const config = {
        method: options.method || 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        ...(options.body && { body: JSON.stringify(options.body) })
    };
    
    for (let i = 0; i <= retries; i++) {
        try {
            const response = await fetch(`/api${endpoint}`, config);
            
            if (!response.ok) {
                const errorData = await response.json();
                
                // Handle 401 - Unauthorized
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user_info');
                    if (window.location.pathname !== '/login.html') {
                        window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
                    }
                    throw new Error(errorData.message || 'Phiên đăng nhập đã hết hạn');
                }
                
                // Handle 403 - Forbidden
                if (response.status === 403) {
                    throw new Error(errorData.message || 'Bạn không có quyền truy cập');
                }
                
                // Other errors
                throw new Error(errorData.message || `Lỗi ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            // Network error hoặc 5xx - Retry
            if (i < retries && (error.message.includes('fetch') || error.message.includes('500'))) {
                const delay = 1000 * (i + 1);
                console.log(`Retry ${i + 1}/${retries} after ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            
            // Last retry failed hoặc không phải network error
            throw error;
        }
    }
}
```

---

### 12. 📊 WORKFLOW ADMIN DASHBOARD (Đã được cập nhật ở 7.1)

#### 11.1. Thống Kê Tổng Quan

```
Admin → Admin Panel → Dashboard
  ↓
GET /api/stats/overview
Headers: Authorization: Bearer <token>
  ↓
Gateway (Direct DB Query):
  - SELECT COUNT(*) FROM users
  - SELECT COUNT(*) FROM products
  - SELECT COUNT(*), SUM(total) FROM orders
  ↓
Response: {
  totalUsers: 150,
  totalProducts: 500,
  totalOrders: 1200,
  totalRevenue: 1500000000
}
```

#### 11.2. Thống Kê Doanh Thu

```
Admin → Dashboard → Charts
  ↓
GET /api/stats/revenue
  ↓
Gateway:
  - Revenue by month (current year)
  - Orders by status (pending, processing, shipped, delivered, cancelled)
  ↓
Response: {
  months: ["T1", "T2", ..., "T12"],
  revenue: [10000000, 20000000, ...],
  ordersByStatus: {
    pending: 10,
    processing: 5,
    shipped: 20,
    delivered: 100,
    cancelled: 5
  }
}
```

---

## 🚀 WORKFLOW KHỞI ĐỘNG HỆ THỐNG

### Development Mode (Local - Không Docker)

**1. Khởi động MySQL:**
```bash
# Đảm bảo MySQL đang chạy trên localhost:3306
# Database: tttn2025
# User: root
# Password: (empty hoặc theo cấu hình)
```

**2. Cài đặt dependencies:**
```bash
# Cài đặt dependencies cho Gateway
cd gateway
npm install

# Cài đặt dependencies cho từng service
cd ../services/auth-service
npm install

cd ../product-service
npm install

cd ../cart-service
npm install

cd ../order-service
npm install

cd ../news-service
npm install
```

**3. Khởi động các services (từng terminal riêng):**
```bash
# Terminal 1: Auth Service
cd services/auth-service
node server.js
# Output: 🔐 Auth Service đang chạy tại http://localhost:5001

# Terminal 2: Product Service
cd services/product-service
node server.js
# Output: 📦 Product Service đang chạy tại http://localhost:5002

# Terminal 3: Cart Service
cd services/cart-service
node server.js
# Output: 🛒 Cart Service đang chạy tại http://localhost:5003

# Terminal 4: Order Service
cd services/order-service
node server.js
# Output: 📦 Order Service đang chạy tại http://localhost:5004

# Terminal 5: News Service
cd services/news-service
node server.js
# Output: 📰 News Service đang chạy tại http://localhost:5005

# Terminal 6: Gateway
cd gateway
node server.js
# Output: 🚀 API Gateway đang chạy tại http://localhost:5000
```

**4. Hoặc sử dụng script PowerShell (Windows):**
```powershell
# Khởi động tất cả services
.\start-services.ps1

# Kiểm tra health
.\docker-health-check.ps1
```

**5. Truy cập:**
- App: http://localhost:5000
- Admin: http://localhost:5000/admin.html

### Development Mode (Docker Compose)

**1. Khởi động MySQL trên localhost:3306:**
```bash
# Đảm bảo MySQL đang chạy
# Database: tttn2025
# User: root
# Password: (empty)
```

**2. Chạy Docker Compose:**
```bash
docker-compose up -d
```

**3. Các services tự động khởi động:**
- auth-service:5001
- product-service:5002
- cart-service:5003
- order-service:5004
- news-service:5005
- gateway:5000

**4. Health Check:**
```powershell
.\docker-health-check.ps1
```

**5. Truy cập:**
- App: http://localhost:5000
- Admin: http://localhost:5000/admin.html

### Production Mode

**1. Build Docker images:**
```bash
docker-compose build
```

**2. Set environment variables trong `.env` hoặc docker-compose.yml:**
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=tttn2025

# JWT Secret
JWT_SECRET=your_very_secure_jwt_secret_key_here

# Email (Gmail SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Google OAuth (nếu dùng)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Service URLs (trong Docker, dùng service names)
AUTH_SERVICE_URL=http://auth-service:5001
PRODUCT_SERVICE_URL=http://product-service:5002
CART_SERVICE_URL=http://cart-service:5003
ORDER_SERVICE_URL=http://order-service:5004
NEWS_SERVICE_URL=http://news-service:5005
```

**3. Start services:**
```bash
docker-compose up -d
```

**4. Monitor logs:**
```bash
# Tất cả services
docker-compose logs -f

# Một service cụ thể
docker-compose logs -f gateway
docker-compose logs -f auth-service
```

### Cấu Hình Environment Variables

**File `.env` (tạo ở root project):**
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=tttn2025

# JWT Configuration
JWT_SECRET=HhGg78@!kYpQzXcVbNmL1o2P3oI4U5yT6rE7wQ8aZ9sX0cVkGjH

# Email Configuration (Gmail SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Service URLs (Development - localhost)
AUTH_SERVICE_URL=http://localhost:5001
PRODUCT_SERVICE_URL=http://localhost:5002
CART_SERVICE_URL=http://localhost:5003
ORDER_SERVICE_URL=http://localhost:5004
NEWS_SERVICE_URL=http://localhost:5005
```

**Lưu ý:** Trong Docker, các services tự động resolve tên service, không cần set URL.

---

## 🔒 WORKFLOW BẢO MẬT

### Authentication Flow

```
1. User đăng nhập → Nhận JWT token
2. Token lưu trong localStorage
3. Mỗi request API kèm header: Authorization: Bearer <token>
4. Gateway verify token với Auth Service
5. Nếu token hợp lệ → Cho phép request
6. Nếu token hết hạn → Yêu cầu đăng nhập lại
```

### Authorization Flow

```
1. Gateway verify token → req.user = { id, username, role }
2. Kiểm tra route có yêu cầu admin?
   ├─ YES → Kiểm tra role === 'admin'
   │   ├─ YES → Cho phép
   │   └─ NO → 403 Forbidden
   └─ NO → Cho phép (user đã đăng nhập)
```

### Public Routes (Không cần token)

```
- /api/register
- /api/login
- /api/products
- /api/categories
- /api/news
- /api/comments/product/:id (GET)
- /api/coupons/validate
- /api/faqs
```

---

## 📦 WORKFLOW DATABASE

### Schema Chính

```
users
  - id, username, email, password (hashed)
  - full_name, phone, address, date_of_birth
  - avatar_url, role (user/admin)
  - loyalty_points, google_id
  - otp_code, otp_expires

products
  - id, name, description, price, discount_price
  - category_id, stock, specifications (JSON)
  - images (4 images trong img/products/{id}/)

categories
  - id, name, slug, parent_id

cart_items
  - id, user_id, product_id, quantity

orders
  - id, user_id, order_number, items (JSON)
  - total, shipping_address, shipping_method
  - payment_method, status, created_at

order_tracking
  - id, order_id, status, note, created_at

coupons
  - id, code, discount_type, discount_value
  - min_order_amount, max_usage, expires_at, is_active

product_comments
  - id, product_id, user_id, username, comment, rating

news
  - id, title, content, image, author, created_at, views
```

---

## 🔄 WORKFLOW XỬ LÝ LỖI

### Error Handling Flow

```
1. Service gặp lỗi
   ↓
2. Service trả về error response:
   {
     status: 400/401/403/404/500,
     message: "Mô tả lỗi"
   }
   ↓
3. Gateway nhận error từ service
   ↓
4. Gateway forward error đến client
   ↓
5. Frontend xử lý:
   - Hiển thị thông báo lỗi
   - Log error (nếu cần)
   - Redirect hoặc retry (tùy loại lỗi)
```

### Common Error Scenarios

```
- 401 Unauthorized: Token không hợp lệ hoặc hết hạn
- 403 Forbidden: Không có quyền truy cập (admin-only)
- 404 Not Found: Resource không tồn tại
- 400 Bad Request: Dữ liệu đầu vào không hợp lệ
- 500 Internal Server Error: Lỗi server (DB connection, etc.)
- 502 Bad Gateway: Service không phản hồi
```

---

## 🔗 GIAO TIẾP GIỮA CÁC SERVICES

### Service-to-Service Communication

**1. Gateway → Services:**
```javascript
// Gateway forward request đến service tương ứng
app.post('/api/register', async (req, res) => {
    const response = await axios.post(`${SERVICES.auth}/register`, req.body);
    res.json(response.data);
});
```

**2. Order Service → Cart Service:**
```javascript
// Order Service gọi Cart Service để lấy cart items
const cartResponse = await axios.get(`${CART_SERVICE_URL}/cart`, {
    headers: { 'Authorization': req.headers['authorization'] }
});
const cartData = cartResponse.data.cart;
```

**3. Tất cả Services → Database:**
```javascript
// Mỗi service có connection pool riêng nhưng cùng database
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tttn2025'
});

// Sử dụng trong routes
const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
```

### Database Schema Chính

**users table:**
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    password VARCHAR(255) NOT NULL,  -- Hashed với bcrypt
    role ENUM('user', 'admin') DEFAULT 'user',
    full_name VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    avatar_url VARCHAR(500),
    loyalty_points INT DEFAULT 0,
    google_id VARCHAR(255),
    otp_code VARCHAR(6),
    otp_expires DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**products table:**
```sql
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    category VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    description TEXT,
    images JSON,  -- Array of image URLs
    stock INT DEFAULT 0,
    specifications JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**carts & cart_items tables:**
```sql
CREATE TABLE carts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    status ENUM('active', 'completed', 'abandoned') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

**orders & order_items tables:**
```sql
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    shipping_address TEXT,
    shipping_phone VARCHAR(20),
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

## 📝 GHI CHÚ QUAN TRỌNG

1. **JWT Token**: Expires sau 100 ngày, cần refresh hoặc đăng nhập lại
2. **Database**: Tất cả services dùng chung MySQL database `tttn2025` với connection pool riêng
3. **Static Files**: Gateway serve static files từ `public/` folder
4. **CORS**: Gateway xử lý CORS cho frontend
5. **Session**: Không dùng session, chỉ dùng JWT stateless
6. **File Upload**: Images được lưu trong `public/img/products/{product_id}/`
7. **Email**: Dùng Gmail SMTP để gửi OTP và thông báo (config trong `config/email.js`)
8. **Payment**: Demo payment với tài khoản test trong `payment_demo_accounts` table
9. **Service Communication**: Services giao tiếp qua HTTP/axios, không dùng message queue
10. **Error Handling**: Mỗi service xử lý lỗi riêng và trả về format chuẩn

---

## 🔍 CHI TIẾT VALIDATION RULES

### 1.1. Đăng Ký (Register) - Validation Chi Tiết

**Request Body Validation:**
```javascript
{
  username: {
    required: true,
    type: 'string',
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_]+$/,  // Chỉ cho phép chữ, số, dấu gạch dưới
    trim: true,
    unique: true  // Kiểm tra trong database
  },
  password: {
    required: true,
    type: 'string',
    minLength: 6,
    maxLength: 100,
    // Không có pattern cụ thể, nhưng nên có ít nhất 1 chữ và 1 số
  },
  email: {
    required: false,
    type: 'string',
    format: 'email',  // RFC 5322 email format
    maxLength: 255,
    unique: true  // Nếu có thì phải unique
  },
  role: {
    required: false,
    type: 'string',
    enum: ['user', 'admin'],
    default: 'user'
  }
}
```

**Validation Flow:**
```
1. Kiểm tra required fields:
   ├─ username: Nếu null/undefined/empty → 400: "Username là bắt buộc"
   └─ password: Nếu null/undefined/empty → 400: "Password là bắt buộc"

2. Kiểm tra format:
   ├─ username:
   │   ├─ Length < 3 → 400: "Username phải có ít nhất 3 ký tự"
   │   ├─ Length > 50 → 400: "Username không được quá 50 ký tự"
   │   └─ Pattern không hợp lệ → 400: "Username chỉ được chứa chữ, số và dấu gạch dưới"
   │
   ├─ password:
   │   ├─ Length < 6 → 400: "Password phải có ít nhất 6 ký tự"
   │   └─ Length > 100 → 400: "Password không được quá 100 ký tự"
   │
   └─ email (nếu có):
       ├─ Format không hợp lệ → 400: "Email không đúng định dạng"
       └─ Length > 255 → 400: "Email quá dài"

3. Kiểm tra duplicate trong database:
   ├─ SELECT COUNT(*) FROM users WHERE username = ? → Nếu > 0 → 409: "Username đã tồn tại"
   └─ SELECT COUNT(*) FROM users WHERE email = ? → Nếu > 0 → 409: "Email đã được sử dụng"

4. Hash password:
   └─ bcrypt.hash(password, 10) → Lưu vào database

5. Insert vào database:
   └─ INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)
```

**Error Codes & Messages:**
```javascript
{
  400: {
    'MISSING_USERNAME': 'Username là bắt buộc',
    'MISSING_PASSWORD': 'Password là bắt buộc',
    'USERNAME_TOO_SHORT': 'Username phải có ít nhất 3 ký tự',
    'USERNAME_TOO_LONG': 'Username không được quá 50 ký tự',
    'USERNAME_INVALID_FORMAT': 'Username chỉ được chứa chữ, số và dấu gạch dưới',
    'PASSWORD_TOO_SHORT': 'Password phải có ít nhất 6 ký tự',
    'PASSWORD_TOO_LONG': 'Password không được quá 100 ký tự',
    'EMAIL_INVALID_FORMAT': 'Email không đúng định dạng',
    'EMAIL_TOO_LONG': 'Email quá dài (tối đa 255 ký tự)'
  },
  409: {
    'USERNAME_EXISTS': 'Username đã tồn tại',
    'EMAIL_EXISTS': 'Email đã được sử dụng'
  },
  500: {
    'DATABASE_ERROR': 'Lỗi kết nối database',
    'HASH_ERROR': 'Lỗi khi mã hóa password',
    'INTERNAL_ERROR': 'Lỗi máy chủ nội bộ'
  }
}
```

### 1.2. Đăng Nhập (Login) - Validation Chi Tiết

**Request Body Validation:**
```javascript
{
  username: {
    required: true,
    type: 'string',
    trim: true,
    maxLength: 50
  },
  password: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 100
  }
}
```

**Validation Flow:**
```
1. Kiểm tra required fields:
   ├─ username: Nếu null/undefined/empty → 400: "Username là bắt buộc"
   └─ password: Nếu null/undefined/empty → 400: "Password là bắt buộc"

2. Query database:
   └─ SELECT * FROM users WHERE username = ? LIMIT 1
      ├─ Nếu không tìm thấy → 401: "Username hoặc password không đúng" (không tiết lộ username không tồn tại)
      └─ Nếu tìm thấy → Tiếp tục

3. Verify password:
   └─ bcrypt.compare(password, user.password)
      ├─ Nếu false → 401: "Username hoặc password không đúng"
      └─ Nếu true → Tiếp tục

4. Kiểm tra user status (nếu có):
   ├─ is_active = false → 403: "Tài khoản đã bị khóa"
   └─ deleted_at IS NOT NULL → 403: "Tài khoản đã bị xóa"

5. Tạo JWT token:
   └─ jwt.sign({ id, username, role }, JWT_SECRET, { expiresIn: '100d' })

6. Return response:
   └─ { message, token, user: { id, username, role } }
```

**Security Considerations:**
- Không tiết lộ username có tồn tại hay không (luôn trả về cùng message)
- Rate limiting: Giới hạn số lần đăng nhập sai (ví dụ: 5 lần/15 phút)
- Log failed attempts để phát hiện brute force

### 1.3. Quên Mật Khẩu (Forgot Password) - Validation Chi Tiết

**Request Body Validation:**
```javascript
{
  email: {
    required: true,
    type: 'string',
    format: 'email',
    maxLength: 255,
    trim: true,
    toLowerCase: true  // Normalize email
  }
}
```

**Validation Flow:**
```
1. Kiểm tra required:
   └─ email: Nếu null/undefined/empty → 400: "Email là bắt buộc"

2. Validate email format:
   └─ Regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      ├─ Nếu không hợp lệ → 400: "Email không đúng định dạng"
      └─ Nếu hợp lệ → Tiếp tục

3. Query database:
   └─ SELECT id, username, email FROM users WHERE email = ? LIMIT 1
      ├─ Nếu không tìm thấy:
      │   └─ Return 200: { message: "Nếu email tồn tại, mã OTP đã được gửi", sent: true }
      │      (Không tiết lộ email có tồn tại hay không - Security best practice)
      │
      └─ Nếu tìm thấy:
          ├─ Kiểm tra rate limiting:
          │   ├─ SELECT COUNT(*) FROM otp_attempts WHERE email = ? AND created_at > NOW() - INTERVAL 15 MINUTE
          │   └─ Nếu >= 3 → 429: "Bạn đã yêu cầu quá nhiều. Vui lòng thử lại sau 15 phút"
          │
          ├─ Tạo OTP:
          │   ├─ Code: Math.floor(100000 + Math.random() * 900000) (6 chữ số)
          │   ├─ Expires: NOW() + 10 minutes
          │   └─ Lưu vào database: UPDATE users SET otp_code = ?, otp_expires = ?
          │
          ├─ Gửi email:
          │   └─ sendOTPEmail(email, otpCode, username)
          │      ├─ Nếu thành công → Log success
          │      └─ Nếu thất bại → Log error nhưng vẫn return success (không tiết lộ lỗi)
          │
          └─ Return 200: { message: "Mã OTP đã được gửi đến email của bạn", sent: true }
```

**Rate Limiting:**
- Tối đa 3 lần gửi OTP trong 15 phút cho cùng 1 email
- Tối đa 10 lần gửi OTP trong 1 giờ cho cùng 1 email
- Tối đa 50 lần gửi OTP trong 24 giờ cho cùng 1 email

### 1.4. Đặt Lại Mật Khẩu (Reset Password) - Validation Chi Tiết

**Request Body Validation:**
```javascript
{
  email: {
    required: true,
    type: 'string',
    format: 'email',
    maxLength: 255,
    trim: true,
    toLowerCase: true
  },
  otp: {
    required: true,
    type: 'string',
    length: 6,
    pattern: /^\d{6}$/  // Chỉ 6 chữ số
  },
  newPassword: {
    required: true,
    type: 'string',
    minLength: 6,
    maxLength: 100
  }
}
```

**Validation Flow:**
```
1. Kiểm tra required fields:
   ├─ email → 400: "Email là bắt buộc"
   ├─ otp → 400: "Mã OTP là bắt buộc"
   └─ newPassword → 400: "Mật khẩu mới là bắt buộc"

2. Validate format:
   ├─ email: Format hợp lệ → 400: "Email không đúng định dạng"
   ├─ otp: 6 chữ số → 400: "Mã OTP phải là 6 chữ số"
   └─ newPassword: Length >= 6 → 400: "Mật khẩu mới phải có ít nhất 6 ký tự"

3. Query database:
   └─ SELECT id, otp_code, otp_expires FROM users WHERE email = ? LIMIT 1
      ├─ Nếu không tìm thấy → 404: "Email không tồn tại"
      └─ Nếu tìm thấy:
          ├─ Kiểm tra OTP:
          │   ├─ otp_code IS NULL → 400: "Chưa có mã OTP. Vui lòng yêu cầu mã OTP trước"
          │   ├─ otp_code !== otp → 401: "Mã OTP không đúng"
          │   └─ otp_code === otp → Tiếp tục
          │
          ├─ Kiểm tra expiration:
          │   └─ otp_expires < NOW() → 401: "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới"
          │
          ├─ Kiểm tra password mới khác password cũ:
          │   └─ bcrypt.compare(newPassword, oldPassword)
          │      ├─ Nếu true → 400: "Mật khẩu mới phải khác mật khẩu cũ"
          │      └─ Nếu false → Tiếp tục
          │
          ├─ Hash password mới:
          │   └─ bcrypt.hash(newPassword, 10)
          │
          └─ Update database:
              └─ UPDATE users SET password = ?, otp_code = NULL, otp_expires = NULL WHERE id = ?
                 ├─ Nếu thành công → 200: { message: "Đặt lại mật khẩu thành công" }
                 └─ Nếu thất bại → 500: "Lỗi máy chủ nội bộ"
```

**Security Considerations:**
- OTP chỉ có thể dùng 1 lần (sau khi reset thành công, xóa OTP)
- OTP hết hạn sau 10 phút
- Giới hạn số lần nhập sai OTP (ví dụ: 5 lần/15 phút)

---

## 🗄️ DATABASE QUERIES CHI TIẾT

### 2.1. Users Table - Queries Thường Dùng

**1. Tạo User Mới:**
```sql
INSERT INTO users (username, password, email, role, created_at)
VALUES (?, ?, ?, ?, NOW());
-- Parameters: [username, hashedPassword, email, role]
-- Returns: { insertId: 123 }
```

**2. Tìm User Theo Username:**
```sql
SELECT id, username, email, password, role, full_name, phone, address, 
       date_of_birth, avatar_url, loyalty_points, google_id, 
       otp_code, otp_expires, created_at, updated_at
FROM users 
WHERE username = ? 
LIMIT 1;
-- Parameters: [username]
-- Returns: Array với 1 object hoặc []
```

**3. Tìm User Theo Email:**
```sql
SELECT id, username, email, password, role, otp_code, otp_expires
FROM users 
WHERE email = ? 
LIMIT 1;
-- Parameters: [email]
-- Returns: Array với 1 object hoặc []
```

**4. Cập Nhật OTP:**
```sql
UPDATE users 
SET otp_code = ?, 
    otp_expires = ?,
    updated_at = NOW()
WHERE id = ?;
-- Parameters: [otpCode, otpExpires, userId]
-- Returns: { affectedRows: 1 }
```

**5. Cập Nhật Password:**
```sql
UPDATE users 
SET password = ?, 
    otp_code = NULL,
    otp_expires = NULL,
    updated_at = NOW()
WHERE id = ?;
-- Parameters: [hashedPassword, userId]
-- Returns: { affectedRows: 1 }
```

**6. Lấy User Theo ID (với thông tin đầy đủ):**
```sql
SELECT u.id, u.username, u.email, u.role, u.full_name, u.phone, 
       u.address, u.date_of_birth, u.avatar_url, u.loyalty_points,
       u.created_at, u.updated_at,
       (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as total_orders,
       (SELECT SUM(total) FROM orders WHERE user_id = u.id AND status != 'cancelled') as total_spent
FROM users u
WHERE u.id = ?
LIMIT 1;
-- Parameters: [userId]
-- Returns: Array với 1 object hoặc []
```

### 2.2. Products Table - Queries Thường Dùng

**1. Lấy Danh Sách Sản Phẩm Với Filter:**
```sql
SELECT p.id, p.name, p.slug, p.category, p.price, p.original_price,
       p.description, p.main_image_url, p.stock_quantity,
       p.created_at, p.updated_at,
       CASE 
         WHEN p.original_price IS NOT NULL AND p.original_price > p.price 
         THEN ROUND(((p.original_price - p.price) / p.original_price) * 100, 0)
         ELSE 0
       END as discount_percentage
FROM products p
WHERE 1=1
  AND (? IS NULL OR p.slug = ? OR p.name LIKE ? OR p.description LIKE ? OR p.category LIKE ?)
  AND (? IS NULL OR p.category = ?)
  AND (? IS NULL OR p.price >= ?)
  AND (? IS NULL OR p.price <= ?)
ORDER BY 
  CASE WHEN ? = 'price_asc' THEN p.price END ASC,
  CASE WHEN ? = 'price_desc' THEN p.price END DESC,
  CASE WHEN ? = 'name_asc' THEN p.name END ASC,
  CASE WHEN ? = 'name_desc' THEN p.name END DESC,
  CASE WHEN ? = 'created_desc' THEN p.created_at END DESC,
  p.id ASC
LIMIT ? OFFSET ?;
-- Parameters: [searchTerm, searchTerm, '%searchTerm%', '%searchTerm%', '%searchTerm%',
--              category, category, minPrice, minPrice, maxPrice, maxPrice,
--              sort, sort, sort, sort, sort, sort,
--              limit, offset]
-- Returns: Array of products
```

**2. Đếm Tổng Số Sản Phẩm (Với Filter):**
```sql
SELECT COUNT(*) as total
FROM products p
WHERE 1=1
  AND (? IS NULL OR p.slug = ? OR p.name LIKE ? OR p.description LIKE ? OR p.category LIKE ?)
  AND (? IS NULL OR p.category = ?)
  AND (? IS NULL OR p.price >= ?)
  AND (? IS NULL OR p.price <= ?);
-- Parameters: [searchTerm, searchTerm, '%searchTerm%', '%searchTerm%', '%searchTerm%',
--              category, category, minPrice, minPrice, maxPrice, maxPrice]
-- Returns: [{ total: 100 }]
```

**3. Lấy Chi Tiết Sản Phẩm:**
```sql
SELECT p.id, p.name, p.slug, p.category, p.price, p.original_price,
       p.description, p.main_image_url, p.image_url, p.stock_quantity,
       p.brand, p.specifications, p.created_at, p.updated_at,
       (SELECT AVG(rating) FROM product_comments WHERE product_id = p.id) as avg_rating,
       (SELECT COUNT(*) FROM product_comments WHERE product_id = p.id) as review_count
FROM products p
WHERE p.id = ? OR p.slug = ?
LIMIT 1;
-- Parameters: [idOrSlug, idOrSlug]
-- Returns: Array với 1 object hoặc []
```

**4. Kiểm Tra Stock:**
```sql
SELECT id, name, stock_quantity, price
FROM products
WHERE id = ? AND stock_quantity >= ?;
-- Parameters: [productId, requiredQuantity]
-- Returns: Array với 1 object hoặc [] (nếu không đủ stock)
```

### 2.3. Cart & Cart Items - Queries Thường Dùng

**1. Lấy Hoặc Tạo Cart:**
```sql
-- Tìm cart active
SELECT id, user_id, status, created_at
FROM carts
WHERE user_id = ? AND status = 'active'
LIMIT 1;

-- Nếu không có, tạo mới
INSERT INTO carts (user_id, status, created_at)
VALUES (?, 'active', NOW());
-- Returns: { insertId: 123 }
```

**2. Lấy Cart Items Với Thông Tin Sản Phẩm:**
```sql
SELECT ci.id, ci.cart_id, ci.product_id, ci.quantity, ci.price,
       p.name as product_name, p.slug as product_slug, 
       p.category as product_category, p.main_image_url as product_image,
       p.stock_quantity as product_stock,
       (ci.price * ci.quantity) as subtotal
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
WHERE ci.cart_id = ?
ORDER BY ci.created_at DESC;
-- Parameters: [cartId]
-- Returns: Array of cart items
```

**3. Tính Tổng Tiền Cart:**
```sql
SELECT SUM(price * quantity) as total, COUNT(*) as item_count
FROM cart_items
WHERE cart_id = ?;
-- Parameters: [cartId]
-- Returns: [{ total: 15000000, item_count: 3 }]
```

**4. Kiểm Tra Item Đã Có Trong Cart:**
```sql
SELECT id, quantity, price
FROM cart_items
WHERE cart_id = ? AND product_id = ?
LIMIT 1;
-- Parameters: [cartId, productId]
-- Returns: Array với 1 object hoặc []
```

**5. Cập Nhật Quantity:**
```sql
UPDATE cart_items
SET quantity = ?, updated_at = NOW()
WHERE id = ?;
-- Parameters: [newQuantity, itemId]
-- Returns: { affectedRows: 1 }
```

### 2.4. Orders & Order Items - Queries Thường Dùng

**1. Tạo Đơn Hàng (Transaction):**
```sql
BEGIN;

-- Tạo order
INSERT INTO orders (user_id, total, shipping_address, shipping_phone, 
                    payment_method, payment_details, status, created_at)
VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW());
-- Returns: { insertId: 123 }

-- Tạo order items
INSERT INTO order_items (order_id, product_id, quantity, price)
VALUES (?, ?, ?, ?);
-- Repeat cho mỗi item

-- Cập nhật stock (giảm số lượng)
UPDATE products
SET stock_quantity = stock_quantity - ?
WHERE id = ? AND stock_quantity >= ?;
-- Repeat cho mỗi product

COMMIT;
-- Nếu có lỗi: ROLLBACK;
```

**2. Lấy Danh Sách Đơn Hàng Của User:**
```sql
SELECT o.id, o.order_number, o.total, o.status, o.shipping_address,
       o.shipping_phone, o.payment_method, o.created_at, o.updated_at,
       (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
       (SELECT status FROM order_tracking WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) as latest_status
FROM orders o
WHERE o.user_id = ?
ORDER BY o.created_at DESC
LIMIT ? OFFSET ?;
-- Parameters: [userId, limit, offset]
-- Returns: Array of orders
```

**3. Lấy Chi Tiết Đơn Hàng:**
```sql
SELECT o.id, o.order_number, o.user_id, o.total, o.status,
       o.shipping_address, o.shipping_phone, o.payment_method,
       o.payment_details, o.created_at, o.updated_at,
       u.username, u.email, u.phone as user_phone
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.id = ?
LIMIT 1;

-- Lấy order items
SELECT oi.id, oi.product_id, oi.quantity, oi.price,
       p.name as product_name, p.slug as product_slug,
       p.main_image_url as product_image,
       (oi.price * oi.quantity) as subtotal
FROM order_items oi
JOIN products p ON oi.product_id = p.id
WHERE oi.order_id = ?;
-- Parameters: [orderId]
-- Returns: Array of order items
```

---

## ⚠️ EDGE CASES & EXCEPTION HANDLING

### 3.1. Edge Cases - Đăng Ký

**Case 1: Username có ký tự đặc biệt**
```
Input: username = "user@123"
Validation: Pattern check fails
Response: 400 - "Username chỉ được chứa chữ, số và dấu gạch dưới"
```

**Case 2: Username quá dài**
```
Input: username = "a".repeat(100)
Validation: Length check fails
Response: 400 - "Username không được quá 50 ký tự"
```

**Case 3: Password trùng với username**
```
Input: username = "user123", password = "user123"
Validation: (Optional) Check if password === username
Response: 400 - "Mật khẩu không được trùng với username"
```

**Case 4: Email đã được sử dụng bởi user khác**
```
Input: email = "existing@example.com"
Database: SELECT COUNT(*) FROM users WHERE email = ? → 1
Response: 409 - "Email đã được sử dụng"
```

**Case 5: Database connection timeout**
```
Error: ECONNREFUSED hoặc ETIMEDOUT
Response: 500 - "Lỗi kết nối database. Vui lòng thử lại sau"
Log: Error details vào log file
```

### 3.2. Edge Cases - Đăng Nhập

**Case 1: User đã bị xóa (soft delete)**
```
Database: SELECT * FROM users WHERE username = ? AND deleted_at IS NULL
If deleted_at IS NOT NULL:
Response: 401 - "Tài khoản không tồn tại hoặc đã bị xóa"
```

**Case 2: User bị khóa (is_active = false)**
```
Database: SELECT * FROM users WHERE username = ? AND is_active = TRUE
If is_active = FALSE:
Response: 403 - "Tài khoản đã bị khóa. Vui lòng liên hệ admin"
```

**Case 3: Quá nhiều lần đăng nhập sai (Rate Limiting)**
```
Check: SELECT COUNT(*) FROM login_attempts 
       WHERE username = ? AND created_at > NOW() - INTERVAL 15 MINUTE
If count >= 5:
Response: 429 - "Bạn đã đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút"
```

**Case 4: JWT_SECRET không được set**
```
Error: JWT_SECRET is undefined
Response: 500 - "Lỗi cấu hình server"
Log: Critical error - JWT_SECRET missing
```

### 3.3. Edge Cases - Cart

**Case 1: Thêm sản phẩm đã hết hàng**
```
Database: SELECT stock_quantity FROM products WHERE id = ?
If stock_quantity < quantity:
Response: 400 - "Sản phẩm không đủ số lượng. Số lượng còn lại: {stock_quantity}"
```

**Case 2: Thêm sản phẩm không tồn tại**
```
Database: SELECT * FROM products WHERE id = ?
If not found:
Response: 404 - "Sản phẩm không tồn tại"
```

**Case 3: Quantity vượt quá stock khi cập nhật**
```
Current cart quantity: 5
Request update quantity: 10
Product stock: 8
Validation: 5 + (10 - 5) = 10 > 8
Response: 400 - "Số lượng vượt quá tồn kho. Số lượng tối đa: 8"
```

**Case 4: Cart của user khác (Security)**
```
Request: DELETE /api/cart/items/123
Database: SELECT cart_id, user_id FROM cart_items WHERE id = 123
Check: cart.user_id !== req.user.id
Response: 403 - "Bạn không có quyền xóa item này"
```

### 3.4. Edge Cases - Orders

**Case 1: Cart rỗng khi tạo order**
```
Cart Service: GET /cart → { items: [] }
Response: 400 - "Giỏ hàng không có sản phẩm"
```

**Case 2: Sản phẩm hết hàng giữa lúc checkout**
```
Step 1: Lấy cart items (có stock)
Step 2: User nhập thông tin (mất 5 phút)
Step 3: Tạo order → Product đã hết hàng
Validation: Check stock trước khi tạo order
Response: 400 - "Sản phẩm '{product_name}' đã hết hàng"
```

**Case 3: Coupon đã hết lượt sử dụng**
```
Database: SELECT * FROM coupons WHERE code = ?
Check: current_usage >= max_usage
Response: 400 - "Mã giảm giá đã hết lượt sử dụng"
```

**Case 4: Coupon đã hết hạn**
```
Database: SELECT * FROM coupons WHERE code = ? AND expires_at > NOW()
If expires_at < NOW():
Response: 400 - "Mã giảm giá đã hết hạn"
```

**Case 5: Loyalty points không đủ**
```
Request: use_loyalty_points = 1000
Database: SELECT balance FROM loyalty_points WHERE user_id = ?
If balance < 1000:
Response: 400 - "Bạn không đủ điểm thưởng. Số điểm hiện có: {balance}"
```

**Case 6: Payment account không đủ số dư**
```
Request: payment_method = "bank_transfer", account_number = "9704151234567890"
Database: SELECT balance FROM payment_demo_accounts WHERE account_number = ?
Check: balance < order_total
Response: 400 - "Số dư tài khoản không đủ. Số dư hiện có: {balance} VNĐ"
```

**Case 7: Transaction rollback khi có lỗi**
```
BEGIN TRANSACTION;
  INSERT INTO orders ... → Success
  INSERT INTO order_items ... → Success
  UPDATE products SET stock_quantity ... → Error (constraint violation)
ROLLBACK;
Response: 500 - "Lỗi khi tạo đơn hàng. Vui lòng thử lại"
```

---

## 📊 RESPONSE FORMATS CHI TIẾT

### 4.1. Success Response Formats

**Standard Success (200 OK):**
```json
{
  "message": "Thông báo thành công",
  "data": {
    // Response data
  }
}
```

**Created Success (201 Created):**
```json
{
  "message": "Tạo thành công",
  "id": 123,
  "data": {
    // Created resource
  }
}
```

**List Response (200 OK):**
```json
{
  "items": [
    {
      "id": 1,
      "name": "...",
      // ... other fields
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Detail Response (200 OK):**
```json
{
  "id": 123,
  "name": "...",
  // ... all fields
  "related": {
    // Related data (optional)
  }
}
```

### 4.2. Error Response Formats

**Validation Error (400 Bad Request):**
```json
{
  "message": "Dữ liệu đầu vào không hợp lệ",
  "errors": [
    {
      "field": "username",
      "message": "Username phải có ít nhất 3 ký tự"
    },
    {
      "field": "email",
      "message": "Email không đúng định dạng"
    }
  ],
  "error": "VALIDATION_ERROR"
}
```

**Authentication Error (401 Unauthorized):**
```json
{
  "message": "Token không hợp lệ hoặc đã hết hạn",
  "error": "UNAUTHORIZED",
  "errorCode": "TOKEN_EXPIRED" | "TOKEN_INVALID" | "TOKEN_MISSING"
}
```

**Authorization Error (403 Forbidden):**
```json
{
  "message": "Bạn không có quyền truy cập tài nguyên này",
  "error": "FORBIDDEN",
  "requiredRole": "admin"
}
```

**Not Found Error (404 Not Found):**
```json
{
  "message": "Không tìm thấy tài nguyên",
  "error": "NOT_FOUND",
  "resource": "product",
  "id": 123
}
```

**Conflict Error (409 Conflict):**
```json
{
  "message": "Username đã tồn tại",
  "error": "CONFLICT",
  "field": "username",
  "value": "user123"
}
```

**Server Error (500 Internal Server Error):**
```json
{
  "message": "Lỗi máy chủ nội bộ",
  "error": "INTERNAL_SERVER_ERROR"
  // Không trả về stack trace trong production
}
```

**Service Unavailable (502 Bad Gateway):**
```json
{
  "message": "Service không phản hồi",
  "error": "SERVICE_UNAVAILABLE",
  "service": "auth-service"
}
```

---

## 🔒 SECURITY DETAILS

### 5.1. Password Security

**Hashing Algorithm:**
- Algorithm: bcrypt
- Salt Rounds: 10
- Example: `$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`

**Password Requirements:**
- Minimum length: 6 characters
- Maximum length: 100 characters
- Recommended: At least 1 uppercase, 1 lowercase, 1 number, 1 special character
- Not allowed: Same as username, common passwords (123456, password, etc.)

**Password Storage:**
- Never store plain text passwords
- Always hash before storing
- Never log passwords (even hashed) in production

### 5.2. JWT Token Security

**Token Structure:**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "id": 123,
    "username": "user123",
    "role": "user",
    "iat": 1704067200,
    "exp": 1735689600
  },
  "signature": "HMACSHA256(base64UrlEncode(header) + '.' + base64UrlEncode(payload), secret)"
}
```

**Token Expiration:**
- Default: 100 days
- Refresh token: Not implemented (future enhancement)
- Token blacklist: Not implemented (future enhancement)

**Token Storage:**
- Client: localStorage (vulnerable to XSS)
- Alternative: httpOnly cookies (more secure, but requires CORS setup)

**Token Validation:**
1. Check signature với JWT_SECRET
2. Check expiration (exp claim)
3. Check user still exists in database
4. Check user is_active = true

### 5.3. SQL Injection Prevention

**Parameterized Queries:**
```javascript
// ✅ CORRECT - Parameterized
const [rows] = await pool.query(
  'SELECT * FROM users WHERE username = ?',
  [username]
);

// ❌ WRONG - String concatenation (vulnerable)
const query = `SELECT * FROM users WHERE username = '${username}'`;
```

**Always Use:**
- `pool.query(sql, [params])` với parameterized queries
- Never concatenate user input vào SQL string
- Validate and sanitize input before querying

### 5.4. XSS Prevention

**Input Sanitization:**
- Sanitize user input (username, email, comments)
- Use libraries: `validator`, `sanitize-html`
- Escape HTML in output

**Example:**
```javascript
const validator = require('validator');
const sanitizeHtml = require('sanitize-html');

// Sanitize username
const sanitizedUsername = validator.escape(username);

// Sanitize HTML content
const sanitizedContent = sanitizeHtml(content, {
  allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p'],
  allowedAttributes: { 'a': ['href'] }
});
```

### 5.5. CORS Configuration

**Gateway CORS Setup:**
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Security Headers:**
```javascript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

---

## ⚡ PERFORMANCE CONSIDERATIONS

### 6.1. Database Optimization

**Indexes:**
```sql
-- Users table
CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_role ON users(role);

-- Products table
CREATE INDEX idx_category ON products(category);
CREATE INDEX idx_slug ON products(slug);
CREATE INDEX idx_price ON products(price);
CREATE INDEX idx_created_at ON products(created_at);

-- Orders table
CREATE INDEX idx_user_id ON orders(user_id);
CREATE INDEX idx_status ON orders(status);
CREATE INDEX idx_created_at ON orders(created_at);

-- Cart items
CREATE INDEX idx_cart_id ON cart_items(cart_id);
CREATE INDEX idx_product_id ON cart_items(product_id);
```

**Query Optimization:**
- Use `LIMIT` và `OFFSET` cho pagination
- Use `SELECT` chỉ các fields cần thiết (không dùng `SELECT *`)
- Use `JOIN` thay vì multiple queries khi có thể
- Cache frequently accessed data (Redis - future)

### 6.2. Connection Pooling

**Configuration:**
```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tttn2025',
  waitForConnections: true,
  connectionLimit: 10,        // Max connections in pool
  queueLimit: 0,              // Unlimited queue
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});
```

**Best Practices:**
- Reuse connections từ pool
- Release connections sau khi dùng xong
- Monitor pool usage và adjust `connectionLimit` nếu cần

### 6.3. API Response Time

**Target Response Times:**
- Simple queries: < 100ms
- Complex queries với JOIN: < 500ms
- External API calls: < 2000ms (with timeout)

**Optimization:**
- Use pagination cho large datasets
- Implement caching cho static data (categories, FAQs)
- Use async/await properly (không block event loop)
- Monitor slow queries và optimize

---

## 🧪 TESTING SCENARIOS

### 7.1. Unit Test Scenarios - Register

**Test Case 1: Successful Registration**
```
Input: { username: "newuser", password: "password123" }
Expected: 201 - { message: "Đăng ký thành công! Vui lòng đăng nhập." }
Database: User được tạo với password đã hash
```

**Test Case 2: Duplicate Username**
```
Input: { username: "existinguser", password: "password123" }
Expected: 409 - { message: "Username đã tồn tại" }
Database: Không có user mới được tạo
```

**Test Case 3: Invalid Username Format**
```
Input: { username: "user@123", password: "password123" }
Expected: 400 - { message: "Username chỉ được chứa chữ, số và dấu gạch dưới" }
```

**Test Case 4: Password Too Short**
```
Input: { username: "newuser", password: "123" }
Expected: 400 - { message: "Password phải có ít nhất 6 ký tự" }
```

### 7.2. Integration Test Scenarios - Order Flow

**Test Case 1: Complete Order Flow**
```
1. User đăng nhập → Get token
2. Add products to cart → Cart có items
3. Apply coupon → Discount calculated
4. Use loyalty points → Points deducted
5. Create order → Order created với status 'pending'
6. Verify cart cleared → Cart empty
7. Verify stock reduced → Product stock updated
8. Verify loyalty points earned → Points added
```

**Test Case 2: Order với Cart Rỗng**
```
1. User đăng nhập → Get token
2. Cart empty
3. Create order → 400 - "Giỏ hàng không có sản phẩm"
```

**Test Case 3: Order với Sản Phẩm Hết Hàng**
```
1. User đăng nhập → Get token
2. Add product to cart (stock = 5)
3. Admin reduces stock to 0
4. User creates order → 400 - "Sản phẩm '{name}' đã hết hàng"
```

---

## 📈 MONITORING & LOGGING

### 8.1. Logging Levels

**Error Logging:**
```javascript
console.error('ERROR:', {
  timestamp: new Date().toISOString(),
  level: 'ERROR',
  message: error.message,
  stack: error.stack,
  request: {
    method: req.method,
    path: req.path,
    body: req.body,
    user: req.user?.id
  }
});
```

**Info Logging:**
```javascript
console.log('INFO:', {
  timestamp: new Date().toISOString(),
  level: 'INFO',
  message: 'User logged in',
  userId: user.id,
  username: user.username
});
```

**Warning Logging:**
```javascript
console.warn('WARN:', {
  timestamp: new Date().toISOString(),
  level: 'WARN',
  message: 'Failed to send email, but continuing',
  error: error.message
});
```

### 8.2. Metrics to Monitor

**API Metrics:**
- Request count per endpoint
- Response time per endpoint
- Error rate per endpoint
- 4xx vs 5xx errors

**Database Metrics:**
- Connection pool usage
- Query execution time
- Slow queries (> 1 second)
- Deadlocks và timeouts

**Service Metrics:**
- Service uptime
- Memory usage
- CPU usage
- Request queue length

---

## 🔄 TRANSACTION HANDLING CHI TIẾT

### 9.1. Order Creation Transaction

**Transaction Flow:**
```javascript
const connection = await pool.getConnection();
await connection.beginTransaction();

try {
  // Step 1: Validate cart
  const cartResponse = await axios.get(`${CART_SERVICE_URL}/cart`, {
    headers: { 'Authorization': req.headers['authorization'] }
  });
  const cartData = cartResponse.data.cart;
  
  if (!cartData.items || cartData.items.length === 0) {
    await connection.rollback();
    return res.status(400).json({ message: 'Giỏ hàng không có sản phẩm' });
  }
  
  // Step 2: Validate và lock products (SELECT FOR UPDATE)
  for (const item of cartData.items) {
    const [products] = await connection.query(
      'SELECT id, name, stock_quantity, price FROM products WHERE id = ? FOR UPDATE',
      [item.product_id]
    );
    
    if (products.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        message: `Sản phẩm ID ${item.product_id} không tồn tại` 
      });
    }
    
    const product = products[0];
    if (product.stock_quantity < item.quantity) {
      await connection.rollback();
      return res.status(400).json({ 
        message: `Sản phẩm "${product.name}" không đủ số lượng. Còn lại: ${product.stock_quantity}` 
      });
    }
  }
  
  // Step 3: Calculate totals
  let subtotal = parseFloat(cartData.total || 0);
  let shippingFee = calculateShippingFee(req.body.shipping_method);
  let discountAmount = 0;
  let loyaltyDiscount = 0;
  
  // Step 4: Apply coupon (nếu có)
  if (req.body.coupon_code) {
    const [coupons] = await connection.query(
      'SELECT * FROM coupons WHERE code = ? AND is_active = TRUE AND expires_at > NOW()',
      [req.body.coupon_code]
    );
    
    if (coupons.length > 0) {
      const coupon = coupons[0];
      if (coupon.current_usage < coupon.max_usage && subtotal >= coupon.min_order_amount) {
        if (coupon.discount_type === 'percentage') {
          discountAmount = subtotal * (coupon.discount_value / 100);
        } else {
          discountAmount = coupon.discount_value;
        }
        discountAmount = Math.min(discountAmount, coupon.max_discount || discountAmount);
        
        // Increment usage
        await connection.query(
          'UPDATE coupons SET current_usage = current_usage + 1 WHERE id = ?',
          [coupon.id]
        );
      }
    }
  }
  
  // Step 5: Apply loyalty points (nếu có)
  if (req.body.use_loyalty_points && req.body.use_loyalty_points > 0) {
    const [points] = await connection.query(
      'SELECT balance FROM loyalty_points WHERE user_id = ? FOR UPDATE',
      [userId]
    );
    
    if (points.length > 0 && points[0].balance >= req.body.use_loyalty_points) {
      loyaltyDiscount = req.body.use_loyalty_points * 1000; // 1 point = 1000 VNĐ
      
      // Deduct points
      await connection.query(
        'UPDATE loyalty_points SET balance = balance - ? WHERE user_id = ?',
        [req.body.use_loyalty_points, userId]
      );
    }
  }
  
  const finalTotal = Math.max(0, subtotal + shippingFee - discountAmount - loyaltyDiscount);
  
  // Step 6: Create order
  const [orderResult] = await connection.query(
    `INSERT INTO orders (user_id, total, shipping_address, shipping_phone, 
                         payment_method, payment_details, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())`,
    [
      userId,
      finalTotal,
      req.body.shipping_address,
      req.body.phone,
      req.body.payment_method,
      JSON.stringify(req.body.payment_details || {})
    ]
  );
  const orderId = orderResult.insertId;
  
  // Step 7: Create order items và update stock
  for (const item of cartData.items) {
    // Insert order item
    await connection.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
      [orderId, item.product_id, item.quantity, item.price]
    );
    
    // Update stock
    await connection.query(
      'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
      [item.quantity, item.product_id]
    );
  }
  
  // Step 8: Earn loyalty points
  const earnedPoints = Math.floor(finalTotal / 10000); // 1 point per 10,000 VNĐ
  if (earnedPoints > 0) {
    await connection.query(
      'INSERT INTO loyalty_points (user_id, balance) VALUES (?, ?) ON DUPLICATE KEY UPDATE balance = balance + ?',
      [userId, earnedPoints, earnedPoints]
    );
    
    await connection.query(
      'INSERT INTO loyalty_points_history (user_id, order_id, points, type, description) VALUES (?, ?, ?, ?, ?)',
      [userId, orderId, earnedPoints, 'earned', `Tích điểm từ đơn hàng #${orderId}`]
    );
  }
  
  // Step 9: Clear cart
  const [carts] = await connection.query(
    'SELECT id FROM carts WHERE user_id = ? AND status = ?',
    [userId, 'active']
  );
  if (carts.length > 0) {
    const cartId = carts[0].id;
    await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
    await connection.query('UPDATE carts SET status = ? WHERE id = ?', ['completed', cartId]);
  }
  
  // Step 10: Create tracking
  await connection.query(
    'INSERT INTO order_tracking (order_id, status, note, created_at) VALUES (?, ?, ?, NOW())',
    [orderId, 'pending', 'Đơn hàng đã được tạo']
  );
  
  // Commit transaction
  await connection.commit();
  
  res.status(201).json({
    message: 'Đặt hàng thành công',
    order: {
      id: orderId,
      total: finalTotal,
      status: 'pending'
    }
  });
  
} catch (error) {
  // Rollback on any error
  await connection.rollback();
  console.error('Order creation error:', error);
  res.status(500).json({ message: 'Lỗi khi tạo đơn hàng' });
} finally {
  // Always release connection
  connection.release();
}
```

**Transaction Isolation Level:**
- Default: `REPEATABLE READ` (MySQL default)
- For order creation: Use `SELECT FOR UPDATE` để lock rows và tránh race condition

**Deadlock Handling:**
```javascript
let retries = 3;
while (retries > 0) {
  try {
    await connection.beginTransaction();
    // ... transaction code ...
    await connection.commit();
    break; // Success
  } catch (error) {
    if (error.code === 'ER_LOCK_DEADLOCK' && retries > 0) {
      retries--;
      await new Promise(resolve => setTimeout(resolve, 100 * (4 - retries))); // Exponential backoff
      continue;
    }
    await connection.rollback();
    throw error;
  }
}
```

---

## 🛠️ TROUBLESHOOTING GUIDE

### 10.1. Common Issues & Solutions

**Issue 1: Service không khởi động được**

**Symptoms:**
- Service không listen trên port
- Error: `EADDRINUSE: address already in use`

**Solutions:**
```bash
# Kiểm tra port đang được sử dụng
netstat -ano | findstr :5001  # Windows
lsof -i :5001                 # Linux/Mac

# Kill process đang dùng port
taskkill /PID <pid> /F         # Windows
kill -9 <pid>                  # Linux/Mac

# Hoặc đổi port trong .env
PORT=5006
```

**Issue 2: Database Connection Error**

**Symptoms:**
- Error: `ECONNREFUSED` hoặc `ETIMEDOUT`
- Error: `Access denied for user`

**Solutions:**
```bash
# 1. Kiểm tra MySQL đang chạy
mysql -u root -p -e "SELECT 1"

# 2. Kiểm tra credentials trong .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=tttn2025

# 3. Kiểm tra database tồn tại
mysql -u root -p -e "SHOW DATABASES LIKE 'tttn2025'"

# 4. Kiểm tra connection pool limit
# Tăng connectionLimit trong pool config nếu cần
```

**Issue 3: JWT Token Invalid**

**Symptoms:**
- Error: `Token không hợp lệ`
- Error: `TokenExpiredError`

**Solutions:**
```javascript
// 1. Kiểm tra JWT_SECRET được set
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

// 2. Kiểm tra token format
const token = req.headers['authorization']?.replace('Bearer ', '');
console.log('Token:', token?.substring(0, 20) + '...');

// 3. Verify token manually
const decoded = jwt.verify(token, JWT_SECRET);
console.log('Decoded:', decoded);

// 4. Kiểm tra expiration
if (decoded.exp < Date.now() / 1000) {
  // Token expired
}
```

**Issue 4: Cart Items Không Hiển Thị**

**Symptoms:**
- GET /api/cart trả về items rỗng
- Items không được lưu vào database

**Solutions:**
```sql
-- 1. Kiểm tra cart tồn tại
SELECT * FROM carts WHERE user_id = ? AND status = 'active';

-- 2. Kiểm tra cart_items
SELECT * FROM cart_items WHERE cart_id = ?;

-- 3. Kiểm tra foreign key constraints
SHOW CREATE TABLE cart_items;

-- 4. Kiểm tra product_id tồn tại
SELECT * FROM products WHERE id IN (SELECT product_id FROM cart_items WHERE cart_id = ?);
```

**Issue 5: Order Không Được Tạo**

**Symptoms:**
- POST /api/orders trả về 500
- Transaction rollback

**Solutions:**
```javascript
// 1. Kiểm tra cart có items không
const cart = await getCart(userId);
if (!cart.items || cart.items.length === 0) {
  return res.status(400).json({ message: 'Giỏ hàng không có sản phẩm' });
}

// 2. Kiểm tra stock
for (const item of cart.items) {
  const product = await getProduct(item.product_id);
  if (product.stock_quantity < item.quantity) {
    return res.status(400).json({ 
      message: `Sản phẩm "${product.name}" không đủ số lượng` 
    });
  }
}

// 3. Kiểm tra transaction
try {
  await connection.beginTransaction();
  // ... transaction code ...
  await connection.commit();
} catch (error) {
  await connection.rollback();
  console.error('Transaction error:', error);
  // Log full error để debug
}
```

**Issue 6: Email Không Gửi Được**

**Symptoms:**
- OTP email không đến
- Error: `Invalid login` hoặc `Authentication failed`

**Solutions:**
```javascript
// 1. Kiểm tra email config
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');

// 2. Test email connection
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Email config error:', error);
  } else {
    console.log('Email server ready');
  }
});

// 3. Sử dụng App Password (không phải Gmail password)
// Tạo App Password tại: https://myaccount.google.com/apppasswords
```

---

## 🚀 DEPLOYMENT CHECKLIST

### 11.1. Pre-Deployment Checklist

**Environment Variables:**
- [ ] `DB_HOST` - Database host
- [ ] `DB_USER` - Database user
- [ ] `DB_PASSWORD` - Database password
- [ ] `DB_NAME` - Database name
- [ ] `JWT_SECRET` - JWT secret key (strong, random)
- [ ] `EMAIL_USER` - Gmail address
- [ ] `EMAIL_PASS` - Gmail App Password
- [ ] `PORT` - Service port (5001-5005, 5000 for gateway)
- [ ] `NODE_ENV` - `production` hoặc `development`

**Database:**
- [ ] Database `tttn2025` đã được tạo
- [ ] Tất cả tables đã được tạo (run migration scripts)
- [ ] Indexes đã được tạo
- [ ] Foreign keys đã được set
- [ ] Test data đã được seed (nếu cần)

**Services:**
- [ ] Tất cả services đã được test locally
- [ ] Health check endpoints hoạt động
- [ ] Services có thể communicate với nhau
- [ ] Gateway có thể route đến tất cả services

**Security:**
- [ ] JWT_SECRET là strong và random
- [ ] Database password là strong
- [ ] CORS đã được config đúng
- [ ] Rate limiting đã được implement (nếu có)
- [ ] Input validation đã được implement

**Monitoring:**
- [ ] Logging đã được setup
- [ ] Error tracking đã được setup (nếu có)
- [ ] Health check endpoints accessible

### 11.2. Deployment Steps

**Step 1: Prepare Environment**
```bash
# 1. Clone repository
git clone <repository-url>
cd TTTN2025

# 2. Install dependencies
cd gateway && npm install
cd ../services/auth-service && npm install
cd ../product-service && npm install
cd ../cart-service && npm install
cd ../order-service && npm install
cd ../news-service && npm install

# 3. Create .env file
cp .env.example .env
# Edit .env với production values
```

**Step 2: Database Setup**
```bash
# 1. Create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS tttn2025 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Run migration scripts
mysql -u root -p tttn2025 < database/schema.sql

# 3. Seed initial data (optional)
node database/seed_data.js
```

**Step 3: Start Services**
```bash
# Option 1: Manual (Development)
# Terminal 1
cd services/auth-service && node server.js

# Terminal 2
cd services/product-service && node server.js

# Terminal 3
cd services/cart-service && node server.js

# Terminal 4
cd services/order-service && node server.js

# Terminal 5
cd services/news-service && node server.js

# Terminal 6
cd gateway && node server.js

# Option 2: Docker Compose (Production)
docker-compose up -d

# Option 3: PM2 (Production)
pm2 start ecosystem.config.js
```

**Step 4: Verify Deployment**
```bash
# 1. Check all services health
curl http://localhost:5001/health  # Auth
curl http://localhost:5002/health  # Product
curl http://localhost:5003/health  # Cart
curl http://localhost:5004/health  # Order
curl http://localhost:5005/health  # News
curl http://localhost:5000/health  # Gateway

# 2. Test API endpoints
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'

# 3. Check logs
docker-compose logs -f  # Docker
pm2 logs                # PM2
```

### 11.3. Post-Deployment Verification

**Functional Tests:**
- [ ] User có thể đăng ký
- [ ] User có thể đăng nhập
- [ ] User có thể xem sản phẩm
- [ ] User có thể thêm vào giỏ hàng
- [ ] User có thể tạo đơn hàng
- [ ] Admin có thể quản lý sản phẩm
- [ ] Admin có thể quản lý đơn hàng

**Performance Tests:**
- [ ] API response time < 500ms (average)
- [ ] Database queries < 100ms (average)
- [ ] No memory leaks
- [ ] Connection pool hoạt động đúng

**Security Tests:**
- [ ] JWT token validation hoạt động
- [ ] SQL injection prevention hoạt động
- [ ] XSS prevention hoạt động
- [ ] CORS hoạt động đúng
- [ ] Admin routes được protect

---

## 📚 APPENDIX

### A.1. Database Schema Reference

**Complete Table List:**
1. `users` - User accounts
2. `products` - Product catalog
3. `categories` - Product categories
4. `carts` - Shopping carts
5. `cart_items` - Cart items
6. `orders` - Orders
7. `order_items` - Order items
8. `order_tracking` - Order status tracking
9. `coupons` - Discount coupons
10. `loyalty_points` - User loyalty points
11. `loyalty_points_history` - Loyalty points transaction history
12. `product_comments` - Product reviews/comments
13. `news` - News/blog posts
14. `shipments` - Shipment records
15. `shipment_events` - Shipment tracking events
16. `payment_demo_accounts` - Demo payment accounts

### A.2. API Endpoint Reference

**Auth Endpoints:**
- `POST /api/register` - Đăng ký
- `POST /api/login` - Đăng nhập
- `GET /api/me` - Lấy thông tin user
- `PUT /api/profile` - Cập nhật profile
- `POST /api/forgot-password` - Quên mật khẩu
- `POST /api/reset-password` - Đặt lại mật khẩu

**Product Endpoints:**
- `GET /api/products` - Danh sách sản phẩm
- `GET /api/products/:id` - Chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm (admin)
- `PUT /api/products/:id` - Cập nhật sản phẩm (admin)
- `DELETE /api/products/:id` - Xóa sản phẩm (admin)

**Cart Endpoints:**
- `GET /api/cart` - Lấy giỏ hàng
- `POST /api/cart/items` - Thêm vào giỏ
- `PUT /api/cart/items/:id` - Cập nhật số lượng
- `DELETE /api/cart/items/:id` - Xóa item

**Order Endpoints:**
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders` - Danh sách đơn hàng
- `GET /api/orders/:id` - Chi tiết đơn hàng
- `PUT /api/orders/:id/status` - Cập nhật trạng thái (admin)

### A.3. Error Code Reference

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication error)
- `403` - Forbidden (authorization error)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error
- `502` - Bad Gateway (service unavailable)
- `504` - Gateway Timeout

**Custom Error Codes:**
- `VALIDATION_ERROR` - Input validation failed
- `TOKEN_EXPIRED` - JWT token expired
- `TOKEN_INVALID` - JWT token invalid
- `TOKEN_MISSING` - JWT token not provided
- `USER_NOT_FOUND` - User không tồn tại
- `PRODUCT_NOT_FOUND` - Product không tồn tại
- `CART_EMPTY` - Cart không có items
- `INSUFFICIENT_STOCK` - Không đủ stock
- `INSUFFICIENT_BALANCE` - Không đủ số dư
- `COUPON_INVALID` - Coupon không hợp lệ
- `COUPON_EXPIRED` - Coupon đã hết hạn

---

**Cập nhật lần cuối:** 2025-01-15  
**Phiên bản:** 3.0 (Ultra Detailed)  
**Tác giả:** TechStore Development Team  
**Trạng thái:** ✅ Cực kỳ chi tiết và cẩn kỹ

---

## 📊 DATA FLOW DIAGRAMS

### 1. Tổng Quan Luồng Dữ Liệu

```
┌─────────────┐
│   Client    │ (Browser - HTML/JS)
│  (Frontend) │
└──────┬──────┘
       │ HTTP/HTTPS
       │ Authorization: Bearer <token>
       ↓
┌─────────────────────────────────────┐
│      API Gateway (Port 5000)        │
│  - gateway/server.js                │
│  - Verify Token                     │
│  - Route to Services                │
│  - Serve Static Files               │
└──────┬───────────────────────────────┘
       │
       ├──────────┬──────────┬──────────┬──────────┐
       ↓          ↓          ↓          ↓          ↓
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│   Auth   │ │ Product  │ │   Cart   │ │  Order  │ │   News   │
│ Service  │ │ Service  │ │ Service  │ │ Service │ │ Service │
│  :5001   │ │  :5002   │ │  :5003   │ │  :5004  │ │  :5005  │
└────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
     │            │            │            │            │
     └────────────┴────────────┴────────────┴────────────┘
                          │
                          ↓
              ┌───────────────────────┐
              │   MySQL Database      │
              │   (localhost:3306)    │
              │   Database: tttn2025 │
              └───────────────────────┘
```

### 2. Luồng Đặt Hàng Hoàn Chỉnh

```
User → Cart → Checkout → Order → Payment → Shipment → Delivery

┌─────────┐
│  User   │
└────┬────┘
     │ 1. Add to Cart
     ↓
┌─────────┐     POST /api/cart/items
│  Cart   │ ←─────────────────────── Cart Service
└────┬────┘
     │ 2. Checkout
     ↓
┌──────────┐    POST /api/orders
│ Checkout │ ←─────────────────────── Order Service
└────┬─────┘    ├─ Get cart from Cart Service
     │          ├─ Validate payment
     │          ├─ Apply coupon
     │          └─ Create order
     │ 3. Payment
     ↓
┌──────────┐    Validate account/balance
│ Payment  │ ←─────────────────────── Payment Demo Accounts
└────┬─────┘
     │ 4. Order Created
     ↓
┌──────────┐    INSERT INTO orders
│  Order   │ ←─────────────────────── Database
└────┬─────┘    ├─ order_items
     │          ├─ order_tracking
     │          └─ loyalty_points
     │ 5. Admin Create Shipment
     ↓
┌──────────┐    POST /api/shipments
│ Shipment │ ←─────────────────────── Shipments Route
└────┬─────┘    ├─ INSERT shipments
     │          ├─ INSERT shipment_events
     │          └─ UPDATE orders.status
     │ 6. Webhook Updates
     ↓
┌──────────┐    POST /api/shipments/webhook/:carrier
│ Carrier  │ →─────────────────────── Shipments Route
│ (GHN)   │    ├─ Map status
└────┬────┘    ├─ Update shipment
     │         └─ Update order
     │ 7. Delivery
     ↓
┌──────────┐    status = "delivered"
│Delivery  │ ←─────────────────────── Database
└──────────┘    └─ UPDATE orders.status
```

### 3. Luồng Xác Thực (Authentication Flow)

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Login
     ↓
┌──────────┐    POST /api/login
│  Login   │ →─────────────────────── Auth Service
│   Form   │    ├─ Verify username/password
└────┬─────┘    ├─ Generate JWT token
     │          └─ Return token + user info
     │ 2. Store Token
     ↓
┌──────────┐    localStorage.setItem('token', token)
│ Browser  │
│Storage   │
└────┬─────┘
     │ 3. API Request
     ↓
┌──────────┐    GET /api/cart
│  API     │ →─────────────────────── Gateway
│ Request  │    Headers: Authorization: Bearer <token>
└────┬─────┘
     │ 4. Verify Token
     ↓
┌──────────┐    POST /api/verify-token
│ Gateway  │ →─────────────────────── Auth Service
│Middleware│    ├─ Verify JWT signature
└────┬─────┘    ├─ Check expiration
     │          └─ Return user info
     │ 5. Forward Request
     ↓
┌──────────┐    GET /cart
│  Cart    │ ←─────────────────────── Cart Service
│ Service  │    ├─ req.user = { id, username, role }
└────┬─────┘    └─ Query cart by user_id
     │
     ↓
┌──────────┐    SELECT * FROM carts WHERE user_id = ?
│Database  │
└──────────┘
```

## 🎯 KẾT LUẬN

Workflow này mô tả toàn bộ luồng hoạt động của hệ thống TechStore từ frontend đến backend, qua API Gateway và các microservices, cuối cùng là database. Mỗi module có workflow riêng nhưng đều tuân theo kiến trúc microservices và sử dụng JWT để xác thực.

### ✅ Các Điểm Chính:

**Kiến Trúc:**
- ✅ Kiến trúc Microservices với API Gateway
- ✅ JWT-based authentication (stateless)
- ✅ Role-based authorization (user/admin)
- ✅ RESTful API design
- ✅ Docker containerization
- ✅ MySQL database (shared across services)

**Tính Năng:**
- ✅ User authentication (register, login, OAuth2 Google)
- ✅ Email OTP cho forgot password
- ✅ Product management (CRUD, search, filter, pagination)
- ✅ Shopping cart (add, update, remove items)
- ✅ Order management (create, track, status updates)
- ✅ Payment processing (Bank Transfer, MoMo, Visa - Demo)
- ✅ Shipment tracking với webhook integration (GHN, GHTK, Viettel)
- ✅ Coupon system (validate, apply discount)
- ✅ Loyalty points (earn, use, history)
- ✅ Comments & Reviews
- ✅ News/Blog system
- ✅ Admin dashboard (stats, management)

**Bảo Mật:**
- ✅ JWT token với expiration (100 days)
- ✅ Password hashing (bcrypt, salt rounds = 10)
- ✅ Token verification trên mỗi request
- ✅ Public routes (không cần token)
- ✅ Admin-only routes (role check)
- ✅ SQL injection prevention (parameterized queries)

**Error Handling:**
- ✅ Comprehensive error handling
- ✅ Retry logic (frontend)
- ✅ Error logging
- ✅ User-friendly error messages (tiếng Việt)

**Documentation:**
- ✅ Complete API documentation (API_ENDPOINTS.md)
- ✅ Architecture documentation (ARCHITECTURE.md)
- ✅ Setup guides (docs/setup/)
- ✅ Feature guides (docs/guides/)
- ✅ This workflow document (WORKFLOW.md)

### 📈 Thống Kê:

- **Services:** 5 microservices (Auth, Product, Cart, Order, News)
- **API Endpoints:** 50+ endpoints
- **Database Tables:** 15+ tables
- **Payment Methods:** 3 (Bank Transfer, MoMo, Visa)
- **Shipment Carriers:** 3+ (GHN, GHTK, Viettel)
- **Status Types:** 7 shipment statuses, 5 order statuses
- **Lines of Code:** ~10,000+ lines
- **Documentation:** 20+ markdown files

### 🚀 Hướng Phát Triển:

**Ngắn Hạn:**
- [ ] Real payment gateway integration (MoMo, VNPay)
- [ ] Email notifications cho order status changes
- [ ] SMS notifications (optional)
- [ ] Product image upload (multipart/form-data)
- [ ] Advanced search với Elasticsearch (optional)

**Dài Hạn:**
- [ ] Real-time notifications (WebSocket)
- [ ] Caching layer (Redis)
- [ ] Message queue (RabbitMQ/Kafka) cho async tasks
- [ ] Microservices communication via gRPC
- [ ] API rate limiting
- [ ] Monitoring & Logging (Prometheus, Grafana)
- [ ] CI/CD pipeline

---

**Cập nhật lần cuối:** 2025-01-15
**Phiên bản:** 2.0 (Enhanced)
**Tác giả:** TechStore Development Team
**Trạng thái:** ✅ Hoàn chỉnh và chi tiết


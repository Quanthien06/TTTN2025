# 🔒 CÁC CẢI TIẾN BẢO MẬT VÀ TÍNH TOÀN VẸN CẦN BỔ SUNG

## 📋 TỔNG QUAN

Tài liệu này liệt kê các cải tiến cần thiết để đảm bảo hệ thống TechStore có tính **toàn vẹn dữ liệu**, **bảo mật cao** và **đầy đủ tính năng**.

---

## 🔴 MỨC ĐỘ ƯU TIÊN

### ⚠️ CRITICAL (Phải làm ngay)
1. **Rate Limiting** - Chống brute force attacks
2. **Input Validation Middleware** - Validate tất cả inputs
3. **SQL Injection Prevention** - Đảm bảo 100% parameterized queries
4. **XSS Prevention** - Sanitize HTML output
5. **CSRF Protection** - Bảo vệ khỏi CSRF attacks
6. **Security Headers** - Helmet.js
7. **Database Constraints** - Foreign keys, check constraints
8. **Transaction Integrity** - Đảm bảo ACID properties

### 🟡 HIGH (Nên làm sớm)
9. **Token Blacklist** - Revoke tokens khi logout
10. **Refresh Tokens** - Giảm thời gian sống của access token
11. **Audit Logging** - Log tất cả actions quan trọng
12. **Password Strength Validation** - Enforce strong passwords
13. **Email Verification** - Verify email khi đăng ký
14. **Account Lockout** - Lock account sau nhiều lần đăng nhập sai
15. **Data Encryption** - Encrypt sensitive data (payment info)

### 🟢 MEDIUM (Làm khi có thời gian)
16. **API Versioning** - Version control cho API
17. **Request Size Limits** - Giới hạn kích thước request
18. **File Upload Validation** - Validate file types, sizes
19. **Session Management** - Better session handling
20. **Monitoring & Alerting** - Real-time security monitoring

---

## 1. 🔴 RATE LIMITING (CRITICAL)

### Vấn Đề Hiện Tại
- ❌ Không có rate limiting
- ❌ Dễ bị brute force attack trên login/register
- ❌ Không giới hạn số lần request từ 1 IP

### Giải Pháp

**1.1. Cài đặt express-rate-limit**
```bash
npm install express-rate-limit --save
```

**1.2. Implement Rate Limiting Middleware**

**File: `gateway/middleware/rateLimiter.js`**
```javascript
const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'TOO_MANY_REQUESTS',
    message: 'Quá nhiều requests từ IP này. Vui lòng thử lại sau 15 phút.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});

// Strict rate limiter cho login/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'TOO_MANY_AUTH_ATTEMPTS',
    message: 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 15 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Store in memory (có thể dùng Redis cho production)
  store: new rateLimit.MemoryStore(),
  skipSuccessfulRequests: false, // Count successful requests too
});

// Rate limiter cho OTP requests
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit to 3 OTP requests per 15 minutes
  message: {
    error: 'TOO_MANY_OTP_REQUESTS',
    message: 'Bạn đã yêu cầu quá nhiều mã OTP. Vui lòng thử lại sau 15 phút.'
  },
  keyGenerator: (req) => {
    // Rate limit by email instead of IP
    return req.body.email || req.ip;
  }
});

// Rate limiter cho password reset
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit to 3 password reset attempts per hour
  message: {
    error: 'TOO_MANY_RESET_ATTEMPTS',
    message: 'Quá nhiều lần thử đặt lại mật khẩu. Vui lòng thử lại sau 1 giờ.'
  },
  keyGenerator: (req) => req.body.email || req.ip
});

module.exports = {
  apiLimiter,
  authLimiter,
  otpLimiter,
  passwordResetLimiter
};
```

**1.3. Áp dụng vào Gateway**

**File: `gateway/server.js`**
```javascript
const { apiLimiter, authLimiter, otpLimiter, passwordResetLimiter } = require('./middleware/rateLimiter');

// Apply general rate limiting to all API routes
app.use('/api', apiLimiter);

// Apply strict rate limiting to auth routes
app.post('/api/login', authLimiter, async (req, res) => {
  // ... existing login code
});

app.post('/api/register', authLimiter, async (req, res) => {
  // ... existing register code
});

app.post('/api/forgot-password', otpLimiter, async (req, res) => {
  // ... existing forgot password code
});

app.post('/api/reset-password', passwordResetLimiter, async (req, res) => {
  // ... existing reset password code
});
```

**1.4. Database-based Rate Limiting (Cho Production)**

**Tạo table: `rate_limit_logs`**
```sql
CREATE TABLE rate_limit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL, -- IP address hoặc email
  endpoint VARCHAR(255) NOT NULL,
  attempts INT DEFAULT 1,
  window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  blocked_until TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_identifier_endpoint (identifier, endpoint),
  INDEX idx_window_start (window_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 2. 🔴 INPUT VALIDATION MIDDLEWARE (CRITICAL)

### Vấn Đề Hiện Tại
- ❌ Validation rải rác trong từng route
- ❌ Không có validation schema tập trung
- ❌ Dễ bỏ sót validation

### Giải Pháp

**2.1. Cài đặt express-validator**
```bash
npm install express-validator --save
```

**2.2. Tạo Validation Schemas**

**File: `gateway/middleware/validators.js`**
```javascript
const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Dữ liệu đầu vào không hợp lệ',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Register validation
const validateRegister = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username là bắt buộc')
    .isLength({ min: 3, max: 50 }).withMessage('Username phải có từ 3-50 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username chỉ được chứa chữ, số và dấu gạch dưới'),
  
  body('password')
    .notEmpty().withMessage('Password là bắt buộc')
    .isLength({ min: 6, max: 100 }).withMessage('Password phải có từ 6-100 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Email không đúng định dạng')
    .normalizeEmail(),
  
  body('role')
    .optional()
    .isIn(['user', 'admin']).withMessage('Role phải là user hoặc admin'),
  
  handleValidationErrors
];

// Login validation
const validateLogin = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username là bắt buộc')
    .isLength({ max: 50 }).withMessage('Username quá dài'),
  
  body('password')
    .notEmpty().withMessage('Password là bắt buộc')
    .isLength({ max: 100 }).withMessage('Password quá dài'),
  
  handleValidationErrors
];

// Product validation
const validateProduct = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tên sản phẩm là bắt buộc')
    .isLength({ min: 1, max: 255 }).withMessage('Tên sản phẩm phải có từ 1-255 ký tự'),
  
  body('price')
    .notEmpty().withMessage('Giá là bắt buộc')
    .isFloat({ min: 0 }).withMessage('Giá phải là số dương'),
  
  body('category')
    .trim()
    .notEmpty().withMessage('Danh mục là bắt buộc'),
  
  body('stock_quantity')
    .optional()
    .isInt({ min: 0 }).withMessage('Số lượng tồn kho phải là số nguyên dương'),
  
  handleValidationErrors
];

// Order validation
const validateOrder = [
  body('shipping_address')
    .trim()
    .notEmpty().withMessage('Địa chỉ giao hàng là bắt buộc')
    .isLength({ min: 10, max: 500 }).withMessage('Địa chỉ phải có từ 10-500 ký tự'),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Số điện thoại là bắt buộc')
    .matches(/^[0-9]{10,11}$/).withMessage('Số điện thoại không hợp lệ'),
  
  body('payment_method')
    .optional()
    .isIn(['bank_transfer', 'momo', 'visa']).withMessage('Phương thức thanh toán không hợp lệ'),
  
  body('coupon_code')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Mã giảm giá quá dài'),
  
  body('use_loyalty_points')
    .optional()
    .isInt({ min: 0 }).withMessage('Số điểm thưởng phải là số nguyên dương'),
  
  handleValidationErrors
];

// ID parameter validation
const validateId = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID phải là số nguyên dương'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProduct,
  validateOrder,
  validateId,
  handleValidationErrors
};
```

**2.3. Áp dụng vào Routes**

**File: `gateway/server.js`**
```javascript
const { validateRegister, validateLogin, validateProduct, validateOrder, validateId } = require('./middleware/validators');

app.post('/api/register', validateRegister, async (req, res) => {
  // ... existing code
});

app.post('/api/login', validateLogin, async (req, res) => {
  // ... existing code
});
```

---

## 3. 🔴 XSS PREVENTION (CRITICAL)

### Vấn Đề Hiện Tại
- ❌ Chưa sanitize HTML output
- ❌ User input có thể chứa malicious scripts
- ❌ Comments/reviews có thể chứa XSS

### Giải Pháp

**3.1. Cài đặt sanitize-html**
```bash
npm install sanitize-html --save
```

**3.2. Tạo Sanitization Middleware**

**File: `gateway/middleware/sanitizer.js`**
```javascript
const sanitizeHtml = require('sanitize-html');

// Sanitize HTML content (for comments, reviews, descriptions)
const sanitizeHtmlContent = (dirty) => {
  return sanitizeHtml(dirty, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    allowedAttributes: {
      'a': ['href', 'title']
    },
    allowedSchemes: ['http', 'https'],
    // Remove all other tags and attributes
  });
};

// Sanitize plain text (remove all HTML)
const sanitizeText = (dirty) => {
  return sanitizeHtml(dirty, {
    allowedTags: [],
    allowedAttributes: {}
  });
};

// Middleware để sanitize request body
const sanitizeRequestBody = (req, res, next) => {
  if (req.body) {
    // Sanitize text fields
    if (req.body.username) {
      req.body.username = sanitizeText(req.body.username);
    }
    if (req.body.email) {
      req.body.email = sanitizeText(req.body.email);
    }
    if (req.body.phone) {
      req.body.phone = sanitizeText(req.body.phone);
    }
    if (req.body.shipping_address) {
      req.body.shipping_address = sanitizeText(req.body.shipping_address);
    }
    
    // Sanitize HTML fields (allow some HTML)
    if (req.body.comment) {
      req.body.comment = sanitizeHtmlContent(req.body.comment);
    }
    if (req.body.description) {
      req.body.description = sanitizeHtmlContent(req.body.description);
    }
  }
  next();
};

module.exports = {
  sanitizeHtmlContent,
  sanitizeText,
  sanitizeRequestBody
};
```

**3.3. Áp dụng vào Gateway**

**File: `gateway/server.js`**
```javascript
const { sanitizeRequestBody } = require('./middleware/sanitizer');

// Apply sanitization to all POST/PUT requests
app.use(express.json());
app.use(sanitizeRequestBody);
```

---

## 4. 🔴 CSRF PROTECTION (CRITICAL)

### Vấn Đề Hiện Tại
- ❌ Không có CSRF protection
- ❌ Dễ bị CSRF attacks trên state-changing operations

### Giải Pháp

**4.1. Cài đặt csurf**
```bash
npm install csurf --save
```

**4.2. Implement CSRF Protection**

**File: `gateway/middleware/csrf.js`**
```javascript
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

// CSRF protection middleware
const csrfProtection = csrf({ 
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
    sameSite: 'strict'
  }
});

// Get CSRF token endpoint
const getCsrfToken = (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
};

module.exports = {
  csrfProtection,
  getCsrfToken
};
```

**4.3. Áp dụng vào Gateway**

**File: `gateway/server.js`**
```javascript
const cookieParser = require('cookie-parser');
const { csrfProtection, getCsrfToken } = require('./middleware/csrf');

app.use(cookieParser());

// Get CSRF token (public endpoint)
app.get('/api/csrf-token', csrfProtection, getCsrfToken);

// Apply CSRF protection to state-changing operations
app.post('/api/register', csrfProtection, validateRegister, async (req, res) => {
  // ... existing code
});

app.post('/api/orders', csrfProtection, validateOrder, async (req, res) => {
  // ... existing code
});

// Skip CSRF for public read operations
app.get('/api/products', async (req, res) => {
  // ... existing code (no CSRF needed)
});
```

**4.4. Frontend Integration**

**File: `public/app.js`**
```javascript
// Get CSRF token on page load
let csrfToken = '';

async function getCsrfToken() {
  try {
    const response = await fetch('/api/csrf-token', {
      credentials: 'include' // Include cookies
    });
    const data = await response.json();
    csrfToken = data.csrfToken;
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
  }
}

// Include CSRF token in POST/PUT/DELETE requests
async function apiCall(endpoint, options = {}) {
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      ...(options.headers || {})
    },
    credentials: 'include'
  };
  
  // ... rest of apiCall function
}

// Initialize CSRF token
getCsrfToken();
```

---

## 5. 🔴 SECURITY HEADERS (CRITICAL)

### Vấn Đề Hiện Tại
- ❌ Thiếu security headers
- ❌ Dễ bị clickjacking, XSS, MIME sniffing

### Giải Pháp

**5.1. Cài đặt helmet**
```bash
npm install helmet --save
```

**5.2. Implement Security Headers**

**File: `gateway/server.js`**
```javascript
const helmet = require('helmet');

// Apply security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable if causing issues
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Additional custom headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});
```

---

## 6. 🔴 DATABASE CONSTRAINTS (CRITICAL)

### Vấn Đề Hiện Tại
- ⚠️ Có thể thiếu foreign key constraints
- ⚠️ Thiếu check constraints
- ⚠️ Thiếu unique constraints

### Giải Pháp

**6.1. Tạo Migration Script**

**File: `database/add_constraints.sql`**
```sql
-- Add foreign key constraints
ALTER TABLE cart_items
ADD CONSTRAINT fk_cart_items_cart_id
FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE;

ALTER TABLE cart_items
ADD CONSTRAINT fk_cart_items_product_id
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE order_items
ADD CONSTRAINT fk_order_items_order_id
FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

ALTER TABLE order_items
ADD CONSTRAINT fk_order_items_product_id
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT;

ALTER TABLE orders
ADD CONSTRAINT fk_orders_user_id
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;

ALTER TABLE carts
ADD CONSTRAINT fk_carts_user_id
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add check constraints
ALTER TABLE products
ADD CONSTRAINT chk_products_price_positive
CHECK (price >= 0);

ALTER TABLE products
ADD CONSTRAINT chk_products_stock_positive
CHECK (stock_quantity >= 0);

ALTER TABLE cart_items
ADD CONSTRAINT chk_cart_items_quantity_positive
CHECK (quantity > 0);

ALTER TABLE order_items
ADD CONSTRAINT chk_order_items_quantity_positive
CHECK (quantity > 0);

ALTER TABLE orders
ADD CONSTRAINT chk_orders_total_positive
CHECK (total >= 0);

-- Add unique constraints
ALTER TABLE users
ADD CONSTRAINT uk_users_username UNIQUE (username);

ALTER TABLE users
ADD CONSTRAINT uk_users_email UNIQUE (email);

ALTER TABLE products
ADD CONSTRAINT uk_products_slug UNIQUE (slug);

-- Add indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

---

## 7. 🔴 TRANSACTION INTEGRITY (CRITICAL)

### Vấn Đề Hiện Tại
- ⚠️ Một số operations không dùng transaction
- ⚠️ Có thể có race conditions

### Giải Pháp

**7.1. Đảm Bảo Tất Cả Critical Operations Dùng Transaction**

**File: `services/order-service/routes/orders.js`**
```javascript
// Đảm bảo order creation dùng transaction
router.post('/', async (req, res) => {
  const pool = req.app.locals.pool;
  const connection = await pool.getConnection();
  
  await connection.beginTransaction();
  
  try {
    // 1. Lock products với SELECT FOR UPDATE
    for (const item of cartData.items) {
      const [products] = await connection.query(
        'SELECT id, name, stock_quantity, price FROM products WHERE id = ? FOR UPDATE',
        [item.product_id]
      );
      
      if (products.length === 0 || products[0].stock_quantity < item.quantity) {
        await connection.rollback();
        return res.status(400).json({ 
          message: `Sản phẩm "${products[0]?.name || 'N/A'}" không đủ số lượng` 
        });
      }
    }
    
    // 2. Create order
    const [orderResult] = await connection.query(
      'INSERT INTO orders ...',
      [...]
    );
    
    // 3. Create order items
    for (const item of cartData.items) {
      await connection.query(
        'INSERT INTO order_items ...',
        [...]
      );
      
      // 4. Update stock
      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }
    
    // 5. Apply coupon (nếu có)
    if (coupon_code) {
      await connection.query(
        'UPDATE coupons SET current_usage = current_usage + 1 WHERE id = ?',
        [coupon.id]
      );
    }
    
    // 6. Deduct loyalty points (nếu có)
    if (use_loyalty_points > 0) {
      await connection.query(
        'UPDATE loyalty_points SET balance = balance - ? WHERE user_id = ?',
        [use_loyalty_points, userId]
      );
    }
    
    // 7. Earn loyalty points
    const earnedPoints = Math.floor(finalTotal / 10000);
    if (earnedPoints > 0) {
      await connection.query(
        'UPDATE loyalty_points SET balance = balance + ? WHERE user_id = ?',
        [earnedPoints, userId]
      );
    }
    
    // 8. Clear cart
    await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
    await connection.query('UPDATE carts SET status = ? WHERE id = ?', ['completed', cartId]);
    
    // Commit transaction
    await connection.commit();
    
    res.status(201).json({ message: 'Đặt hàng thành công', order: {...} });
    
  } catch (error) {
    await connection.rollback();
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Lỗi khi tạo đơn hàng' });
  } finally {
    connection.release();
  }
});
```

---

## 8. 🟡 TOKEN BLACKLIST (HIGH)

### Vấn Đề Hiện Tại
- ❌ Không thể revoke token khi logout
- ❌ Token vẫn hợp lệ sau khi logout

### Giải Pháp

**8.1. Tạo Token Blacklist Table**

```sql
CREATE TABLE token_blacklist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_token_hash (token_hash),
  INDEX idx_expires_at (expires_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**8.2. Implement Token Blacklist**

**File: `services/auth-service/utils/tokenBlacklist.js`**
```javascript
const crypto = require('crypto');
const mysql = require('mysql2/promise');

// Hash token để lưu vào database
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Add token to blacklist
async function addToBlacklist(pool, token, userId, expiresAt) {
  const tokenHash = hashToken(token);
  await pool.query(
    'INSERT INTO token_blacklist (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
    [tokenHash, userId, expiresAt]
  );
}

// Check if token is blacklisted
async function isBlacklisted(pool, token) {
  const tokenHash = hashToken(token);
  const [rows] = await pool.query(
    'SELECT id FROM token_blacklist WHERE token_hash = ? AND expires_at > NOW()',
    [tokenHash]
  );
  return rows.length > 0;
}

// Clean expired tokens (run periodically)
async function cleanExpiredTokens(pool) {
  await pool.query('DELETE FROM token_blacklist WHERE expires_at < NOW()');
}

module.exports = {
  addToBlacklist,
  isBlacklisted,
  cleanExpiredTokens
};
```

**8.3. Update Verify Token Middleware**

**File: `gateway/server.js`**
```javascript
const { isBlacklisted } = require('./middleware/tokenBlacklist');

async function verifyToken(req, res, next) {
  // ... existing code ...
  
  // Check if token is blacklisted
  const dbPool = mysql.createPool({...});
  if (await isBlacklisted(dbPool, token)) {
    return res.status(401).json({ 
      message: 'Token đã bị thu hồi',
      error: 'TOKEN_REVOKED'
    });
  }
  
  // ... rest of verification ...
}
```

**8.4. Implement Logout**

**File: `services/auth-service/routes/auth.js`**
```javascript
const { addToBlacklist } = require('../utils/tokenBlacklist');
const jwt = require('jsonwebtoken');

router.post('/logout', async (req, res) => {
  const pool = req.app.locals.pool;
  const token = req.headers['authorization']?.replace('Bearer ', '').trim();
  
  if (!token) {
    return res.status(400).json({ message: 'Token không được cung cấp' });
  }
  
  try {
    // Decode token để lấy expiration
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      const expiresAt = new Date(decoded.exp * 1000);
      await addToBlacklist(pool, token, decoded.id, expiresAt);
    }
    
    res.json({ message: 'Đăng xuất thành công' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Lỗi khi đăng xuất' });
  }
});
```

---

## 9. 🟡 REFRESH TOKENS (HIGH)

### Vấn Đề Hiện Tại
- ❌ Access token sống quá lâu (100 days)
- ❌ Không có cơ chế refresh token

### Giải Pháp

**9.1. Tạo Refresh Tokens Table**

```sql
CREATE TABLE refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_token_hash (token_hash),
  INDEX idx_expires_at (expires_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**9.2. Implement Refresh Token Logic**

**File: `services/auth-service/routes/auth.js`**
```javascript
const crypto = require('crypto');

// Generate refresh token
function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

// Hash refresh token
function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Login với refresh token
router.post('/login', async (req, res) => {
  // ... existing login code ...
  
  // Generate tokens
  const accessToken = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' } // Short-lived access token
  );
  
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  // Save refresh token
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    [user.id, refreshTokenHash, refreshTokenExpires]
  );
  
  res.json({
    message: 'Đăng nhập thành công',
    accessToken,
    refreshToken, // Send to client
    user: { id: user.id, username: user.username, role: user.role }
  });
});

// Refresh access token
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token là bắt buộc' });
  }
  
  const refreshTokenHash = hashRefreshToken(refreshToken);
  
  // Check refresh token
  const [tokens] = await pool.query(
    `SELECT rt.user_id, rt.expires_at, rt.revoked_at, u.id, u.username, u.role
     FROM refresh_tokens rt
     JOIN users u ON rt.user_id = u.id
     WHERE rt.token_hash = ? AND rt.expires_at > NOW() AND rt.revoked_at IS NULL`,
    [refreshTokenHash]
  );
  
  if (tokens.length === 0) {
    return res.status(401).json({ message: 'Refresh token không hợp lệ hoặc đã hết hạn' });
  }
  
  const tokenData = tokens[0];
  
  // Generate new access token
  const accessToken = jwt.sign(
    { id: tokenData.user_id, username: tokenData.username, role: tokenData.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  res.json({
    accessToken,
    user: { id: tokenData.user_id, username: tokenData.username, role: tokenData.role }
  });
});
```

---

## 10. 🟡 AUDIT LOGGING (HIGH)

### Vấn Đề Hiện Tại
- ❌ Không log các actions quan trọng
- ❌ Khó trace lại các thay đổi

### Giải Pháp

**10.1. Tạo Audit Logs Table**

```sql
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(100) NOT NULL, -- 'LOGIN', 'LOGOUT', 'CREATE_ORDER', 'UPDATE_PRODUCT', etc.
  resource_type VARCHAR(50) NULL, -- 'user', 'order', 'product', etc.
  resource_id INT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  request_data JSON NULL,
  response_status INT NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_resource (resource_type, resource_id),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**10.2. Create Audit Logger**

**File: `gateway/middleware/auditLogger.js`**
```javascript
const mysql = require('mysql2/promise');

async function logAudit(pool, {
  userId = null,
  action,
  resourceType = null,
  resourceId = null,
  ipAddress = null,
  userAgent = null,
  requestData = null,
  responseStatus = null,
  errorMessage = null
}) {
  try {
    await pool.query(
      `INSERT INTO audit_logs 
       (user_id, action, resource_type, resource_id, ip_address, user_agent, 
        request_data, response_status, error_message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        action,
        resourceType,
        resourceId,
        ipAddress,
        userAgent,
        requestData ? JSON.stringify(requestData) : null,
        responseStatus,
        errorMessage
      ]
    );
  } catch (error) {
    // Don't throw error, just log to console
    console.error('Audit logging error:', error);
  }
}

// Middleware để log requests
function auditMiddleware(pool) {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log after response
      const userId = req.user?.id || null;
      const action = `${req.method} ${req.path}`;
      
      logAudit(pool, {
        userId,
        action,
        resourceType: getResourceType(req.path),
        resourceId: req.params.id ? parseInt(req.params.id) : null,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        requestData: sanitizeRequestData(req.body),
        responseStatus: res.statusCode,
        errorMessage: res.statusCode >= 400 ? data : null
      });
      
      return originalSend.call(this, data);
    };
    
    next();
  };
}

function getResourceType(path) {
  if (path.includes('/users')) return 'user';
  if (path.includes('/products')) return 'product';
  if (path.includes('/orders')) return 'order';
  if (path.includes('/cart')) return 'cart';
  return null;
}

function sanitizeRequestData(data) {
  if (!data) return null;
  const sanitized = { ...data };
  // Remove sensitive data
  if (sanitized.password) sanitized.password = '[REDACTED]';
  if (sanitized.token) sanitized.token = '[REDACTED]';
  return sanitized;
}

module.exports = {
  logAudit,
  auditMiddleware
};
```

---

## 📝 CHECKLIST TRIỂN KHAI

### Phase 1: Critical (Tuần 1-2)
- [ ] Rate Limiting
- [ ] Input Validation Middleware
- [ ] XSS Prevention
- [ ] CSRF Protection
- [ ] Security Headers (Helmet)
- [ ] Database Constraints
- [ ] Transaction Integrity

### Phase 2: High Priority (Tuần 3-4)
- [ ] Token Blacklist
- [ ] Refresh Tokens
- [ ] Audit Logging
- [ ] Password Strength Validation
- [ ] Account Lockout

### Phase 3: Medium Priority (Tuần 5+)
- [ ] API Versioning
- [ ] Request Size Limits
- [ ] File Upload Validation
- [ ] Monitoring & Alerting

---

**Cập nhật lần cuối:** 2025-01-15  
**Tác giả:** TechStore Development Team  
**Trạng thái:** 📋 Cần triển khai


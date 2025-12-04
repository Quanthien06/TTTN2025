# 🚀 HƯỚNG DẪN TRIỂN KHAI CÁC API CÒN THIẾU

## 📋 MỤC LỤC

1. [Phase 1: Auth API Bổ Sung](#phase-1-auth-api-bổ-sung) ⭐⭐⭐⭐⭐
2. [Phase 2: Products Search & Filter](#phase-2-products-search--filter) ⭐⭐⭐⭐
3. [Phase 3: Categories API](#phase-3-categories-api) ⭐⭐⭐⭐

---

# PHASE 1: AUTH API BỔ SUNG ⭐⭐⭐⭐⭐

## 📝 Tổng quan

Thêm 4 endpoints vào Auth API:
- `GET /api/me` - Lấy thông tin user hiện tại
- `POST /api/logout` - Đăng xuất (tùy chọn, xử lý ở client)
- `PUT /api/profile` - Cập nhật thông tin cá nhân
- `PUT /api/change-password` - Đổi mật khẩu

---

## BƯỚC 1: Thêm GET /api/me

### 1.1. Code cần thêm vào `routes/auth.js`

Thêm sau `router.post('/login', ...)` và trước `module.exports`:

```javascript
// GET /api/me - Lấy thông tin user hiện tại
const authenticateToken = require('../middleware/auth');

router.get('/me', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;

    try {
        // Lấy thông tin user từ database
        const [rows] = await pool.query(
            'SELECT id, username, role, created_at FROM users WHERE id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        const user = rows[0];
        
        res.json({
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                created_at: user.created_at
            }
        });

    } catch (error) {
        console.error('Lỗi khi lấy thông tin user:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});
```

### 1.2. Test API

**Với cURL:**
```bash
curl -X GET http://localhost:5000/api/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Với PowerShell:**
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_TOKEN"
}
Invoke-RestMethod -Uri "http://localhost:5000/api/me" -Method GET -Headers $headers
```

**Expected Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "created_at": "2025-01-XX..."
  }
}
```

---

## BƯỚC 2: Thêm PUT /api/profile

### 2.1. Code cần thêm vào `routes/auth.js`

Thêm sau `GET /api/me`:

```javascript
// PUT /api/profile - Cập nhật thông tin cá nhân
router.put('/profile', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    const { username } = req.body;

    try {
        // Validation
        if (!username || username.trim() === '') {
            return res.status(400).json({ message: 'Username không được để trống' });
        }

        // Kiểm tra username đã tồn tại chưa (trừ user hiện tại)
        const [existingUsers] = await pool.query(
            'SELECT id FROM users WHERE username = ? AND id != ?',
            [username, userId]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'Username đã tồn tại' });
        }

        // Cập nhật username
        await pool.query(
            'UPDATE users SET username = ? WHERE id = ?',
            [username.trim(), userId]
        );

        // Lấy thông tin user đã cập nhật
        const [rows] = await pool.query(
            'SELECT id, username, role, created_at FROM users WHERE id = ?',
            [userId]
        );

        res.json({
            message: 'Cập nhật thông tin thành công',
            user: rows[0]
        });

    } catch (error) {
        console.error('Lỗi khi cập nhật profile:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});
```

### 2.2. Test API

**Với cURL:**
```bash
curl -X PUT http://localhost:5000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"new_username\"}"
```

**Expected Response (200 OK):**
```json
{
  "message": "Cập nhật thông tin thành công",
  "user": {
    "id": 1,
    "username": "new_username",
    "role": "admin",
    "created_at": "2025-01-XX..."
  }
}
```

---

## BƯỚC 3: Thêm PUT /api/change-password

### 3.1. Code cần thêm vào `routes/auth.js`

Thêm sau `PUT /api/profile`:

```javascript
// PUT /api/change-password - Đổi mật khẩu
router.put('/change-password', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    try {
        // Validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                message: 'Current password và new password là bắt buộc' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                message: 'Mật khẩu mới phải có ít nhất 6 ký tự' 
            });
        }

        // Lấy user từ database
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        const user = rows[0];

        // Kiểm tra current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' });
        }

        // Hash mật khẩu mới
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu
        await pool.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedNewPassword, userId]
        );

        res.json({ message: 'Đổi mật khẩu thành công' });

    } catch (error) {
        console.error('Lỗi khi đổi mật khẩu:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});
```

### 3.2. Test API

**Với cURL:**
```bash
curl -X PUT http://localhost:5000/api/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"currentPassword\":\"old_password\",\"newPassword\":\"new_password123\"}"
```

**Expected Response (200 OK):**
```json
{
  "message": "Đổi mật khẩu thành công"
}
```

**Test với mật khẩu sai (401):**
```json
{
  "message": "Mật khẩu hiện tại không đúng"
}
```

---

## BƯỚC 4: Thêm POST /api/logout (Tùy chọn)

**Lưu ý:** Với JWT stateless, logout thường được xử lý ở client (xóa token). 
Nhưng nếu muốn có blacklist token, có thể implement như sau:

### 4.1. Cách 1: Xử lý ở Client (Đơn giản, khuyến nghị)

Chỉ cần hướng dẫn client xóa token:
- Frontend: `localStorage.removeItem('token')` hoặc `sessionStorage.removeItem('token')`

### 4.2. Cách 2: Token Blacklist (Phức tạp hơn)

Nếu muốn implement blacklist, cần:
1. Tạo bảng `blacklisted_tokens` trong database
2. Lưu token đã logout vào blacklist
3. Kiểm tra token trong blacklist khi authenticate

**Code mẫu (nếu muốn implement):**

```javascript
// POST /api/logout - Đăng xuất
router.post('/logout', authenticateToken, async (req, res) => {
    const token = req.headers['authorization']?.substring(7); // Lấy token sau "Bearer "
    
    // TODO: Lưu token vào blacklist nếu cần
    // Hiện tại chỉ trả về success, client tự xóa token
    
    res.json({ message: 'Đăng xuất thành công' });
});
```

---

## BƯỚC 5: Kiểm tra toàn bộ Auth API

### 5.1. Import authenticateToken

Đảm bảo đã import ở đầu file `routes/auth.js`:

```javascript
const authenticateToken = require('../middleware/auth');
```

### 5.2. Cấu trúc file sau khi hoàn thành

File `routes/auth.js` sẽ có cấu trúc:
1. `POST /api/register` ✅ (đã có)
2. `POST /api/login` ✅ (đã có)
3. `GET /api/me` ✅ (mới thêm)
4. `PUT /api/profile` ✅ (mới thêm)
5. `PUT /api/change-password` ✅ (mới thêm)
6. `POST /api/logout` ⚠️ (tùy chọn)

---

## ✅ CHECKLIST PHASE 1

- [ ] Đã thêm `GET /api/me`
- [ ] Đã thêm `PUT /api/profile`
- [ ] Đã thêm `PUT /api/change-password`
- [ ] Đã import `authenticateToken` vào `routes/auth.js`
- [ ] Đã test tất cả endpoints với Postman/cURL
- [ ] Đã test error cases (thiếu token, token sai, v.v.)

---

# PHASE 2: PRODUCTS SEARCH & FILTER ⭐⭐⭐⭐

## 📝 Tổng quan

Cập nhật `GET /api/products` để hỗ trợ:
- Tìm kiếm: `?q=keyword`
- Lọc theo category: `?category=laptop`
- Lọc theo giá: `?minPrice=1000000&maxPrice=5000000`
- Sắp xếp: `?sort=price&order=asc`
- Phân trang: `?page=1&limit=10`

---

## BƯỚC 1: Cập nhật GET /api/products

### 1.1. Code mới cho `routes/product.js`

Thay thế `router.get('/', ...)` hiện tại bằng code sau:

```javascript
// GET /api/products - Lấy danh sách sản phẩm (với search, filter, sort, pagination)
router.get('/', async (req, res) => {
    const pool = req.app.locals.pool;

    try {
        // Lấy query parameters
        const {
            q,              // search keyword
            category,       // filter by category
            minPrice,       // filter min price
            maxPrice,       // filter max price
            sort = 'id',    // sort field (id, name, price, created_at)
            order = 'asc',  // sort order (asc, desc)
            page = 1,       // page number
            limit = 20      // items per page
        } = req.query;

        // Validate page và limit
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const offset = (pageNum - 1) * limitNum;

        // Validate sort
        const validSortFields = ['id', 'name', 'price', 'created_at'];
        const sortField = validSortFields.includes(sort) ? sort : 'id';

        // Validate order
        const sortOrder = (order.toLowerCase() === 'desc') ? 'DESC' : 'ASC';

        // Build WHERE clause
        let whereConditions = [];
        let queryParams = [];

        // Search by keyword (q)
        if (q && q.trim() !== '') {
            whereConditions.push('(name LIKE ? OR description LIKE ? OR category LIKE ?)');
            const searchTerm = `%${q.trim()}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm);
        }

        // Filter by category
        if (category && category.trim() !== '') {
            whereConditions.push('category = ?');
            queryParams.push(category.trim());
        }

        // Filter by price range
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

        // Build WHERE clause string
        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}` 
            : '';

        // Query để đếm tổng số (cho pagination)
        const countQuery = `SELECT COUNT(*) as total FROM products ${whereClause}`;
        const [countRows] = await pool.query(countQuery, queryParams);
        const total = countRows[0].total;

        // Query để lấy sản phẩm
        const dataQuery = `
            SELECT * FROM products 
            ${whereClause}
            ORDER BY ${sortField} ${sortOrder}
            LIMIT ? OFFSET ?
        `;
        queryParams.push(limitNum, offset);

        const [rows] = await pool.query(dataQuery, queryParams);

        // Format products
        const products = rows.map(product => ({
            ...product,
            price: typeof product.price === 'string' ? parseFloat(product.price) : product.price
        }));

        // Calculate pagination info
        const totalPages = Math.ceil(total / limitNum);

        res.json({
            products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages
            }
        });

    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});
```

### 1.2. Test API

**Tìm kiếm:**
```bash
GET /api/products?q=laptop
```

**Lọc theo category:**
```bash
GET /api/products?category=laptop
```

**Lọc theo giá:**
```bash
GET /api/products?minPrice=1000000&maxPrice=5000000
```

**Sắp xếp:**
```bash
GET /api/products?sort=price&order=asc
```

**Phân trang:**
```bash
GET /api/products?page=1&limit=10
```

**Kết hợp tất cả:**
```bash
GET /api/products?q=macbook&category=laptop&minPrice=1000000&maxPrice=50000000&sort=price&order=asc&page=1&limit=10
```

**Expected Response:**
```json
{
  "products": [
    {
      "id": 1,
      "name": "MacBook Pro",
      "category": "laptop",
      "price": 25000000,
      "description": "..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

## ✅ CHECKLIST PHASE 2

- [ ] Đã cập nhật `GET /api/products` với search
- [ ] Đã cập nhật `GET /api/products` với filter category
- [ ] Đã cập nhật `GET /api/products` với filter price
- [ ] Đã cập nhật `GET /api/products` với sort
- [ ] Đã cập nhật `GET /api/products` với pagination
- [ ] Đã test tất cả query parameters
- [ ] Đã test kết hợp nhiều parameters

---

# PHASE 3: CATEGORIES API ⭐⭐⭐⭐

## 📝 Tổng quan

Tạo API quản lý danh mục sản phẩm:
- `GET /api/categories` - Lấy danh sách danh mục
- `GET /api/categories/:id` - Lấy sản phẩm theo danh mục
- `POST /api/categories` - Tạo danh mục (admin)
- `PUT /api/categories/:id` - Cập nhật danh mục (admin)
- `DELETE /api/categories/:id` - Xóa danh mục (admin)

---

## BƯỚC 1: Tạo Database Schema

### 1.1. Tạo file `database/categories_schema.sql`

```sql
-- ============================================
-- SCHEMA CHO DANH MỤC (CATEGORIES)
-- ============================================

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 1.2. Chạy SQL trong MySQL

- Mở MySQL Workbench hoặc phpMyAdmin
- Chọn database `tttn2025`
- Copy và paste SQL vào
- Execute

**Kiểm tra:** Chạy `SHOW TABLES;` để xem có `categories` chưa.

---

## BƯỚC 2: Tạo file routes/categories.js

### 2.1. Code hoàn chỉnh

Tạo file mới: `routes/categories.js`

```javascript
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

// GET /api/categories - Lấy danh sách danh mục
router.get('/', async (req, res) => {
    const pool = req.app.locals.pool;

    try {
        const [rows] = await pool.query(
            `SELECT 
                c.*,
                COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON p.category = c.name
            GROUP BY c.id
            ORDER BY c.name ASC`
        );

        const categories = rows.map(cat => ({
            ...cat,
            product_count: parseInt(cat.product_count || 0)
        }));

        res.json({ categories });

    } catch (error) {
        console.error('Lỗi khi lấy danh sách categories:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// GET /api/categories/:id - Lấy sản phẩm theo danh mục
router.get('/:id', async (req, res) => {
    const pool = req.app.locals.pool;
    const categoryId = req.params.id;

    try {
        // Lấy thông tin category
        const [categories] = await pool.query(
            'SELECT * FROM categories WHERE id = ?',
            [categoryId]
        );

        if (categories.length === 0) {
            return res.status(404).json({ message: 'Danh mục không tồn tại' });
        }

        const category = categories[0];

        // Lấy sản phẩm thuộc category này (dựa vào category name)
        const [products] = await pool.query(
            'SELECT * FROM products WHERE category = ?',
            [category.name]
        );

        const formattedProducts = products.map(product => ({
            ...product,
            price: typeof product.price === 'string' ? parseFloat(product.price) : product.price
        }));

        res.json({
            category,
            products: formattedProducts,
            count: products.length
        });

    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm theo category:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// POST /api/categories - Tạo danh mục (admin)
router.post('/', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;

    try {
        // Kiểm tra quyền admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Chỉ admin mới có quyền tạo danh mục' });
        }

        const { name, slug, description } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Tên danh mục là bắt buộc' });
        }

        // Generate slug nếu không có
        let categorySlug = slug || name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const [result] = await pool.query(
            'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
            [name.trim(), categorySlug, description || null]
        );

        const [newCategory] = await pool.query(
            'SELECT * FROM categories WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            message: 'Tạo danh mục thành công',
            category: newCategory[0]
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Slug đã tồn tại' });
        }
        console.error('Lỗi khi tạo category:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// PUT /api/categories/:id - Cập nhật danh mục (admin)
router.put('/:id', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const categoryId = req.params.id;

    try {
        // Kiểm tra quyền admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Chỉ admin mới có quyền cập nhật danh mục' });
        }

        const { name, slug, description } = req.body;

        // Kiểm tra category tồn tại
        const [categories] = await pool.query(
            'SELECT * FROM categories WHERE id = ?',
            [categoryId]
        );

        if (categories.length === 0) {
            return res.status(404).json({ message: 'Danh mục không tồn tại' });
        }

        // Build update query
        let updateFields = [];
        let updateParams = [];

        if (name !== undefined) {
            updateFields.push('name = ?');
            updateParams.push(name.trim());
        }

        if (slug !== undefined) {
            updateFields.push('slug = ?');
            updateParams.push(slug.trim());
        }

        if (description !== undefined) {
            updateFields.push('description = ?');
            updateParams.push(description);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'Không có thông tin để cập nhật' });
        }

        updateParams.push(categoryId);

        await pool.query(
            `UPDATE categories SET ${updateFields.join(', ')} WHERE id = ?`,
            updateParams
        );

        const [updatedCategory] = await pool.query(
            'SELECT * FROM categories WHERE id = ?',
            [categoryId]
        );

        res.json({
            message: 'Cập nhật danh mục thành công',
            category: updatedCategory[0]
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Slug đã tồn tại' });
        }
        console.error('Lỗi khi cập nhật category:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// DELETE /api/categories/:id - Xóa danh mục (admin)
router.delete('/:id', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const categoryId = req.params.id;

    try {
        // Kiểm tra quyền admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Chỉ admin mới có quyền xóa danh mục' });
        }

        // Kiểm tra category tồn tại
        const [categories] = await pool.query(
            'SELECT * FROM categories WHERE id = ?',
            [categoryId]
        );

        if (categories.length === 0) {
            return res.status(404).json({ message: 'Danh mục không tồn tại' });
        }

        // Xóa category
        await pool.query('DELETE FROM categories WHERE id = ?', [categoryId]);

        res.json({ message: 'Xóa danh mục thành công' });

    } catch (error) {
        console.error('Lỗi khi xóa category:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

module.exports = router;
```

---

## BƯỚC 3: Cập nhật server.js

### 3.1. Thêm route vào `server.js`

Thêm sau các route khác:

```javascript
// Gắn router categories vào đường dẫn /api/categories
const categoriesRouter = require('./routes/categories');
app.use('/api/categories', categoriesRouter);
```

---

## BƯỚC 4: Test Categories API

**GET /api/categories:**
```bash
curl http://localhost:5000/api/categories
```

**GET /api/categories/:id:**
```bash
curl http://localhost:5000/api/categories/1
```

**POST /api/categories (admin):**
```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","slug":"laptop","description":"Máy tính xách tay"}'
```

**PUT /api/categories/:id (admin):**
```bash
curl -X PUT http://localhost:5000/api/categories/1 \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop Updated","description":"Mô tả mới"}'
```

**DELETE /api/categories/:id (admin):**
```bash
curl -X DELETE http://localhost:5000/api/categories/1 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## ✅ CHECKLIST PHASE 3

- [ ] Đã tạo file `database/categories_schema.sql`
- [ ] Đã chạy SQL trong MySQL
- [ ] Đã tạo file `routes/categories.js`
- [ ] Đã thêm route vào `server.js`
- [ ] Đã test tất cả endpoints
- [ ] Đã test với admin và user thường (403 error)

---

# 📚 TỔNG KẾT

Sau khi hoàn thành 3 Phase trên, bạn sẽ có:

✅ **Phase 1:** Auth API đầy đủ (me, profile, change-password)
✅ **Phase 2:** Products API với search, filter, sort, pagination
✅ **Phase 3:** Categories API hoàn chỉnh

**Tổng cộng:** ~15 endpoints mới được thêm vào backend!

---

# 🎯 TIẾP THEO

Sau khi hoàn thành 3 Phase trên, bạn có thể tiếp tục với:
- User Management API
- Reviews/Ratings API
- Statistics/Dashboard API

Xem chi tiết trong file `DANH_SACH_API_CON_THIEU.md`


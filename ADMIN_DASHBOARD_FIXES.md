# Admin Dashboard Fixes - Hướng Dẫn

## ✅ Các Lỗi Đã Được Fix

### 1. **Admin Role Verification** ✓
- Thêm kiểm tra admin role trong `initAdmin()` function
- Chỉ admin users mới có thể truy cập admin dashboard
- Redirect non-admin users về homepage

### 2. **API Error Handling** ✓
- Thêm error handling cho tất cả fetch calls
- Xử lý 401 (Unauthorized) - redirect to login
- Xử lý 403 (Forbidden) - hiển thị permission denied message
- Xử lý 404 (Not Found) - hiển thị endpoint not found message
- Xử lý 500 (Server Error) - hiển thị server error message

### 3. **Enhanced User List (loadUsers)** ✓
- Xử lý lỗi khi fetch `/api/users` endpoint
- Hiển thị error message thay vì blank table
- Thêm role badge (admin/user) cho mỗi user
- Proper pagination handling

### 4. **Enhanced Refunds List (loadRefunds)** ✓
- Xử lý lỗi khi fetch `/api/refunds` endpoint
- Hiển thị status badges (Chờ xử lý/Phê duyệt/Từ chối/Đã hoàn tiền)
- Proper pagination handling
- Chi tiết hoàn tiền modal improvements

### 5. **Dashboard Stats (loadDashboard)** ✓
- Graceful fallback nếu `/api/stats/overview` không có dữ liệu
- Fallback values (0) thay vì crash
- Better error logging

### 6. **Refunds Infrastructure** ✓
- Tạo `middleware/authorize.js` - permission/role checking middleware
- Tạo `routes/refunds.js` - full refunds API (POST, GET, PUT)
- Tạo `database/06_refunds_schema.sql` - refunds table schema
- Register `refundsRouter` trong server.js

## 📁 Các File Mới/Sửa

### Mới tạo:
- `public/admin-fix.js` - Fix script cho admin role verification
- `public/admin-enhancements.js` - Enhanced error handling cho loadUsers, loadRefunds, loadDashboard
- `public/test-admin-endpoints.js` - Test script để verify API endpoints
- `middleware/authorize.js` - Permission/role checking middleware
- `routes/refunds.js` - Refunds API routes
- `database/06_refunds_schema.sql` - Refunds table migration

### Sửa:
- `public/admin.html` - Thêm 3 script references
- `server.js` - Register refunds router (already done)

## 🚀 Cách Sử Dụng

### 1. Restart Server (QUAN TRỌNG)
```bash
# Tắt server hiện tại
# Chạy lại
npm start
```

### 2. Test Endpoints
```javascript
// Mở DevTools Console trong admin.html, chạy:
testEndpoints()

// Output sẽ hiển thị:
// ✅ GET /me - [200]
// ✅ GET /users - [200]
// ✅ GET /stats/overview - [200]
// ✅ GET /refunds - [200]
// ✅ GET /orders/admin - [200]
```

### 3. Login & Access Admin
1. Đăng nhập bằng admin account
2. Truy cập `/admin.html`
3. Kiểm tra console để xem có error gì không
4. Chọn các tab (Products, Users, Orders, Refunds) để load dữ liệu

## 🔐 Admin Role Update Flow

### Khi user mua hàng:
1. User login → checkout → submit order
2. Order được tạo với status `processing`
3. Admin có thể thấy order trong "Orders" tab
4. Admin click "Chi tiết" để update order status
5. Khi admin approve/complete, order status được update
6. User có thể request refund nếu cần

### Admin Permissions:
- ✅ View tất cả users
- ✅ View tất cả orders
- ✅ Update order status
- ✅ View tất cả refund requests
- ✅ Approve/Reject refunds
- ✅ Process refunds (hoàn tiền)

### User Permissions:
- ✅ View own profile
- ✅ View own orders
- ✅ Create refund requests
- ❌ Cannot view other users
- ❌ Cannot update orders
- ❌ Cannot approve refunds

## 🐛 Debugging

### Nếu vẫn thấy 404 errors:

1. **Check server logs**
   ```
   Kiểm tra console output từ `npm start`
   Phải thấy: "✓ Refunds router đã được đăng ký tại /api/refunds"
   ```

2. **Check token**
   ```javascript
   // Trong DevTools Console:
   localStorage.getItem('token')
   // Phải có giá trị token (dài, base64-like string)
   ```

3. **Check user role**
   ```javascript
   // Trong DevTools Console:
   testEndpoints()
   // Hoặc check response từ /api/me
   ```

4. **Check network tab**
   - DevTools → Network tab
   - Xem request headers (có Authorization header?)
   - Xem response status & body

### Common Issues:

| Issue | Giải pháp |
|-------|----------|
| 401 Unauthorized | Cần login lại, token hết hạn |
| 403 Forbidden | User không có admin role |
| 404 Not Found | Server chưa restart sau khi thêm route |
| Empty data | Server OK nhưng không có dữ liệu trong DB |

## 📋 Refunds API Endpoints

```
POST /api/refunds
- Create refund request
- Require: order_id, reason, amount
- Auth: User

GET /api/refunds
- List all refunds (admin only)
- Query: page, limit, status
- Auth: Admin

GET /api/refunds/mine
- List user's own refunds
- Query: page, limit
- Auth: User

PUT /api/refunds/:id/status
- Update refund status (admin only)
- Body: { status: 'approved|rejected|refunded|etc', admin_note: '' }
- Auth: Admin
```

## ✨ Next Steps (Optional)

1. **Database Migration**
   - Chạy migration script: `node database/06_refunds_schema.sql`
   - Hoặc execute SQL từ MySQL client

2. **Test Admin Functions**
   - Create test orders
   - Admin approve orders
   - Users create refund requests
   - Admin process refunds

3. **Monitor Logs**
   - Watch server console for errors
   - Check admin.html console for API issues

## 📞 Troubleshooting

Nếu vẫn có issue:
1. Kiểm tra `npm start` output - có error gì không?
2. Kiểm tra browser console - có error gì không?
3. Kiểm tra Network tab - response status & body là gì?
4. Verify database - refunds table có tồn tại không?
5. Verify user role - user có role='admin' không?

---

**Lần update cuối cùng**: Hôm nay
**Status**: Ready to use

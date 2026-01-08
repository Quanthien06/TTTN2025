# 🚀 HƯỚNG DẪN TRIỂN KHAI BẢO MẬT - THEO THỨ TỰ

## 📋 THỨ TỰ TRIỂN KHAI ĐÃ ĐỀ XUẤT

### ✅ BƯỚC 1-5: ĐÃ HOÀN THÀNH (Critical)

1. ✅ **Database Constraints** - Nền tảng data integrity
2. ✅ **Input Validation** - Validate tất cả inputs
3. ✅ **XSS Prevention** - Sanitize HTML
4. ✅ **Security Headers** - Helmet.js
5. ✅ **Rate Limiting** - Chống brute force

### 🟡 BƯỚC 6-7: ĐANG TRIỂN KHAI

6. 🟡 **CSRF Protection** - Bảo vệ khỏi CSRF attacks
7. 🟡 **Transaction Integrity** - Cải thiện transactions

### ❌ BƯỚC 8-10: CHƯA BẮT ĐẦU (High Priority)

8. ❌ **Token Blacklist** - Revoke tokens
9. ❌ **Refresh Tokens** - Short-lived access tokens
10. ❌ **Audit Logging** - Log critical actions

---

## 🔧 CÁCH TRIỂN KHAI TIẾP

### Bước 1: Cài Đặt Dependencies

```bash
cd gateway
npm install
```

**Dependencies sẽ được cài:**
- express-validator
- express-rate-limit
- sanitize-html
- helmet
- cookie-parser
- csurf

### Bước 2: Chạy Database Migration

```bash
node database/add_security_constraints.js
```

**Kết quả mong đợi:**
- Foreign keys được thêm
- Check constraints được thêm
- Unique constraints được thêm
- Indexes được tạo

### Bước 3: Test Các Middleware

**Test Rate Limiting:**
```bash
# Test auth rate limiter (sẽ fail sau 5 requests)
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"test"}'
  echo ""
done
```

**Test Validation:**
```bash
# Test register validation (sẽ fail)
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"ab","password":"123"}'

# Response sẽ có:
# {
#   "error": "VALIDATION_ERROR",
#   "message": "Dữ liệu đầu vào không hợp lệ",
#   "errors": [...]
# }
```

**Test XSS Prevention:**
```bash
# Test XSS trong comment
curl -X POST http://localhost:5000/api/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"product_id":1,"comment":"<script>alert(\"XSS\")</script>Hello"}'

# Script tags sẽ bị remove
```

### Bước 4: Tiếp Tục Triển Khai

#### Bước 6: CSRF Protection

**File cần tạo:** `gateway/middleware/csrf.js`
**File cần update:** `gateway/server.js`, `public/app.js`

**Chi tiết:** Xem `SECURITY_ENHANCEMENTS.md` section 4

#### Bước 7: Transaction Integrity

**File cần update:** `services/order-service/routes/orders.js`

**Chi tiết:** Xem `SECURITY_ENHANCEMENTS.md` section 9.1

#### Bước 8: Token Blacklist

**Files cần tạo:**
- `database/create_token_blacklist_table.js`
- `services/auth-service/utils/tokenBlacklist.js`

**Files cần update:**
- `gateway/server.js` (verifyToken middleware)
- `services/auth-service/routes/auth.js` (logout endpoint)

#### Bước 9: Refresh Tokens

**Files cần tạo:**
- `database/create_refresh_tokens_table.js`

**Files cần update:**
- `services/auth-service/routes/auth.js` (login, refresh endpoints)
- `public/app.js` (handle refresh tokens)

#### Bước 10: Audit Logging

**Files cần tạo:**
- `database/create_audit_logs_table.js`
- `gateway/middleware/auditLogger.js`

**Files cần update:**
- `gateway/server.js` (apply audit middleware)

---

## 📝 CHECKLIST TRIỂN KHAI

### Phase 1: Critical (✅ Hoàn thành)
- [x] Database Constraints
- [x] Input Validation
- [x] XSS Prevention
- [x] Security Headers
- [x] Rate Limiting

### Phase 2: High Priority (🟡 Đang làm)
- [ ] CSRF Protection
- [ ] Transaction Integrity

### Phase 3: High Priority (❌ Chưa làm)
- [ ] Token Blacklist
- [ ] Refresh Tokens
- [ ] Audit Logging

---

## 🧪 TESTING

Sau mỗi bước, cần test:

1. **Functional Test:** Chức năng vẫn hoạt động bình thường
2. **Security Test:** Bảo mật được cải thiện
3. **Performance Test:** Không ảnh hưởng performance đáng kể
4. **Error Handling:** Error messages rõ ràng

---

## 📚 TÀI LIỆU THAM KHẢO

- `SECURITY_ENHANCEMENTS.md` - Chi tiết từng cải tiến
- `SECURITY_IMPLEMENTATION_STATUS.md` - Trạng thái triển khai
- `WORKFLOW.md` - Workflow tổng thể

---

**Cập nhật lần cuối:** 2025-01-15


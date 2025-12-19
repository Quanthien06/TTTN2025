# Hướng dẫn Test Payment Demo Accounts

## Bước 1: Đảm bảo Database đã có dữ liệu

Chạy SQL trong phpMyAdmin hoặc MySQL:

```sql
-- Chạy file database/07_payment_demo_accounts_schema.sql
-- Hoặc chạy INSERT statement:

INSERT INTO payment_demo_accounts (bank_type, account_number, account_name, balance, payment_type, description) VALUES
('vietcombank', '9704151234567890', 'NGUYEN VAN A', 100000000.00, 'bank', 'Tài khoản demo Vietcombank'),
('vietcombank', '9704159876543210', 'TRAN THI B', 50000000.00, 'bank', 'Tài khoản demo Vietcombank'),
('techcombank', '9704071234567890', 'LE VAN C', 75000000.00, 'bank', 'Tài khoản demo Techcombank'),
('techcombank', '9704079876543210', 'PHAM THI D', 200000000.00, 'bank', 'Tài khoản demo Techcombank'),
('acb', '9704155555555555', 'HOANG VAN E', 150000000.00, 'bank', 'Tài khoản demo ACB'),
('acb', '9704156666666666', 'VU THI F', 80000000.00, 'bank', 'Tài khoản demo ACB'),
('bidv', '9704157777777777', 'DAO VAN G', 120000000.00, 'bank', 'Tài khoản demo BIDV'),
('vietinbank', '9704158888888888', 'BUI THI H', 90000000.00, 'bank', 'Tài khoản demo VietinBank'),
('agribank', '9704159999999999', 'DANG VAN I', 60000000.00, 'bank', 'Tài khoản demo Agribank'),
('sacombank', '9704151111111111', 'NGUYEN THI K', 300000000.00, 'bank', 'Tài khoản demo Sacombank'),
('mbbank', '9704152222222222', 'TRAN VAN L', 180000000.00, 'bank', 'Tài khoản demo MB Bank')
ON DUPLICATE KEY UPDATE account_name = VALUES(account_name), description = VALUES(description);
```

## Bước 2: Restart Server

**Quan trọng:** Cần restart server để áp dụng thay đổi!

```powershell
# Dừng server hiện tại (Ctrl+C trong terminal đang chạy server)
# Hoặc chạy:
.\kill-server.ps1

# Khởi động lại server
npm start
# Hoặc
node gateway/server.js
```

## Bước 3: Test bằng Script

```bash
node test_payment_simple.js
```

## Bước 4: Test trên Giao diện

1. **Mở trang checkout:**
   - Truy cập: `http://localhost:5000/checkout.html`
   - Hoặc thêm sản phẩm vào giỏ hàng và click "Thanh toán"

2. **Test kiểm tra tài khoản:**
   - Chọn phương thức thanh toán: **"Ngân hàng nội địa"**
   - Chọn ngân hàng: **Vietcombank**
   - Nhập số tài khoản: **9704151234567890**
   - **Kết quả mong đợi:** Hiển thị "Chủ tài khoản: NGUYEN VAN A" với icon check xanh

3. **Test các tài khoản khác:**
   - Techcombank: `9704071234567890` → LE VAN C
   - ACB: `9704155555555555` → HOANG VAN E
   - BIDV: `9704157777777777` → DAO VAN G

4. **Test tài khoản không hợp lệ:**
   - Nhập số tài khoản: `9999999999999999`
   - **Kết quả mong đợi:** Hiển thị lỗi "Không tìm thấy tài khoản"

## Danh sách Tài khoản Demo

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

## Troubleshooting

### Lỗi: "Không có token truy cập"
- **Nguyên nhân:** Server chưa được restart sau khi sửa code
- **Giải pháp:** Restart server

### Lỗi: "Database connection not available"
- **Nguyên nhân:** MySQL chưa kết nối
- **Giải pháp:** Kiểm tra MySQL service và connection pool

### Lỗi: "Không tìm thấy tài khoản"
- **Nguyên nhân:** Dữ liệu chưa được insert vào database
- **Giải pháp:** Chạy lại INSERT statement trong Bước 1

### API trả về 401 Unauthorized
- **Nguyên nhân:** Endpoint chưa được thêm vào public routes
- **Giải pháp:** Kiểm tra `gateway/server.js` có `/api/payment/check-account` trong `publicRoutes` không


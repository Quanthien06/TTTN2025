-- Thêm tài khoản MoMo demo vào bảng payment_demo_accounts
-- Số điện thoại đăng ký MoMo

INSERT INTO payment_demo_accounts (bank_type, account_number, account_name, balance, payment_type, description) VALUES
('momo', '0905884303', 'NGUYEN VAN A', 50000000.00, 'momo', 'Tài khoản demo MoMo - 0905884303'),
('momo', '0912345678', 'TRAN THI B', 75000000.00, 'momo', 'Tài khoản demo MoMo - 0912345678'),
('momo', '0987654321', 'LE VAN C', 100000000.00, 'momo', 'Tài khoản demo MoMo - 0987654321'),
('momo', '0901234567', 'PHAM THI D', 30000000.00, 'momo', 'Tài khoản demo MoMo - 0901234567'),
('momo', '0923456789', 'HOANG VAN E', 60000000.00, 'momo', 'Tài khoản demo MoMo - 0923456789')
ON DUPLICATE KEY UPDATE account_name = VALUES(account_name), description = VALUES(description);


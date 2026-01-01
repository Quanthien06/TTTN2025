-- tests/setup-test-db.sql
-- Script để tạo test database và các bảng cần thiết

-- Tạo database test
CREATE DATABASE IF NOT EXISTS tttn2025_test;

USE tttn2025_test;

-- Lưu ý: Các bảng sẽ được tạo tự động khi chạy tests
-- Nếu cần, có thể chạy các migration scripts từ thư mục database/

-- Hoặc copy schema từ database chính:
-- mysqldump -u root -p tttn2025 --no-data > schema.sql
-- mysql -u root -p tttn2025_test < schema.sql


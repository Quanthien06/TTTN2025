# scripts/create-all-product-folders.ps1
# Script PowerShell để tạo folder cho tất cả sản phẩm

Write-Host "=== TẠO FOLDER CHO TẤT CẢ SẢN PHẨM ===" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js chưa được cài đặt!" -ForegroundColor Red
    Write-Host "  Vui lòng cài đặt Node.js từ https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📦 Script sẽ:" -ForegroundColor Yellow
Write-Host "   1. Lấy tất cả sản phẩm từ database" -ForegroundColor White
Write-Host "   2. Tạo folder: public/img/products/[slug]/ cho mỗi sản phẩm" -ForegroundColor White
Write-Host "   3. Tạo placeholder.svg nếu chưa có ảnh" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Tiếp tục? (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Đã hủy" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🚀 Đang chạy script..." -ForegroundColor Yellow
Write-Host ""

node scripts/create-all-product-folders.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Hoàn thành!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Bước tiếp theo:" -ForegroundColor Yellow
    Write-Host "   1. Đặt ảnh vào các folder: public/img/products/[slug]/" -ForegroundColor White
    Write-Host "   2. Chạy: node scripts/setup-product-images.js để resize ảnh" -ForegroundColor White
    Write-Host "   3. Chạy: node scripts/update-product-image-paths.js để cập nhật database" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Có lỗi xảy ra!" -ForegroundColor Red
    exit 1
}


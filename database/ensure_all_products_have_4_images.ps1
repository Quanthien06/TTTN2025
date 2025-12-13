# database/ensure_all_products_have_4_images.ps1
# Script PowerShell để chạy ensure_all_products_have_4_images.js

Write-Host "=== ĐẢM BẢO TẤT CẢ SẢN PHẨM CÓ ĐỦ 4 ẢNH ===" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js chưa được cài đặt!" -ForegroundColor Red
    Write-Host "Vui lòng cài đặt Node.js từ https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Chuyển đến thư mục gốc
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Split-Path -Parent $scriptPath
Set-Location $rootPath

Write-Host "Đang chạy script ensure_all_products_have_4_images.js..." -ForegroundColor Yellow
Write-Host ""

# Chạy script
node database/ensure_all_products_have_4_images.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Hoàn thành!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✗ Có lỗi xảy ra!" -ForegroundColor Red
    exit 1
}


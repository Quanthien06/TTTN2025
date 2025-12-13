# scripts/create-temp-images-folder.ps1
# Script để tạo folder temp-images và hướng dẫn sử dụng

Write-Host "=== TẠO FOLDER TEMP-IMAGES ===" -ForegroundColor Cyan
Write-Host ""

$tempImagesDir = Join-Path $PSScriptRoot "..\temp-images"

if (-not (Test-Path $tempImagesDir)) {
    New-Item -ItemType Directory -Path $tempImagesDir -Force | Out-Null
    Write-Host "✓ Đã tạo folder: temp-images" -ForegroundColor Green
} else {
    Write-Host "✓ Folder temp-images đã tồn tại" -ForegroundColor Green
}

Write-Host ""
Write-Host "📁 Cấu trúc folder:" -ForegroundColor Yellow
Write-Host "   temp-images/" -ForegroundColor White
Write-Host "   ├── iphone-15/" -ForegroundColor Gray
Write-Host "   │   ├── image1.jpg" -ForegroundColor Gray
Write-Host "   │   ├── image2.jpg" -ForegroundColor Gray
Write-Host "   │   ├── image3.jpg" -ForegroundColor Gray
Write-Host "   │   └── image4.jpg" -ForegroundColor Gray
Write-Host "   ├── laptop-dell/" -ForegroundColor Gray
Write-Host "   │   └── ..." -ForegroundColor Gray
Write-Host "   └── ..." -ForegroundColor Gray

Write-Host ""
Write-Host "💡 Hướng dẫn:" -ForegroundColor Yellow
Write-Host "   1. Tạo folder con trong temp-images với tên sản phẩm (ví dụ: iphone-15)" -ForegroundColor White
Write-Host "   2. Đặt ảnh vào folder đó (tên file không quan trọng)" -ForegroundColor White
Write-Host "   3. Chạy: node scripts/setup-product-images.js `"Tên Sản Phẩm`" `"./temp-images/iphone-15`"" -ForegroundColor White
Write-Host ""

$createExample = Read-Host "Có muốn tạo folder ví dụ 'iphone-15' không? (y/n)"
if ($createExample -eq "y" -or $createExample -eq "Y") {
    $exampleDir = Join-Path $tempImagesDir "iphone-15"
    if (-not (Test-Path $exampleDir)) {
        New-Item -ItemType Directory -Path $exampleDir -Force | Out-Null
        Write-Host "✓ Đã tạo folder ví dụ: temp-images/iphone-15" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Bây giờ bạn có thể:" -ForegroundColor Yellow
        Write-Host "   1. Đặt ảnh vào folder: temp-images/iphone-15/" -ForegroundColor White
        Write-Host "   2. Chạy: node scripts/setup-product-images.js `"iPhone 15`" `"./temp-images/iphone-15`"" -ForegroundColor White
    } else {
        Write-Host "✓ Folder ví dụ đã tồn tại" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=== HOÀN TẤT ===" -ForegroundColor Cyan


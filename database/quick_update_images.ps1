# Script PowerShell nhanh để cập nhật hình ảnh
# Chạy: .\database\quick_update_images.ps1

Write-Host "=== CẬP NHẬT HÌNH ẢNH SẢN PHẨM ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Chọn phương thức tạo hình ảnh:" -ForegroundColor Yellow
Write-Host "1. Unsplash (Ảnh thật, đẹp) - Khuyến nghị" -ForegroundColor White
Write-Host "2. Placeholder (Có thông tin sản phẩm)" -ForegroundColor White
Write-Host "3. Picsum (Ảnh đẹp, ổn định)" -ForegroundColor White
Write-Host "4. DummyImage (Màu brand)" -ForegroundColor White
Write-Host "5. PlaceholderDetailed (Chi tiết)" -ForegroundColor White
Write-Host "6. UIAvatar (Avatar brand)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Nhập số (1-6) hoặc Enter để dùng mặc định (1)"

$method = switch ($choice) {
    "2" { "placeholder" }
    "3" { "picsum" }
    "4" { "dummyimage" }
    "5" { "placeholderDetailed" }
    "6" { "uiavatar" }
    default { "unsplash" }
}

Write-Host ""
Write-Host "Đang chạy với method: $method" -ForegroundColor Green
Write-Host ""

if ($method -eq "unsplash") {
    node database/update_product_images.js
} else {
    node database/generate_product_images_advanced.js $method
}

Write-Host ""
Write-Host "=== HOÀN TẤT ===" -ForegroundColor Cyan


# Script để khởi động tất cả microservices (PowerShell)

Write-Host "🚀 Khởi động các Microservices..." -ForegroundColor Green
Write-Host ""

# Định nghĩa các services
$services = @(
    @{Name="Auth Service"; Path="services/auth-service"; Port=5001},
    @{Name="Product Service"; Path="services/product-service"; Port=5002},
    @{Name="Cart Service"; Path="services/cart-service"; Port=5003},
    @{Name="Order Service"; Path="services/order-service"; Port=5004},
    @{Name="API Gateway"; Path="gateway"; Port=5000}
)

# Khởi động từng service
foreach ($service in $services) {
    Write-Host "📦 Đang khởi động $($service.Name)..." -ForegroundColor Yellow
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$($service.Path)'; Write-Host '$($service.Name) - Port $($service.Port)' -ForegroundColor Cyan; npm start" -WindowStyle Minimized
    
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "✅ Tất cả services đã được khởi động!" -ForegroundColor Green
Write-Host ""
Write-Host "Các services đang chạy tại:" -ForegroundColor Cyan
Write-Host "  - API Gateway: http://localhost:5000" -ForegroundColor White
Write-Host "  - Auth Service: http://localhost:5001" -ForegroundColor White
Write-Host "  - Product Service: http://localhost:5002" -ForegroundColor White
Write-Host "  - Cart Service: http://localhost:5003" -ForegroundColor White
Write-Host "  - Order Service: http://localhost:5004" -ForegroundColor White
Write-Host ""
Write-Host "Mở trình duyệt: http://localhost:5000" -ForegroundColor Green


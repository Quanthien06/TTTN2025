# Script de khoi dong tat ca microservices (PowerShell)

Write-Host "Khoi dong cac Microservices..." -ForegroundColor Green
Write-Host ""

# Dinh nghia cac services
$services = @(
    @{Name="Auth Service"; Path="services/auth-service"; Port=5001},
    @{Name="Product Service"; Path="services/product-service"; Port=5002},
    @{Name="Cart Service"; Path="services/cart-service"; Port=5003},
    @{Name="Order Service"; Path="services/order-service"; Port=5004},
    @{Name="News Service"; Path="services/news-service"; Port=5005},
    @{Name="API Gateway"; Path="gateway"; Port=5000}
)

# Khoi dong tung service
foreach ($service in $services) {
    Write-Host "Dang khoi dong $($service.Name)..." -ForegroundColor Yellow
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$($service.Path)'; Write-Host '$($service.Name) - Port $($service.Port)' -ForegroundColor Cyan; npm start" -WindowStyle Minimized
    
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "Tat ca services da duoc khoi dong!" -ForegroundColor Green
Write-Host ""
Write-Host "Cac services dang chay tai:" -ForegroundColor Cyan
Write-Host "  - API Gateway: http://localhost:5000" -ForegroundColor White
Write-Host "  - Auth Service: http://localhost:5001" -ForegroundColor White
Write-Host "  - Product Service: http://localhost:5002" -ForegroundColor White
Write-Host "  - Cart Service: http://localhost:5003" -ForegroundColor White
Write-Host "  - Order Service: http://localhost:5004" -ForegroundColor White
Write-Host "  - News Service: http://localhost:5005" -ForegroundColor White
Write-Host ""
Write-Host "Mo trinh duyet: http://localhost:5000" -ForegroundColor Green
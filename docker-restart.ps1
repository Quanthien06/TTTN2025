# docker-restart.ps1
# Script de restart Docker containers nhanh

Write-Host "=== RESTART DOCKER CONTAINERS ===" -ForegroundColor Cyan
Write-Host ""

# Rebuild order-service neu co thay doi code
Write-Host "Rebuilding order-service..." -ForegroundColor Yellow
docker-compose build order-service

Write-Host ""
Write-Host "Restarting order-service and gateway..." -ForegroundColor Yellow
docker-compose up -d order-service gateway

Write-Host ""
Write-Host "Cho 3 giay de containers khoi dong..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Kiem tra logs:" -ForegroundColor Cyan
docker-compose logs --tail=5 order-service

Write-Host ""
Write-Host "Hoan thanh!" -ForegroundColor Green
Write-Host "Kiem tra: http://localhost:5000" -ForegroundColor White



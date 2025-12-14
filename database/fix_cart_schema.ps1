# database/fix_cart_schema.ps1
# Script PowerShell de chay fix_cart_schema.js

Write-Host "=== SUA SCHEMA CARTS VA CART_ITEMS ===" -ForegroundColor Cyan
Write-Host ""

# Kiem tra Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js chua duoc cai dat!" -ForegroundColor Red
    Write-Host "Vui long cai dat Node.js tu https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Chuyen den thu muc goc
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Split-Path -Parent $scriptPath
Set-Location $rootPath

Write-Host "Dang chay script fix_cart_schema.js..." -ForegroundColor Yellow
Write-Host ""

# Chay script
node database/fix_cart_schema.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Hoan thanh! Vui long restart server." -ForegroundColor Green
    Write-Host ""
    Write-Host "Chay: .\quick-restart.ps1" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Co loi xay ra!" -ForegroundColor Red
    exit 1
}


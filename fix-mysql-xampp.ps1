# Script fix MySQL XAMPP - Giai quyet port 3306 bi chiem
# Chay: .\fix-mysql-xampp.ps1

Write-Host "=== FIX MYSQL XAMPP ===" -ForegroundColor Cyan
Write-Host ""

# Kiem tra port 3306
Write-Host "1. Kiem tra port 3306..." -ForegroundColor Yellow
$port3306 = netstat -ano | findstr :3306
if ($port3306) {
    Write-Host "   Port 3306 dang bi su dung!" -ForegroundColor Red
    Write-Host $port3306 -ForegroundColor White
} else {
    Write-Host "   Port 3306 dang trong!" -ForegroundColor Green
}

Write-Host ""

# Kiem tra MySQL services
Write-Host "2. Kiem tra MySQL services..." -ForegroundColor Yellow
$mysqlServices = Get-Service | Where-Object {$_.DisplayName -like "*mysql*" -or $_.Name -like "*mysql*"}
foreach ($service in $mysqlServices) {
    Write-Host "   $($service.Name): $($service.Status) - $($service.DisplayName)" -ForegroundColor White
}

Write-Host ""

# Kiem tra MySQL processes
Write-Host "3. Kiem tra MySQL processes..." -ForegroundColor Yellow
$mysqlProcesses = Get-Process | Where-Object {$_.ProcessName -like "*mysql*"}
foreach ($proc in $mysqlProcesses) {
    Write-Host "   PID $($proc.Id): $($proc.ProcessName)" -ForegroundColor White
}

Write-Host ""

# Hoi nguoi dung
Write-Host "=== GIAI PHAP ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Co 2 cach:" -ForegroundColor Yellow
Write-Host ""
Write-Host "CACH 1: Tat MySQL80 service (KHUYEN NGHI)" -ForegroundColor Cyan
Write-Host "   Stop-Service MySQL80" -ForegroundColor White
Write-Host "   Set-Service MySQL80 -StartupType Manual" -ForegroundColor White
Write-Host ""
Write-Host "CACH 2: Doi port MySQL trong XAMPP" -ForegroundColor Cyan
Write-Host "   Sua file: C:\xampp\mysql\bin\my.ini" -ForegroundColor White
Write-Host "   Tim: port=3306" -ForegroundColor White
Write-Host "   Doi thanh: port=3307" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Ban muon tat MySQL80 service? (y/n)"

if ($choice -eq "y" -or $choice -eq "Y") {
    Write-Host ""
    Write-Host "Dang tat MySQL80 service..." -ForegroundColor Yellow
    
    try {
        Stop-Service MySQL80 -Force
        Write-Host "   Da tat MySQL80 service!" -ForegroundColor Green
        
        # Set startup type to Manual
        Set-Service MySQL80 -StartupType Manual
        Write-Host "   Da dat MySQL80 thanh Manual (khong tu dong khoi dong)" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "Bay gio ban co the khoi dong MySQL trong XAMPP!" -ForegroundColor Cyan
        Write-Host "Hoac chay lenh: Start-Service mysql (XAMPP MySQL service)" -ForegroundColor White
        
    } catch {
        Write-Host "   LOI: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   Co the can quyen Administrator!" -ForegroundColor Yellow
        Write-Host "   Chay PowerShell voi quyen Administrator va thu lai!" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "Ban co the:" -ForegroundColor Yellow
    Write-Host "1. Tat MySQL80 service thu cong trong Services (services.msc)" -ForegroundColor White
    Write-Host "2. Hoac doi port MySQL trong XAMPP" -ForegroundColor White
}

Write-Host ""
Write-Host "=== HOAN TAT ===" -ForegroundColor Cyan



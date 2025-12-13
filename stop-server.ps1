# stop-server.ps1
# Script để dừng server Node.js đang chạy trên port 5000

Write-Host "=== DỪNG SERVER TRÊN PORT 5000 ===" -ForegroundColor Cyan
Write-Host ""

$port = 5000
$connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($connections) {
    $processes = $connections | ForEach-Object {
        Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
    } | Where-Object { $_.ProcessName -eq "node" } | Select-Object -Unique

    if ($processes) {
        Write-Host "Tim thay cac process Node.js dang su dung port $port:" -ForegroundColor Yellow
        foreach ($proc in $processes) {
            Write-Host "  - PID: $($proc.Id) | Process: $($proc.ProcessName) | Path: $($proc.Path)" -ForegroundColor White
        }
        Write-Host ""
        
        $confirm = Read-Host "Ban co muon dung cac process nay? (y/n)"
        if ($confirm -eq "y" -or $confirm -eq "Y") {
            foreach ($proc in $processes) {
                try {
                    Stop-Process -Id $proc.Id -Force
                    Write-Host "✓ Da dung process PID: $($proc.Id)" -ForegroundColor Green
                } catch {
                    Write-Host "✗ Khong the dung process PID: $($proc.Id) - $($_.Exception.Message)" -ForegroundColor Red
                }
            }
            Write-Host ""
            Write-Host "✓ Hoan thanh! Port $port da duoc giai phong." -ForegroundColor Green
        } else {
            Write-Host "Da huy" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Khong tim thay process Node.js nao tren port $port" -ForegroundColor Yellow
    }
} else {
    Write-Host "Port $port khong duoc su dung" -ForegroundColor Green
}

Write-Host ""
Write-Host "💡 Bay gio ban co the:" -ForegroundColor Cyan
Write-Host "   1. Chay Docker Compose: docker-compose up -d" -ForegroundColor White
Write-Host "   2. Hoac chay server.js: node server.js" -ForegroundColor White


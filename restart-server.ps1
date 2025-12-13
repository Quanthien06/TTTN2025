# restart-server.ps1
# Script để restart server Node.js

Write-Host "=== RESTART SERVER ===" -ForegroundColor Cyan
Write-Host ""

$port = 5000
$connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($connections) {
    $processes = $connections | ForEach-Object {
        Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
    } | Where-Object { $_.ProcessName -eq "node" } | Select-Object -Unique

    if ($processes) {
        Write-Host "Tim thay server Node.js dang chay tren port $port:" -ForegroundColor Yellow
        foreach ($proc in $processes) {
            Write-Host "  - PID: $($proc.Id) | Process: $($proc.ProcessName)" -ForegroundColor White
        }
        Write-Host ""
        
        # Auto confirm để restart nhanh
        $confirm = "y"
        if ($confirm -eq "y" -or $confirm -eq "Y") {
            foreach ($proc in $processes) {
                try {
                    Stop-Process -Id $proc.Id -Force
                    Write-Host "✓ Da dung process PID: $($proc.Id)" -ForegroundColor Green
                } catch {
                    Write-Host "✗ Khong the dung process PID: $($proc.Id)" -ForegroundColor Red
                }
            }
            Write-Host ""
            Write-Host "Cho 2 giay de port duoc giai phong..." -ForegroundColor Yellow
            Start-Sleep -Seconds 2
        } else {
            Write-Host "Da huy" -ForegroundColor Yellow
            exit 0
        }
    }
}

Write-Host ""
Write-Host "Khoi dong lai server..." -ForegroundColor Yellow
Write-Host ""

# Start server in background
Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory (Get-Location) -WindowStyle Normal

Write-Host "✓ Server da duoc khoi dong!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Kiem tra:" -ForegroundColor Cyan
Write-Host "   1. Mo browser: http://localhost:5000" -ForegroundColor White
Write-Host "   2. Test API: http://localhost:5000/api/comments/product/2049" -ForegroundColor White


# kill-server.ps1
# Script để kill server nhanh

Write-Host "=== KILL SERVER ===" -ForegroundColor Red
Write-Host ""

$port = 5000

# Tìm và kill tất cả process Node.js trên port 5000
$connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($connections) {
    $processes = $connections | ForEach-Object {
        Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
    } | Where-Object { $_.ProcessName -eq "node" } | Select-Object -Unique

    if ($processes) {
        foreach ($proc in $processes) {
            try {
                Stop-Process -Id $proc.Id -Force
                Write-Host "✓ Đã kill PID: $($proc.Id)" -ForegroundColor Green
            } catch {
                Write-Host "✗ Không thể kill PID: $($proc.Id)" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "Không tìm thấy server nào đang chạy trên port $port" -ForegroundColor Yellow
    }
} else {
    Write-Host "Không tìm thấy server nào đang chạy trên port $port" -ForegroundColor Yellow
}

# Kill tất cả process node (backup)
Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        Write-Host "✓ Đã kill node process PID: $($_.Id)" -ForegroundColor Green
    } catch {
        # Ignore
    }
}

Write-Host ""
Write-Host "✓ Hoàn thành!" -ForegroundColor Green


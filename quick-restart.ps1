# quick-restart.ps1
# Script restart server nhanh (không cần xác nhận)

Write-Host "=== QUICK RESTART SERVER ===" -ForegroundColor Cyan
Write-Host ""

$port = 5000

# Tìm và kill tất cả process Node.js trên port 5000
$connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($connections) {
    $processes = $connections | ForEach-Object {
        Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
    } | Where-Object { $_.ProcessName -eq "node" } | Select-Object -Unique

    if ($processes) {
        Write-Host "Đang dừng server cũ..." -ForegroundColor Yellow
        foreach ($proc in $processes) {
            try {
                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                Write-Host "  ✓ Đã dừng PID: $($proc.Id)" -ForegroundColor Green
            } catch {
                # Ignore errors
            }
        }
        Write-Host ""
        Write-Host "Đợi 1 giây để port được giải phóng..." -ForegroundColor Yellow
        Start-Sleep -Seconds 1
    }
}

# Kill tất cả process node server.js (backup method)
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*server.js*" -or $_.Path -like "*node*"
} | ForEach-Object {
    try {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    } catch {
        # Ignore errors
    }
}

Start-Sleep -Seconds 1

Write-Host "Khởi động lại server..." -ForegroundColor Yellow
Write-Host ""

# Start server
$process = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory (Get-Location) -PassThru -WindowStyle Normal

Write-Host "✓ Server đã được khởi động! (PID: $($process.Id))" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Kiểm tra:" -ForegroundColor Cyan
Write-Host "   http://localhost:5000" -ForegroundColor White
Write-Host ""


# quick-restart.ps1
# Script restart server nhanh (khong can xac nhan)

Write-Host "=== QUICK RESTART SERVER ===" -ForegroundColor Cyan
Write-Host ""

$port = 5000

# Tim va kill tat ca process Node.js tren port 5000
$connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($connections) {
    $processes = $connections | ForEach-Object {
        Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
    } | Where-Object { $_.ProcessName -eq "node" } | Select-Object -Unique

    if ($processes) {
        Write-Host "Dang dung server cu..." -ForegroundColor Yellow
        foreach ($proc in $processes) {
            try {
                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                Write-Host "  Da dung PID: $($proc.Id)" -ForegroundColor Green
            } catch {
                # Ignore errors
            }
        }
        Write-Host ""
        Write-Host "Doi 1 giay de port duoc giai phong..." -ForegroundColor Yellow
        Start-Sleep -Seconds 1
    }
}

# Kill tat ca process node server.js (backup method)
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

Write-Host "Khoi dong lai server..." -ForegroundColor Yellow
Write-Host ""

# Start server
$process = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory (Get-Location) -PassThru -WindowStyle Normal

Write-Host "Server da duoc khoi dong! (PID: $($process.Id))" -ForegroundColor Green
Write-Host ""
Write-Host "Kiem tra:" -ForegroundColor Cyan
Write-Host "   http://localhost:5000" -ForegroundColor White
Write-Host ""

# check_server_logs.ps1
# Script de xem server logs

Write-Host "=== KIEM TRA SERVER ===" -ForegroundColor Cyan
Write-Host ""

$port = 5000
$connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($connections) {
    $processes = $connections | ForEach-Object {
        Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
    } | Where-Object { $_.ProcessName -eq "node" } | Select-Object -Unique

    if ($processes) {
        Write-Host "Server dang chay:" -ForegroundColor Green
        foreach ($proc in $processes) {
            Write-Host "  - PID: $($proc.Id) | Process: $($proc.ProcessName) | Start: $($proc.StartTime)" -ForegroundColor White
        }
        Write-Host ""
        Write-Host "Vui long kiem tra terminal chay server de xem log chi tiet!" -ForegroundColor Yellow
        Write-Host "Tim dong: === LOI KHI TAO DON HANG ===" -ForegroundColor Cyan
    } else {
        Write-Host "Khong tim thay server Node.js tren port $port" -ForegroundColor Red
    }
} else {
    Write-Host "Khong co server nao dang chay tren port $port" -ForegroundColor Red
    Write-Host ""
    Write-Host "Chay: .\quick-restart.ps1 de khoi dong server" -ForegroundColor Yellow
}



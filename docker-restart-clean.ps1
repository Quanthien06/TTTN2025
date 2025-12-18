# docker-restart-clean.ps1
# Clean restart for Docker workflow. Stops local processes that block port 5000, then rebuilds and starts compose.
# NOTE: ASCII-only output to avoid PowerShell encoding issues on some Windows setups.

$ErrorActionPreference = "Stop"

function Write-Ok($msg) { Write-Host ("[OK] " + $msg) -ForegroundColor Green }
function Write-Warn($msg) { Write-Host ("[WARN] " + $msg) -ForegroundColor Yellow }
function Write-Bad($msg) { Write-Host ("[FAIL] " + $msg) -ForegroundColor Red }

Write-Host "=== Docker Clean Restart (TTTN2025) ===" -ForegroundColor Cyan
Write-Host ""

# Kill any node processes (common cause for port 5000 conflicts) - safe for this repo usage
$nodes = Get-Process node -ErrorAction SilentlyContinue
if ($nodes) {
  Write-Warn ("Stopping " + $nodes.Count + " node.exe process(es) to free ports...")
  $nodes | Stop-Process -Force
  Start-Sleep -Seconds 1
  Write-Ok "node.exe stopped"
} else {
  Write-Ok "No node.exe process running"
}

Write-Host ""
Write-Host "Bringing docker compose down..." -ForegroundColor DarkGray
docker compose down | Out-Host

Write-Host ""
Write-Host "Building and starting docker compose..." -ForegroundColor DarkGray
docker compose up -d --build | Out-Host

Write-Host ""
Write-Ok "Docker compose is up"
Write-Host "Next: run .\\docker-health-check.ps1" -ForegroundColor Cyan



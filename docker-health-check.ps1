# docker-health-check.ps1
# Quick "doctor" for Docker workflow: verifies compose is up, port availability, and core admin endpoints.
# NOTE: ASCII-only output to avoid PowerShell encoding issues on some Windows setups.

$ErrorActionPreference = "Stop"

function Write-Ok($msg) { Write-Host ("[OK] " + $msg) -ForegroundColor Green }
function Write-Warn($msg) { Write-Host ("[WARN] " + $msg) -ForegroundColor Yellow }
function Write-Bad($msg) { Write-Host ("[FAIL] " + $msg) -ForegroundColor Red }

function Check-PortFree($port) {
  $line = (netstat -ano | findstr (":" + $port + " ") | Select-Object -First 1)
  if ($line) {
    $procId = ($line -split "\s+")[-1]
    return @{ Taken = $true; Pid = $procId; Line = $line }
  }
  return @{ Taken = $false; Pid = $null; Line = $null }
}

function Is-DockerPortOwner($procId) {
  try {
    $p = Get-Process -Id $procId -ErrorAction Stop
    # Common on Windows Docker Desktop / WSL networking
    return @('com.docker.backend','wslrelay','vmmem','vmmemWSL').Contains($p.ProcessName)
  } catch {
    return $false
  }
}

function Http-Status($url) {
  try {
    $r = Invoke-WebRequest -UseBasicParsing -Uri $url -Method GET -TimeoutSec 6
    return @{ ok = $true; status = [int]$r.StatusCode; body = $null }
  } catch {
    $resp = $_.Exception.Response
    if ($resp) {
      return @{ ok = $false; status = [int]$resp.StatusCode.value__; body = $null }
    }
    return @{ ok = $false; status = -1; body = $_.Exception.Message }
  }
}

Write-Host "=== Docker Health Check (TTTN2025) ===" -ForegroundColor Cyan
Write-Host ("Repo: " + (Get-Location)) -ForegroundColor DarkGray
Write-Host ""

# 1) Preflight: port 5000 must be free for Docker gateway
$p = Check-PortFree 5000
if ($p.Taken) {
  if (Is-DockerPortOwner $p.Pid) {
    Write-Ok ("Port 5000 is bound by Docker/WSL (PID " + $p.Pid + ")")
  } else {
    Write-Warn ("Port 5000 is in use (PID " + $p.Pid + "). Docker gateway cannot bind.")
    Write-Host ("   Tip: stop the process using 5000 or run .\\docker-restart-clean.ps1") -ForegroundColor DarkGray
  }
} else {
  Write-Ok "Port 5000 is free"
}

# 2) Docker compose status
try {
  $ps = docker compose ps --format json | ConvertFrom-Json
  if (-not $ps) {
    Write-Bad "No containers found. Did you run: docker compose up -d ?"
    exit 1
  }
} catch {
  Write-Bad "Cannot read docker compose status. Ensure Docker Desktop is running."
  throw
}

$required = @("gateway","auth-service","order-service","product-service","cart-service","news-service")
foreach ($name in $required) {
  $row = $ps | Where-Object { $_.Service -eq $name } | Select-Object -First 1
  if (-not $row) {
    Write-Warn ("Missing service in compose: " + $name)
    continue
  }
  if ($row.State -eq "running") {
    Write-Ok ("Service " + $name + " is running")
  } else {
    Write-Bad ("Service " + $name + " is NOT running (state=" + $row.State + ")")
  }
}

Write-Host ""

# 3) HTTP checks (public)
$checks = @(
  @{ name="Gateway homepage"; url="http://localhost:5000/"; expect=@(200,302) },
  @{ name="Auth health"; url="http://localhost:5001/health"; expect=@(200) },
  @{ name="Order health"; url="http://localhost:5004/health"; expect=@(200) }
)

foreach ($c in $checks) {
  $r = Http-Status $c.url
  if ($c.expect -contains $r.status) {
    Write-Ok ($c.name + " OK (" + $r.status + ")")
  } else {
    if ($r.status -eq -1) {
      Write-Bad ($c.name + " FAIL (" + $r.body + ")")
    } else {
      Write-Bad ($c.name + " FAIL (" + $r.status + ")")
    }
  }
}

Write-Host ""

# 4) Admin endpoints existence check (without token should be 401/403, not 404/500)
$adminChecks = @(
  @{ name="Admin users"; url="http://localhost:5000/api/users?page=1&limit=1"; ok=@(401,403) },
  @{ name="Admin stats overview"; url="http://localhost:5000/api/stats/overview"; ok=@(401,403) },
  @{ name="Admin stats revenue"; url="http://localhost:5000/api/stats/revenue?days=7"; ok=@(401,403) },
  @{ name="Admin orders"; url="http://localhost:5000/api/orders/admin?limit=1"; ok=@(401,403) }
)

foreach ($c in $adminChecks) {
  $r = Http-Status $c.url
  if ($c.ok -contains $r.status) {
    Write-Ok ($c.name + " exists (" + $r.status + ")")
  } elseif ($r.status -eq 404) {
    Write-Bad ($c.name + " 404 (route missing / wrong server running)")
  } elseif ($r.status -eq 500) {
    Write-Bad ($c.name + " 500 (backend runtime error / DB / SQL)")
  } else {
    Write-Warn ($c.name + " unexpected status: " + $r.status)
  }
}

Write-Host ""
Write-Host "Done. If you see [FAIL], run:" -ForegroundColor Cyan
Write-Host "  .\\docker-restart-clean.ps1" -ForegroundColor White



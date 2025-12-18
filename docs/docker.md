# Docker Guide (Recommended)

## Start (stable, Docker-only)

From repo root:

```powershell
.\docker-restart-clean.ps1
.\docker-health-check.ps1
```

If health-check is all **OK**, open:
- App: `http://localhost:5000`
- Admin: `http://localhost:5000/admin.html`

## Common commands

```powershell
# Start all services
docker compose up -d --build

# Logs
docker compose logs -f
docker compose logs -f gateway

# Stop / remove
docker compose stop
docker compose down
```

## Troubleshooting

### Port 5000 conflict
- Run `.\docker-restart-clean.ps1` (it stops local `node.exe` that often blocks 5000).

### Verify services
- `http://localhost:5001/health` (auth)
- `http://localhost:5004/health` (order)



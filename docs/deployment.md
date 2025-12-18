# Deployment Checklist

This checklist focuses on the current **Docker** workflow.

## Pre-flight

- Docker Desktop running
- `.\docker-health-check.ps1` shows all **OK**

## Smoke tests (manual)

- Open `http://localhost:5000`
- Login as admin and open `http://localhost:5000/admin.html`
- Verify tabs: Products / Users / Orders load without console errors



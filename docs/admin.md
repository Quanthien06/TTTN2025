# Admin Dashboard Guide

## Access

- URL: `http://localhost:5000/admin.html`
- Requires a user with `role=admin`.

## What the admin page calls

- `/api/me`
- `/api/users`
- `/api/orders/admin`
- `/api/stats/overview`
- `/api/stats/revenue` (charts)

## Quick verification

Run Docker health check:

```powershell
.\docker-health-check.ps1
```

Expected (without token) for admin endpoints: **401/403** (exists), not 404/500.



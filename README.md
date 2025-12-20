# TTTN2025 (TechStore)

This repo contains a TechStore web app (HTML frontend served by Gateway) with a Node.js microservices backend.

## Quick start (recommended: Docker)

### Prerequisites

- Windows 10/11
- Docker Desktop (with Docker Compose)
- MySQL running on your host at `localhost:3306` (XAMPP/WAMP/MySQL Server)
  - Database name: `tttn2025`
  - User: `root`
  - Password: empty string (`""`) by default in this project

### Start (2 commands)

From repo root:

```powershell
.\docker-restart-clean.ps1
.\docker-health-check.ps1
```

If health-check is all **OK**, open:

- App: `http://localhost:5000`
- Admin: `http://localhost:5000/admin.html`

> Important: When using Docker, **do not** run `npm start` for gateway/services on the host, otherwise you will hit port conflicts and “random” 404/500 errors.

## Admin login

- Login page: `http://localhost:5000/login.html`
- Admin page: `http://localhost:5000/admin.html`
- Your admin user must have `role='admin'` in table `users`.

### Create an admin user (example)

Option A: Register normally, then update role in DB:

```sql
UPDATE users SET role='admin' WHERE username='kevinhere';
```

Option B: Insert directly (hash password with bcrypt first).

## Environment variables (OAuth2 + Email)

Some features require environment variables (Google OAuth2, email OTP).

- Create `.env` in repo root (optional if you don’t use these features)

Example:

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@techstore.com
```

## Useful commands

### Rebuild and restart everything

```powershell
.\docker-restart-clean.ps1
```

### Check system health

```powershell
.\docker-health-check.ps1
```

### View logs

```powershell
docker compose logs -f
docker compose logs -f gateway
docker compose logs -f auth-service
docker compose logs -f order-service
```

## Documentation

- **Docs index**: `docs/README.md`
- **Architecture**: `ARCHITECTURE.md` - Kiến trúc hệ thống
- **Docker guide**: `docs/docker.md`
- **Admin guide**: `docs/admin.md`
- **OAuth + Email**: `docs/oauth-email.md`
- **Setup guides**: `docs/setup/` - Hướng dẫn cấu hình
- **User guides**: `docs/guides/` - Hướng dẫn sử dụng

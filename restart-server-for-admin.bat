@echo off
REM Script để restart server sau khi fix admin

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║                  RESTARTING SERVER                     ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Tìm process Node.js chạy trên port 5000 và kill nó
echo [1] Stopping existing server process...
for /f "tokens=5" %%a in ('netstat -anob ^| find "5000" ^| find "LISTENING"') do (
    taskkill /PID %%a /F 2>nul
)

timeout /t 2 /nobreak

REM Start server lại
echo.
echo [2] Starting server...
cd /d "%~dp0"
start cmd /k npm start

echo.
echo [3] Server should be starting now!
echo.
echo ℹ️  To access admin:
echo    - Login with admin account
echo    - Go to http://localhost:5000/admin.html
echo.
echo ℹ️  To test endpoints, open DevTools Console and run:
echo    testEndpoints()
echo.

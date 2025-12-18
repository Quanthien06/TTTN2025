# Run database migration for refunds table
Write-Host "`nRunning Refunds Table Migration...`n" -ForegroundColor Cyan

# Đọc SQL file
$sqlFile = "$(Get-Location)\database\06_refunds_schema.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ SQL file not found: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Found: $sqlFile" -ForegroundColor Green

$sql = Get-Content $sqlFile -Raw

Write-Host "`nSQL to execute:`n" -ForegroundColor Yellow
Write-Host $sql

Write-Host "`n" -ForegroundColor Cyan
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  IMPORTANT: Configure MySQL connection before running   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host @"
`nTo execute this migration:

1. Open MySQL client or MySQL Workbench
2. Connect to your database server
3. Select your database (e.g., `USE yourdatabasename;`)
4. Copy and paste the SQL above
5. Execute (Ctrl+Enter or click Execute button)

OR

1. Open Command Prompt/PowerShell
2. Run: mysql -u [username] -p[password] -h [host] [database] < database\06_refunds_schema.sql

Example:
mysql -u root -ppassword -h localhost mytestdb < database\06_refunds_schema.sql

"@

Write-Host "Press Enter after migration is complete..." -ForegroundColor Yellow
Read-Host

# Verify table was created (optional - requires Node.js script)
Write-Host "`nTo verify table creation, you can:" -ForegroundColor Cyan
Write-Host "1. Open Node.js REPL and check the database"
Write-Host "2. Query: SELECT * FROM refunds LIMIT 0;"
Write-Host "3. Or check admin dashboard - refunds section should work"

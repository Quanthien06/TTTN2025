# create-test-db.ps1
# Script để tạo test database

Write-Host "🔧 Creating test database..." -ForegroundColor Cyan

# Database config
$DB_HOST = "localhost"
$DB_USER = "root"
$DB_PASSWORD = ""
$DB_NAME = "tttn2025_test"

# Tạo SQL command
$sql = @"
CREATE DATABASE IF NOT EXISTS $DB_NAME;
USE $DB_NAME;
SELECT 'Test database created successfully!' as message;
"@

# Lưu SQL vào file tạm
$tempFile = [System.IO.Path]::GetTempFileName() + ".sql"
$sql | Out-File -FilePath $tempFile -Encoding UTF8

try {
    Write-Host "📝 Executing SQL..." -ForegroundColor Yellow
    
    # Chạy MySQL command
    if ($DB_PASSWORD) {
        $result = mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD < $tempFile 2>&1
    } else {
        $result = mysql -h $DB_HOST -u $DB_USER < $tempFile 2>&1
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Test database '$DB_NAME' created successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Next steps:" -ForegroundColor Cyan
        Write-Host "   1. Run migration scripts to create tables (if needed)"
        Write-Host "   2. Run: npm run test:quick"
        Write-Host "   3. Run: npm test"
    } else {
        Write-Host "❌ Error creating database:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 Try creating manually:" -ForegroundColor Yellow
        Write-Host "   mysql -u root -e `"CREATE DATABASE $DB_NAME;`""
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Make sure MySQL is running and try creating manually:" -ForegroundColor Yellow
    Write-Host "   mysql -u root -e `"CREATE DATABASE $DB_NAME;`""
} finally {
    # Xóa file tạm
    if (Test-Path $tempFile) {
        Remove-Item $tempFile -Force
    }
}


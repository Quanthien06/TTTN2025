# Script PowerShell để cập nhật Client Secret vào file .env

Write-Host "=== CẬP NHẬT CLIENT SECRET ===" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra file .env
if (-not (Test-Path .env)) {
    Write-Host "❌ File .env không tồn tại!" -ForegroundColor Red
    Write-Host "Tạo file .env trước..." -ForegroundColor Yellow
    exit
}

# Đọc file .env hiện tại
$envContent = Get-Content .env -Raw

# Kiểm tra xem đã có GOOGLE_CLIENT_ID chưa
if ($envContent -notmatch "GOOGLE_CLIENT_ID=") {
    Write-Host "❌ File .env không có GOOGLE_CLIENT_ID!" -ForegroundColor Red
    exit
}

Write-Host "📝 Nhập Client Secret mới (bắt đầu bằng GOCSPX-):" -ForegroundColor Yellow
Write-Host "   (Paste Secret bạn vừa copy từ Google Cloud Console)" -ForegroundColor Gray
Write-Host ""
$newSecret = Read-Host "Client Secret"

if ([string]::IsNullOrWhiteSpace($newSecret)) {
    Write-Host "❌ Client Secret không được để trống!" -ForegroundColor Red
    exit
}

# Loại bỏ khoảng trắng đầu cuối
$newSecret = $newSecret.Trim()

# Kiểm tra format (nên bắt đầu bằng GOCSPX-)
if ($newSecret -notmatch "^GOCSPX-") {
    Write-Host "⚠️  Cảnh báo: Client Secret thường bắt đầu bằng 'GOCSPX-'" -ForegroundColor Yellow
    $continue = Read-Host "Bạn có chắc muốn tiếp tục? (y/n)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "Đã hủy." -ForegroundColor Red
        exit
    }
}

# Cập nhật GOOGLE_CLIENT_SECRET
if ($envContent -match "GOOGLE_CLIENT_SECRET=(.+)") {
    # Thay thế Secret cũ
    $envContent = $envContent -replace "GOOGLE_CLIENT_SECRET=.+", "GOOGLE_CLIENT_SECRET=$newSecret"
    Write-Host "✅ Đã cập nhật Client Secret" -ForegroundColor Green
} else {
    # Thêm Secret mới
    $envContent += "`nGOOGLE_CLIENT_SECRET=$newSecret"
    Write-Host "✅ Đã thêm Client Secret" -ForegroundColor Green
}

# Ghi lại file
try {
    $envContent | Out-File -FilePath .env -Encoding utf8 -NoNewline
    Write-Host ""
    Write-Host "✅ Đã cập nhật file .env thành công!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Nội dung file .env:" -ForegroundColor Cyan
    Write-Host "─" * 50
    Get-Content .env
    Write-Host "─" * 50
    Write-Host ""
    Write-Host "🔍 Kiểm tra cấu hình:" -ForegroundColor Yellow
    Write-Host "   node check-oauth-config.js" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ Lỗi khi cập nhật file .env: $_" -ForegroundColor Red
}


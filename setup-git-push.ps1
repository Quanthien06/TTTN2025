# Script setup Git push với token
# Chạy: .\setup-git-push.ps1

Write-Host "=== SETUP GIT PUSH VỚI TOKEN ===" -ForegroundColor Cyan
Write-Host ""

# Bước 1: Hướng dẫn tạo token
Write-Host "BƯỚC 1: Tạo Personal Access Token" -ForegroundColor Yellow
Write-Host "1. Vào: https://github.com/settings/tokens" -ForegroundColor White
Write-Host "2. Click 'Generate new token' -> 'Generate new token (classic)'" -ForegroundColor White
Write-Host "3. Đặt tên: TTTN2025-Push-Token" -ForegroundColor White
Write-Host "4. Chọn quyền: repo (full control)" -ForegroundColor White
Write-Host "5. Generate và COPY TOKEN" -ForegroundColor White
Write-Host ""

# Bước 2: Nhập token
$token = Read-Host "Nhập token của bạn (ghp_...)"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "Token không được để trống!" -ForegroundColor Red
    exit 1
}

# Bước 3: Cập nhật remote URL
Write-Host ""
Write-Host "Đang cập nhật remote URL..." -ForegroundColor Yellow

$newUrl = "https://$token@github.com/Quanthien06/TTTN2025.git"

try {
    git remote set-url origin $newUrl
    Write-Host "✓ Đã cập nhật remote URL thành công!" -ForegroundColor Green
} catch {
    Write-Host "✗ Lỗi khi cập nhật remote URL" -ForegroundColor Red
    exit 1
}

# Bước 4: Kiểm tra
Write-Host ""
Write-Host "Kiểm tra remote URL:" -ForegroundColor Yellow
git remote -v

# Bước 5: Thử push
Write-Host ""
Write-Host "Bạn có muốn push ngay bây giờ? (y/n)" -ForegroundColor Cyan
$pushNow = Read-Host

if ($pushNow -eq "y" -or $pushNow -eq "Y") {
    Write-Host ""
    Write-Host "Đang push lên GitHub..." -ForegroundColor Yellow
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Push thành công!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "✗ Push thất bại. Kiểm tra lại token và repository." -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "Để push sau, chạy: git push origin main" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=== HOÀN TẤT ===" -ForegroundColor Cyan




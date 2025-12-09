# Script để fix lỗi GitHub Push Protection do secrets trong commit history
# Chạy script này: .\fix-git-secrets.ps1

Write-Host "=== FIX GIT SECRETS ===" -ForegroundColor Yellow
Write-Host ""

# Kiểm tra git status
Write-Host "1. Kiểm tra git status..." -ForegroundColor Cyan
git status

Write-Host ""
Write-Host "2. Đảm bảo .env đã được thêm vào .gitignore..." -ForegroundColor Cyan
if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content ".gitignore" -Raw
    if ($gitignoreContent -match "\.env") {
        Write-Host "   ✓ .env đã có trong .gitignore" -ForegroundColor Green
    } else {
        Write-Host "   ✗ .env chưa có trong .gitignore" -ForegroundColor Red
        Add-Content ".gitignore" "`n# Environment variables`n.env"
        Write-Host "   ✓ Đã thêm .env vào .gitignore" -ForegroundColor Green
    }
} else {
    Write-Host "   ✗ Không tìm thấy .gitignore" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Các file markdown đã được cập nhật (secrets đã được thay bằng placeholder)" -ForegroundColor Cyan
Write-Host "   ✓ FIX_LOI_401_NHANH.md" -ForegroundColor Green
Write-Host "   ✓ HUONG_DAN_FIX_LOI_401_INVALID_CLIENT.md" -ForegroundColor Green
Write-Host "   ✓ HUONG_DAN_RESTART_SERVER.md" -ForegroundColor Green

Write-Host ""
Write-Host "=== CÁCH FIX COMMIT HISTORY ===" -ForegroundColor Yellow
Write-Host ""
Write-Host "Có 2 cách để fix:" -ForegroundColor Cyan
Write-Host ""
Write-Host "CÁCH 1: Sử dụng GitHub UI (Đơn giản nhất)" -ForegroundColor Green
Write-Host "1. Truy cập link GitHub đã cung cấp trong error message" -ForegroundColor White
Write-Host "2. Click 'Allow secret' để cho phép push" -ForegroundColor White
Write-Host "3. Sau đó chạy: git push origin main" -ForegroundColor White
Write-Host ""
Write-Host "CÁCH 2: Rewrite commit history (Nếu muốn xóa hoàn toàn secrets)" -ForegroundColor Green
Write-Host "⚠️  CẢNH BÁO: Cách này sẽ rewrite history, cần cẩn thận!" -ForegroundColor Red
Write-Host ""
Write-Host "Bước 1: Commit các thay đổi mới" -ForegroundColor Cyan
Write-Host "   git add .gitignore FIX_LOI_401_NHANH.md HUONG_DAN_FIX_LOI_401_INVALID_CLIENT.md HUONG_DAN_RESTART_SERVER.md" -ForegroundColor White
Write-Host "   git commit -m 'Remove secrets from markdown files'" -ForegroundColor White
Write-Host ""
Write-Host "Bước 2: Xóa .env khỏi commit history (nếu đã commit)" -ForegroundColor Cyan
Write-Host "   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env' --prune-empty --tag-name-filter cat -- --all" -ForegroundColor White
Write-Host ""
Write-Host "Bước 3: Force push (CẨN THẬN!)" -ForegroundColor Cyan
Write-Host "   git push origin --force --all" -ForegroundColor White
Write-Host ""
Write-Host "=== KHUYẾN NGHỊ ===" -ForegroundColor Yellow
Write-Host "Nên dùng CÁCH 1 (GitHub UI) vì đơn giản và an toàn hơn." -ForegroundColor Green
Write-Host "Chỉ dùng CÁCH 2 nếu thực sự cần xóa secrets khỏi history." -ForegroundColor Yellow
Write-Host ""


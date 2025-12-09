# Script đơn giản để đồng bộ author cho commit có email giekiethcb@gmail.com
# Chạy script này: .\sync-commits-author-simple.ps1

Write-Host "=== ĐỒNG BỘ AUTHOR CHO COMMIT CŨ ===" -ForegroundColor Yellow
Write-Host ""

Write-Host "Các author hiện tại trong repo:" -ForegroundColor Cyan
git log --format="%an <%ae>" | Select-Object -Unique | ForEach-Object { Write-Host "  - $_" -ForegroundColor White }

Write-Host ""
Write-Host "Script sẽ sửa:" -ForegroundColor Cyan
Write-Host "  'giekiwt <giekiethcb@gmail.com>' → 'Vo Pham Gia Kiet <giakiethcb@gmail.com>'" -ForegroundColor Yellow
Write-Host ""

Write-Host "⚠️  CẢNH BÁO:" -ForegroundColor Red
Write-Host "- Script này sẽ REWRITE commit history" -ForegroundColor Yellow
Write-Host "- Cần FORCE PUSH sau khi chạy" -ForegroundColor Yellow
Write-Host "- Chỉ chạy nếu bạn chắc chắn!" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Bạn có chắc chắn muốn tiếp tục? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "Đã hủy!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Đang rewrite commit history..." -ForegroundColor Cyan
Write-Host "(Quá trình này có thể mất vài phút)" -ForegroundColor Yellow

# Sử dụng git filter-branch để thay đổi author
git filter-branch -f --env-filter '
if [ "$GIT_COMMITTER_EMAIL" = "giekiethcb@gmail.com" ]; then
    export GIT_COMMITTER_NAME="Vo Pham Gia Kiet"
    export GIT_COMMITTER_EMAIL="giakiethcb@gmail.com"
fi
if [ "$GIT_AUTHOR_EMAIL" = "giekiethcb@gmail.com" ]; then
    export GIT_AUTHOR_NAME="Vo Pham Gia Kiet"
    export GIT_AUTHOR_EMAIL="giakiethcb@gmail.com"
fi
' --tag-name-filter cat -- --branches --tags

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Đã rewrite commit history thành công!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Kiểm tra kết quả:" -ForegroundColor Cyan
    git log --format="%h - %an <%ae>, %ar : %s" -10
    
    Write-Host ""
    Write-Host "=== BƯỚC TIẾP THEO ===" -ForegroundColor Yellow
    Write-Host "Bạn cần FORCE PUSH để áp dụng thay đổi:" -ForegroundColor Cyan
    Write-Host "  git push origin --force --all" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  LƯU Ý QUAN TRỌNG:" -ForegroundColor Red
    Write-Host "1. Force push sẽ GHI ĐÈ lên remote repository" -ForegroundColor Yellow
    Write-Host "2. Nếu có người khác đang làm việc, họ cần pull lại" -ForegroundColor Yellow
    Write-Host "3. Đảm bảo đã backup trước khi force push!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Nếu chắc chắn, chạy:" -ForegroundColor Cyan
    Write-Host "  git push origin --force --all" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "✗ Có lỗi xảy ra!" -ForegroundColor Red
    Write-Host "Kiểm tra lại và thử lại." -ForegroundColor Yellow
}


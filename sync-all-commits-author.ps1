# Script để đồng bộ author cho TẤT CẢ commit (cả cũ và mới)
# Chạy script này: .\sync-all-commits-author.ps1

Write-Host "=== ĐỒNG BỘ AUTHOR CHO TẤT CẢ COMMIT ===" -ForegroundColor Yellow
Write-Host ""

Write-Host "Author mới sẽ là:" -ForegroundColor Cyan
Write-Host "  Name: Vo Pham Gia Kiet" -ForegroundColor White
Write-Host "  Email: giakiethcb@gmail.com" -ForegroundColor White

Write-Host ""
Write-Host "⚠️  CẢNH BÁO:" -ForegroundColor Red
Write-Host "- Script này sẽ REWRITE toàn bộ commit history" -ForegroundColor Yellow
Write-Host "- Cần FORCE PUSH sau khi chạy" -ForegroundColor Yellow
Write-Host "- Chỉ chạy nếu bạn chắc chắn và đã backup!" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Bạn có chắc chắn muốn tiếp tục? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "Đã hủy!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Đang kiểm tra số lượng commit..." -ForegroundColor Cyan
$commitCount = (git rev-list --count HEAD)
Write-Host "Tổng số commit: $commitCount" -ForegroundColor White

Write-Host ""
Write-Host "Đang rewrite commit history..." -ForegroundColor Cyan
Write-Host "(Quá trình này có thể mất vài phút)" -ForegroundColor Yellow

# Sử dụng git filter-branch để thay đổi author cho tất cả commit
git filter-branch -f --env-filter "
if [ `"`$GIT_COMMITTER_EMAIL`" = `"giekiethcb@gmail.com`" ]; then
    export GIT_COMMITTER_NAME=`"Vo Pham Gia Kiet`"
    export GIT_COMMITTER_EMAIL=`"giakiethcb@gmail.com`"
fi
if [ `"`$GIT_AUTHOR_EMAIL`" = `"giekiethcb@gmail.com`" ]; then
    export GIT_AUTHOR_NAME=`"Vo Pham Gia Kiet`"
    export GIT_AUTHOR_EMAIL=`"giakiethcb@gmail.com`"
fi
" --tag-name-filter cat -- --branches --tags

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Đã rewrite commit history thành công!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Kiểm tra kết quả:" -ForegroundColor Cyan
    git log --format="%h - %an <%ae>, %ar : %s" -5
    
    Write-Host ""
    Write-Host "=== BƯỚC TIẾP THEO ===" -ForegroundColor Yellow
    Write-Host "Bạn cần FORCE PUSH để áp dụng thay đổi:" -ForegroundColor Cyan
    Write-Host "  git push origin --force --all" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  LƯU Ý: Force push sẽ ghi đè lên remote!" -ForegroundColor Red
    Write-Host "Chỉ làm nếu bạn chắc chắn và đã backup!" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "✗ Có lỗi xảy ra!" -ForegroundColor Red
    Write-Host "Kiểm tra lại và thử lại." -ForegroundColor Yellow
}


# Script để thống nhất Git author
# Chạy script này: .\fix-git-author.ps1

Write-Host "=== FIX GIT AUTHOR ===" -ForegroundColor Yellow
Write-Host ""

Write-Host "Git config hiện tại:" -ForegroundColor Cyan
Write-Host "  Name: $(git config user.name)" -ForegroundColor White
Write-Host "  Email: $(git config user.email)" -ForegroundColor White

Write-Host ""
Write-Host "=== THỐNG NHẤT AUTHOR ===" -ForegroundColor Yellow
Write-Host ""
Write-Host "Bạn muốn dùng:" -ForegroundColor Cyan
Write-Host "1. 'giekiwt <giekiethcb@gmail.com>' (hiện tại)" -ForegroundColor White
Write-Host "2. 'Vo Pham Gia Kiet <giakiethcb@gmail.com>' (cũ)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Chọn (1 hoặc 2)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "Đang cấu hình..." -ForegroundColor Cyan
    git config user.name "giekiwt"
    git config user.email "giekiethcb@gmail.com"
    Write-Host "✓ Đã cấu hình: giekiwt <giekiethcb@gmail.com>" -ForegroundColor Green
} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "Đang cấu hình..." -ForegroundColor Cyan
    git config user.name "Vo Pham Gia Kiet"
    git config user.email "giakiethcb@gmail.com"
    Write-Host "✓ Đã cấu hình: Vo Pham Gia Kiet <giakiethcb@gmail.com>" -ForegroundColor Green
} else {
    Write-Host "Lựa chọn không hợp lệ!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "=== LƯU Ý ===" -ForegroundColor Yellow
Write-Host "Các commit mới sẽ dùng author mới này." -ForegroundColor White
Write-Host "Các commit cũ vẫn giữ nguyên author cũ." -ForegroundColor White
Write-Host ""
Write-Host "Nếu muốn thay đổi author cho các commit cũ:" -ForegroundColor Cyan
Write-Host "  git rebase -i HEAD~10" -ForegroundColor White
Write-Host "  (Thay 'pick' thành 'edit' cho commit muốn sửa)" -ForegroundColor White
Write-Host "  git commit --amend --author='Name <email>' --no-edit" -ForegroundColor White
Write-Host "  git rebase --continue" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  CẢNH BÁO: Sửa author commit cũ cần force push!" -ForegroundColor Red
Write-Host ""


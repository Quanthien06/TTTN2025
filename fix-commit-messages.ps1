# Script để sửa commit messages nếu cần
# Chạy script này: .\fix-commit-messages.ps1

Write-Host "=== FIX COMMIT MESSAGES ===" -ForegroundColor Yellow
Write-Host ""

Write-Host "Commit history hiện tại:" -ForegroundColor Cyan
git log --oneline -5

Write-Host ""
Write-Host "=== CÁCH SỬA COMMIT MESSAGE ===" -ForegroundColor Yellow
Write-Host ""
Write-Host "Nếu muốn sửa commit message gần nhất:" -ForegroundColor Cyan
Write-Host "   git commit --amend -m 'Login | Register by Gmail'" -ForegroundColor White
Write-Host ""
Write-Host "Nếu muốn sửa commit message cũ hơn:" -ForegroundColor Cyan
Write-Host "   git rebase -i HEAD~5" -ForegroundColor White
Write-Host "   (Thay 'pick' thành 'reword' cho commit muốn sửa)" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  LƯU Ý:" -ForegroundColor Red
Write-Host "- Chỉ sửa commit message nếu chưa push lên GitHub" -ForegroundColor Yellow
Write-Host "- Nếu đã push, cần force push: git push --force origin main" -ForegroundColor Yellow
Write-Host "- Force push có thể ảnh hưởng đến người khác đang làm việc trên cùng branch" -ForegroundColor Yellow
Write-Host ""
Write-Host "=== KHUYẾN NGHỊ ===" -ForegroundColor Green
Write-Host "Nếu commit đã push lên GitHub và không có vấn đề nghiêm trọng," -ForegroundColor White
Write-Host "tốt nhất là để nguyên và commit message tốt hơn cho các commit tiếp theo." -ForegroundColor White
Write-Host ""



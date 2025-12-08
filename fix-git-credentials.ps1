# Script xóa Git credentials cũ và đăng nhập lại
# Chạy: .\fix-git-credentials.ps1

Write-Host "=== XÓA GIT CREDENTIALS CŨ ===" -ForegroundColor Cyan
Write-Host ""

# Xóa credentials từ Windows Credential Manager
Write-Host "Đang xóa credentials cũ của huybu29..." -ForegroundColor Yellow

# Xóa credentials cho GitHub
cmdkey /list | Select-String "git:https://github.com" | ForEach-Object {
    if ($_ -match "Target: (.*)") {
        $target = $matches[1]
        Write-Host "Xóa: $target" -ForegroundColor Yellow
        cmdkey /delete:$target 2>$null
    }
}

# Xóa tất cả credentials liên quan đến github.com
$credentialList = cmdkey /list 2>$null | Select-String "github"
if ($credentialList) {
    Write-Host "Tìm thấy credentials GitHub, đang xóa..." -ForegroundColor Yellow
    cmdkey /list | ForEach-Object {
        if ($_ -match "Target: (.*github.*)") {
            $target = $matches[1]
            Write-Host "Xóa: $target" -ForegroundColor Yellow
            cmdkey /delete:$target 2>$null
        }
    }
}

# Xóa credentials từ Git Credential Manager (nếu có)
Write-Host ""
Write-Host "Đang xóa credentials từ Git Credential Manager..." -ForegroundColor Yellow
git credential-manager-core erase https://github.com 2>$null
git credential erase https://github.com 2>$null

Write-Host ""
Write-Host "✓ Đã xóa credentials cũ!" -ForegroundColor Green
Write-Host ""

# Kiểm tra Git config
Write-Host "=== KIỂM TRA GIT CONFIG ===" -ForegroundColor Cyan
Write-Host "Username: $(git config --global user.name)" -ForegroundColor White
Write-Host "Email: $(git config --global user.email)" -ForegroundColor White
Write-Host ""

# Huong dan dang nhap lai
Write-Host "=== DANG NHAP LAI ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ban co 2 cach:" -ForegroundColor Yellow
Write-Host ""
Write-Host "CACH 1: Push va nhap credentials moi" -ForegroundColor Cyan
Write-Host "  git push origin main" -ForegroundColor White
Write-Host "  Username: giekiwt" -ForegroundColor White
Write-Host "  Password: [Personal Access Token cua giekiwt]" -ForegroundColor White
Write-Host ""
Write-Host "CACH 2: Dung token trong URL (khong can nhap lai)" -ForegroundColor Cyan
Write-Host "  git remote set-url origin https://YOUR_TOKEN@github.com/Quanthien06/TTTN2025.git" -ForegroundColor White
Write-Host ""
Write-Host "Luu y: Can Personal Access Token cua tai khoan giekiwt" -ForegroundColor Yellow
Write-Host "Tao token tai: https://github.com/settings/tokens" -ForegroundColor Yellow
Write-Host ""


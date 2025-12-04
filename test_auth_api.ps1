# Script Test Auth API - PowerShell
# Sử dụng script này để test các Auth API mới

$BASE_URL = "http://localhost:5000"

Write-Host "=== TEST AUTH API ===" -ForegroundColor Green
Write-Host ""

# Bước 1: Đăng nhập để lấy token
Write-Host "1. Đăng nhập để lấy token..." -ForegroundColor Yellow
$loginBody = @{
    username = "admin"  # Thay bằng username của bạn
    password = "password123"  # Thay bằng password của bạn
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/api/login" -Method POST -Body $loginBody -ContentType "application/json"
    $TOKEN = $loginResponse.token
    Write-Host "✓ Đăng nhập thành công!" -ForegroundColor Green
    Write-Host "Token: $($TOKEN.Substring(0, 30))..." -ForegroundColor Cyan
} catch {
    Write-Host "✗ Lỗi đăng nhập: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

Write-Host ""

# Bước 2: Test GET /api/me
Write-Host "2. Test GET /api/me..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $TOKEN"
}

try {
    $meResponse = Invoke-RestMethod -Uri "$BASE_URL/api/me" -Method GET -Headers $headers
    Write-Host "✓ Lấy thông tin user thành công!" -ForegroundColor Green
    Write-Host "User: $($meResponse.user.username) - Role: $($meResponse.user.role)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Bước 3: Test PUT /api/profile
Write-Host "3. Test PUT /api/profile..." -ForegroundColor Yellow
$profileBody = @{
    username = "admin_updated"  # Thay bằng username mới
} | ConvertTo-Json

$profileHeaders = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

try {
    $profileResponse = Invoke-RestMethod -Uri "$BASE_URL/api/profile" -Method PUT -Headers $profileHeaders -Body $profileBody
    Write-Host "✓ Cập nhật profile thành công!" -ForegroundColor Green
    Write-Host "Username mới: $($profileResponse.user.username)" -ForegroundColor Cyan
    
    # Đổi lại username cũ để test tiếp
    $restoreBody = @{
        username = "admin"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$BASE_URL/api/profile" -Method PUT -Headers $profileHeaders -Body $restoreBody | Out-Null
    Write-Host "  (Đã khôi phục username cũ)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Bước 4: Test PUT /api/change-password
Write-Host "4. Test PUT /api/change-password..." -ForegroundColor Yellow
Write-Host "  (Skipping - cần biết password hiện tại)" -ForegroundColor Gray
# Uncomment để test:
# $passwordBody = @{
#     currentPassword = "old_password"
#     newPassword = "new_password123"
# } | ConvertTo-Json
#
# try {
#     $passwordResponse = Invoke-RestMethod -Uri "$BASE_URL/api/change-password" -Method PUT -Headers $profileHeaders -Body $passwordBody
#     Write-Host "✓ Đổi mật khẩu thành công!" -ForegroundColor Green
# } catch {
#     Write-Host "✗ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
# }

Write-Host ""

Write-Host "=== HOÀN THÀNH ===" -ForegroundColor Green


# Script Test Payment Demo Accounts API - PowerShell

$BASE_URL = "http://localhost:5000"

Write-Host "=== TEST PAYMENT DEMO ACCOUNTS API ===" -ForegroundColor Green
Write-Host ""

# Test 1: Kiểm tra tài khoản Vietcombank hợp lệ
Write-Host "1. Test Check Account - Vietcombank (Valid)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/payment/check-account?bank=vietcombank&account_number=9704151234567890" -Method GET
    if ($response.success) {
        Write-Host "✓ Tài khoản hợp lệ!" -ForegroundColor Green
        Write-Host "  - Chủ tài khoản: $($response.account.account_name)" -ForegroundColor Cyan
        Write-Host "  - Số dư: $([math]::Round($response.account.balance, 2)) VNĐ" -ForegroundColor Cyan
    } else {
        Write-Host "✗ Không tìm thấy tài khoản" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Kiểm tra tài khoản Techcombank hợp lệ
Write-Host "2. Test Check Account - Techcombank (Valid)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/payment/check-account?bank=techcombank&account_number=9704071234567890" -Method GET
    if ($response.success) {
        Write-Host "✓ Tài khoản hợp lệ!" -ForegroundColor Green
        Write-Host "  - Chủ tài khoản: $($response.account.account_name)" -ForegroundColor Cyan
        Write-Host "  - Số dư: $([math]::Round($response.account.balance, 2)) VNĐ" -ForegroundColor Cyan
    } else {
        Write-Host "✗ Không tìm thấy tài khoản" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Kiểm tra tài khoản ACB hợp lệ
Write-Host "3. Test Check Account - ACB (Valid)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/payment/check-account?bank=acb`&account_number=9704155555555555" -Method GET
    if ($response.success) {
        Write-Host "✓ Tài khoản hợp lệ!" -ForegroundColor Green
        Write-Host "  - Chủ tài khoản: $($response.account.account_name)" -ForegroundColor Cyan
        Write-Host "  - Số dư: $([math]::Round($response.account.balance, 2)) VNĐ" -ForegroundColor Cyan
    } else {
        Write-Host "✗ Không tìm thấy tài khoản" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Kiểm tra tài khoản không tồn tại
Write-Host "4. Test Check Account - Invalid Account..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/payment/check-account?bank=vietcombank&account_number=9999999999999999" -Method GET
    if ($response.success) {
        Write-Host "✗ Lỗi: Tài khoản không hợp lệ nhưng API trả về success" -ForegroundColor Red
    } else {
        Write-Host "✓ Đúng: Tài khoản không tồn tại" -ForegroundColor Green
        Write-Host "  - Message: $($response.message)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "✗ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: Kiểm tra thiếu tham số
Write-Host "5. Test Check Account - Missing Parameters..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/payment/check-account?bank=vietcombank" -Method GET -ErrorAction Stop
    Write-Host "✗ Lỗi: API không validate thiếu tham số" -ForegroundColor Red
} catch {
    try {
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        if ($errorResponse.message) {
            Write-Host "✓ Đúng: API validate thiếu tham số" -ForegroundColor Green
            Write-Host "  - Message: $($errorResponse.message)" -ForegroundColor Cyan
        } else {
            Write-Host "✓ Đúng: API trả về lỗi (status code khác 200)" -ForegroundColor Green
        }
    } catch {
        Write-Host "✓ Đúng: API trả về lỗi khi thiếu tham số" -ForegroundColor Green
    }
}

Write-Host ""

# Test 6: Test tất cả các ngân hàng
Write-Host "6. Test All Banks..." -ForegroundColor Yellow
$banks = @(
    @{bank='vietcombank'; account='9704151234567890'; name='NGUYEN VAN A'},
    @{bank='vietcombank'; account='9704159876543210'; name='TRAN THI B'},
    @{bank='techcombank'; account='9704071234567890'; name='LE VAN C'},
    @{bank='techcombank'; account='9704079876543210'; name='PHAM THI D'},
    @{bank='acb'; account='9704155555555555'; name='HOANG VAN E'},
    @{bank='acb'; account='9704156666666666'; name='VU THI F'},
    @{bank='bidv'; account='9704157777777777'; name='DAO VAN G'},
    @{bank='vietinbank'; account='9704158888888888'; name='BUI THI H'},
    @{bank='agribank'; account='9704159999999999'; name='DANG VAN I'},
    @{bank='sacombank'; account='9704151111111111'; name='NGUYEN THI K'},
    @{bank='mbbank'; account='9704152222222222'; name='TRAN VAN L'}
)

$successCount = 0
$failCount = 0

foreach ($bankInfo in $banks) {
    try {
        $params = @{
            bank = $bankInfo.bank
            account_number = $bankInfo.account
        }
        $uri = "$BASE_URL/api/payment/check-account"
        $response = Invoke-RestMethod -Uri $uri -Method GET -Body $params
        if ($response.success -and $response.account.account_name -eq $bankInfo.name) {
            $successCount++
            Write-Host "  ✓ $($bankInfo.bank) - $($bankInfo.account): $($bankInfo.name)" -ForegroundColor Green
        } else {
            $failCount++
            Write-Host "  ✗ $($bankInfo.bank) - $($bankInfo.account): Không khớp" -ForegroundColor Red
        }
    } catch {
        $failCount++
        Write-Host "  ✗ $($bankInfo.bank) - $($bankInfo.account): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Kết quả: $successCount thành công, $failCount thất bại" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Yellow" })

Write-Host ""
Write-Host "=== TEST HOÀN TẤT ===" -ForegroundColor Green
Write-Host ""
Write-Host "Để test trên giao diện:" -ForegroundColor Cyan
Write-Host "1. Mở http://localhost:5000/checkout.html" -ForegroundColor White
Write-Host "2. Chọn phương thức 'Ngân hàng nội địa'" -ForegroundColor White
Write-Host "3. Chọn ngân hàng (ví dụ: Vietcombank)" -ForegroundColor White
Write-Host "4. Nhập số tài khoản: 9704151234567890" -ForegroundColor White
Write-Host "5. Kiem tra xem co hien thi 'Chu tai khoan: NGUYEN VAN A' khong" -ForegroundColor White


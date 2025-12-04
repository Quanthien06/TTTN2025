# Script Test Products Search & Filter API - PowerShell

$BASE_URL = "http://localhost:5000"

Write-Host "=== TEST PRODUCTS SEARCH & FILTER API ===" -ForegroundColor Green
Write-Host ""

# Test 1: Tìm kiếm
Write-Host "1. Test Search (q=keyword)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/products?q=laptop" -Method GET
    Write-Host "✓ Tìm thấy $($response.products.Count) sản phẩm" -ForegroundColor Green
} catch {
    Write-Host "✗ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Lọc theo category
Write-Host "2. Test Filter by Category..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/products?category=laptop" -Method GET
    Write-Host "✓ Tìm thấy $($response.products.Count) sản phẩm" -ForegroundColor Green
} catch {
    Write-Host "✗ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Lọc theo giá
Write-Host "3. Test Filter by Price..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/products?minPrice=1000000&maxPrice=5000000" -Method GET
    Write-Host "✓ Tìm thấy $($response.products.Count) sản phẩm" -ForegroundColor Green
} catch {
    Write-Host "✗ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Sắp xếp
Write-Host "4. Test Sort..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/products?sort=price&order=asc" -Method GET
    Write-Host "✓ Đã sắp xếp theo giá tăng dần" -ForegroundColor Green
    if ($response.products.Count -gt 0) {
        Write-Host "  Giá đầu tiên: $($response.products[0].price)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "✗ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: Phân trang
Write-Host "5. Test Pagination..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/products?page=1&limit=5" -Method GET
    Write-Host "✓ Phân trang thành công" -ForegroundColor Green
    Write-Host "  Page: $($response.pagination.page)" -ForegroundColor Cyan
    Write-Host "  Limit: $($response.pagination.limit)" -ForegroundColor Cyan
    Write-Host "  Total: $($response.pagination.total)" -ForegroundColor Cyan
    Write-Host "  Total Pages: $($response.pagination.totalPages)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 6: Kết hợp tất cả
Write-Host "6. Test Kết hợp tất cả..." -ForegroundColor Yellow
try {
    $url = "$BASE_URL/api/products?q=laptop&category=laptop&minPrice=1000000&maxPrice=50000000&sort=price&order=asc&page=1&limit=10"
    $response = Invoke-RestMethod -Uri $url -Method GET
    Write-Host "✓ Kết hợp thành công!" -ForegroundColor Green
    Write-Host "  Tìm thấy: $($response.products.Count) sản phẩm" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

Write-Host "=== HOÀN THÀNH ===" -ForegroundColor Green


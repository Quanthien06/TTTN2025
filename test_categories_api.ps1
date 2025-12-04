# Script Test Categories API - PowerShell

$BASE_URL = "http://localhost:5000"

# Đăng nhập để lấy token (admin)
Write-Host "=== Đăng nhập để lấy Admin Token ===" -ForegroundColor Yellow
$loginBody = @{
    username = "admin"  # Thay bằng username admin của bạn
    password = "password123"  # Thay bằng password của bạn
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/api/login" -Method POST -Body $loginBody -ContentType "application/json"
    $ADMIN_TOKEN = $loginResponse.token
    Write-Host "✓ Đăng nhập thành công!" -ForegroundColor Green
} catch {
    Write-Host "✗ Lỗi đăng nhập: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

Write-Host ""

$headers = @{
    "Authorization" = "Bearer $ADMIN_TOKEN"
    "Content-Type" = "application/json"
}

Write-Host "=== TEST CATEGORIES API ===" -ForegroundColor Green
Write-Host ""

# Test 1: GET /api/categories
Write-Host "1. Test GET /api/categories..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/categories" -Method GET
    Write-Host "✓ Lấy danh sách categories thành công!" -ForegroundColor Green
    Write-Host "  Số lượng: $($response.categories.Count)" -ForegroundColor Cyan
    $CATEGORY_ID = $response.categories[0].id  # Lưu ID để test tiếp
} catch {
    Write-Host "✗ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: POST /api/categories (Tạo mới)
Write-Host "2. Test POST /api/categories (Tạo mới)..." -ForegroundColor Yellow
$newCategoryBody = @{
    name = "Test Category"
    slug = "test-category"
    description = "Đây là category test"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/categories" -Method POST -Headers $headers -Body $newCategoryBody
    Write-Host "✓ Tạo category thành công!" -ForegroundColor Green
    $NEW_CATEGORY_ID = $response.category.id
    Write-Host "  ID: $NEW_CATEGORY_ID" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
    # Nếu category đã tồn tại, lấy ID từ GET
    if ($CATEGORY_ID) {
        $NEW_CATEGORY_ID = $CATEGORY_ID
    }
}

Write-Host ""

# Test 3: GET /api/categories/:id
if ($NEW_CATEGORY_ID) {
    Write-Host "3. Test GET /api/categories/$NEW_CATEGORY_ID..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/api/categories/$NEW_CATEGORY_ID" -Method GET
        Write-Host "✓ Lấy chi tiết category thành công!" -ForegroundColor Green
        Write-Host "  Tên: $($response.category.name)" -ForegroundColor Cyan
        Write-Host "  Số sản phẩm: $($response.count)" -ForegroundColor Cyan
    } catch {
        Write-Host "✗ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Test 4: PUT /api/categories/:id
if ($NEW_CATEGORY_ID) {
    Write-Host "4. Test PUT /api/categories/$NEW_CATEGORY_ID..." -ForegroundColor Yellow
    $updateBody = @{
        name = "Test Category Updated"
        description = "Mô tả đã cập nhật"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/api/categories/$NEW_CATEGORY_ID" -Method PUT -Headers $headers -Body $updateBody
        Write-Host "✓ Cập nhật category thành công!" -ForegroundColor Green
        Write-Host "  Tên mới: $($response.category.name)" -ForegroundColor Cyan
    } catch {
        Write-Host "✗ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Test 5: DELETE /api/categories/:id (Chỉ xóa category test)
Write-Host "5. Test DELETE /api/categories (Chỉ xóa category test)..." -ForegroundColor Yellow
Write-Host "  (Skipping - để tránh xóa nhầm dữ liệu thật)" -ForegroundColor Gray
# Uncomment để test xóa:
# if ($NEW_CATEGORY_ID) {
#     try {
#         Invoke-RestMethod -Uri "$BASE_URL/api/categories/$NEW_CATEGORY_ID" -Method DELETE -Headers $headers
#         Write-Host "✓ Xóa category thành công!" -ForegroundColor Green
#     } catch {
#         Write-Host "✗ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
#     }
# }

Write-Host ""

Write-Host "=== HOÀN THÀNH ===" -ForegroundColor Green


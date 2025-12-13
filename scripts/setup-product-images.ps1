# scripts/setup-product-images.ps1
# Script PowerShell để tự động setup ảnh sản phẩm
# Chạy: .\scripts\setup-product-images.ps1

param(
    [string]$ProductName = "",
    [string]$SourceDir = "",
    [switch]$Batch = $false,
    [switch]$UpdateDB = $false
)

Write-Host "=== SETUP ẢNH SẢN PHẨM ===" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra Node.js và npm
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "✓ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js chưa được cài đặt!" -ForegroundColor Red
    Write-Host "  Vui lòng cài đặt Node.js từ https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Kiểm tra sharp đã được cài đặt chưa
Write-Host ""
Write-Host "Đang kiểm tra dependencies..." -ForegroundColor Yellow
$sharpInstalled = Test-Path "node_modules\sharp"
if (-not $sharpInstalled) {
    Write-Host "⚠️  Sharp chưa được cài đặt. Đang cài đặt..." -ForegroundColor Yellow
    npm install sharp
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Không thể cài đặt sharp!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Đã cài đặt sharp" -ForegroundColor Green
} else {
    Write-Host "✓ Sharp đã được cài đặt" -ForegroundColor Green
}

Write-Host ""

# Chế độ batch - xử lý nhiều sản phẩm
if ($Batch) {
    Write-Host "=== CHẾ ĐỘ BATCH ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Vui lòng chỉnh sửa file scripts/setup-product-images.js" -ForegroundColor Yellow
    Write-Host "để thêm danh sách sản phẩm vào array 'products'" -ForegroundColor Yellow
    Write-Host ""
    $confirm = Read-Host "Đã chỉnh sửa file chưa? (y/n)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "Đã hủy" -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host ""
    Write-Host "Đang chạy batch process..." -ForegroundColor Yellow
    node scripts/setup-product-images.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Batch process hoàn thành!" -ForegroundColor Green
        
        if ($UpdateDB) {
            Write-Host ""
            Write-Host "Đang cập nhật database..." -ForegroundColor Yellow
            node scripts/update-product-image-paths.js
        }
    } else {
        Write-Host ""
        Write-Host "✗ Batch process thất bại!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "=== HOÀN TẤT ===" -ForegroundColor Cyan
    exit 0
}

# Chế độ xử lý một sản phẩm
if ($ProductName -and $SourceDir) {
    Write-Host "=== XỬ LÝ MỘT SẢN PHẨM ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Tên sản phẩm: $ProductName" -ForegroundColor White
    Write-Host "Folder ảnh: $SourceDir" -ForegroundColor White
    Write-Host ""
    
    # Kiểm tra folder source có tồn tại không
    if (-not (Test-Path $SourceDir)) {
        Write-Host "✗ Folder không tồn tại: $SourceDir" -ForegroundColor Red
        exit 1
    }
    
    # Đếm số ảnh trong folder
    $imageFiles = Get-ChildItem -Path $SourceDir -Include *.jpg,*.jpeg,*.png,*.webp -Recurse
    $imageCount = $imageFiles.Count
    
    if ($imageCount -eq 0) {
        Write-Host "✗ Không tìm thấy ảnh trong folder: $SourceDir" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✓ Tìm thấy $imageCount ảnh" -ForegroundColor Green
    Write-Host ""
    Write-Host "Đang xử lý..." -ForegroundColor Yellow
    
    # Chạy script Node.js
    node scripts/setup-product-images.js "`"$ProductName`"" "`"$SourceDir`""
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Hoàn thành!" -ForegroundColor Green
        
        if ($UpdateDB) {
            Write-Host ""
            Write-Host "Đang cập nhật database..." -ForegroundColor Yellow
            node scripts/update-product-image-paths.js
        }
    } else {
        Write-Host ""
        Write-Host "✗ Xử lý thất bại!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "=== HOÀN TẤT ===" -ForegroundColor Cyan
    exit 0
}

# Chế độ interactive
Write-Host "=== CHẾ ĐỘ INTERACTIVE ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Chọn chế độ:" -ForegroundColor Yellow
Write-Host "1. Xử lý một sản phẩm" -ForegroundColor White
Write-Host "2. Xử lý nhiều sản phẩm (batch)" -ForegroundColor White
Write-Host "3. Chỉ cập nhật database" -ForegroundColor White
Write-Host "4. Thoát" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Nhập số (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        $productName = Read-Host "Nhập tên sản phẩm (ví dụ: iPhone 15 Pro Max 256GB)"
        $sourceDir = Read-Host "Nhập đường dẫn folder chứa ảnh (ví dụ: ./temp-images/iphone)"
        
        if (-not $productName -or -not $sourceDir) {
            Write-Host "✗ Tên sản phẩm và folder ảnh là bắt buộc!" -ForegroundColor Red
            exit 1
        }
        
        # Kiểm tra folder
        if (-not (Test-Path $sourceDir)) {
            Write-Host "✗ Folder không tồn tại: $sourceDir" -ForegroundColor Red
            exit 1
        }
        
        Write-Host ""
        Write-Host "Đang xử lý..." -ForegroundColor Yellow
        node scripts/setup-product-images.js "`"$productName`"" "`"$sourceDir`""
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✓ Hoàn thành!" -ForegroundColor Green
            
            $updateDB = Read-Host "Có muốn cập nhật database không? (y/n)"
            if ($updateDB -eq "y" -or $updateDB -eq "Y") {
                Write-Host ""
                Write-Host "Đang cập nhật database..." -ForegroundColor Yellow
                node scripts/update-product-image-paths.js
            }
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "Vui lòng chỉnh sửa file scripts/setup-product-images.js" -ForegroundColor Yellow
        Write-Host "để thêm danh sách sản phẩm vào array 'products'" -ForegroundColor Yellow
        Write-Host ""
        $confirm = Read-Host "Đã chỉnh sửa file chưa? (y/n)"
        if ($confirm -ne "y" -and $confirm -ne "Y") {
            Write-Host "Đã hủy" -ForegroundColor Yellow
            exit 0
        }
        
        Write-Host ""
        Write-Host "Đang chạy batch process..." -ForegroundColor Yellow
        node scripts/setup-product-images.js
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✓ Batch process hoàn thành!" -ForegroundColor Green
            
            $updateDB = Read-Host "Có muốn cập nhật database không? (y/n)"
            if ($updateDB -eq "y" -or $updateDB -eq "Y") {
                Write-Host ""
                Write-Host "Đang cập nhật database..." -ForegroundColor Yellow
                node scripts/update-product-image-paths.js
            }
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "Đang cập nhật database..." -ForegroundColor Yellow
        node scripts/update-product-image-paths.js
    }
    
    "4" {
        Write-Host "Đã thoát" -ForegroundColor Yellow
        exit 0
    }
    
    default {
        Write-Host "✗ Lựa chọn không hợp lệ!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "=== HOÀN TẤT ===" -ForegroundColor Cyan


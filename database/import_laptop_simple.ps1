# Script PowerShell đơn giản để import CSV vào MySQL
# Yêu cầu: MySQL đã được cài đặt và có thể chạy mysql command

param(
    [string]$Host = "localhost",
    [string]$User = "root",
    [string]$Password = "",
    [string]$Database = "tttn2025",
    [string]$CsvFile = "database\laptop.csv"
)

Write-Host "=== IMPORT LAPTOP DATA ===" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra file CSV
if (-not (Test-Path $CsvFile)) {
    Write-Host "Lỗi: Không tìm thấy file $CsvFile" -ForegroundColor Red
    exit 1
}

Write-Host "File CSV: $CsvFile" -ForegroundColor Green
Write-Host "Database: $Database" -ForegroundColor Green
Write-Host ""

# Đọc CSV
Write-Host "Đang đọc file CSV..." -ForegroundColor Yellow
$csvData = Import-Csv $CsvFile

Write-Host "Tìm thấy $($csvData.Count) sản phẩm" -ForegroundColor Green
Write-Host ""

# Tạo file SQL tạm
$sqlFile = "database\import_temp.sql"
$sqlContent = @"
USE `$Database`;

-- Xóa dữ liệu cũ
DELETE FROM products WHERE category LIKE 'Laptop%';

-- Import dữ liệu
"@

$count = 0
foreach ($row in $csvData) {
    $count++
    
    # Xử lý dữ liệu
    $name = $row.model_name -replace "'", "''"
    $brand = $row.brand -replace "'", "''"
    $processor = $row.processor_name -replace "'", "''"
    $os = $row.'Operating System' -replace "'", "''"
    $graphics = $row.graphics -replace "'", "''"
    $resolution = $row.'resolution (pixels)' -replace "'", "''"
    
    # Xác định category
    $category = "Laptop"
    $nameLower = $name.ToLower()
    if ($nameLower -match "gaming|tuf|victus") {
        $category = "Laptop Gaming"
    } elseif ($brand -eq "Lenovo") {
        $category = "Laptop Lenovo"
    } elseif ($brand -eq "HP") {
        $category = "Laptop HP"
    } elseif ($brand -eq "Dell") {
        $category = "Dell"
    } elseif ($brand -eq "Asus") {
        $category = "Laptop Asus"
    } elseif ($brand -eq "Apple") {
        $category = "Laptop Apple"
    }
    
    # Tạo description
    $descParts = @()
    if ($processor) { $descParts += "CPU: $processor" }
    if ($row.'ram(GB)') { $descParts += "RAM: $($row.'ram(GB)')GB" }
    if ($row.'ssd(GB)') { $descParts += "SSD: $($row.'ssd(GB)')GB" }
    if ($row.'Hard Disk(GB)' -and $row.'Hard Disk(GB)' -ne "0") {
        $descParts += "HDD: $($row.'Hard Disk(GB)')GB"
    }
    if ($graphics -and $graphics -ne "Missing") {
        $descParts += "Card đồ họa: $graphics"
    }
    if ($row.'screen_size(inches)') {
        $descParts += "Màn hình: $($row.'screen_size(inches)')`" $resolution"
    }
    if ($os) { $descParts += "Hệ điều hành: $os" }
    
    $description = $descParts -join " | "
    if (-not $description) { $description = "Laptop chất lượng cao" }
    $description = $description -replace "'", "''"
    
    # Giá trị
    $ram = if ($row.'ram(GB)') { [int]$row.'ram(GB)' } else { "NULL" }
    $ssd = if ($row.'ssd(GB)') { [int]$row.'ssd(GB)' } else { "NULL" }
    $hdd = if ($row.'Hard Disk(GB)' -and $row.'Hard Disk(GB)' -ne "0") { [int]$row.'Hard Disk(GB)' } else { "NULL" }
    $screenSize = if ($row.'screen_size(inches)') { [decimal]$row.'screen_size(inches)' } else { "NULL" }
    $cores = if ($row.no_of_cores) { [int]$row.no_of_cores } else { "NULL" }
    $threads = if ($row.no_of_threads) { [int]$row.no_of_threads } else { "NULL" }
    $score = if ($row.spec_score) { [int]$row.spec_score } else { "NULL" }
    $price = if ($row.price) { [decimal]$row.price } else { "NULL" }
    
    # Tính original_price (giảm giá 10%)
    $originalPrice = if ($price -ne "NULL") { [math]::Round($price * 1.1, 2) } else { "NULL" }
    
    # Stock random
    $stock = Get-Random -Minimum 5 -Maximum 26
    
    # Image URL
    $imageUrl = "https://via.placeholder.com/400x400?text=$([System.Web.HttpUtility]::UrlEncode("$brand $($name.Substring(0, [Math]::Min(20, $name.Length)))"))"
    
    # Tạo SQL INSERT
    $sqlContent += @"
INSERT INTO products (
    name, brand, category, processor_name, ram_gb, ssd_gb, hard_disk_gb,
    operating_system, graphics, screen_size_inches, resolution,
    no_of_cores, no_of_threads, spec_score, price, original_price,
    description, image_url, stock
) VALUES (
    '$name', '$brand', '$category', 
    $(if ($processor) { "'$processor'" } else { "NULL" }),
    $ram, $ssd, $hdd,
    $(if ($os) { "'$os'" } else { "NULL" }),
    $(if ($graphics -and $graphics -ne "Missing") { "'$graphics'" } else { "NULL" }),
    $screenSize,
    $(if ($resolution) { "'$resolution'" } else { "NULL" }),
    $cores, $threads, $score,
    $price, $originalPrice,
    '$description', '$imageUrl', $stock
);

"@
    
    if ($count % 100 -eq 0) {
        Write-Host "Đã xử lý $count/$($csvData.Count) sản phẩm..." -ForegroundColor Yellow
    }
}

# Ghi file SQL
$sqlContent | Out-File -FilePath $sqlFile -Encoding UTF8

Write-Host ""
Write-Host "Đã tạo file SQL: $sqlFile" -ForegroundColor Green
Write-Host ""

# Chạy MySQL
if ($Password) {
    $mysqlCmd = "mysql -h $Host -u $User -p$Password $Database < `"$sqlFile`""
} else {
    $mysqlCmd = "mysql -h $Host -u $User $Database < `"$sqlFile`""
}

Write-Host "Đang import vào database..." -ForegroundColor Yellow
Write-Host "Lệnh: $mysqlCmd" -ForegroundColor Gray
Write-Host ""

try {
    Invoke-Expression $mysqlCmd
    Write-Host ""
    Write-Host "=== THÀNH CÔNG ===" -ForegroundColor Green
    Write-Host "Đã import $count sản phẩm vào database!" -ForegroundColor Green
    
    # Xóa file tạm
    Remove-Item $sqlFile -ErrorAction SilentlyContinue
    Write-Host "Đã xóa file tạm" -ForegroundColor Gray
} catch {
    Write-Host ""
    Write-Host "=== LỖI ===" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "File SQL đã được lưu tại: $sqlFile" -ForegroundColor Yellow
    Write-Host "Bạn có thể chạy thủ công bằng lệnh:" -ForegroundColor Yellow
    Write-Host "mysql -u $User -p $Database < `"$sqlFile`"" -ForegroundColor Cyan
}


# Script khởi động Docker cho TTTN2025 Microservices
# Chạy: .\docker-start.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TTTN2025 Microservices - Docker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra Docker
Write-Host "Đang kiểm tra Docker..." -ForegroundColor Yellow

# Kiểm tra Docker command có tồn tại không
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker command failed"
    }
    Write-Host "✓ Docker: $dockerVersion" -ForegroundColor Green
    
    $composeVersion = docker-compose --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker Compose command failed"
    }
    Write-Host "✓ Docker Compose: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker chưa được cài đặt!" -ForegroundColor Red
    Write-Host "Vui lòng cài đặt Docker Desktop từ: https://www.docker.com/products/docker-desktop" -ForegroundColor Red
    exit 1
}

# Kiểm tra Docker Desktop có đang chạy không
Write-Host "Đang kiểm tra Docker Desktop..." -ForegroundColor Yellow
try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        # Kiểm tra xem có phải lỗi kết nối không
        if ($dockerInfo -match "error during connect" -or $dockerInfo -match "Cannot connect" -or $dockerInfo -match "dockerDesktopLinuxEngine") {
            Write-Host "✗ Docker Desktop chưa chạy!" -ForegroundColor Red
            Write-Host ""
            Write-Host "Các bước khắc phục:" -ForegroundColor Yellow
            Write-Host "1. Mở Docker Desktop từ Start Menu" -ForegroundColor White
            Write-Host "2. Đợi Docker Desktop khởi động hoàn toàn (biểu tượng Docker ở system tray)" -ForegroundColor White
            Write-Host "3. Chạy lại script này" -ForegroundColor White
            Write-Host ""
            
            # Kiểm tra xem Docker Desktop process có tồn tại không
            $dockerProcess = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
            if ($dockerProcess) {
                Write-Host "⚠ Docker Desktop process đã được tìm thấy nhưng chưa sẵn sàng." -ForegroundColor Yellow
                Write-Host "   Vui lòng đợi Docker Desktop khởi động hoàn toàn." -ForegroundColor Yellow
            } else {
                Write-Host "⚠ Docker Desktop không chạy. Đang thử khởi động..." -ForegroundColor Yellow
                $dockerDesktopPath = "${env:ProgramFiles}\Docker\Docker\Docker Desktop.exe"
                if (Test-Path $dockerDesktopPath) {
                    Write-Host "   Đang khởi động Docker Desktop..." -ForegroundColor Yellow
                    Start-Process $dockerDesktopPath
                    Write-Host "   Vui lòng đợi Docker Desktop khởi động (30-60 giây) và chạy lại script." -ForegroundColor Yellow
                } else {
                    Write-Host "   Không tìm thấy Docker Desktop. Vui lòng cài đặt từ:" -ForegroundColor Yellow
                    Write-Host "   https://www.docker.com/products/docker-desktop" -ForegroundColor Cyan
                }
            }
            exit 1
        } else {
            throw $dockerInfo
        }
    }
    Write-Host "✓ Docker Desktop đang chạy" -ForegroundColor Green
} catch {
    Write-Host "✗ Lỗi khi kiểm tra Docker: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Kiểm tra ports
Write-Host "Đang kiểm tra ports..." -ForegroundColor Yellow
$ports = @(5000, 5001, 5002, 5003, 5004, 5005, 3307)
$portInUse = @()

foreach ($port in $ports) {
    $result = netstat -ano | findstr ":$port"
    if ($result) {
        $portInUse += $port
        Write-Host "⚠ Port $port đang được sử dụng" -ForegroundColor Yellow
    } else {
        Write-Host "✓ Port $port sẵn sàng" -ForegroundColor Green
    }
}

if ($portInUse.Count -gt 0) {
    Write-Host ""
    Write-Host "Cảnh báo: Có ports đang được sử dụng!" -ForegroundColor Yellow
    Write-Host "Ports: $($portInUse -join ', ')" -ForegroundColor Yellow
    $continue = Read-Host "Tiếp tục? (y/n)"
    if ($continue -ne "y") {
        exit 0
    }
}

Write-Host ""

# Menu
Write-Host "Chọn hành động:" -ForegroundColor Cyan
Write-Host "1. Build và chạy tất cả services (lần đầu)" -ForegroundColor White
Write-Host "2. Chạy services đã build (background)" -ForegroundColor White
Write-Host "3. Chạy và xem logs (foreground)" -ForegroundColor White
Write-Host "4. Dừng tất cả services" -ForegroundColor White
Write-Host "5. Dừng và xóa containers" -ForegroundColor White
Write-Host "6. Xem logs" -ForegroundColor White
Write-Host "7. Xem trạng thái containers" -ForegroundColor White
Write-Host "8. Rebuild một service cụ thể" -ForegroundColor White
Write-Host "0. Thoát" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Nhập lựa chọn (0-8)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Đang build và chạy tất cả services..." -ForegroundColor Yellow
        docker-compose up --build
        if ($LASTEXITCODE -ne 0) {
            Write-Host ""
            Write-Host "✗ Lỗi khi build/khởi động services!" -ForegroundColor Red
            Write-Host "Kiểm tra Docker Desktop có đang chạy không." -ForegroundColor Yellow
        }
    }
    "2" {
        Write-Host ""
        Write-Host "Đang chạy services ở background..." -ForegroundColor Yellow
        docker-compose up -d
        if ($LASTEXITCODE -ne 0) {
            Write-Host ""
            Write-Host "✗ Lỗi khi khởi động services!" -ForegroundColor Red
            if ($LASTEXITCODE -eq 1) {
                Write-Host "Kiểm tra Docker Desktop có đang chạy không." -ForegroundColor Yellow
                Write-Host "Thử chạy: docker-compose ps" -ForegroundColor Gray
            }
            exit 1
        }
        Write-Host ""
        Write-Host "✓ Services đã khởi động!" -ForegroundColor Green
        Write-Host "Truy cập: http://localhost:5000" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Xem logs: docker-compose logs -f" -ForegroundColor Gray
        Write-Host "Xem trạng thái: docker-compose ps" -ForegroundColor Gray
    }
    "3" {
        Write-Host ""
        Write-Host "Đang chạy và hiển thị logs..." -ForegroundColor Yellow
        Write-Host "Nhấn Ctrl+C để dừng" -ForegroundColor Gray
        Write-Host ""
        docker-compose up
        if ($LASTEXITCODE -ne 0) {
            Write-Host ""
            Write-Host "✗ Lỗi khi khởi động services!" -ForegroundColor Red
        }
    }
    "4" {
        Write-Host ""
        Write-Host "Đang dừng tất cả services..." -ForegroundColor Yellow
        docker-compose stop
        Write-Host "✓ Đã dừng tất cả services" -ForegroundColor Green
    }
    "5" {
        Write-Host ""
        Write-Host "Đang dừng và xóa containers..." -ForegroundColor Yellow
        docker-compose down
        Write-Host "✓ Đã dừng và xóa containers" -ForegroundColor Green
    }
    "6" {
        Write-Host ""
        Write-Host "Chọn service để xem logs:" -ForegroundColor Cyan
        Write-Host "1. Tất cả" -ForegroundColor White
        Write-Host "2. Gateway" -ForegroundColor White
        Write-Host "3. Auth Service" -ForegroundColor White
        Write-Host "4. Product Service" -ForegroundColor White
        Write-Host "5. Cart Service" -ForegroundColor White
        Write-Host "6. Order Service" -ForegroundColor White
        Write-Host "7. News Service" -ForegroundColor White
        Write-Host "8. MySQL" -ForegroundColor White
        Write-Host ""
        $logChoice = Read-Host "Nhập lựa chọn (1-8)"
        
        $services = @{
            "1" = ""
            "2" = "gateway"
            "3" = "auth-service"
            "4" = "product-service"
            "5" = "cart-service"
            "6" = "order-service"
            "7" = "news-service"
            "8" = "mysql"
        }
        
        $service = $services[$logChoice]
        if ($service) {
            Write-Host ""
            Write-Host "Đang hiển thị logs (Ctrl+C để thoát)..." -ForegroundColor Yellow
            if ($service -eq "") {
                docker-compose logs -f
            } else {
                docker-compose logs -f $service
            }
        }
    }
    "7" {
        Write-Host ""
        Write-Host "Trạng thái containers:" -ForegroundColor Cyan
        docker-compose ps
    }
    "8" {
        Write-Host ""
        Write-Host "Chọn service để rebuild:" -ForegroundColor Cyan
        Write-Host "1. Gateway" -ForegroundColor White
        Write-Host "2. Auth Service" -ForegroundColor White
        Write-Host "3. Product Service" -ForegroundColor White
        Write-Host "4. Cart Service" -ForegroundColor White
        Write-Host "5. Order Service" -ForegroundColor White
        Write-Host "6. News Service" -ForegroundColor White
        Write-Host ""
        $rebuildChoice = Read-Host "Nhập lựa chọn (1-6)"
        
        $rebuildServices = @{
            "1" = "gateway"
            "2" = "auth-service"
            "3" = "product-service"
            "4" = "cart-service"
            "5" = "order-service"
            "6" = "news-service"
        }
        
        $service = $rebuildServices[$rebuildChoice]
        if ($service) {
            Write-Host ""
            Write-Host "Đang rebuild $service..." -ForegroundColor Yellow
            docker-compose build $service
            Write-Host ""
            Write-Host "Đang restart $service..." -ForegroundColor Yellow
            docker-compose up -d $service
            Write-Host "✓ Đã rebuild và restart $service" -ForegroundColor Green
        }
    }
    "0" {
        Write-Host "Thoát." -ForegroundColor Gray
        exit 0
    }
    default {
        Write-Host "Lựa chọn không hợp lệ!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Hoàn thành!" -ForegroundColor Green


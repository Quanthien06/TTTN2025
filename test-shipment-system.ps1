# Quick test script for Shipment Management System
# Usage: .\test-shipment-system.ps1 -AdminToken "YOUR_TOKEN"

param(
    [string]$AdminToken = "your-admin-token-here",
    [string]$ServerUrl = "http://localhost:3000",
    [int]$OrderId = 5
)

Write-Host "🧪 Testing Shipment Management System" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "Server: $ServerUrl" -ForegroundColor Gray
Write-Host "Admin Token: $($AdminToken.Substring(0, 20))..." -ForegroundColor Gray
Write-Host ""

# Test 1: Get list of shipments
Write-Host "📋 Test 1: GET /api/shipments/admin/list" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$ServerUrl/api/shipments/admin/list?page=1&limit=5" `
        -Headers @{ "Authorization" = "Bearer $AdminToken" } `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "  Found $($data.shipments.Count) shipments"
    if ($data.pagination) {
        Write-Host "  Pagination: Page $($data.pagination.currentPage) of $($data.pagination.totalPages)"
    }
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Get shipment list filtered by status
Write-Host "📋 Test 2: GET /api/shipments/admin/list?status=delivered" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$ServerUrl/api/shipments/admin/list?status=delivered" `
        -Headers @{ "Authorization" = "Bearer $AdminToken" } `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "  Found $($data.shipments.Count) delivered shipments"
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Get shipment for specific order
Write-Host "📋 Test 3: GET /api/shipments/$OrderId" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$ServerUrl/api/shipments/$OrderId" `
        -Headers @{ "Authorization" = "Bearer $AdminToken" } `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    if ($data.shipment) {
        Write-Host "  Shipment: $($data.shipment.tracking_number) ($($data.shipment.status))"
        Write-Host "  Events: $($data.events.Count) events"
    }
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Create shipment
Write-Host "📋 Test 4: POST /api/shipments (Create)" -ForegroundColor Yellow
$newShipment = @{
    order_id = $OrderId
    carrier_name = "GHN"
    tracking_number = "GHN_TEST_$(Get-Random -Minimum 1000 -Maximum 9999)"
    estimated_delivery_date = (Get-Date).AddDays(3).ToString("yyyy-MM-dd")
    shipping_cost = 25000
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$ServerUrl/api/shipments" `
        -Method POST `
        -Headers @{ "Authorization" = "Bearer $AdminToken" } `
        -ContentType "application/json" `
        -Body $newShipment `
        -ErrorAction Stop
    
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "  Created shipment ID: $($data.id)"
    Write-Host "  Tracking: $($data.tracking_number)"
    $shipmentId = $data.id
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: Update shipment status
if ($shipmentId) {
    Write-Host "📋 Test 5: PUT /api/shipments/:id/update-status" -ForegroundColor Yellow
    $updateStatus = @{
        status = "in_transit"
        event_label = "Đơn hàng đang được vận chuyển"
        location = "Quận 1, TP HCM"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -Uri "$ServerUrl/api/shipments/$shipmentId/update-status" `
            -Method PUT `
            -Headers @{ "Authorization" = "Bearer $AdminToken" } `
            -ContentType "application/json" `
            -Body $updateStatus `
            -ErrorAction Stop
        
        Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "  Updated to: $($data.status)"
        Write-Host "  Event: $($data.event_label)"
    } catch {
        Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 6: Test webhook
Write-Host "📋 Test 6: POST /api/shipments/webhook/ghn (Simulate Webhook)" -ForegroundColor Yellow
$webhookPayload = @{
    code = "GHN_WEBHOOK_TEST"
    status = "out_for_delivery"
    message = "Đơn hàng đang được giao"
    location = "Quận 1, TP HCM"
    timestamp = [int]([datetime]::UtcNow.Subtract([datetime]'1970-01-01')).TotalSeconds
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$ServerUrl/api/shipments/webhook/ghn" `
        -Method POST `
        -ContentType "application/json" `
        -Body $webhookPayload `
        -ErrorAction Stop
    
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "  Webhook processed"
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "✅ Tests completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Next steps:" -ForegroundColor Cyan
Write-Host "1. Check admin panel: http://localhost:3000/admin-shipments.html"
Write-Host "2. Check customer orders: http://localhost:3000/?page=orders"
Write-Host "3. Read docs: HUONG_DAN_QUAN_LY_VAN_CHUYEN.md"

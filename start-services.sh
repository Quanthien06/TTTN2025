#!/bin/bash

# Script để khởi động tất cả microservices (Bash)

echo "🚀 Khởi động các Microservices..."
echo ""

# Tạo function để chạy service trong background
start_service() {
    local name=$1
    local path=$2
    local port=$3
    
    echo "📦 Đang khởi động $name..."
    cd "$path" && npm start > /dev/null 2>&1 &
    sleep 2
}

# Khởi động các services
start_service "Auth Service" "services/auth-service" "5001"
start_service "Product Service" "services/product-service" "5002"
start_service "Cart Service" "services/cart-service" "5003"
start_service "Order Service" "services/order-service" "5004"
start_service "API Gateway" "gateway" "5000"

echo ""
echo "✅ Tất cả services đã được khởi động!"
echo ""
echo "Các services đang chạy tại:"
echo "  - API Gateway: http://localhost:5000"
echo "  - Auth Service: http://localhost:5001"
echo "  - Product Service: http://localhost:5002"
echo "  - Cart Service: http://localhost:5003"
echo "  - Order Service: http://localhost:5004"
echo ""
echo "Mở trình duyệt: http://localhost:5000"


/**
 * WEBHOOK INTEGRATION EXAMPLES
 * 
 * Các ví dụ về cách webhook từ các đơn vị vận chuyển gửi update tracking
 * 
 * Endpoint webhook: POST /api/shipments/webhook/:carrier
 * 
 * Hướng dẫn setup:
 * 1. Tạo tài khoản tại GHN/GHTK/Viettel API
 * 2. Lấy API key/token
 * 3. Thiết lập webhook URL trỏ về: http://yourdomain.com/api/shipments/webhook/ghn
 * 4. Mỗi khi tracking update, carrier sẽ POST dữ liệu tới endpoint này
 */

// ============================================
// 1. GHN (GIAO HÀNG NHANH) WEBHOOK
// ============================================
// Docs: https://api.ghn.vn

// Example webhook payload từ GHN:
const GHN_WEBHOOK_EXAMPLE = {
    "order_id": 12345,
    "order_number": "GHN12345678",
    "tracking_number": "GHN12345678",
    "status": "on_way", // or: ready_to_pick, picking, picked, at_sort_center, waylay, delivery_fail, delivered, cancel, returning, return_sorted, returned
    "message": "Đơn hàng đang được vận chuyển",
    "updated_at": "2025-12-17 10:30:00",
    "location": "Kho GHN - Hà Nội",
    "reason": null,
    "cod_amount": 0,
    "customer_name": "Nguyễn Văn A",
    "customer_phone": "0987654321",
    "address": "123 Đường ABC, Hà Nội"
};

// Ví dụ request từ browser/postman:
/*
POST http://localhost:5000/api/shipments/webhook/ghn
Content-Type: application/json

{
    "tracking_number": "GHN12345678",
    "status": "on_way",
    "message": "Đơn hàng đang được vận chuyển",
    "location": "Kho GHN - Hà Nội"
}
*/

// ============================================
// 2. GHTK (GIAO HÀNG TIẾT KIỆM) WEBHOOK
// ============================================
// Docs: https://api.ghtk.vn

// Example webhook payload từ GHTK:
const GHTK_WEBHOOK_EXAMPLE = {
    "tracking_number": "GHTK98765432",
    "status": 3, // 1: Pending, 2: Picked, 3: In Transit, 4: Out for Delivery, 5: Delivered, -1: Failed, -2: Returned
    "message": "Đơn hàng đang giao",
    "updated_at": "2025-12-17 10:30:00",
    "location": "Kho GHTK - TP.HCM"
};

// ============================================
// 3. VIETTEL POST WEBHOOK
// ============================================
// Docs: https://tracking.viettelpost.vn/api

// Example webhook payload từ Viettel:
const VIETTEL_WEBHOOK_EXAMPLE = {
    "tracking_number": "VT1234567890",
    "status": "Đang chuyên chở", // or: Đã tiếp nhận, Đang lấy hàng, Đã lấy hàng, Đang giao, Đã giao, Giao không thành
    "message": "Đơn hàng đang được vận chuyển",
    "updated_at": "2025-12-17 10:30:00",
    "location": "Bưu điện Quận 1, TP.HCM"
};

// ============================================
// NODE.JS IMPLEMENTATION EXAMPLE
// ============================================

/**
 * Thêm endpoint này vào routes/shipments.js hoặc tạo file riêng:
 */

const shipmentWebhookExample = `
// Sử dụng đã được implement trong routes/shipments.js
// POST /api/shipments/webhook/:carrier

// Cách test webhook bằng cURL:

// GHN:
curl -X POST http://localhost:5000/api/shipments/webhook/ghn \\
  -H "Content-Type: application/json" \\
  -d '{
    "tracking_number": "GHN12345678",
    "status": "on_way",
    "message": "Đơn hàng đang được vận chuyển",
    "location": "Kho GHN - Hà Nội"
  }'

// GHTK:
curl -X POST http://localhost:5000/api/shipments/webhook/ghtk \\
  -H "Content-Type: application/json" \\
  -d '{
    "tracking_number": "GHTK98765432",
    "status": "3",
    "message": "Đơn hàng đang giao",
    "location": "Kho GHTK - TP.HCM"
  }'

// Viettel:
curl -X POST http://localhost:5000/api/shipments/webhook/viettel \\
  -H "Content-Type: application/json" \\
  -d '{
    "tracking_number": "VT1234567890",
    "status": "Đang chuyên chở",
    "message": "Đơn hàng đang được vận chuyển",
    "location": "Bưu điện Quận 1, TP.HCM"
  }'
`;

// ============================================
// SETUP INSTRUCTIONS
// ============================================

const setupInstructions = `
## 1. GHN (Giao Hàng Nhanh)

**Bước 1: Tạo tài khoản GHN API**
- Truy cập: https://api.ghn.vn
- Đăng ký tài khoản doanh nghiệp
- Lấy API Token

**Bước 2: Cấu hình Webhook URL**
- Vào GHN Partner Portal
- Tìm phần "Webhooks" hoặc "Integrations"
- Thêm URL: https://yourdomain.com/api/shipments/webhook/ghn
- Chọn events: "Order Status Updated"
- Lưu lại

**Bước 3: Test Webhook**
- Tạo đơn hàng test trên GHN
- Webhook sẽ gửi POST request tới endpoint
- Server sẽ update status tự động

---

## 2. GHTK (Giao Hàng Tiết Kiệm)

**Bước 1: Tạo tài khoản GHTK API**
- Truy cập: https://api.ghtk.vn
- Đăng ký tài khoản
- Lấy Token & Secret

**Bước 2: Cấu hình Webhook**
- Tài khoản GHTK > Cài đặt > Webhook
- Webhook URL: https://yourdomain.com/api/shipments/webhook/ghtk
- Lưu lại

---

## 3. Viettel Post

**Bước 1: Đăng ký API**
- Liên hệ: https://tracking.viettelpost.vn/
- Lấy API Key

**Bước 2: Setup Webhook**
- Cấu hình webhook URL: https://yourdomain.com/api/shipments/webhook/viettel
- Viettel sẽ gửi update khi trạng thái thay đổi

---

## 4. Manual Testing

Nếu chưa có real webhook, bạn có thể test bằng:

**PowerShell (Windows):**
\`\`\`powershell
$body = @{
    tracking_number = "GHN12345678"
    status = "on_way"
    message = "Đơn hàng đang được vận chuyển"
    location = "Kho GHN - Hà Nội"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/shipments/webhook/ghn" \`
  -Method POST \`
  -ContentType "application/json" \`
  -Body $body
\`\`\`

**cURL (Linux/Mac):**
\`\`\`bash
curl -X POST http://localhost:5000/api/shipments/webhook/ghn \\
  -H "Content-Type: application/json" \\
  -d '{
    "tracking_number": "GHN12345678",
    "status": "on_way",
    "message": "Đơn hàng đang được vận chuyển",
    "location": "Kho GHN - Hà Nội"
  }'
\`\`\`

**Insomnia/Postman:**
- Method: POST
- URL: http://localhost:5000/api/shipments/webhook/ghn
- Headers: Content-Type: application/json
- Body (JSON):
\`\`\`json
{
  "tracking_number": "GHN12345678",
  "status": "on_way",
  "message": "Đơn hàng đang được vận chuyển",
  "location": "Kho GHN - Hà Nội"
}
\`\`\`

---

## 5. Troubleshooting

**Webhook không nhận được:**
1. Kiểm tra firewall/port 5000 mở
2. Kiểm tra ngrok nếu test localhost: \`ngrok http 5000\`
3. Test endpoint bằng cURL trước
4. Kiểm tra logs server: \`npm start\`

**Status không update:**
1. Kiểm tra mapping status trong mapCarrierStatus()
2. Kiểm tra shipment_id tồn tại
3. Kiểm tra database logs

**Email không được gửi:**
1. Thêm email notification handler khi status thay đổi
2. Config email service (SendGrid, Gmail, etc.)
`;

module.exports = {
    GHN_WEBHOOK_EXAMPLE,
    GHTK_WEBHOOK_EXAMPLE,
    VIETTEL_WEBHOOK_EXAMPLE,
    shipmentWebhookExample,
    setupInstructions
};

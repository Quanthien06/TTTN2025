// check-oauth-config.js
// Script để kiểm tra cấu hình OAuth2

// Load biến môi trường từ file .env
require('dotenv').config();

console.log('=== KIỂM TRA CẤU HÌNH OAUTH2 ===\n');

// Kiểm tra biến môi trường
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackUrl = process.env.GOOGLE_CALLBACK_URL;

console.log('1. Kiểm tra biến môi trường:');
console.log('   GOOGLE_CLIENT_ID:', clientId ? `${clientId.substring(0, 20)}...` : '❌ CHƯA ĐƯỢC CẤU HÌNH');
console.log('   GOOGLE_CLIENT_SECRET:', clientSecret ? '✅ Đã cấu hình' : '❌ CHƯA ĐƯỢC CẤU HÌNH');
console.log('   GOOGLE_CALLBACK_URL:', callbackUrl || 'http://localhost:5000/api/auth/google/callback');

console.log('\n2. Kiểm tra file .env:');
try {
    const fs = require('fs');
    if (fs.existsSync('.env')) {
        console.log('   ✅ File .env tồn tại');
        const envContent = fs.readFileSync('.env', 'utf8');
        const hasClientId = envContent.includes('GOOGLE_CLIENT_ID');
        const hasClientSecret = envContent.includes('GOOGLE_CLIENT_SECRET');
        console.log('   GOOGLE_CLIENT_ID trong .env:', hasClientId ? '✅' : '❌');
        console.log('   GOOGLE_CLIENT_SECRET trong .env:', hasClientSecret ? '✅' : '❌');
    } else {
        console.log('   ❌ File .env không tồn tại');
    }
} catch (error) {
    console.log('   ⚠️ Không thể kiểm tra file .env');
}

console.log('\n3. Hướng dẫn khắc phục:');
if (!clientId || !clientSecret) {
    console.log('   ❌ OAuth2 chưa được cấu hình đúng!');
    console.log('\n   Các bước cần làm:');
    console.log('   1. Truy cập: https://console.cloud.google.com/');
    console.log('   2. Tạo project mới hoặc chọn project hiện có');
    console.log('   3. Vào APIs & Services > Credentials');
    console.log('   4. Click "Create Credentials" > "OAuth client ID"');
    console.log('   5. Chọn "Web application"');
    console.log('   6. Điền thông tin:');
    console.log('      - Name: TechStore OAuth2');
    console.log('      - Authorized JavaScript origins: http://localhost:5000');
    console.log('      - Authorized redirect URIs: http://localhost:5000/api/auth/google/callback');
    console.log('   7. Copy Client ID và Client Secret');
    console.log('   8. Tạo file .env trong thư mục gốc:');
    console.log('      GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com');
    console.log('      GOOGLE_CLIENT_SECRET=your-client-secret');
    console.log('      GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback');
    console.log('   9. Cài đặt dotenv: npm install dotenv');
    console.log('   10. Thêm vào đầu server.js: require(\'dotenv\').config();');
    console.log('   11. Restart server');
} else {
    console.log('   ✅ OAuth2 đã được cấu hình');
    console.log('   ⚠️ Nếu vẫn lỗi, kiểm tra:');
    console.log('      - Client ID và Client Secret có đúng không');
    console.log('      - Callback URL trong Google Console có khớp không');
    console.log('      - OAuth consent screen đã được cấu hình chưa');
}

console.log('\n=== KẾT THÚC KIỂM TRA ===');



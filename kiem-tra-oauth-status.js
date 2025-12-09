// Script để kiểm tra OAuth status từ server
const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/status',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const status = JSON.parse(data);
            console.log('=== OAUTH STATUS ===\n');
            console.log('Google OAuth:');
            console.log('  Enabled:', status.google?.enabled ? '✅' : '❌');
            console.log('  Credentials Configured:', status.google?.credentialsConfigured ? '✅' : '❌');
            console.log('  Strategy Initialized:', status.google?.strategyInitialized ? '✅' : '❌');
            console.log('  Auth URL:', status.google?.authUrl || 'N/A');
            console.log('  Callback URL:', status.google?.callbackUrl || 'N/A');
            
            if (!status.google?.enabled) {
                console.log('\n⚠️  OAuth chưa được kích hoạt!');
                console.log('Kiểm tra:');
                console.log('  1. File .env có đúng không?');
                console.log('  2. Server đã restart sau khi cập nhật .env?');
                console.log('  3. Client ID và Secret có đúng không?');
            } else {
                console.log('\n✅ OAuth đã được cấu hình đúng!');
            }
        } catch (error) {
            console.error('❌ Lỗi khi parse response:', error.message);
            console.log('Response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Lỗi khi kết nối đến server:', error.message);
    console.log('\n⚠️  Server có thể chưa chạy!');
    console.log('Chạy: node server.js');
});

req.end();


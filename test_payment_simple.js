// Simple test script for payment demo accounts API
const http = require('http');

const BASE_URL = 'http://localhost:5000';

function testAccount(bank, accountNumber, expectedName) {
    return new Promise((resolve, reject) => {
        const url = `${BASE_URL}/api/payment/check-account?bank=${encodeURIComponent(bank)}&account_number=${encodeURIComponent(accountNumber)}`;
        
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.success && response.account) {
                        const match = response.account.account_name === expectedName;
                        resolve({
                            success: true,
                            match: match,
                            account: response.account,
                            expected: expectedName
                        });
                    } else {
                        resolve({
                            success: false,
                            message: response.message || 'Account not found'
                        });
                    }
                } catch (e) {
                    reject(new Error(`Parse error: ${e.message}`));
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function runTests() {
    console.log('=== TEST PAYMENT DEMO ACCOUNTS API ===\n');

    const testCases = [
        { bank: 'vietcombank', account: '9704151234567890', name: 'NGUYEN VAN A' },
        { bank: 'vietcombank', account: '9704159876543210', name: 'TRAN THI B' },
        { bank: 'techcombank', account: '9704071234567890', name: 'LE VAN C' },
        { bank: 'techcombank', account: '9704079876543210', name: 'PHAM THI D' },
        { bank: 'acb', account: '9704155555555555', name: 'HOANG VAN E' },
        { bank: 'acb', account: '9704156666666666', name: 'VU THI F' },
        { bank: 'bidv', account: '9704157777777777', name: 'DAO VAN G' },
        { bank: 'vietinbank', account: '9704158888888888', name: 'BUI THI H' },
        { bank: 'agribank', account: '9704159999999999', name: 'DANG VAN I' },
        { bank: 'sacombank', account: '9704151111111111', name: 'NGUYEN THI K' },
        { bank: 'mbbank', account: '9704152222222222', name: 'TRAN VAN L' }
    ];

    let successCount = 0;
    let failCount = 0;

    for (const testCase of testCases) {
        try {
            const result = await testAccount(testCase.bank, testCase.account, testCase.name);
            if (result.success && result.match) {
                console.log(`✓ ${testCase.bank} - ${testCase.account}: ${result.account.account_name}`);
                console.log(`  Balance: ${parseFloat(result.account.balance).toLocaleString('vi-VN')} VND`);
                successCount++;
            } else if (result.success && !result.match) {
                console.log(`✗ ${testCase.bank} - ${testCase.account}: Name mismatch`);
                console.log(`  Expected: ${testCase.name}, Got: ${result.account.account_name}`);
                failCount++;
            } else {
                console.log(`✗ ${testCase.bank} - ${testCase.account}: ${result.message}`);
                failCount++;
            }
        } catch (error) {
            console.log(`✗ ${testCase.bank} - ${testCase.account}: ${error.message}`);
            failCount++;
        }
    }

    console.log(`\nKết quả: ${successCount} thành công, ${failCount} thất bại`);

    // Test invalid account
    console.log('\n--- Test Invalid Account ---');
    try {
        const result = await testAccount('vietcombank', '9999999999999999', '');
        if (!result.success) {
            console.log(`✓ Invalid account correctly rejected: ${result.message}`);
        } else {
            console.log(`✗ Invalid account was accepted (should be rejected)`);
        }
    } catch (error) {
        console.log(`✗ Error testing invalid account: ${error.message}`);
    }

    console.log('\n=== TEST HOÀN TẤT ===');
    console.log('\nĐể test trên giao diện:');
    console.log('1. Mở http://localhost:5000/checkout.html');
    console.log('2. Chọn phương thức "Ngân hàng nội địa"');
    console.log('3. Chọn ngân hàng (ví dụ: Vietcombank)');
    console.log('4. Nhập số tài khoản: 9704151234567890');
    console.log('5. Kiểm tra xem có hiển thị "Chủ tài khoản: NGUYEN VAN A" không');
}

runTests().catch(console.error);


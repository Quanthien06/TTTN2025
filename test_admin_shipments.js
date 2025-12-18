/**
 * Test admin shipments list endpoint
 * Usage: node test_admin_shipments.js
 */

const http = require('http');

// Giả sử admin token đã được tạo
const adminToken = process.env.ADMIN_TOKEN || 'your-admin-token-here';

function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    body: responseData
                });
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function testEndpoints() {
    console.log('🧪 Testing Admin Shipments Endpoints\n');
    console.log(`Using token: ${adminToken.substring(0, 20)}...`);
    console.log('─'.repeat(60));

    const baseURL = 'http://localhost:3000';
    const endpoints = [
        {
            name: 'GET /api/shipments/admin/list (trang 1)',
            method: 'GET',
            path: '/api/shipments/admin/list?page=1&limit=10'
        },
        {
            name: 'GET /api/shipments/admin/list (filter status=delivered)',
            method: 'GET',
            path: '/api/shipments/admin/list?status=delivered'
        },
        {
            name: 'GET /api/shipments/admin/list (search tracking)',
            method: 'GET',
            path: '/api/shipments/admin/list?search=GHN'
        }
    ];

    for (const endpoint of endpoints) {
        console.log(`\n📋 ${endpoint.name}`);
        console.log(`   ${endpoint.method} ${endpoint.path}`);

        try {
            const url = new URL(baseURL + endpoint.path);
            const options = {
                hostname: url.hostname,
                port: url.port,
                path: url.pathname + url.search,
                method: endpoint.method,
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            };

            const response = await makeRequest(options);
            console.log(`   Status: ${response.statusCode}`);

            try {
                const data = JSON.parse(response.body);
                if (data.shipments) {
                    console.log(`   ✓ Found ${data.shipments.length} shipments`);
                    if (data.pagination) {
                        console.log(`   Pagination: Page ${data.pagination.currentPage} of ${data.pagination.totalPages}`);
                    }
                } else if (data.message) {
                    console.log(`   Message: ${data.message}`);
                }
            } catch (e) {
                console.log(`   Response: ${response.body.substring(0, 100)}...`);
            }
        } catch (error) {
            console.error(`   ❌ Error: ${error.message}`);
        }
    }

    console.log('\n' + '─'.repeat(60));
    console.log('\n💡 Tips:');
    console.log('1. Make sure your server is running on port 3000');
    console.log('2. Replace ADMIN_TOKEN with your actual JWT token');
    console.log('3. Check database to ensure shipments table exists');
    console.log('\nTo get an admin token:');
    console.log('  1. Log in to your app as an admin user');
    console.log('  2. Check browser DevTools > Application > localStorage > "token"');
    console.log('  3. Set as ADMIN_TOKEN environment variable');
}

testEndpoints().catch(console.error);

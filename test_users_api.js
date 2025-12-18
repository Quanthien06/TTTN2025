#!/usr/bin/env node
/**
 * Test users loading from database
 * Run this after server starts to verify /api/users works
 */

const http = require('http');

function makeRequest(path, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: JSON.parse(data)
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: data
                    });
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function testUsersEndpoint() {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║      Testing /api/users endpoint                   ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    // Get token from localStorage
    const token = process.argv[2];
    
    if (!token) {
        console.log('❌ No token provided!');
        console.log('\nUsage: node test_users_api.js <JWT_TOKEN>');
        console.log('\nHow to get token:');
        console.log('1. Login in browser at http://localhost:5000/login.html');
        console.log('2. Open DevTools Console');
        console.log('3. Run: localStorage.getItem("token")');
        console.log('4. Copy the token value');
        console.log('5. Run: node test_users_api.js "YOUR_TOKEN_HERE"\n');
        return;
    }

    try {
        console.log('Testing: GET /api/users?page=1&limit=5\n');
        
        const result = await makeRequest('/api/users?page=1&limit=5', token);
        
        console.log(`Status: ${result.status}`);
        
        if (result.status === 200) {
            console.log('✅ Users loaded successfully!\n');
            
            if (result.data.users && result.data.users.length > 0) {
                console.log('📊 Users Data:');
                result.data.users.forEach((user, i) => {
                    console.log(`  ${i + 1}. ${user.username} (${user.email}) - Role: ${user.role}`);
                });
            } else {
                console.log('⚠️  No users found in database');
            }
            
            if (result.data.pagination) {
                console.log(`\n📄 Pagination:`);
                console.log(`  Current Page: ${result.data.pagination.currentPage}`);
                console.log(`  Total Pages: ${result.data.pagination.totalPages}`);
                console.log(`  Total Items: ${result.data.pagination.totalItems}`);
                console.log(`  Per Page: ${result.data.pagination.itemsPerPage}`);
            }
        } else if (result.status === 401) {
            console.log('❌ Unauthorized - Token is invalid or expired');
            console.log('Please login again and get a fresh token');
        } else if (result.status === 403) {
            console.log('❌ Forbidden - User does not have admin role');
            console.log('Please login with an admin account');
        } else {
            console.log('❌ Error:', result.data.message || result.data);
        }
        
        console.log('');
        
    } catch (error) {
        console.log('❌ Connection Error:', error.message);
        console.log('Make sure server is running (npm start)');
    }
}

testUsersEndpoint();

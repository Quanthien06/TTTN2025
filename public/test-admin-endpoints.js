// Quick test admin endpoints
const API_BASE = 'http://localhost:5000/api';

async function testEndpoints() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        console.log('❌ No token found. Please login first');
        return;
    }
    
    console.log('Testing Admin Endpoints...\n');
    
    const endpoints = [
        { name: 'GET /me', url: `${API_BASE}/me` },
        { name: 'GET /users', url: `${API_BASE}/users?page=1&limit=5` },
        { name: 'GET /stats/overview', url: `${API_BASE}/stats/overview` },
        { name: 'GET /refunds', url: `${API_BASE}/refunds?page=1&limit=5` },
        { name: 'GET /orders/admin', url: `${API_BASE}/orders/admin?limit=5` }
    ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint.url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const status = response.ok ? '✅' : '❌';
            console.log(`${status} ${endpoint.name} - [${response.status}]`);
            
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                console.log(`   Error: ${JSON.stringify(data)}`);
            }
        } catch (error) {
            console.log(`❌ ${endpoint.name} - [ERROR: ${error.message}]`);
        }
    }
}

// Run test when called
console.log('Available: testEndpoints()');

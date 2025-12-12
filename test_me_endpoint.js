// Script test API /me endpoint
// Chạy: node test_me_endpoint.js

const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const JWT_SECRET = 'HhGg78@!kYpQzXcVbNmL1o2P3oI4U5yT6rE7wQ8aZ9sX0cVkGjH';

async function testMeEndpoint() {
    let connection;
    
    try {
        console.log('🔌 Đang kết nối đến database...');
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'tttn2025'
        });
        console.log('✅ Đã kết nối thành công!');
        
        // Lấy user đầu tiên
        const [users] = await connection.query('SELECT id, username, role FROM users LIMIT 1');
        
        if (users.length === 0) {
            console.log('⚠ Không có user nào trong database');
            return;
        }
        
        const user = users[0];
        console.log('\n📝 Tạo token cho user:', user.username);
        
        // Tạo token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '100d' }
        );
        
        console.log('✅ Token đã được tạo');
        console.log('Token (first 50 chars):', token.substring(0, 50) + '...');
        
        // Test query như trong API
        console.log('\n📝 Đang test query SELECT * FROM users WHERE id = ?');
        const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [user.id]);
        
        if (rows.length === 0) {
            console.log('❌ Không tìm thấy user với ID:', user.id);
            return;
        }
        
        const dbUser = rows[0];
        console.log('✅ Query thành công!');
        console.log('User data keys:', Object.keys(dbUser));
        
        // Test xử lý như trong API
        const result = {
            id: dbUser.id,
            username: dbUser.username || '',
            role: dbUser.role || 'user',
            created_at: dbUser.created_at || dbUser.createdAt || null,
            email: dbUser.email || null,
            email_verified: (dbUser.email_verified !== undefined && dbUser.email_verified !== null) ? Boolean(dbUser.email_verified) : null,
            google_id: dbUser.google_id || null,
            full_name: dbUser.full_name || null,
            phone: dbUser.phone || null,
            address: dbUser.address || null,
            date_of_birth: dbUser.date_of_birth || null
        };
        
        console.log('\n✅ Kết quả xử lý:');
        console.log(JSON.stringify(result, null, 2));
        
        // Test API call
        console.log('\n📡 Đang test API call...');
        const fetch = require('node-fetch');
        const response = await fetch('http://localhost:5000/api/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', JSON.stringify(data, null, 2));
        
        if (response.ok) {
            console.log('\n✅ API test thành công!');
        } else {
            console.log('\n❌ API test thất bại!');
        }
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        if (error.stack) {
            console.error('Stack:', error.stack);
        }
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Đã đóng kết nối database.');
        }
    }
}

// Chạy test
testMeEndpoint();


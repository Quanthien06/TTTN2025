// test_order.js
// Script để test tạo đơn hàng

const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tttn2025'
};

async function testOrder() {
    let connection;
    try {
        console.log('=== TEST ORDER CREATION ===\n');
        connection = await mysql.createConnection(dbConfig);
        console.log('✓ Kết nối database thành công!\n');

        // Test 1: Kiểm tra bảng carts
        console.log('Test 1: Kiểm tra bảng carts...');
        const [carts] = await connection.query('SELECT * FROM carts LIMIT 1');
        console.log('✓ Bảng carts tồn tại');
        console.log('  Schema:', Object.keys(carts[0] || {}));
        console.log('');

        // Test 2: Kiểm tra bảng cart_items
        console.log('Test 2: Kiểm tra bảng cart_items...');
        const [cartItems] = await connection.query('SELECT * FROM cart_items LIMIT 1');
        console.log('✓ Bảng cart_items tồn tại');
        if (cartItems.length > 0) {
            console.log('  Schema:', Object.keys(cartItems[0]));
            console.log('  Sample item:', {
                id: cartItems[0].id,
                cart_id: cartItems[0].cart_id,
                product_id: cartItems[0].product_id,
                quantity: cartItems[0].quantity,
                price: cartItems[0].price
            });
        } else {
            console.log('  ⚠️  Không có cart_items nào');
        }
        console.log('');

        // Test 3: Kiểm tra bảng orders
        console.log('Test 3: Kiểm tra bảng orders...');
        const [orders] = await connection.query('DESCRIBE orders');
        console.log('✓ Bảng orders tồn tại');
        console.log('  Columns:', orders.map(c => c.Field).join(', '));
        console.log('');

        // Test 4: Kiểm tra bảng order_items
        console.log('Test 4: Kiểm tra bảng order_items...');
        const [orderItems] = await connection.query('DESCRIBE order_items');
        console.log('✓ Bảng order_items tồn tại');
        console.log('  Columns:', orderItems.map(c => c.Field).join(', '));
        console.log('');

        // Test 5: Kiểm tra user có cart không
        console.log('Test 5: Kiểm tra user có cart...');
        const [users] = await connection.query('SELECT id, username FROM users LIMIT 1');
        if (users.length > 0) {
            const userId = users[0].id;
            console.log(`  User: ${users[0].username} (ID: ${userId})`);
            
            const [userCarts] = await connection.query(
                'SELECT * FROM carts WHERE user_id = ? AND status = ?',
                [userId, 'active']
            );
            console.log(`  Carts active: ${userCarts.length}`);
            
            if (userCarts.length > 0) {
                const cartId = userCarts[0].id;
                const [items] = await connection.query(
                    'SELECT * FROM cart_items WHERE cart_id = ?',
                    [cartId]
                );
                console.log(`  Cart items: ${items.length}`);
                if (items.length > 0) {
                    console.log('  Sample item:', {
                        id: items[0].id,
                        cart_id: items[0].cart_id,
                        product_id: items[0].product_id,
                        quantity: items[0].quantity,
                        price: items[0].price
                    });
                }
            }
        }
        console.log('');

        await connection.end();
        console.log('✓ Hoàn thành test!');

    } catch (error) {
        console.error('✗ Lỗi:', error.message);
        console.error('  Code:', error.code);
        console.error('  SQL:', error.sqlMessage);
        if (connection) {
            await connection.end();
        }
        process.exit(1);
    }
}

testOrder();



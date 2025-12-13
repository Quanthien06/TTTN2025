// database/seed_comments.js
// Script để thêm các comments mẫu vào database

const mysql = require('mysql2/promise');

// Kết nối database
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tttn2025'
});

// Danh sách comments mẫu
const sampleComments = [
    {
        username: 'Nguyễn Văn A',
        comment: 'Sản phẩm rất tốt, chất lượng đúng như mô tả. Giao hàng nhanh, đóng gói cẩn thận. Tôi rất hài lòng với sản phẩm này!',
        rating: 5
    },
    {
        username: 'Trần Thị B',
        comment: 'Sản phẩm ổn, giá cả hợp lý. Tuy nhiên có một số điểm nhỏ cần cải thiện về thiết kế. Nhìn chung là hài lòng.',
        rating: 4
    },
    {
        username: 'Lê Văn C',
        comment: 'Mình đã sử dụng sản phẩm này được 2 tuần rồi. Hiệu năng tốt, pin ổn định. Khuyến nghị mọi người nên thử!',
        rating: 5
    }
];

async function seedComments() {
    try {
        console.log('Bắt đầu thêm comments mẫu...\n');

        // Lấy danh sách sản phẩm
        const [products] = await pool.query('SELECT id FROM products LIMIT 10');
        
        if (products.length === 0) {
            console.log('❌ Không tìm thấy sản phẩm nào trong database. Vui lòng thêm sản phẩm trước.');
            process.exit(1);
        }

        // Lấy user đầu tiên (hoặc tạo user mẫu nếu chưa có)
        let [users] = await pool.query('SELECT id FROM users LIMIT 1');
        
        let userId = 1; // Default user ID
        if (users.length > 0) {
            userId = users[0].id;
        } else {
            console.log('⚠️  Không tìm thấy user nào. Sử dụng user_id = 1 mặc định.');
        }

        let totalAdded = 0;

        // Thêm comments cho mỗi sản phẩm (1-3 comments ngẫu nhiên)
        for (const product of products) {
            // Random số lượng comments (1-3)
            const numComments = Math.floor(Math.random() * 3) + 1;
            
            // Chọn ngẫu nhiên comments từ danh sách mẫu
            const shuffled = [...sampleComments].sort(() => 0.5 - Math.random());
            const selectedComments = shuffled.slice(0, numComments);

            for (const commentData of selectedComments) {
                try {
                    await pool.query(
                        `INSERT INTO product_comments (product_id, user_id, username, comment, rating) 
                         VALUES (?, ?, ?, ?, ?)`,
                        [product.id, userId, commentData.username, commentData.comment, commentData.rating]
                    );
                    totalAdded++;
                    console.log(`✅ Đã thêm comment cho sản phẩm ID ${product.id}: "${commentData.comment.substring(0, 50)}..."`);
                } catch (error) {
                    // Bỏ qua lỗi duplicate hoặc các lỗi khác
                    if (error.code !== 'ER_DUP_ENTRY') {
                        console.error(`❌ Lỗi khi thêm comment cho sản phẩm ID ${product.id}:`, error.message);
                    }
                }
            }
        }

        console.log(`\n✅ Hoàn thành! Đã thêm ${totalAdded} comments mẫu.`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}

// Chạy script
seedComments();


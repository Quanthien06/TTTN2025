// Seed 10 sample tech news posts and demo pagination (5 items per page)
const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', // cập nhật nếu DB có mật khẩu
    database: 'tttn2025',
    multipleStatements: true
};

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS news (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(255) NOT NULL,
  slug          VARCHAR(255) NOT NULL UNIQUE,
  summary       VARCHAR(500),
  content       MEDIUMTEXT NOT NULL,
  thumbnail_url VARCHAR(500),
  category      VARCHAR(100),
  tags          JSON,
  author        VARCHAR(150),
  source_url    VARCHAR(500),
  published_at  DATETIME,
  status        ENUM('draft','published','archived') DEFAULT 'draft',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_news_published_at (published_at),
  INDEX idx_news_category (category),
  FULLTEXT INDEX ft_news_content (title, summary, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

const sampleNews = [
    {
        title: 'AI vượt mốc mới trong xử lý ngôn ngữ',
        category: 'AI',
        tags: ['AI', 'NLP'],
        author: 'TechStore News',
        source: 'https://example.com/ai-nlp'
    },
    {
        title: 'Laptop 2025: Chip mới, pin lâu hơn',
        category: 'Laptop',
        tags: ['Laptop', 'Hardware'],
        author: 'TechStore News',
        source: 'https://example.com/laptop-2025'
    },
    {
        title: 'Smartphone gập thế hệ 3 ra mắt',
        category: 'Mobile',
        tags: ['Smartphone', 'Foldable'],
        author: 'TechStore News',
        source: 'https://example.com/foldable-gen3'
    },
    {
        title: 'Card đồ họa mới cho game thủ 4K',
        category: 'PC',
        tags: ['GPU', 'Gaming'],
        author: 'TechStore News',
        source: 'https://example.com/gpu-4k'
    },
    {
        title: 'Ổ SSD PCIe 5.0 tăng gấp đôi tốc độ',
        category: 'Storage',
        tags: ['SSD', 'PCIe5'],
        author: 'TechStore News',
        source: 'https://example.com/ssd-pcie5'
    },
    {
        title: 'Màn hình OLED 240Hz cho esports',
        category: 'Monitor',
        tags: ['Monitor', 'OLED', 'Esports'],
        author: 'TechStore News',
        source: 'https://example.com/oled-240hz'
    },
    {
        title: 'Router Wi-Fi 7: chuẩn kết nối tương lai',
        category: 'Networking',
        tags: ['Wi-Fi 7', 'Router'],
        author: 'TechStore News',
        source: 'https://example.com/router-wifi7'
    },
    {
        title: 'Tai nghe ANC giá tốt cho dân văn phòng',
        category: 'Audio',
        tags: ['Headphone', 'ANC'],
        author: 'TechStore News',
        source: 'https://example.com/anc-budget'
    },
    {
        title: 'Tablet 12 inch thay laptop nhẹ nhàng',
        category: 'Tablet',
        tags: ['Tablet', 'Productivity'],
        author: 'TechStore News',
        source: 'https://example.com/tablet-12'
    },
    {
        title: 'Máy in laser tiết kiệm cho doanh nghiệp nhỏ',
        category: 'Printer',
        tags: ['Printer', 'SMB'],
        author: 'TechStore News',
        source: 'https://example.com/laser-smb'
    }
].map((item, idx) => ({
    ...item,
    slug: item.title.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') + `-${idx + 1}`,
    summary: item.title,
    content: `${item.title}. Đây là nội dung mẫu cho bài viết tin công nghệ.`,
    thumbnail: `https://picsum.photos/seed/news-${idx + 1}/800/450`,
    publishedAt: new Date(Date.now() - idx * 3600 * 1000) // mỗi bài cách 1 giờ
}));

async function seed() {
    const conn = await mysql.createConnection(dbConfig);
    try {
        console.log('⚙️  Tạo bảng news nếu chưa có...');
        await conn.query(CREATE_TABLE_SQL);
        console.log('✅ Schema OK');

        console.log('🗑  Xóa dữ liệu cũ...');
        await conn.query('DELETE FROM news');

        console.log('📝 Chèn 10 bài viết mẫu...');
        const insertSQL = `
            INSERT INTO news
            (title, slug, summary, content, thumbnail_url, category, tags, author, source_url, published_at, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')
        `;

        for (const item of sampleNews) {
            await conn.execute(insertSQL, [
                item.title,
                item.slug,
                item.summary,
                item.content,
                item.thumbnail,
                item.category,
                JSON.stringify(item.tags || []),
                item.author,
                item.source,
                item.publishedAt.toISOString().slice(0, 19).replace('T', ' ')
            ]);
        }
        console.log('✅ Đã chèn xong');

        // Demo phân trang: 5 bài / trang
        const pageSize = 5;
        for (let page = 1; page <= 2; page++) {
            const offset = (page - 1) * pageSize;
            const [rows] = await conn.query(
                'SELECT id, title, category, published_at FROM news ORDER BY published_at DESC LIMIT ? OFFSET ?',
                [pageSize, offset]
            );
            console.log(`\n📄 Trang ${page}:`);
            rows.forEach(r => console.log(`- [${r.id}] ${r.title} (${r.category}) ${r.published_at}`));
        }

        const [[{ total }]] = await conn.query('SELECT COUNT(*) as total FROM news');
        console.log(`\nTổng số bài: ${total} (mỗi trang 5 bài ⇒ ${Math.ceil(total / pageSize)} trang)`);
    } finally {
        await conn.end();
    }
}

seed().catch(err => {
    console.error('❌ Lỗi seed news:', err);
    process.exit(1);
});


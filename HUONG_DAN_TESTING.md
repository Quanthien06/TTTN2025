# 🧪 HƯỚNG DẪN TESTING

## Quick Start

### 1. Cài đặt Dependencies

```bash
npm install
```

Hoặc chỉ cài dev dependencies:

```bash
npm install --save-dev jest supertest
```

### 2. Tạo Test Database

Tạo database test riêng:

```sql
CREATE DATABASE tttn2025_test;
```

Hoặc chạy script:

```bash
mysql -u root -p < tests/setup-test-db.sql
```

**Lưu ý**: Test database sẽ sử dụng cùng schema với database chính. Đảm bảo các bảng đã được tạo (chạy migration scripts trong thư mục `database/`).

### 3. Cấu hình Environment Variables

Tạo file `.env.test` (optional, có thể dùng default values):

```env
NODE_ENV=test
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=tttn2025_test
JWT_SECRET=test-secret-key-for-jwt
```

### 4. Chạy Tests

```bash
# Chạy tất cả tests
npm test

# Chạy với watch mode (tự động chạy lại khi code thay đổi)
npm run test:watch

# Chạy với coverage report
npm run test:coverage

# Chạy unit tests
npm run test:unit

# Chạy integration tests
npm run test:integration

# Chạy tests cho service cụ thể
npm run test:auth      # Auth Service
npm run test:product   # Product Service
npm run test:cart      # Cart Service
npm run test:order     # Order Service
```

## Cấu trúc Tests

```
tests/
├── setup.js                    # Jest setup
├── helpers/                    # Test helpers
│   ├── db.js                   # Database helpers
│   ├── auth.js                 # Auth helpers
│   └── app.js                  # App helpers
├── unit/                       # Unit tests
│   └── email.test.js
└── integration/                # Integration tests
    ├── auth.test.js
    ├── product.test.js
    ├── cart.test.js
    └── order.test.js
```

## Test Coverage

Sau khi chạy `npm run test:coverage`, xem report tại:

```
coverage/lcov-report/index.html
```

Mở file này trong browser để xem chi tiết coverage.

## Viết Test Mới

### Unit Test

```javascript
// tests/unit/my-function.test.js
const { myFunction } = require('../../services/my-service/utils/my-function');

describe('My Function', () => {
  test('should return expected result', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

### Integration Test

```javascript
// tests/integration/my-service.test.js
const request = require('supertest');
const express = require('express');
const myRouter = require('../../services/my-service/routes/my');
const { cleanDatabase, getPool, closePool } = require('../helpers/db');

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.locals.pool = getPool();
  app.use('/', myRouter);
  return app;
}

describe('My Service', () => {
  let app;
  
  beforeAll(async () => {
    app = createTestApp();
    await cleanDatabase();
  });
  
  afterAll(async () => {
    await cleanDatabase();
    await closePool();
  });
  
  test('should handle GET /endpoint', async () => {
    const response = await request(app)
      .get('/endpoint');
    
    expect(response.status).toBe(200);
  });
});
```

## Troubleshooting

### Lỗi: Database connection failed

- Đảm bảo MySQL đang chạy
- Kiểm tra credentials trong `.env` hoặc default values
- Đảm bảo test database đã được tạo

### Lỗi: Table doesn't exist

- Chạy migration scripts từ thư mục `database/`
- Hoặc copy schema từ database chính

### Lỗi: Port already in use

- Đảm bảo các services không đang chạy khi test
- Tests không cần chạy services, chỉ test routes trực tiếp

### Lỗi: Timeout

- Tăng timeout trong `jest.config.js`:
  ```javascript
  testTimeout: 30000 // 30 seconds
  ```

## Best Practices

1. **Isolation**: Mỗi test phải độc lập
2. **Clean Data**: Luôn clean database trước mỗi test
3. **Test Helpers**: Sử dụng helpers để tạo test data
4. **Assertions**: Viết assertions rõ ràng
5. **Error Cases**: Test cả success và error cases

## Tài liệu tham khảo

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- Xem chi tiết tại `tests/README.md`


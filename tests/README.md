# 🧪 Testing Documentation

## Tổng quan

Dự án sử dụng **Jest** làm testing framework và **Supertest** cho integration testing. Testing được chia thành 2 loại:

1. **Unit Tests**: Test các functions/utilities riêng lẻ
2. **Integration Tests**: Test các API endpoints và flow hoàn chỉnh

## Cấu trúc thư mục

```
tests/
├── setup.js                 # Jest setup file
├── helpers/                  # Test helpers
│   ├── db.js                 # Database helpers
│   ├── auth.js               # Authentication helpers
│   └── app.js                # App creation helpers
├── unit/                     # Unit tests
│   └── email.test.js         # Email utility tests
└── integration/              # Integration tests
    ├── auth.test.js          # Auth Service tests
    ├── product.test.js       # Product Service tests
    ├── cart.test.js          # Cart Service tests
    └── order.test.js         # Order Service tests
```

## Yêu cầu

### 1. Database

Cần tạo test database riêng:

```sql
CREATE DATABASE tttn2025_test;
```

Test database sẽ được tự động clean trước mỗi test suite.

### 2. Dependencies

Cài đặt dependencies:

```bash
npm install
```

Hoặc chỉ cài dev dependencies:

```bash
npm install --save-dev jest supertest
```

## Chạy Tests

### Chạy tất cả tests

```bash
npm test
```

### Chạy tests với watch mode

```bash
npm run test:watch
```

### Chạy tests với coverage report

```bash
npm run test:coverage
```

### Chạy unit tests

```bash
npm run test:unit
```

### Chạy integration tests

```bash
npm run test:integration
```

### Chạy tests cho service cụ thể

```bash
npm run test:auth      # Auth Service
npm run test:product   # Product Service
npm run test:cart      # Cart Service
npm run test:order     # Order Service
```

## Test Coverage

Sau khi chạy `npm run test:coverage`, xem report tại:

```
coverage/
├── lcov-report/
│   └── index.html    # Mở file này trong browser để xem coverage
```

## Test Helpers

### Database Helpers

```javascript
const { 
  getPool, 
  closePool, 
  cleanDatabase,
  createTestUser,
  createTestProduct,
  createTestCategory 
} = require('./tests/helpers/db');

// Tạo test user
const user = await createTestUser(pool, {
  username: 'testuser',
  password: 'testpass',
  email: 'test@example.com',
  role: 'user'
});

// Xóa tất cả dữ liệu test
await cleanDatabase();
```

### Auth Helpers

```javascript
const { generateToken, getAuthHeader } = require('./tests/helpers/auth');

// Tạo JWT token
const token = generateToken({
  id: 1,
  username: 'testuser',
  role: 'user'
});

// Tạo Authorization header
const headers = getAuthHeader(token);
```

## Viết Tests Mới

### Unit Test Example

```javascript
// tests/unit/my-utility.test.js
const { myFunction } = require('../../services/my-service/utils/my-utility');

describe('My Utility', () => {
  test('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

### Integration Test Example

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

describe('My Service Integration Tests', () => {
  let app;
  let pool;
  
  beforeAll(async () => {
    app = createTestApp();
    pool = getPool();
    await cleanDatabase();
  });
  
  afterAll(async () => {
    await cleanDatabase();
    await closePool();
  });
  
  beforeEach(async () => {
    await cleanDatabase();
  });
  
  test('should handle GET /my-endpoint', async () => {
    const response = await request(app)
      .get('/my-endpoint');
    
    expect(response.status).toBe(200);
  });
});
```

## Best Practices

1. **Isolation**: Mỗi test phải độc lập, không phụ thuộc vào test khác
2. **Clean Database**: Luôn clean database trước mỗi test suite
3. **Test Data**: Sử dụng test helpers để tạo data, không hardcode
4. **Assertions**: Viết assertions rõ ràng và cụ thể
5. **Error Cases**: Test cả success và error cases
6. **Edge Cases**: Test edge cases (empty array, null values, etc.)

## Test Cases Coverage

### Auth Service
- ✅ User registration
- ✅ User login
- ✅ Token verification
- ✅ Password reset (OTP)
- ✅ Change password
- ✅ Profile update

### Product Service
- ✅ Get all products
- ✅ Search products
- ✅ Filter by category
- ✅ Filter by price range
- ✅ Sort products
- ✅ Pagination
- ✅ Get product by ID

### Cart Service
- ✅ Get cart
- ✅ Add item to cart
- ✅ Update cart item quantity
- ✅ Delete cart item
- ✅ Clear cart
- ✅ Calculate cart total
- ✅ Stock validation

### Order Service
- ✅ Create order
- ✅ Get user orders
- ✅ Get order details
- ✅ Order tracking
- ✅ Stock deduction
- ✅ Authorization checks

## Troubleshooting

### Database connection errors

Đảm bảo MySQL đang chạy và test database đã được tạo:

```sql
CREATE DATABASE tttn2025_test;
```

### Port conflicts

Nếu có lỗi port đã được sử dụng, đảm bảo các services không đang chạy khi test.

### Timeout errors

Tăng timeout trong `jest.config.js`:

```javascript
testTimeout: 30000 // 30 seconds
```

## CI/CD Integration

Để tích hợp vào CI/CD pipeline:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## Tài liệu tham khảo

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)


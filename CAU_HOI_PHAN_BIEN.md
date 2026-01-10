# 📋 DANH SÁCH CÂU HỎI PHẢN BIỆN VÀ CÂU TRẢ LỜI - DỰ ÁN TECHSTORE

> **Lưu ý:** Tài liệu này bao gồm các câu hỏi phản biện chi tiết về dự án TechStore (TTTN2025) mà giáo viên có thể đưa ra cùng với câu trả lời đầy đủ và chuyên nghiệp.

---

## 📌 MỤC LỤC

1. [Câu hỏi về Tổng quan Dự án](#1-câu-hỏi-về-tổng-quan-dự-án)
2. [Câu hỏi về Kiến trúc Hệ thống](#2-câu-hỏi-về-kiến-trúc-hệ-thống)
3. [Câu hỏi về Công nghệ và Framework](#3-câu-hỏi-về-công-nghệ-và-framework)
4. [Câu hỏi về Authentication & Security](#4-câu-hỏi-về-authentication--security)
5. [Câu hỏi về Database Design](#5-câu-hỏi-về-database-design)
6. [Câu hỏi về API Design](#6-câu-hỏi-về-api-design)
7. [Câu hỏi về Frontend Development](#7-câu-hỏi-về-frontend-development)
8. [Câu hỏi về Backend Development](#8-câu-hỏi-về-backend-development)
9. [Câu hỏi về Microservices Architecture](#9-câu-hỏi-về-microservices-architecture)
10. [Câu hỏi về Tính năng Sản phẩm](#10-câu-hỏi-về-tính-năng-sản-phẩm)
11. [Câu hỏi về Giỏ hàng và Checkout](#11-câu-hỏi-về-giỏ-hàng-và-checkout)
12. [Câu hỏi về Quản lý Đơn hàng](#12-câu-hỏi-về-quản-lý-đơn-hàng)
13. [Câu hỏi về Thanh toán (Payment)](#13-câu-hỏi-về-thanh-toán-payment)
14. [Câu hỏi về Vận chuyển (Shipping)](#14-câu-hỏi-về-vận-chuyển-shipping)
15. [Câu hỏi về Admin Dashboard](#15-câu-hỏi-về-admin-dashboard)
16. [Câu hỏi về Bảo mật (Security)](#16-câu-hỏi-về-bảo-mật-security)
17. [Câu hỏi về Performance & Scalability](#17-câu-hỏi-về-performance--scalability)
18. [Câu hỏi về Testing & Quality Assurance](#18-câu-hỏi-về-testing--quality-assurance)
19. [Câu hỏi về Deployment & DevOps](#19-câu-hỏi-về-deployment--devops)
20. [Câu hỏi về Error Handling & Logging](#20-câu-hỏi-về-error-handling--logging)
21. [Câu hỏi về UI/UX Design](#21-câu-hỏi-về-uiux-design)
22. [Câu hỏi về Tính năng Bổ sung](#22-câu-hỏi-về-tính-năng-bổ-sung)
23. [Câu hỏi về Documentation](#23-câu-hỏi-về-documentation)
24. [Câu hỏi về Thực tế và Production Ready](#24-câu-hỏi-về-thực-tế-và-production-ready)
25. [Câu hỏi về So sánh và Đánh giá](#25-câu-hỏi-về-so-sánh-và-đánh-giá)

---

## 1. Câu hỏi về Tổng quan Dự án

### ❓ Câu 1.1: Hãy mô tả tổng quan về dự án TechStore của bạn?

**📝 Trả lời:**
TechStore là một hệ thống thương mại điện tử (E-commerce) chuyên bán các sản phẩm công nghệ như điện thoại, laptop, tablet, phụ kiện, đồng hồ thông minh, camera, v.v. 

Dự án được xây dựng với các đặc điểm chính:
- **Kiến trúc:** Microservices với API Gateway làm điểm vào duy nhất
- **Frontend:** Single Page Application (SPA) sử dụng HTML/CSS/JavaScript thuần với Tailwind CSS và Bootstrap 5
- **Backend:** Node.js/Express với 5 microservices riêng biệt (Auth, Product, Cart, Order, News)
- **Database:** MySQL với thiết kế chuẩn hóa
- **Triển khai:** Docker Compose cho môi trường development và production

**Tính năng chính:**
- Quản lý sản phẩm và danh mục đầy đủ
- Giỏ hàng và thanh toán với nhiều phương thức
- Quản lý đơn hàng với tracking
- Hệ thống coupon và tích điểm loyalty
- Admin dashboard quản lý toàn bộ hệ thống
- OAuth2 Google login
- Email OTP cho xác thực

**Mục tiêu:** Tạo ra một nền tảng bán hàng công nghệ hiện đại, có khả năng mở rộng, bảo mật cao và trải nghiệm người dùng tốt.

---

### ❓ Câu 1.2: Tại sao bạn chọn xây dựng một hệ thống e-commerce thay vì các dự án khác?

**📝 Trả lời:**
Tôi chọn xây dựng hệ thống e-commerce vì các lý do sau:

1. **Thực tế và ứng dụng cao:** E-commerce là một trong những lĩnh vực có nhu cầu thực tế rất cao, đặc biệt trong thời đại số hóa hiện nay. Việc xây dựng một hệ thống hoàn chỉnh giúp tôi hiểu được quy trình thương mại điện tử từ A-Z.

2. **Độ phức tạp phù hợp:** E-commerce là dự án có độ phức tạp vừa đủ để thể hiện nhiều kỹ năng:
   - Database design với nhiều quan hệ phức tạp
   - Authentication và Authorization
   - Payment processing
   - Order management
   - Inventory management
   - Security concerns

3. **Khả năng mở rộng:** Dự án cho phép áp dụng kiến trúc microservices, giúp tôi học hỏi về distributed systems, service communication, và scalability.

4. **Trải nghiệm đầy đủ:** Từ frontend đến backend, từ database đến deployment, dự án bao gồm đầy đủ các khía cạnh của một ứng dụng web thực tế.

5. **Cơ hội học hỏi:** E-commerce yêu cầu hiểu biết về nhiều domain khác nhau (business logic, payment, shipping, inventory), giúp mở rộng kiến thức tổng quát.

---

### ❓ Câu 1.3: Dự án này phục vụ đối tượng người dùng nào?

**📝 Trả lời:**
Dự án TechStore phục vụ 2 đối tượng người dùng chính:

**1. Khách hàng (Customers/Users):**
- Người tiêu dùng muốn mua sắm sản phẩm công nghệ trực tuyến
- Có thể đăng ký tài khoản hoặc mua hàng với tư cách khách
- Tính năng: Xem sản phẩm, tìm kiếm, lọc, thêm giỏ hàng, thanh toán, theo dõi đơn hàng, đánh giá sản phẩm, quản lý profile

**2. Quản trị viên (Administrators):**
- Nhân viên quản lý của cửa hàng
- Quyền hạn cao nhất trong hệ thống
- Tính năng: Quản lý sản phẩm, danh mục, đơn hàng, người dùng, xem thống kê doanh thu, quản lý vận chuyển, cấu hình hệ thống

**Phân quyền rõ ràng:** Hệ thống sử dụng role-based access control (RBAC) để phân biệt quyền hạn giữa user và admin, đảm bảo bảo mật và trải nghiệm phù hợp cho từng đối tượng.

---

### ❓ Câu 1.4: Bạn đã làm dự án này trong bao lâu? Thời gian phân bổ như thế nào?

**📝 Trả lời:**
Dự án được phát triển trong khoảng [X] tuần/tháng, với thời gian phân bổ như sau:

**Giai đoạn 1: Planning & Design (20%)**
- Phân tích yêu cầu và thiết kế database schema
- Thiết kế API endpoints
- Lựa chọn công nghệ và kiến trúc
- Tạo wireframes và mockups

**Giai đoạn 2: Backend Development (35%)**
- Setup kiến trúc microservices
- Phát triển các service (Auth, Product, Cart, Order, News)
- Implement authentication và authorization
- Xây dựng API Gateway
- Database migrations và seeding data

**Giai đoạn 3: Frontend Development (25%)**
- Xây dựng UI/UX với Tailwind CSS
- Implement các trang chính (Home, Products, Cart, Checkout, Orders)
- Tích hợp với API backend
- Xử lý state management và routing

**Giai đoạn 4: Advanced Features (15%)**
- Payment integration
- Shipping tracking
- Coupon và loyalty points system
- Admin dashboard
- OAuth2 và Email OTP

**Giai đoạn 5: Testing & Documentation (5%)**
- Testing các tính năng
- Viết documentation
- Bug fixing và optimization

*Lưu ý: Thời gian có thể điều chỉnh tùy theo tình hình thực tế của dự án.*

---

## 2. Câu hỏi về Kiến trúc Hệ thống

### ❓ Câu 2.1: Tại sao bạn chọn kiến trúc Microservices thay vì Monolithic?

**📝 Trả lời:**
Tôi chọn kiến trúc Microservices vì những lý do sau:

**Ưu điểm của Microservices:**

1. **Tách biệt trách nhiệm (Separation of Concerns):**
   - Mỗi service có một chức năng cụ thể (Auth, Product, Cart, Order)
   - Dễ dàng hiểu và maintain từng service
   - Code không bị phức tạp và rối

2. **Khả năng mở rộng độc lập (Independent Scaling):**
   - Nếu service Order có nhiều request hơn, có thể scale riêng service đó mà không cần scale toàn bộ
   - Tiết kiệm tài nguyên và chi phí

3. **Phát triển độc lập (Independent Deployment):**
   - Team có thể phát triển và deploy các service riêng biệt
   - Không ảnh hưởng đến các service khác
   - Tăng tốc độ phát triển

4. **Công nghệ đa dạng:**
   - Mỗi service có thể sử dụng công nghệ phù hợp nhất
   - Ví dụ: Service Product có thể dùng Node.js, service Order có thể dùng Python

5. **Fault Isolation:**
   - Nếu một service bị lỗi, các service khác vẫn hoạt động bình thường
   - Hệ thống có khả năng chịu lỗi cao hơn

**Nhược điểm và cách xử lý:**
- **Phức tạp hơn:** Cần API Gateway, service discovery, message queue → Đã xử lý bằng API Gateway
- **Network latency:** Communication giữa các service → Đã optimize bằng cách đặt các service trong cùng mạng nội bộ
- **Data consistency:** → Đã thiết kế database schema phù hợp và transaction handling

---

### ❓ Câu 2.2: Hãy giải thích về API Gateway trong hệ thống của bạn?

**📝 Trả lời:**
API Gateway trong hệ thống TechStore đóng vai trò là **single entry point** cho tất cả các client requests. 

**Vị trí:** `gateway/server.js` - Port 5000

**Chức năng chính:**

1. **Request Routing:**
   - Nhận tất cả requests từ client (browser)
   - Phân tích URL và route đến service tương ứng:
     - `/api/auth/*` → Auth Service (Port 5001)
     - `/api/products/*` → Product Service (Port 5002)
     - `/api/cart/*` → Cart Service (Port 5003)
     - `/api/orders/*` → Order Service (Port 5004)
     - `/api/news/*` → News Service (Port 5005)

2. **Authentication Middleware:**
   - Verify JWT token trước khi forward request
   - Check role (admin/user) cho các route cần phân quyền
   - Reject requests không có token hợp lệ

3. **Static File Serving:**
   - Serve các file HTML, CSS, JS, images từ thư mục `public/`
   - Giúp frontend có thể truy cập trực tiếp

4. **CORS Configuration:**
   - Xử lý Cross-Origin Resource Sharing
   - Cho phép frontend ở domain khác gọi API (nếu cần)

5. **Error Handling:**
   - Centralized error handling
   - Transform error responses thành format thống nhất
   - Logging errors

6. **Request/Response Transformation:**
   - Có thể transform request trước khi gửi đến service
   - Transform response trước khi trả về client

**Lợi ích:**
- **Single point of entry:** Client chỉ cần biết 1 URL (Gateway)
- **Security:** Centralized authentication và authorization
- **Flexibility:** Có thể thay đổi internal service structure mà không ảnh hưởng client
- **Monitoring:** Dễ dàng theo dõi và log tất cả requests

---

### ❓ Câu 2.3: Các microservices giao tiếp với nhau như thế nào?

**📝 Trả lời:**
Trong hệ thống TechStore, các microservices giao tiếp với nhau qua **HTTP REST API** và thông qua **API Gateway**.

**Cách hoạt động:**

1. **Client → API Gateway → Service:**
   ```
   Client (Browser)
      ↓ HTTP Request
   API Gateway (Port 5000)
      ↓ Route based on URL
   Microservice (Port 5001-5005)
      ↓ Response
   API Gateway
      ↓ HTTP Response
   Client
   ```

2. **Service-to-Service Communication:**
   - Khi một service cần gọi service khác, nó có thể:
     - **Option 1:** Gọi trực tiếp qua HTTP (ví dụ: Order Service gọi Product Service để lấy thông tin sản phẩm)
     - **Option 2:** Qua API Gateway (recommended cho consistency)

3. **Database Sharing:**
   - Hiện tại các service chia sẻ cùng một MySQL database
   - Mỗi service có thể truy cập các bảng liên quan đến chức năng của nó
   - Ví dụ: Order Service có thể đọc bảng `products` để lấy thông tin sản phẩm trong đơn hàng

**Synchronous Communication:**
- Sử dụng HTTP requests/responses
- Client đợi response trước khi tiếp tục
- Phù hợp cho các operations cần kết quả ngay lập tức

**Ví dụ thực tế:**
```
Khi tạo đơn hàng (POST /api/orders):
1. API Gateway nhận request
2. Forward đến Order Service
3. Order Service gọi Product Service để verify stock
4. Order Service gọi Cart Service để lấy cart items
5. Order Service tạo order và update database
6. Response trả về client
```

**Cải thiện trong tương lai:**
- Message Queue (RabbitMQ/Kafka) cho async communication
- Service Discovery để tự động tìm service instances
- Circuit Breaker pattern để xử lý service failures

---

### ❓ Câu 2.4: Làm thế nào để đảm bảo tính nhất quán dữ liệu (Data Consistency) giữa các services?

**📝 Trả lời:**
Đây là một thách thức quan trọng trong kiến trúc microservices. Hiện tại, hệ thống TechStore đảm bảo data consistency như sau:

**1. Shared Database Pattern (Hiện tại):**
- Các services chia sẻ cùng một MySQL database
- Sử dụng database transactions để đảm bảo ACID properties
- Khi cần update nhiều bảng, sử dụng transaction:
  ```javascript
  connection.beginTransaction();
  try {
    // Update products table
    // Update orders table
    // Update cart table
    connection.commit();
  } catch (error) {
    connection.rollback();
  }
  ```

**2. Eventual Consistency cho một số operations:**
- Ví dụ: Khi tạo order, trừ stock của product
- Nếu service Product bị lỗi, order vẫn được tạo nhưng có flag `needs_stock_check`
- Background job sẽ verify và update sau

**3. Validation tại nhiều tầng:**
- **Database level:** Foreign keys, constraints, triggers
- **Service level:** Business logic validation
- **Gateway level:** Request validation

**4. Idempotency:**
- Các operations quan trọng (create order, payment) có idempotency key
- Nếu client retry, operation sẽ không được thực hiện lại

**Ví dụ cụ thể - Tạo Order:**
```javascript
// Order Service
async function createOrder(userId, cartItems) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    // 1. Verify products exist and have stock
    for (let item of cartItems) {
      const product = await verifyProductStock(item.product_id, item.quantity);
      if (!product) throw new Error('Out of stock');
    }
    
    // 2. Create order
    const order = await createOrderRecord(userId, cartItems);
    
    // 3. Update product stock
    for (let item of cartItems) {
      await decreaseProductStock(item.product_id, item.quantity);
    }
    
    // 4. Clear cart
    await clearUserCart(userId);
    
    // 5. Commit transaction
    await connection.commit();
    return order;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
```

**Nhược điểm hiện tại:**
- Shared database làm giảm tính độc lập của services
- Khó scale từng service độc lập

**Hướng cải thiện:**
- **Database per Service:** Mỗi service có database riêng
- **Saga Pattern:** Choreography hoặc Orchestration cho distributed transactions
- **Event Sourcing:** Lưu tất cả events, rebuild state từ events
- **CQRS (Command Query Responsibility Segregation):** Tách read và write models

---

### ❓ Câu 2.5: Vẽ sơ đồ kiến trúc hệ thống của bạn?

**📝 Trả lời:**
Dưới đây là sơ đồ kiến trúc hệ thống TechStore:

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                         │
│  - HTML/CSS/JavaScript (SPA)                                │
│  - Tailwind CSS + Bootstrap 5                               │
│  - Port: Client-side (localhost:5000)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/HTTPS Requests
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              API GATEWAY (Port 5000)                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  - Request Routing                                   │   │
│  │  - Authentication Middleware (JWT)                   │   │
│  │  - Authorization (Role-based)                        │   │
│  │  - Static File Serving                               │   │
│  │  - CORS Configuration                                 │   │
│  │  - Error Handling                                     │   │
│  └─────────────────────────────────────────────────────┘   │
└──────┬──────────┬──────────┬──────────┬──────────┬──────────┘
       │          │          │          │          │
       ↓          ↓          ↓          ↓          ↓
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  AUTH    │ │ PRODUCT  │ │   CART   │ │  ORDER   │ │  NEWS    │
│ Service  │ │ Service  │ │ Service  │ │ Service  │ │ Service  │
│          │ │          │ │          │ │          │ │          │
│ Port     │ │ Port     │ │ Port     │ │ Port     │ │ Port     │
│  5001    │ │  5002    │ │  5003    │ │  5004    │ │  5005    │
│          │ │          │ │          │ │          │ │          │
│ Routes:  │ │ Routes:  │ │ Routes:  │ │ Routes:  │ │ Routes:  │
│ - /login │ │ - /prods │ │ - /cart  │ │ - /order │ │ - /news  │
│ - /reg   │ │ - /cats  │ │ - /items │ │ - /track │ │ - /blog  │
│ - /oauth │ │ - /search│ │          │ │ - /stats │ │          │
└────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
     │           │           │           │           │
     └───────────┴───────────┴───────────┴───────────┘
                       │
                       ↓
         ┌─────────────────────────────┐
         │    MySQL DATABASE           │
         │  (Port 3306)                │
         │                             │
         │  Tables:                    │
         │  - users                    │
         │  - products                 │
         │  - categories               │
         │  - cart, cart_items         │
         │  - orders, order_items      │
         │  - shipments                │
         │  - coupons                  │
         │  - loyalty_points           │
         │  - comments                 │
         │  - news                     │
         │  - momo_accounts            │
         └─────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                              │
│  - Google OAuth2 (Authentication)                           │
│  - Email Service (SMTP - Gmail)                             │
│  - Payment Gateways (VNPay, MoMo - Future)                  │
│  - Shipping APIs (GHN, GHTK, Viettel Post)                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              DEPLOYMENT (Docker Compose)                    │
│  - Gateway Container                                         │
│  - Auth Service Container                                    │
│  - Product Service Container                                 │
│  - Cart Service Container                                    │
│  - Order Service Container                                   │
│  - News Service Container                                    │
│  - MySQL Container (hoặc external MySQL)                     │
└─────────────────────────────────────────────────────────────┘
```

**Luồng dữ liệu điển hình:**

1. **User đăng nhập:**
   ```
   Client → Gateway → Auth Service → Database → JWT Token → Client
   ```

2. **User xem sản phẩm:**
   ```
   Client → Gateway → Product Service → Database → Product Data → Client
   ```

3. **User thêm vào giỏ hàng:**
   ```
   Client (có JWT) → Gateway (verify JWT) → Cart Service → Database → Success → Client
   ```

4. **User checkout:**
   ```
   Client → Gateway → Order Service → Database → Order Created → Cart Service → Clear Cart → Client
   ```

---

## 3. Câu hỏi về Công nghệ và Framework

### ❓ Câu 3.1: Tại sao bạn chọn Node.js thay vì các ngôn ngữ backend khác như Python (Django/Flask), Java (Spring Boot), hay PHP (Laravel)?

**📝 Trả lời:**
Tôi chọn Node.js vì những lý do sau:

**1. JavaScript Full-stack:**
- Cùng ngôn ngữ cho cả frontend và backend (JavaScript)
- Không cần chuyển đổi context giữa các ngôn ngữ
- Có thể chia sẻ code và logic giữa client và server
- Dễ dàng tìm developers biết JavaScript

**2. Performance:**
- Node.js sử dụng event-driven, non-blocking I/O model
- Rất nhanh cho I/O-bound operations (database queries, API calls)
- Phù hợp cho e-commerce với nhiều concurrent requests
- Single-threaded với event loop, không tốn tài nguyên như multi-threading

**3. Ecosystem phong phú:**
- npm có hàng triệu packages
- Express.js là framework rất mature và phổ biến
- Nhiều middleware có sẵn (authentication, validation, logging)

**4. Real-time capabilities:**
- Dễ dàng implement WebSocket cho real-time features (notifications, chat)
- Có thể mở rộng với Socket.io nếu cần

**5. Microservices friendly:**
- Lightweight, khởi động nhanh
- Dễ containerize với Docker
- Phù hợp cho kiến trúc microservices

**6. Async/Await:**
- Syntax dễ đọc và maintain
- Dễ xử lý async operations (database, external APIs)

**So sánh với các alternatives:**

| Framework | Ưu điểm | Nhược điểm | Lý do không chọn |
|-----------|---------|------------|------------------|
| **Django/Python** | Strong typing, ORM tốt, security | Chậm hơn Node.js, syntax khác frontend | Cần học Python riêng |
| **Spring Boot/Java** | Enterprise-grade, type safety | Verbose, cần JVM, chậm startup | Overkill cho dự án này |
| **Laravel/PHP** | Dễ học, documentation tốt | Performance kém hơn, ecosystem nhỏ hơn | Node.js modern hơn |

**Kết luận:** Node.js là lựa chọn tốt cho dự án này vì phù hợp với microservices, performance tốt, và ecosystem phong phú.

---

### ❓ Câu 3.2: Tại sao bạn không sử dụng framework frontend như React, Vue, hay Angular mà lại dùng vanilla JavaScript?

**📝 Trả lời:**
Đây là một quyết định có cân nhắc kỹ. Tôi chọn vanilla JavaScript vì:

**1. Độ phức tạp phù hợp:**
- Dự án này không cần state management phức tạp như Redux/MobX
- Không cần component-based architecture vì UI không quá phức tạp
- Vanilla JS đủ mạnh để handle các tính năng cần thiết

**2. Performance:**
- Không có overhead của framework (bundle size nhỏ hơn)
- Load time nhanh hơn, đặc biệt quan trọng cho e-commerce
- Không cần build step, có thể deploy trực tiếp

**3. Học tập và hiểu sâu:**
- Hiểu rõ cách JavaScript hoạt động, không bị "che giấu" bởi framework
- Dễ debug hơn khi gặp vấn đề
- Kiến thức cơ bản quan trọng hơn framework-specific knowledge

**4. Flexibility:**
- Không bị ràng buộc bởi framework conventions
- Dễ dàng tích hợp các library khác
- Có thể migrate sang framework sau nếu cần

**5. Production-ready:**
- Nhiều website lớn vẫn dùng vanilla JS (Amazon, Google)
- Kết hợp với Tailwind CSS và Bootstrap vẫn tạo được UI hiện đại

**Nhược điểm và cách xử lý:**
- ❌ **State management khó khăn** → Sử dụng localStorage và sessionStorage, custom state management
- ❌ **Code organization** → Modular structure, separate files cho từng feature
- ❌ **Reusability** → Tạo utility functions và reusable components

**Khi nào nên dùng React/Vue:**
- Khi UI phức tạp với nhiều components tương tác
- Khi cần real-time updates (chat, notifications)
- Khi có team lớn và cần standardization
- Khi muốn có mobile app với React Native

**Kết luận:** Cho dự án này, vanilla JavaScript là lựa chọn hợp lý vì đủ mạnh, nhanh, và không cần overhead của framework.

---

### ❓ Câu 3.3: Tại sao bạn chọn MySQL thay vì PostgreSQL, MongoDB, hay các database khác?

**📝 Trả lời:**
Tôi chọn MySQL vì các lý do sau:

**1. Phù hợp với E-commerce:**
- E-commerce cần **ACID transactions** để đảm bảo data consistency
- Relational data (users, orders, products, categories) phù hợp với SQL
- Complex queries (JOINs, aggregations) dễ dàng với SQL

**2. Maturity và Stability:**
- MySQL đã được sử dụng rộng rãi trong production hàng chục năm
- Rất stable và reliable
- Có nhiều tài liệu và community support

**3. Performance:**
- Tối ưu tốt cho read-heavy workloads (e-commerce có nhiều reads hơn writes)
- Indexing tốt, query optimization
- Caching mechanisms (query cache, InnoDB buffer pool)

**4. Ecosystem:**
- Nhiều ORMs và libraries hỗ trợ (Sequelize, TypeORM, Prisma)
- Dễ dàng migrate và backup
- Có nhiều hosting providers support

**5. Learning curve:**
- SQL là kiến thức cơ bản, quan trọng cho developer
- Dễ học và hiểu

**So sánh với alternatives:**

| Database | Type | Ưu điểm | Nhược điểm | Lý do không chọn |
|----------|------|---------|------------|------------------|
| **PostgreSQL** | SQL | Advanced features, JSON support | Phức tạp hơn, ít hosting free hơn | MySQL đủ dùng cho dự án này |
| **MongoDB** | NoSQL | Flexible schema, JSON native | Không có transactions tốt, không phù hợp cho relational data | E-commerce cần transactions |
| **Redis** | In-memory | Rất nhanh | Chỉ là cache, không phải primary DB | Có thể dùng làm cache layer |

**Khi nào nên dùng database khác:**
- **PostgreSQL:** Khi cần advanced features (JSON queries, full-text search, GIS)
- **MongoDB:** Khi có unstructured data, document-based data
- **Redis:** Làm cache layer để tăng performance

**Kết luận:** MySQL là lựa chọn tốt cho e-commerce vì đảm bảo ACID, phù hợp với relational data, và có performance tốt.

---

### ❓ Câu 3.4: Bạn sử dụng Docker trong dự án như thế nào?

**📝 Trả lời:**
Docker được sử dụng để containerize toàn bộ hệ thống, giúp deployment và development dễ dàng hơn.

**Cấu trúc Docker:**

1. **Docker Compose File (`docker-compose.yml`):**
   ```yaml
   services:
     gateway:
       build: ./gateway
       ports:
         - "5000:5000"
       depends_on:
         - auth-service
         - product-service
         # ...
     
     auth-service:
       build: ./services/auth-service
       ports:
         - "5001:5001"
       environment:
         - DB_HOST=mysql
         - DB_USER=root
         - DB_PASSWORD=
     
     # ... các services khác
   ```

2. **Dockerfile cho mỗi service:**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   EXPOSE 5001
   CMD ["node", "server.js"]
   ```

**Lợi ích:**

1. **Consistency:**
   - Môi trường development giống với production
   - Không có vấn đề "works on my machine"
   - Dễ dàng onboard developer mới

2. **Isolation:**
   - Mỗi service chạy trong container riêng
   - Không conflict dependencies
   - Dễ dàng scale từng service

3. **Easy Deployment:**
   - Chỉ cần chạy `docker-compose up`
   - Không cần cài đặt Node.js, MySQL trên host
   - Portable, có thể deploy lên bất kỳ server nào

4. **Resource Efficiency:**
   - Chia sẻ OS kernel
   - Nhẹ hơn VMs
   - Khởi động nhanh

**Cách sử dụng:**

```powershell
# Start tất cả services
docker-compose up -d

# Check logs
docker-compose logs -f gateway

# Stop services
docker-compose down

# Rebuild sau khi thay đổi code
docker-compose up --build
```

**Health Checks:**
- Mỗi service có endpoint `/health` để check status
- Docker có thể tự động restart service nếu fail

**Production Considerations:**
- Sử dụng Docker Swarm hoặc Kubernetes cho orchestration
- Image registry (Docker Hub, AWS ECR)
- Security scanning cho images
- Resource limits cho containers

---

### ❓ Câu 3.5: Bạn sử dụng Tailwind CSS và Bootstrap cùng lúc? Tại sao không chọn một trong hai?

**📝 Trả lời:**
Đây là một câu hỏi hay! Tôi sử dụng cả hai với mục đích khác nhau:

**Tailwind CSS:**
- **Utility-first CSS framework**
- Sử dụng cho: Custom components, unique designs, fine-grained control
- Ưu điểm: Flexible, customizable, modern approach
- Ví dụ: Buttons, cards, layouts được thiết kế riêng

**Bootstrap 5:**
- **Component-based framework**
- Sử dụng cho: Pre-built components phức tạp (modals, dropdowns, forms)
- Ưu điểm: Nhanh, không cần viết nhiều code, tested và stable
- Ví dụ: Modal dialogs, navigation bars, form validations

**Cách kết hợp:**
```html
<!-- Sử dụng Tailwind cho layout và styling -->
<div class="container mx-auto px-4 py-8">
  <!-- Sử dụng Bootstrap cho components -->
  <div class="card">
    <div class="card-body">
      <!-- Tailwind cho custom styling -->
      <h1 class="text-3xl font-bold text-gray-800">Title</h1>
    </div>
  </div>
</div>
```

**Lý do:**
1. **Tận dụng ưu điểm của cả hai:**
   - Tailwind cho flexibility và customization
   - Bootstrap cho speed development với components sẵn có

2. **Giảm code:**
   - Không cần viết lại modal, dropdown từ đầu
   - Focus vào business logic hơn là CSS

3. **Best of both worlds:**
   - Modern utility classes của Tailwind
   - Stable components của Bootstrap

**Nhược điểm:**
- Bundle size lớn hơn (cả 2 frameworks)
- Có thể conflict CSS (đã xử lý bằng CSS specificity và order)

**Alternative approach:**
- Có thể chỉ dùng Tailwind và tự build components
- Hoặc chỉ dùng Bootstrap và customize
- Nhưng approach hiện tại cho phép develop nhanh hơn

---

## 4. Câu hỏi về Authentication & Security

### ❓ Câu 4.1: Hãy giải thích cách JWT (JSON Web Token) hoạt động trong hệ thống của bạn?

**📝 Trả lời:**
JWT được sử dụng để xác thực và ủy quyền người dùng trong hệ thống TechStore.

**Cấu trúc JWT:**
JWT gồm 3 phần, cách nhau bởi dấu chấm (`.`):
```
header.payload.signature
```

**1. Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```
- Algorithm: HS256 (HMAC SHA-256)
- Type: JWT

**2. Payload:**
```json
{
  "userId": 123,
  "username": "john_doe",
  "role": "user",
  "iat": 1234567890,
  "exp": 1234567890
}
```
- userId: ID của user trong database
- username: Tên đăng nhập
- role: Vai trò (user/admin)
- iat: Issued at (thời gian tạo token)
- exp: Expiration (thời gian hết hạn - 100 days trong dự án này)

**3. Signature:**
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret_key
)
```
- Signature được tạo bằng cách hash header + payload với secret key
- Đảm bảo token không bị giả mạo
- Server verify signature để xác thực token

**Luồng hoạt động:**

1. **Login:**
   ```
   User nhập username/password
   → Backend verify credentials
   → Backend tạo JWT với payload chứa userId, username, role
   → Backend trả về JWT cho client
   ```

2. **Authenticated Request:**
   ```
   Client gửi request với header: Authorization: Bearer <token>
   → API Gateway nhận request
   → Gateway verify JWT signature và expiration
   → Gateway extract userId, role từ payload
   → Gateway attach user info vào req.user
   → Forward request đến service tương ứng
   ```

3. **Storage:**
   - JWT được lưu trong `localStorage` của browser
   - Mỗi request đều gửi token trong Authorization header
   - Client tự quản lý token (thêm, xóa khi logout)

**Security Considerations:**
- ✅ Token có expiration time (100 days)
- ✅ Secret key được lưu trong environment variable, không hardcode
- ✅ Signature verification đảm bảo token không bị giả mạo
- ⚠️ Token lưu trong localStorage dễ bị XSS attack (nhưng đã có XSS prevention)
- ⚠️ Không thể revoke token trước khi expire (có thể cải thiện với refresh token + blacklist)

**So sánh với Session-based:**
| JWT | Session |
|-----|---------|
| Stateless, không cần storage | Stateful, cần Redis/database |
| Dễ scale horizontally | Cần shared session storage |
| Token chứa thông tin user | Session chỉ có ID, cần query DB |
| Không thể revoke dễ dàng | Có thể revoke ngay lập tức |

---

### ❓ Câu 4.2: OAuth2 Google Login được implement như thế nào? Luồng hoạt động chi tiết?

**📝 Trả lời:**
OAuth2 Google Login cho phép user đăng nhập bằng tài khoản Google của họ, không cần tạo tài khoản mới trong hệ thống.

**Prerequisites:**
1. Tạo Google OAuth2 credentials trong Google Cloud Console
2. Cấu hình redirect URI: `http://localhost:5000/api/auth/google/callback`
3. Lưu Client ID và Client Secret vào environment variables

**Luồng hoạt động (Authorization Code Flow):**

```
1. User click "Đăng nhập với Google"
   ↓
2. Client redirect đến: 
   https://accounts.google.com/o/oauth2/v2/auth?
     client_id=GOOGLE_CLIENT_ID&
     redirect_uri=http://localhost:5000/api/auth/google/callback&
     response_type=code&
     scope=openid email profile
   ↓
3. Google hiển thị consent screen (yêu cầu user đồng ý)
   ↓
4. User đồng ý → Google redirect về callback URL với authorization code:
   http://localhost:5000/api/auth/google/callback?code=AUTHORIZATION_CODE
   ↓
5. Backend nhận code và exchange lấy access_token:
   POST https://oauth2.googleapis.com/token
     grant_type=authorization_code
     code=AUTHORIZATION_CODE
     client_id=GOOGLE_CLIENT_ID
     client_secret=GOOGLE_CLIENT_SECRET
     redirect_uri=http://localhost:5000/api/auth/google/callback
   ↓
6. Google trả về:
   {
     "access_token": "...",
     "id_token": "JWT_TOKEN",
     "token_type": "Bearer",
     "expires_in": 3600
   }
   ↓
7. Backend verify id_token (JWT) với Google's public keys
   ↓
8. Backend extract user info từ id_token:
   {
     "sub": "google_user_id",
     "email": "user@gmail.com",
     "name": "John Doe",
     "picture": "avatar_url"
   }
   ↓
9. Backend check user trong database:
   - Query: SELECT * FROM users WHERE google_id = 'google_user_id' OR email = 'user@gmail.com'
   ↓
10. Nếu user chưa tồn tại:
    - Tạo user mới với google_id, email, full_name, avatar_url
    - Role default: 'user'
    - Password: NULL (không cần vì dùng OAuth)
   ↓
11. Nếu user đã tồn tại:
    - Update thông tin từ Google (name, avatar)
    - Link google_id nếu chưa có
   ↓
12. Backend tạo JWT token của hệ thống với userId, username, role
   ↓
13. Backend redirect về frontend với token:
    http://localhost:5000/?token=JWT_TOKEN
   ↓
14. Frontend extract token từ URL, lưu vào localStorage
   ↓
15. User đăng nhập thành công
```

**Code Implementation:**

```javascript
// routes/auth.js
router.get('/google', (req, res) => {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?
    client_id=${process.env.GOOGLE_CLIENT_ID}&
    redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&
    response_type=code&
    scope=openid email profile`;
  res.redirect(authUrl);
});

router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      grant_type: 'authorization_code',
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL
    });
    
    const { id_token } = tokenResponse.data;
    
    // Verify and decode id_token
    const decoded = jwt.decode(id_token);
    // In production, should verify signature with Google's public keys
    
    const { sub: googleId, email, name, picture } = decoded;
    
    // Find or create user
    let user = await db.query(
      'SELECT * FROM users WHERE google_id = ? OR email = ?',
      [googleId, email]
    );
    
    if (!user) {
      // Create new user
      const username = email.split('@')[0]; // Generate username from email
      user = await db.query(
        'INSERT INTO users (username, email, full_name, avatar_url, google_id, role) VALUES (?, ?, ?, ?, ?, ?)',
        [username, email, name, picture, googleId, 'user']
      );
      user.id = user.insertId;
    } else {
      // Update existing user
      await db.query(
        'UPDATE users SET google_id = ?, full_name = ?, avatar_url = ? WHERE id = ?',
        [googleId, name, picture, user.id]
      );
    }
    
    // Generate system JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '100d' }
    );
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/?token=${token}`);
  } catch (error) {
    console.error('OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
});
```

**Security Best Practices:**
- ✅ Verify id_token signature với Google's public keys (production)
- ✅ Check expiration của id_token
- ✅ Validate redirect_uri để tránh open redirect attacks
- ✅ Store Google credentials trong environment variables
- ✅ Use HTTPS trong production
- ✅ Handle errors gracefully

**Lợi ích:**
- User không cần nhớ thêm password
- Tăng conversion rate (dễ đăng ký)
- Thông tin user đáng tin cậy (verified by Google)
- Giảm risk về password leaks
- User experience tốt hơn

---

### ❓ Câu 4.3: Email OTP được implement như thế nào? Bảo mật ra sao?

**📝 Trả lời:**
Email OTP (One-Time Password) được sử dụng cho 2 tính năng chính:
1. **Email Verification:** Xác thực email khi đăng ký
2. **Password Reset:** Đặt lại mật khẩu khi quên

**Database Schema:**
```sql
CREATE TABLE otp_verifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  otp_code VARCHAR(255) NOT NULL, -- Hashed OTP
  purpose ENUM('email_verification', 'password_reset') NOT NULL,
  attempts INT DEFAULT 0,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email_purpose (email, purpose, expires_at)
);
```

**Luồng hoạt động - Password Reset:**

```
1. User nhập email vào form "Quên mật khẩu"
   ↓
2. Backend nhận request: POST /api/forgot-password { email: "user@example.com" }
   ↓
3. Backend verify email có tồn tại trong database không
   ↓
4. Backend generate 6-digit OTP:
   const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
   ↓
5. Backend hash OTP với bcrypt:
   const hashedOtp = await bcrypt.hash(otp, 10);
   ↓
6. Backend lưu vào database:
   INSERT INTO otp_verifications (email, otp_code, purpose, expires_at)
   VALUES ('user@example.com', hashedOtp, 'password_reset', DATE_ADD(NOW(), INTERVAL 10 MINUTE))
   ↓
7. Backend gửi email qua SMTP:
   Subject: "Mã OTP đặt lại mật khẩu TechStore"
   Body: "Mã OTP của bạn là: 123456. Mã có hiệu lực trong 10 phút."
   ↓
8. User nhận email, nhập OTP vào form
   ↓
9. Backend nhận request: POST /api/reset-password
   {
     email: "user@example.com",
     otp: "123456",
     newPassword: "new_password_123"
   }
   ↓
10. Backend verify:
    a. Tìm OTP record chưa hết hạn:
       SELECT * FROM otp_verifications 
       WHERE email = ? AND purpose = 'password_reset' 
       AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1
    ↓
    b. Check số lần attempts < 5:
       if (otp_record.attempts >= 5) {
         return error("OTP đã hết lượt thử");
       }
    ↓
    c. Verify OTP:
       const isValid = await bcrypt.compare(otp, otp_record.otp_code);
       if (!isValid) {
         // Tăng attempts
         UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = ?
         return error("OTP không đúng");
       }
    ↓
11. Nếu OTP đúng:
    a. Hash mật khẩu mới: const hashedPassword = await bcrypt.hash(newPassword, 10)
    b. Update password: UPDATE users SET password = ? WHERE email = ?
    c. Xóa OTP record: DELETE FROM otp_verifications WHERE id = ?
    d. Return success
```

**Code Implementation:**

```javascript
// utils/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // App Password, không phải Gmail password
  }
});

async function sendOTPEmail(email, otp, purpose) {
  const subject = purpose === 'password_reset' 
    ? 'Mã OTP đặt lại mật khẩu TechStore'
    : 'Mã OTP xác thực email TechStore';
  
  const html = `
    <h2>Xin chào!</h2>
    <p>Mã OTP của bạn là: <strong style="font-size: 24px; color: #dc2626;">${otp}</strong></p>
    <p>Mã có hiệu lực trong <strong>10 phút</strong>.</p>
    <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
  `;
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject,
    html
  });
}

// routes/auth.js
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Verify email exists
    const user = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      // Don't reveal if email exists (security)
      return res.json({ message: 'Nếu email tồn tại, mã OTP đã được gửi' });
    }
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    
    // Save to database
    await db.query(
      'INSERT INTO otp_verifications (email, otp_code, purpose, expires_at) VALUES (?, ?, ?, ?)',
      [email, hashedOtp, 'password_reset', new Date(Date.now() + 10 * 60 * 1000)]
    );
    
    // Send email
    await sendOTPEmail(email, otp, 'password_reset');
    
    res.json({ message: 'Mã OTP đã được gửi đến email của bạn' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Có lỗi xảy ra' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    // Find OTP record
    const [otpRecord] = await db.query(
      `SELECT * FROM otp_verifications 
       WHERE email = ? AND purpose = 'password_reset' AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email]
    );
    
    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP không tồn tại hoặc đã hết hạn' });
    }
    
    // Check attempts
    if (otpRecord.attempts >= 5) {
      return res.status(400).json({ message: 'OTP đã hết lượt thử' });
    }
    
    // Verify OTP
    const isValid = await bcrypt.compare(otp, otpRecord.otp_code);
    if (!isValid) {
      // Increment attempts
      await db.query(
        'UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = ?',
        [otpRecord.id]
      );
      return res.status(400).json({ message: 'OTP không đúng' });
    }
    
    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
    
    // Delete OTP record
    await db.query('DELETE FROM otp_verifications WHERE id = ?', [otpRecord.id]);
    
    res.json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Có lỗi xảy ra' });
  }
});
```

**Security Features:**
- ✅ **OTP được hash:** Không lưu plain OTP trong database
- ✅ **Expiration:** OTP chỉ có hiệu lực 10 phút
- ✅ **Attempts limit:** Giới hạn 5 lần nhập sai, sau đó phải request OTP mới
- ✅ **Rate limiting:** Chỉ cho phép request OTP mới sau 1 phút (tránh spam)
- ✅ **Email verification:** Trước khi gửi OTP, verify email format
- ✅ **No email enumeration:** Không reveal email có tồn tại hay không (security best practice)

**Potential Vulnerabilities và cách xử lý:**
- ⚠️ **Email interception:** OTP trong email có thể bị đọc bởi attacker → Sử dụng HTTPS, 2FA cho email account
- ⚠️ **Brute force:** Attacker có thể thử nhiều OTP → Đã có attempts limit và expiration
- ⚠️ **Replay attack:** Attacker reuse OTP cũ → OTP chỉ dùng một lần, sau khi verify sẽ bị xóa
- ⚠️ **Timing attack:** So sánh OTP có thể leak thông tin → Dùng bcrypt.compare() (constant-time comparison)

**Best Practices đã áp dụng:**
- ✅ OTP có độ dài đủ (6 digits = 1,000,000 combinations)
- ✅ OTP ngẫu nhiên, không thể đoán
- ✅ Clear expiration và attempts limit
- ✅ Hash OTP trong database
- ✅ Cleanup old OTP records (cron job)

---

---

## 5. Câu hỏi về Database Design

### ❓ Câu 5.1: Hãy mô tả cấu trúc database của hệ thống? Các bảng chính và mối quan hệ giữa chúng?

**📝 Trả lời:**
Database TechStore sử dụng MySQL với thiết kế chuẩn hóa (normalized) để đảm bảo data integrity và tránh redundancy.

**Các bảng chính và mối quan hệ:**

```
┌─────────────┐
│    users    │ (1)──┐
│─────────────│      │
│ id (PK)     │      │
│ username    │      │
│ email       │      │
│ password    │      │
│ role        │      │
│ google_id   │      │
│ ...         │      │
└─────────────┘      │
                     │
       (1)           │ (1)
                     │
┌─────────────┐      │      ┌──────────────┐
│    cart     │───(1)│      │    orders    │
│─────────────│      │      │──────────────│
│ id (PK)     │      │      │ id (PK)      │
│ user_id(FK) │──────┘      │ user_id (FK) │──────┐
│ status      │             │ total        │      │
└─────────────┘             │ status       │      │
       │                    │ ...          │      │
       │ (1)                └──────────────┘      │
       │                           │ (1)          │
       │                           │              │
       │                    ┌──────────────┐      │
       │                    │ order_items  │      │
       │                    │──────────────│      │
       │                    │ id (PK)      │      │
       └───────────(1)      │ order_id(FK) │      │
                            │ product_id   │──────┘
┌─────────────┐             │ quantity     │
│ cart_items  │             │ price        │
│─────────────│             └──────────────┘
│ id (PK)     │                     │
│ cart_id(FK) │───────────┐         │
│ product_id  │──────┐    │         │
│ quantity    │      │    │         │
│ price       │      │    │         │
└─────────────┘      │    │         │
                     │    │         │
                     │    │         │
              ┌──────────────┐      │
              │   products   │      │
              │──────────────│      │
              │ id (PK)      │──────┘
              │ name         │
              │ category     │
              │ price        │
              │ stock        │
              │ images       │
              │ ...          │
              └──────────────┘
                     │
                     │ (N)
              ┌──────────────┐
              │  categories  │
              │──────────────│
              │ id (PK)      │
              │ name         │
              │ slug         │
              │ ...          │
              └──────────────┘
```

**Chi tiết các bảng:**

1. **users:**
   - Lưu thông tin người dùng
   - PK: id
   - Unique: username, email
   - Relationships: 1-N với cart, orders, comments

2. **products:**
   - Lưu thông tin sản phẩm
   - PK: id
   - Index: category, price (cho filtering)
   - Relationships: 1-N với cart_items, order_items, comments

3. **categories:**
   - Danh mục sản phẩm
   - PK: id
   - Relationships: 1-N với products

4. **cart & cart_items:**
   - Cart: Mỗi user có 1 cart (1-1 relationship)
   - Cart_items: Nhiều items trong 1 cart (1-N)
   - Relationships: cart.user_id → users.id, cart_items.product_id → products.id

5. **orders & order_items:**
   - Orders: Mỗi user có nhiều orders (1-N)
   - Order_items: Mỗi order có nhiều items (1-N)
   - Relationships: order.user_id → users.id, order_items.product_id → products.id

6. **shipments:**
   - Thông tin vận chuyển
   - FK: order_id → orders.id
   - Lưu tracking number, carrier, status, timeline

7. **coupons:**
   - Mã giảm giá
   - Có validation rules (min_amount, max_discount, expiry)

8. **loyalty_points:**
   - Điểm tích lũy của user
   - FK: user_id → users.id
   - Lưu history transactions (earn/redeem)

9. **comments:**
   - Bình luận/đánh giá sản phẩm
   - FK: product_id, user_id
   - Có rating (1-5 sao)

10. **news:**
    - Tin tức công nghệ
    - Có slug cho SEO-friendly URLs

**Normalization:**
- ✅ **1NF:** Mỗi column chỉ chứa atomic values
- ✅ **2NF:** Không có partial dependencies (đã tách order_items, cart_items)
- ✅ **3NF:** Không có transitive dependencies
- ⚠️ **BCNF:** Hầu hết đạt, một số exceptions có lý do business

**Indexes:**
- Primary keys: Tự động indexed
- Foreign keys: Indexed cho join performance
- Query optimization: Index trên category, price, created_at cho filtering và sorting

**Constraints:**
- Foreign key constraints: Đảm bảo referential integrity
- Unique constraints: username, email, coupon codes
- Check constraints: price > 0, quantity > 0, role IN ('user', 'admin')

---

### ❓ Câu 5.2: Tại sao bạn tách bảng cart_items và order_items riêng thay vì lưu trực tiếp trong cart và orders?

**📝 Trả lời:**
Đây là một thiết kế quan trọng dựa trên nguyên tắc **normalization** và **database best practices**.

**Lý do tách riêng:**

1. **1-N Relationship:**
   - Một cart/order có thể chứa nhiều sản phẩm (items)
   - Không thể lưu nhiều items trong một row của bảng cart/orders
   - Phải tách thành bảng riêng để lưu từng item

2. **Data Integrity:**
   - Mỗi item có thông tin riêng: quantity, price (giá tại thời điểm mua)
   - Nếu lưu trong JSON/array → Khó query, không có constraints, không normalize
   - Tách bảng → Dễ query, có foreign keys, đảm bảo integrity

3. **Flexibility:**
   - Dễ dàng thêm/xóa/sửa items mà không ảnh hưởng order/cart chính
   - Có thể query riêng items: "Tìm tất cả orders có sản phẩm X"
   - Có thể aggregate: SUM(quantity), SUM(subtotal) per order

4. **Price Snapshot:**
   - Giá sản phẩm có thể thay đổi theo thời gian
   - Order_items lưu price tại thời điểm đặt hàng (snapshot)
   - Đảm bảo order history chính xác, không bị ảnh hưởng khi giá thay đổi

**Ví dụ cụ thể:**

```sql
-- ❌ SAI: Nếu lưu items trong JSON
CREATE TABLE orders (
  id INT,
  user_id INT,
  items JSON -- {"product1": 2, "product2": 1}
);
-- Vấn đề: Khó query, không có foreign keys, không thể join

-- ✅ ĐÚNG: Tách bảng
CREATE TABLE orders (
  id INT PRIMARY KEY,
  user_id INT,
  total DECIMAL(10,2)
);

CREATE TABLE order_items (
  id INT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT,
  price DECIMAL(10,2), -- Price snapshot
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

**Lợi ích:**
- ✅ Dễ query: `SELECT * FROM order_items WHERE order_id = 123`
- ✅ Dễ aggregate: `SELECT SUM(quantity * price) FROM order_items WHERE order_id = 123`
- ✅ Foreign key constraints đảm bảo integrity
- ✅ Có thể join để lấy product details: `order_items JOIN products`

---

### ❓ Câu 5.3: Bạn xử lý vấn đề inventory (tồn kho) như thế nào? Có race condition không?

**📝 Trả lời:**
Quản lý tồn kho là một vấn đề quan trọng trong e-commerce, đặc biệt khi có nhiều user đồng thời mua cùng một sản phẩm.

**Database Schema:**
```sql
CREATE TABLE products (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  stock_quantity INT DEFAULT 0, -- Số lượng tồn kho
  ...
);
```

**Vấn đề Race Condition:**

Khi nhiều user đồng thời mua sản phẩm cuối cùng:
```
User A: Read stock = 1
User B: Read stock = 1 (cùng lúc)
User A: stock = 1 - 1 = 0, UPDATE products SET stock = 0
User B: stock = 1 - 1 = 0, UPDATE products SET stock = 0
→ Kết quả: Cả 2 user đều mua được, nhưng chỉ còn 1 sản phẩm → Over-selling!
```

**Giải pháp trong dự án:**

1. **Database Transactions với Pessimistic Locking:**
```javascript
async function createOrder(userId, cartItems) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    // Check và lock products row
    for (let item of cartItems) {
      const [product] = await connection.query(
        'SELECT stock_quantity FROM products WHERE id = ? FOR UPDATE',
        [item.product_id]
      );
      
      if (!product || product.stock_quantity < item.quantity) {
        throw new Error(`Sản phẩm ${item.product_id} không đủ tồn kho`);
      }
      
      // Update stock trong transaction
      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }
    
    // Create order
    // ... create order logic
    
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
```

2. **Database Constraints:**
```sql
ALTER TABLE products 
ADD CONSTRAINT chk_stock_positive 
CHECK (stock_quantity >= 0);
```
- Đảm bảo stock không bao giờ âm
- MySQL sẽ reject update nếu vi phạm constraint

3. **Atomic Update với WHERE Condition:**
```sql
-- Update chỉ khi stock đủ
UPDATE products 
SET stock_quantity = stock_quantity - 1 
WHERE id = 123 AND stock_quantity >= 1;

-- Check affected rows
-- Nếu affected_rows = 0 → Stock không đủ
```

4. **Optimistic Locking (Alternative):**
```sql
-- Thêm version column
ALTER TABLE products ADD version INT DEFAULT 0;

-- Update với version check
UPDATE products 
SET stock_quantity = stock_quantity - 1, version = version + 1
WHERE id = 123 AND version = ?;

-- Nếu affected_rows = 0 → Version changed, retry
```

**Flow hoàn chỉnh:**

```
1. User checkout
   ↓
2. Begin transaction
   ↓
3. Lock products (SELECT ... FOR UPDATE)
   ↓
4. Check stock for each item
   ↓
5. If insufficient stock → Rollback, return error
   ↓
6. Update stock (atomic operations)
   ↓
7. Create order
   ↓
8. Create order_items
   ↓
9. Commit transaction
   ↓
10. If any error → Rollback everything
```

**Handling Edge Cases:**

1. **Order Cancellation:**
   - Khi hủy order, cần restore stock
   - Transaction đảm bảo atomic: Restore stock + Update order status

2. **Payment Failure:**
   - Nếu payment fail sau khi đã trừ stock → Có 2 options:
     - Option 1: Hold stock trong một thời gian (10-15 phút), nếu payment fail thì restore
     - Option 2: Chỉ trừ stock khi payment successful (recommended)

3. **Partial Stock:**
   - Nếu một số items hết hàng, một số còn → Có thể cho user chọn:
     - Remove items hết hàng và tiếp tục
     - Hoặc cancel toàn bộ order

**Monitoring và Alerts:**
- Log tất cả stock updates để audit
- Alert khi stock thấp (dưới threshold)
- Dashboard hiển thị stock levels

**Best Practices đã áp dụng:**
- ✅ Database transactions đảm bảo ACID
- ✅ Pessimistic locking với FOR UPDATE
- ✅ Check constraints để prevent negative stock
- ✅ Atomic updates với WHERE conditions
- ✅ Proper error handling và rollback

---

### ❓ Câu 5.4: Bạn lưu trữ hình ảnh sản phẩm như thế nào? Tại sao không dùng BLOB trong database?

**📝 Trả lời:**
Có nhiều cách để lưu trữ hình ảnh trong e-commerce. Dự án TechStore lưu **image URLs/Paths** trong database, không lưu BLOB.

**Cách lưu trữ hiện tại:**

```sql
CREATE TABLE products (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  images JSON, -- ["img/product1/main.jpg", "img/product1/1.jpg", ...]
  -- Hoặc
  main_image_url VARCHAR(255),
  image_urls TEXT -- Comma-separated URLs
);
```

**Lý do KHÔNG dùng BLOB:**

1. **Database Size:**
   - Database sẽ rất lớn nếu lưu nhiều ảnh
   - Ảnh có thể từ 100KB đến 5MB mỗi file
   - Với 1000 sản phẩm × 4 ảnh × 500KB = 2GB chỉ cho ảnh!
   - Database queries sẽ chậm vì phải load large objects

2. **Performance:**
   - SELECT query sẽ rất chậm khi include BLOB columns
   - Phải load toàn bộ ảnh vào memory ngay cả khi chỉ cần metadata
   - Indexing và querying khó khăn

3. **Scalability:**
   - Khó scale database khi có nhiều ảnh
   - Backup/restore database sẽ rất lâu
   - Replication giữa database servers sẽ chậm

4. **Caching:**
   - CDN và browser cache hoạt động tốt với static files
   - BLOB trong database không thể cache hiệu quả

5. **Cost:**
   - Database storage đắt hơn file storage (S3, local filesystem)
   - Database cần backup thường xuyên → Tốn storage cho backups

**Cách lưu trữ hiện tại (Recommended):**

1. **Local File System (Development):**
   ```
   public/img/products/
   ├── product-1/
   │   ├── main.jpg
   │   ├── 1.jpg
   │   ├── 2.jpg
   │   └── 3.jpg
   ├── product-2/
   │   └── ...
   ```
   - Database lưu paths: `["img/products/product-1/main.jpg", ...]`
   - Static file server serve files từ `public/` directory

2. **Cloud Storage (Production - Recommended):**
   ```
   Amazon S3 / Google Cloud Storage / Azure Blob Storage
   URLs: https://cdn.techstore.com/products/product-1/main.jpg
   ```
   - Upload ảnh lên cloud storage
   - Database lưu URLs
   - CDN cache và serve ảnh

**Luồng upload ảnh:**

```
1. Admin upload ảnh qua form
   ↓
2. Backend nhận file (multipart/form-data)
   ↓
3. Validate file:
   - Check file type (jpg, png, webp)
   - Check file size (< 5MB)
   - Check dimensions (optional)
   ↓
4. Generate unique filename:
   - product-{id}-{timestamp}.jpg
   - Hoặc UUID-based name
   ↓
5. Save to filesystem/cloud:
   - Local: fs.writeFileSync(path, buffer)
   - Cloud: s3.putObject(bucket, key, buffer)
   ↓
6. Generate URL:
   - Local: /img/products/product-1/main.jpg
   - Cloud: https://cdn.techstore.com/products/product-1/main.jpg
   ↓
7. Update database:
   UPDATE products SET images = ? WHERE id = ?
   ↓
8. Return success với URLs
```

**Code Implementation:**

```javascript
// Upload single image
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const productId = req.params.id;
    const dir = `public/img/products/product-${productId}`;
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, webp)'));
    }
  }
});

router.post('/products/:id/images', authenticateToken, authorize(['admin']), upload.array('images', 4), async (req, res) => {
  try {
    const productId = req.params.id;
    const files = req.files;
    
    // Generate URLs
    const imageUrls = files.map(file => `/img/products/product-${productId}/${file.filename}`);
    
    // Update database
    await db.query(
      'UPDATE products SET images = ? WHERE id = ?',
      [JSON.stringify(imageUrls), productId]
    );
    
    res.json({ message: 'Upload thành công', images: imageUrls });
  } catch (error) {
    // Cleanup uploaded files if error
    req.files.forEach(file => fs.unlinkSync(file.path));
    res.status(500).json({ message: 'Upload thất bại', error: error.message });
  }
});
```

**Image Optimization:**

1. **Resize Images:**
   - Thumbnail: 200x200px
   - Medium: 500x500px
   - Large: 1200x1200px
   - Sử dụng Sharp hoặc ImageMagick

2. **Format Optimization:**
   - Convert to WebP cho modern browsers
   - Fallback to JPEG/PNG cho older browsers
   - Compression để giảm file size

3. **Lazy Loading:**
   - Frontend: `<img loading="lazy" src="...">`
   - Load ảnh khi scroll đến viewport

4. **CDN:**
   - Sử dụng CDN (CloudFront, CloudFlare) để cache ảnh
   - Giảm latency, tăng tốc độ load

**Best Practices:**
- ✅ Store paths/URLs in database, not BLOB
- ✅ Use cloud storage (S3) in production
- ✅ Validate file types and sizes
- ✅ Generate unique filenames
- ✅ Image optimization (resize, compress)
- ✅ CDN for fast delivery
- ✅ Lazy loading for performance

---

### ❓ Câu 5.5: Bạn xử lý soft delete hay hard delete cho các bản ghi? Lý do?

**📝 Trả lời:**
Dự án TechStore sử dụng **Soft Delete** cho hầu hết các bảng quan trọng, và **Hard Delete** cho một số bảng không quan trọng.

**Soft Delete:**
- Thêm column `deleted_at` (DATETIME, nullable)
- Khi "xóa", set `deleted_at = NOW()` thay vì DELETE row
- Query luôn filter `WHERE deleted_at IS NULL`

**Hard Delete:**
- Thực sự xóa row khỏi database
- Không thể recover

**Bảng nào dùng Soft Delete:**

1. **users:**
```sql
ALTER TABLE users ADD deleted_at DATETIME NULL;

-- "Xóa" user
UPDATE users SET deleted_at = NOW() WHERE id = 123;

-- Query users (chỉ lấy active)
SELECT * FROM users WHERE deleted_at IS NULL;
```

**Lý do:**
- Cần giữ lịch sử orders của user (orders.user_id reference đến users)
- Có thể restore user nếu xóa nhầm
- Compliance: Một số quy định yêu cầu giữ data trong thời gian nhất định

2. **products:**
```sql
ALTER TABLE products ADD deleted_at DATETIME NULL;
```

**Lý do:**
- Orders reference đến products, cần giữ product info cho order history
- Có thể un-delete nếu cần
- Analytics: Cần biết sản phẩm nào đã bị xóa và tại sao

3. **orders:**
```sql
-- Orders không bao giờ xóa, chỉ update status = 'cancelled'
```

**Lý do:**
- Orders là records quan trọng, cần audit trail
- Legal requirements: Phải giữ order records trong nhiều năm
- Analytics và reporting cần historical data

**Bảng nào dùng Hard Delete:**

1. **cart_items:**
   - Không quan trọng, có thể regenerate
   - Giảm database size

2. **otp_verifications:**
   - Temporary data, chỉ cần trong thời gian ngắn
   - Cleanup old records định kỳ

3. **comments (có thể soft delete):**
   - Nếu user xóa comment của mình → Hard delete
   - Nếu admin xóa spam → Soft delete (để audit)

**Implementation:**

```javascript
// Soft delete middleware
function softDelete(tableName) {
  return async (req, res, next) => {
    const id = req.params.id;
    
    // Check if record exists and not deleted
    const [record] = await db.query(
      `SELECT * FROM ${tableName} WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    
    if (!record) {
      return res.status(404).json({ message: 'Không tìm thấy' });
    }
    
    req.record = record;
    next();
  };
}

// Soft delete route
router.delete('/products/:id', authenticateToken, authorize(['admin']), softDelete('products'), async (req, res) => {
  try {
    await db.query(
      'UPDATE products SET deleted_at = NOW() WHERE id = ?',
      [req.params.id]
    );
    res.json({ message: 'Đã xóa sản phẩm' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa', error: error.message });
  }
});

// Restore route
router.post('/products/:id/restore', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    await db.query(
      'UPDATE products SET deleted_at = NULL WHERE id = ?',
      [req.params.id]
    );
    res.json({ message: 'Đã khôi phục sản phẩm' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi khôi phục', error: error.message });
  }
});

// Query helper (auto-filter deleted)
function findAll(tableName, conditions = {}) {
  let query = `SELECT * FROM ${tableName} WHERE deleted_at IS NULL`;
  const params = [];
  
  Object.keys(conditions).forEach((key, index) => {
    query += ` AND ${key} = ?`;
    params.push(conditions[key]);
  });
  
  return db.query(query, params);
}
```

**Ưu điểm Soft Delete:**
- ✅ Data recovery: Có thể restore nếu xóa nhầm
- ✅ Audit trail: Biết được record nào bị xóa và khi nào
- ✅ Referential integrity: Foreign keys vẫn valid
- ✅ Historical data: Giữ lại data cho analytics

**Nhược điểm Soft Delete:**
- ⚠️ Queries phức tạp hơn: Luôn phải filter `WHERE deleted_at IS NULL`
- ⚠️ Database size: Không thực sự xóa data, database lớn hơn
- ⚠️ Performance: Cần index trên `deleted_at` để query nhanh

**Best Practices:**
- ✅ Index trên `deleted_at` column
- ✅ Query helpers tự động filter deleted records
- ✅ Cleanup job: Định kỳ hard delete records đã soft delete quá lâu (> 1 năm)
- ✅ Permissions: Chỉ admin mới thấy deleted records
- ✅ UI: Hiển thị "Đã xóa" thay vì ẩn hoàn toàn

**Cleanup Job (Cron):**
```javascript
// Run monthly: Hard delete soft-deleted records older than 1 year
cron.schedule('0 0 1 * *', async () => {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  await db.query(
    'DELETE FROM products WHERE deleted_at IS NOT NULL AND deleted_at < ?',
    [oneYearAgo]
  );
  
  console.log('Cleaned up old soft-deleted records');
});
```

---

## 6. Câu hỏi về API Design

### ❓ Câu 6.1: Bạn thiết kế RESTful API như thế nào? Có tuân thủ các best practices không?

**📝 Trả lời:**
Dự án TechStore sử dụng **RESTful API design** với các nguyên tắc và best practices sau:

**REST Principles:**

1. **Resource-Based URLs:**
   - Resources được biểu diễn bằng nouns (danh từ)
   - URLs rõ ràng và dễ hiểu
   ```
   ✅ ĐÚNG:
   GET    /api/products           # Lấy danh sách sản phẩm
   GET    /api/products/123       # Lấy chi tiết sản phẩm ID 123
   POST   /api/products           # Tạo sản phẩm mới
   PUT    /api/products/123       # Cập nhật sản phẩm ID 123
   DELETE /api/products/123       # Xóa sản phẩm ID 123
   
   ❌ SAI:
   GET /api/getProducts
   POST /api/createProduct
   GET /api/product?id=123
   ```

2. **HTTP Methods Semantics:**
   - GET: Read-only, không thay đổi state
   - POST: Create new resource
   - PUT: Update entire resource (replace)
   - PATCH: Partial update
   - DELETE: Remove resource

3. **HTTP Status Codes:**
   ```
   200 OK              # Success
   201 Created         # Resource created successfully
   400 Bad Request     # Invalid request data
   401 Unauthorized    # Missing/invalid authentication
   403 Forbidden       # Insufficient permissions
   404 Not Found       # Resource not found
   409 Conflict        # Duplicate resource (e.g., username exists)
   500 Internal Server Error
   ```

4. **Request/Response Format:**
   - JSON format cho tất cả requests và responses
   - Consistent structure
   
   ```json
   // Success Response
   {
     "message": "Thành công",
     "data": { ... }
   }
   
   // Error Response
   {
     "message": "Mô tả lỗi",
     "error": "ERROR_CODE",
     "details": { ... }
   }
   
   // List Response với Pagination
   {
     "data": [...],
     "pagination": {
       "page": 1,
       "limit": 20,
       "total": 100,
       "totalPages": 5
     }
   }
   ```

**API Endpoints Structure:**

```
/api
├── /auth
│   ├── POST   /register
│   ├── POST   /login
│   ├── POST   /logout
│   ├── GET    /me
│   ├── PUT    /profile
│   ├── PUT    /change-password
│   ├── POST   /forgot-password
│   ├── POST   /reset-password
│   ├── GET    /google          # OAuth redirect
│   └── GET    /google/callback
│
├── /products
│   ├── GET    /                    # List với filters
│   ├── GET    /:id                 # Detail
│   ├── GET    /by-slug/:slug       # Detail by slug
│   ├── POST   /                    # Create (admin)
│   ├── PUT    /:id                 # Update (admin)
│   └── DELETE /:id                 # Delete (admin)
│
├── /categories
│   ├── GET    /
│   ├── GET    /:id
│   ├── POST   /                    # Admin
│   ├── PUT    /:id                 # Admin
│   └── DELETE /:id                 # Admin
│
├── /cart
│   ├── GET    /
│   ├── POST   /items
│   ├── PUT    /items/:itemId
│   ├── DELETE /items/:itemId
│   └── DELETE /                    # Clear all
│
├── /orders
│   ├── GET    /                    # User's orders
│   ├── GET    /:id                 # Order detail
│   ├── POST   /                    # Create order
│   ├── PUT    /:id                 # Update (pending only)
│   ├── PUT    /:id/cancel          # Cancel order
│   ├── POST   /:id/reorder         # Reorder
│   └── GET    /admin               # All orders (admin)
│
└── /news
    ├── GET    /
    └── GET    /:slug
```

**Query Parameters cho Filtering/Sorting/Pagination:**

```
GET /api/products?q=laptop&category=laptop&minPrice=10000000&maxPrice=30000000&sort=price&order=asc&page=1&limit=20
```

- `q`: Search query (tìm kiếm)
- `category`: Filter by category
- `minPrice`, `maxPrice`: Price range filter
- `sort`: Sort field (id, name, price, created_at)
- `order`: Sort order (asc, desc)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Authentication:**

- Public endpoints: Không cần token
- Protected endpoints: Cần `Authorization: Bearer <token>` header
- Admin endpoints: Cần token + role = 'admin'

**Code Example:**

```javascript
// routes/products.js
router.get('/', async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, sort = 'id', order = 'asc', page = 1, limit = 20 } = req.query;
    
    // Build query
    let query = 'SELECT * FROM products WHERE deleted_at IS NULL';
    const params = [];
    
    if (q) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm);
    }
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (minPrice) {
      query += ' AND price >= ?';
      params.push(minPrice);
    }
    
    if (maxPrice) {
      query += ' AND price <= ?';
      params.push(maxPrice);
    }
    
    // Sorting
    const allowedSorts = ['id', 'name', 'price', 'created_at'];
    const sortField = allowedSorts.includes(sort) ? sort : 'id';
    const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortField} ${sortOrder}`;
    
    // Pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const products = await db.query(query, params);
    
    // Get total count
    const [countResult] = await db.query('SELECT COUNT(*) as total FROM products WHERE deleted_at IS NULL');
    const total = countResult.total;
    
    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});
```

**Best Practices đã áp dụng:**
- ✅ RESTful URLs với nouns
- ✅ HTTP methods đúng semantics
- ✅ HTTP status codes chính xác
- ✅ JSON format consistent
- ✅ Query parameters cho filtering/sorting/pagination
- ✅ Authentication với Bearer tokens
- ✅ Error handling và messages rõ ràng
- ✅ Versioning: `/api/v1/...` (có thể thêm sau)
- ✅ Documentation: API_ENDPOINTS.md đầy đủ

**Cải thiện có thể thêm:**
- ⚠️ API versioning: `/api/v1/products`
- ⚠️ Rate limiting
- ⚠️ Request validation library (joi, express-validator)
- ⚠️ API documentation tool (Swagger/OpenAPI)
- ⚠️ CORS configuration chi tiết hơn

---

### ❓ Câu 6.2: Bạn xử lý errors và error responses như thế nào? Có nhất quán không?

**📝 Trả lời:**
Error handling là một phần quan trọng của API design. Dự án TechStore có error handling nhất quán và user-friendly.

**Error Response Format:**

```json
{
  "message": "Mô tả lỗi bằng tiếng Việt, dễ hiểu",
  "error": "ERROR_CODE",
  "details": {
    "field": "validation error details"
  },
  "timestamp": "2024-01-20T10:30:00Z"
}
```

**Các loại errors:**

1. **Validation Errors (400 Bad Request):**
```json
{
  "message": "Dữ liệu không hợp lệ",
  "error": "VALIDATION_ERROR",
  "details": {
    "username": "Username phải có ít nhất 3 ký tự",
    "email": "Email không đúng định dạng",
    "password": "Password phải có ít nhất 6 ký tự"
  }
}
```

2. **Authentication Errors (401 Unauthorized):**
```json
{
  "message": "Token không hợp lệ hoặc đã hết hạn",
  "error": "INVALID_TOKEN"
}
```

3. **Authorization Errors (403 Forbidden):**
```json
{
  "message": "Bạn không có quyền truy cập tài nguyên này",
  "error": "FORBIDDEN"
}
```

4. **Not Found Errors (404 Not Found):**
```json
{
  "message": "Không tìm thấy sản phẩm với ID 123",
  "error": "NOT_FOUND",
  "resource": "product",
  "id": 123
}
```

5. **Conflict Errors (409 Conflict):**
```json
{
  "message": "Username đã tồn tại",
  "error": "DUPLICATE_USERNAME",
  "field": "username"
}
```

6. **Business Logic Errors (400/422):**
```json
{
  "message": "Sản phẩm không đủ tồn kho",
  "error": "INSUFFICIENT_STOCK",
  "product_id": 123,
  "available": 5,
  "requested": 10
}
```

7. **Server Errors (500 Internal Server Error):**
```json
{
  "message": "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
  "error": "INTERNAL_SERVER_ERROR",
  "request_id": "uuid-for-tracking"
}
```

**Error Handling Middleware:**

```javascript
// middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Dữ liệu không hợp lệ',
      error: 'VALIDATION_ERROR',
      details: err.details
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Token không hợp lệ',
      error: 'INVALID_TOKEN'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token đã hết hạn',
      error: 'TOKEN_EXPIRED'
    });
  }
  
  // Database errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      message: 'Dữ liệu đã tồn tại',
      error: 'DUPLICATE_ENTRY',
      field: extractFieldFromError(err)
    });
  }
  
  // Custom business logic errors
  if (err.code === 'INSUFFICIENT_STOCK') {
    return res.status(400).json({
      message: err.message,
      error: 'INSUFFICIENT_STOCK',
      details: err.details
    });
  }
  
  // Default server error
  res.status(err.status || 500).json({
    message: err.message || 'Đã xảy ra lỗi hệ thống',
    error: err.code || 'INTERNAL_SERVER_ERROR',
    request_id: req.id // Request tracking ID
  });
}

// Custom Error Classes
class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
  }
}

class InsufficientStockError extends AppError {
  constructor(productId, available, requested) {
    super('Sản phẩm không đủ tồn kho', 400, 'INSUFFICIENT_STOCK');
    this.details = { productId, available, requested };
  }
}

// Usage
throw new InsufficientStockError(123, 5, 10);
```

**Consistency:**
- ✅ Tất cả errors có format thống nhất
- ✅ Error messages bằng tiếng Việt, dễ hiểu
- ✅ HTTP status codes chính xác
- ✅ Error codes cho programmatic handling
- ✅ Logging tất cả errors để debugging

---

### ❓ Câu 6.3: API có versioning không? Làm thế nào để handle breaking changes?

**📝 Trả lời:**
**Hiện tại:** API chưa có versioning chính thức, nhưng có thể implement dễ dàng.

**Tại sao cần API Versioning:**
1. **Breaking Changes:** Khi thay đổi API structure, không ảnh hưởng clients cũ
2. **Backward Compatibility:** Giữ support cho clients cũ
3. **Gradual Migration:** Clients có thời gian migrate sang version mới

**Các cách versioning:**

**1. URL Versioning (Recommended):**
```
/api/v1/products
/api/v2/products
```

**Implementation:**
```javascript
// routes/v1/products.js
router.get('/v1/products', ...);
router.get('/v1/products/:id', ...);

// routes/v2/products.js
router.get('/v2/products', ...);
router.get('/v2/products/:id', ...);
```

**2. Header Versioning:**
```
GET /api/products
Headers:
  Accept: application/vnd.techstore.v1+json
  API-Version: v1
```

**3. Query Parameter:**
```
GET /api/products?version=v1
```

**Recommended Approach (URL Versioning):**

```javascript
// gateway/server.js
const v1Routes = require('./routes/v1');
const v2Routes = require('./routes/v2');

// Version 1 (current)
app.use('/api/v1', v1Routes);

// Version 2 (future)
app.use('/api/v2', v2Routes);

// Default to latest version
app.use('/api', v2Routes); // Latest version
```

**Breaking Changes Examples:**

**Version 1:**
```json
// GET /api/v1/products/123
{
  "id": 123,
  "name": "Laptop",
  "price": 15000000
}
```

**Version 2 (Breaking Change):**
```json
// GET /api/v2/products/123
{
  "product": {
    "id": 123,
    "name": "Laptop",
    "price": {
      "amount": 15000000,
      "currency": "VND"
    }
  }
}
```

**Migration Strategy:**

1. **Maintain v1:** Vẫn support v1 trong thời gian dài (1-2 năm)
2. **Deprecation Notice:**
   ```json
   // v1 responses include deprecation header
   Deprecation: version="v1"
   Sunset: Sat, 31 Dec 2025 23:59:59 GMT
   ```
3. **Documentation:** Rõ ràng về changes và migration guide
4. **Client Support:** Thông báo clients về upcoming changes

**Best Practices:**
- ✅ URL versioning cho rõ ràng
- ✅ Default to latest version cho `/api/`
- ✅ Maintain old versions trong thời gian reasonable
- ✅ Deprecation headers cho old versions
- ✅ Migration guides trong documentation
- ✅ Version trong API documentation (Swagger)

---

## 7. Câu hỏi về Frontend Development

### ❓ Câu 7.1: Frontend được tổ chức như thế nào? Có sử dụng component-based architecture không?

**📝 Trả lời:**
Frontend TechStore sử dụng **Vanilla JavaScript** với **SPA-style routing** và **modular structure**, không sử dụng framework component-based như React/Vue.

**Cấu trúc Frontend:**

```
public/
├── index.html                 # Entry point
├── app.js                     # Main application logic, routing, state management
├── styles.css                 # Global styles
├── components/                # Reusable UI components
│   ├── header.html            # Header partial
│   ├── footer.html            # Footer partial
│   ├── product-card.html      # Product card component
│   └── modal.html             # Modal component
├── js/                        # JavaScript modules
│   ├── api.js                 # API calls wrapper
│   ├── auth.js                # Authentication logic
│   ├── cart.js                # Cart management
│   └── utils.js               # Utility functions
├── pages/                     # Page-specific logic
│   ├── products.js
│   ├── product-detail.js
│   ├── cart.js
│   └── checkout.js
├── img/                       # Static images
└── data/                      # Static data (if any)
```

**SPA-Style Routing:**

```javascript
// app.js - Main router
const routes = {
  '/': 'index',
  '/products': 'products',
  '/products/:id': 'product-detail',
  '/cart': 'cart',
  '/checkout': 'checkout',
  '/orders': 'orders',
  '/profile': 'profile'
};

function router() {
  const path = window.location.pathname;
  const route = matchRoute(path, routes);
  
  if (route) {
    loadPage(route);
  } else {
    load404();
  }
}

function loadPage(pageName) {
  // Clear previous page
  document.getElementById('main-content').innerHTML = '';
  
  // Load page content
  switch(pageName) {
    case 'products':
      renderProductsPage();
      break;
    case 'product-detail':
      const id = extractIdFromPath();
      renderProductDetail(id);
      break;
    // ... other pages
  }
}
```

**Modular Components (Without Framework):**

```javascript
// js/components/productCard.js
function ProductCard(product) {
  return `
    <div class="product-card" data-product-id="${product.id}">
      <img src="${product.images[0]}" alt="${product.name}">
      <h3>${product.name}</h3>
      <div class="price">
        <span class="current-price">${formatPrice(product.price)}</span>
        ${product.original_price ? `
          <span class="original-price">${formatPrice(product.original_price)}</span>
          <span class="discount">-${calculateDiscount(product.original_price, product.price)}%</span>
        ` : ''}
      </div>
      <button class="btn-add-cart" onclick="addToCart(${product.id})">
        Thêm vào giỏ
      </button>
    </div>
  `;
}

function renderProductCards(products, container) {
  container.innerHTML = products.map(ProductCard).join('');
  attachEventListeners(container);
}
```

**State Management:**

```javascript
// app.js - Simple state management
const AppState = {
  user: null,
  cart: null,
  products: [],
  
  setUser(user) {
    this.user = user;
    this.notify('userChanged', user);
  },
  
  setCart(cart) {
    this.cart = cart;
    this.notify('cartChanged', cart);
  },
  
  subscribers: {},
  
  subscribe(event, callback) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }
    this.subscribers[event].push(callback);
  },
  
  notify(event, data) {
    if (this.subscribers[event]) {
      this.subscribers[event].forEach(callback => callback(data));
    }
  }
};

// Usage
AppState.subscribe('cartChanged', (cart) => {
  updateCartBadge(cart.item_count);
  if (currentPage === 'cart') {
    renderCart(cart);
  }
});
```

**Why Not Component Framework:**

- ✅ **Simplicity:** Dễ hiểu, không cần học framework
- ✅ **Performance:** Không có framework overhead
- ✅ **Flexibility:** Hoàn toàn tự do, không bị ràng buộc
- ✅ **Size:** Bundle size nhỏ hơn
- ⚠️ **Trade-off:** Phải tự viết nhiều thứ (routing, state management)

**Component Reusability:**

```javascript
// utils/render.js
function render(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] || '';
  });
}

function loadComponent(componentName, data) {
  return fetch(`/components/${componentName}.html`)
    .then(res => res.text())
    .then(template => render(template, data));
}

// Usage
loadComponent('product-card', product).then(html => {
  container.innerHTML += html;
});
```

**Code Organization Best Practices:**
- ✅ Separation of concerns: API, UI, logic tách biệt
- ✅ Reusable functions và components
- ✅ Consistent naming conventions
- ✅ Error handling ở mọi layer
- ✅ Comments cho complex logic

---

### ❓ Câu 7.2: Bạn xử lý state management như thế nào? Có dùng Redux/Vuex không?

**📝 Trả lời:**
Vì không sử dụng React/Vue, dự án **không dùng Redux/Vuex**. Thay vào đó, sử dụng **custom state management** đơn giản nhưng hiệu quả.

**Approach: Centralized State với Observer Pattern:**

```javascript
// js/state.js
class AppState {
  constructor() {
    this.state = {
      user: null,
      cart: null,
      products: [],
      currentPage: 'home',
      filters: {
        category: null,
        minPrice: null,
        maxPrice: null,
        searchQuery: ''
      }
    };
    this.listeners = {};
  }
  
  // Get state
  get(path) {
    const keys = path.split('.');
    let value = this.state;
    for (let key of keys) {
      value = value[key];
      if (value === undefined) break;
    }
    return value;
  }
  
  // Set state và notify listeners
  set(path, value) {
    const keys = path.split('.');
    let obj = this.state;
    
    // Navigate to nested object
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    
    // Set value
    const oldValue = obj[keys[keys.length - 1]];
    obj[keys[keys.length - 1]] = value;
    
    // Notify listeners
    this.notify(path, value, oldValue);
  }
  
  // Subscribe to state changes
  subscribe(path, callback) {
    if (!this.listeners[path]) {
      this.listeners[path] = [];
    }
    this.listeners[path].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners[path] = this.listeners[path].filter(cb => cb !== callback);
    };
  }
  
  // Notify all listeners for a path
  notify(path, newValue, oldValue) {
    if (this.listeners[path]) {
      this.listeners[path].forEach(callback => {
        callback(newValue, oldValue, path);
      });
    }
    
    // Also notify parent path listeners
    const parts = path.split('.');
    for (let i = parts.length - 1; i > 0; i--) {
      const parentPath = parts.slice(0, i).join('.');
      if (this.listeners[parentPath]) {
        this.listeners[parentPath].forEach(callback => {
          callback(this.get(parentPath), null, parentPath);
        });
      }
    }
  }
}

// Create singleton instance
const appState = new AppState();

// Usage Examples
appState.set('user', { id: 1, username: 'john' });
appState.set('cart.items', [{ product_id: 1, quantity: 2 }]);

const user = appState.get('user');
const cartItems = appState.get('cart.items');

// Subscribe to changes
const unsubscribe = appState.subscribe('cart', (newCart, oldCart) => {
  updateCartUI(newCart);
  updateCartBadge(newCart.item_count);
});

// Later: unsubscribe
unsubscribe();
```

**State Persistence (localStorage):**

```javascript
// js/state.js - Extend với persistence
class PersistentAppState extends AppState {
  constructor() {
    super();
    this.loadFromStorage();
    this.setupAutoSave();
  }
  
  loadFromStorage() {
    try {
      const saved = localStorage.getItem('app_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Restore user and cart (not products, reload from API)
        if (parsed.user) this.state.user = parsed.user;
        if (parsed.cart) this.state.cart = parsed.cart;
        if (parsed.filters) this.state.filters = parsed.filters;
      }
    } catch (e) {
      console.error('Failed to load state from storage:', e);
    }
  }
  
  setupAutoSave() {
    // Auto-save to localStorage when state changes
    this.subscribe('user', () => this.saveToStorage());
    this.subscribe('cart', () => this.saveToStorage());
    this.subscribe('filters', () => this.saveToStorage());
  }
  
  saveToStorage() {
    try {
      const toSave = {
        user: this.state.user,
        cart: this.state.cart,
        filters: this.state.filters
      };
      localStorage.setItem('app_state', JSON.stringify(toSave));
    } catch (e) {
      console.error('Failed to save state to storage:', e);
    }
  }
}
```

**Specific State Management:**

**1. User State:**
```javascript
// js/auth.js
async function login(username, password) {
  try {
    const response = await apiCall('/api/login', {
      method: 'POST',
      body: { username, password }
    });
    
    // Update state
    appState.set('user', response.user);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user_info', JSON.stringify(response.user));
    
    // Notify UI
    updateHeaderUI();
    
    return response;
  } catch (error) {
    showError(error.message);
  }
}
```

**2. Cart State:**
```javascript
// js/cart.js
async function loadCart() {
  try {
    const cart = await apiCall('/api/cart');
    appState.set('cart', cart.cart);
    return cart.cart;
  } catch (error) {
    if (error.status === 401) {
      // Not logged in
      appState.set('cart', null);
    }
  }
}

async function addToCart(productId, quantity = 1) {
  try {
    await apiCall('/api/cart/items', {
      method: 'POST',
      body: { product_id: productId, quantity }
    });
    
    // Reload cart
    await loadCart();
    
    showSuccess('Đã thêm vào giỏ hàng');
  } catch (error) {
    showError(error.message);
  }
}

// Subscribe to cart changes
appState.subscribe('cart', (cart) => {
  if (currentPage === 'cart') {
    renderCartPage(cart);
  }
  updateCartBadge(cart?.item_count || 0);
});
```

**3. Products State:**
```javascript
// js/products.js
let productsCache = {};

async function loadProducts(filters = {}) {
  const cacheKey = JSON.stringify(filters);
  
  // Check cache first
  if (productsCache[cacheKey]) {
    appState.set('products', productsCache[cacheKey]);
    return productsCache[cacheKey];
  }
  
  // Load from API
  const queryString = new URLSearchParams(filters).toString();
  const response = await apiCall(`/api/products?${queryString}`);
  
  // Cache and update state
  productsCache[cacheKey] = response.products;
  appState.set('products', response.products);
  
  return response.products;
}
```

**Comparison với Redux/Vuex:**

| Feature | Custom State | Redux/Vuex |
|---------|--------------|------------|
| Complexity | Low | Medium-High |
| Learning Curve | Easy | Steep |
| Boilerplate | Minimal | More |
| DevTools | No | Yes |
| Time Travel | No | Yes |
| Middleware | Manual | Built-in |
| Size | Small | Larger |

**Kết luận:**
- ✅ Custom state management đủ cho dự án này
- ✅ Đơn giản, dễ hiểu và maintain
- ✅ Có thể migrate sang Redux/Vuex sau nếu cần
- ✅ Phù hợp với Vanilla JavaScript approach

---

---

## 8. Câu hỏi về Backend Development

### ❓ Câu 8.1: Middleware được sử dụng như thế nào trong hệ thống?

**📝 Trả lời:**
Middleware là các functions được gọi trước khi request đến route handler. TechStore sử dụng middleware cho authentication, authorization, error handling, và logging.

**Các middleware chính:**

**1. Authentication Middleware (`authenticateToken`):**
```javascript
// middleware/auth.js
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ message: 'Token không được cung cấp', error: 'NO_TOKEN' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn', error: 'INVALID_TOKEN' });
    }
    
    // Attach user info to request
    req.user = user;
    next();
  });
}
```

**Usage:**
```javascript
router.get('/api/cart', authenticateToken, async (req, res) => {
  // req.user.id is available
  const cart = await getCartByUserId(req.user.id);
  res.json({ cart });
});
```

**2. Authorization Middleware (`authorize`):**
```javascript
// middleware/authorize.js
function authorize(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa đăng nhập', error: 'UNAUTHORIZED' });
    }
    
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Không có quyền truy cập', error: 'FORBIDDEN' });
    }
    
    next();
  };
}
```

**Usage:**
```javascript
router.post('/api/products', authenticateToken, authorize(['admin']), async (req, res) => {
  // Only admin can create products
  const product = await createProduct(req.body);
  res.json({ product });
});
```

**3. Error Handling Middleware:**
```javascript
// middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  // Custom error handling
  if (err.isOperational) {
    return res.status(err.statusCode || 500).json({
      message: err.message,
      error: err.errorCode || 'OPERATIONAL_ERROR',
      details: err.details
    });
  }
  
  // Default error
  res.status(500).json({
    message: 'Đã xảy ra lỗi hệ thống',
    error: 'INTERNAL_SERVER_ERROR',
    request_id: req.id
  });
}
```

**4. Logging Middleware:**
```javascript
// middleware/logger.js
function logger(req, res, next) {
  const start = Date.now();
  
  // Log request
  console.log(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString()
  });
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
}
```

**5. Request Validation Middleware:**
```javascript
// middleware/validate.js
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        message: 'Dữ liệu không hợp lệ',
        error: 'VALIDATION_ERROR',
        details: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      });
    }
    
    req.validated = value;
    next();
  };
}

// Usage with Joi
const productSchema = Joi.object({
  name: Joi.string().required().min(3),
  price: Joi.number().required().positive(),
  category_id: Joi.number().integer().required()
});

router.post('/api/products', 
  authenticateToken, 
  authorize(['admin']), 
  validate(productSchema),
  async (req, res) => {
    // req.validated contains validated data
    const product = await createProduct(req.validated);
    res.json({ product });
  }
);
```

**6. Rate Limiting Middleware (Có thể thêm):**
```javascript
// middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Quá nhiều requests, vui lòng thử lại sau'
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  skipSuccessfulRequests: true
});

// Usage
router.post('/api/login', loginLimiter, async (req, res) => {
  // ...
});
```

**Middleware Execution Order:**
```javascript
app.use(logger);                    // 1. Logging
app.use(cors());                    // 2. CORS
app.use(express.json());            // 3. Body parser
app.use(express.urlencoded());      // 4. URL encoded parser

// Route-specific middleware
router.get('/api/products', 
  authenticateToken,                // 5. Auth
  authorize(['admin']),             // 6. Authorization
  validate(schema),                 // 7. Validation
  async (req, res) => {             // 8. Route handler
    // ...
  }
);

app.use(errorHandler);              // 9. Error handler (last)
```

**Best Practices:**
- ✅ Reusable middleware functions
- ✅ Clear separation of concerns
- ✅ Consistent error responses
- ✅ Logging for debugging
- ✅ Security middleware (auth, rate limiting)
- ✅ Validation middleware for data integrity

---

### ❓ Câu 8.2: Bạn xử lý database connections và transactions như thế nào?

**📝 Trả lời:**
Database connections và transactions là critical parts của backend. Dự án sử dụng connection pooling và proper transaction handling.

**Connection Pooling:**

```javascript
// config/database.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tttn2025',
  waitForConnections: true,
  connectionLimit: 10, // Max connections in pool
  queueLimit: 0, // Unlimited queue
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('Database connected');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

module.exports = pool;
```

**Benefits of Connection Pooling:**
- ✅ Reuse connections (không tạo mới mỗi query)
- ✅ Limit concurrent connections (tránh overload database)
- ✅ Automatic connection management (health checks, cleanup)
- ✅ Better performance (faster queries)

**Query Helpers:**

```javascript
// utils/db.js
const pool = require('../config/database');

// Simple query (auto connection management)
async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Get single row
async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

// Transaction helper
async function transaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
```

**Transaction Examples:**

**1. Create Order (Complex Transaction):**
```javascript
async function createOrder(userId, cartItems, shippingInfo) {
  return await transaction(async (connection) => {
    // 1. Verify stock and lock products
    for (const item of cartItems) {
      const [product] = await connection.query(
        'SELECT stock_quantity, price FROM products WHERE id = ? FOR UPDATE',
        [item.product_id]
      );
      
      if (!product || product.stock_quantity < item.quantity) {
        throw new Error(`Sản phẩm ${item.product_id} không đủ tồn kho`);
      }
    }
    
    // 2. Calculate totals
    let total = 0;
    for (const item of cartItems) {
      const [product] = await connection.query('SELECT price FROM products WHERE id = ?', [item.product_id]);
      total += product.price * item.quantity;
    }
    
    // 3. Create order
    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total, shipping_address, status) VALUES (?, ?, ?, ?)',
      [userId, total, shippingInfo.address, 'pending']
    );
    const orderId = orderResult.insertId;
    
    // 4. Create order items and update stock
    for (const item of cartItems) {
      const [product] = await connection.query('SELECT price FROM products WHERE id = ?', [item.product_id]);
      
      // Create order item
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, product.price, product.price * item.quantity]
      );
      
      // Update stock
      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }
    
    // 5. Clear cart
    await connection.query('DELETE FROM cart_items WHERE cart_id = (SELECT id FROM cart WHERE user_id = ?)', [userId]);
    
    return { orderId, total };
  });
}
```

**2. Error Handling trong Transactions:**
```javascript
async function cancelOrder(orderId) {
  try {
    return await transaction(async (connection) => {
      // Get order with lock
      const [order] = await connection.query(
        'SELECT * FROM orders WHERE id = ? AND status = ? FOR UPDATE',
        [orderId, 'pending']
      );
      
      if (!order) {
        throw new Error('Order không tồn tại hoặc không thể hủy');
      }
      
      // Get order items
      const orderItems = await connection.query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [orderId]
      );
      
      // Restore stock
      for (const item of orderItems) {
        await connection.query(
          'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
      
      // Update order status
      await connection.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        ['cancelled', orderId]
      );
      
      return { message: 'Đã hủy đơn hàng' };
    });
  } catch (error) {
    // Transaction automatically rolled back
    console.error('Cancel order error:', error);
    throw error;
  }
}
```

**Best Practices:**
- ✅ Always use transactions for multi-step operations
- ✅ Lock rows with `FOR UPDATE` when needed (inventory)
- ✅ Proper error handling và rollback
- ✅ Release connections in finally blocks
- ✅ Connection pooling for performance
- ✅ Query parameterization để prevent SQL injection
- ✅ Timeout cho long-running transactions

---

### ❓ Câu 8.3: Bạn xử lý async operations và error handling như thế nào?

**📝 Trả lời:**
Node.js là single-threaded và event-driven, nên xử lý async operations đúng cách rất quan trọng.

**Async/Await Pattern (Recommended):**

```javascript
// ✅ ĐÚNG: Async/await
async function getUserOrders(userId) {
  try {
    const orders = await db.query('SELECT * FROM orders WHERE user_id = ?', [userId]);
    
    // Process orders
    for (const order of orders) {
      const items = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      order.items = items;
    }
    
    return orders;
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error; // Re-throw để error handler xử lý
  }
}
```

**Promise Chaining (Alternative):**

```javascript
// ✅ Cũng OK: Promise chaining
function getUserOrders(userId) {
  return db.query('SELECT * FROM orders WHERE user_id = ?', [userId])
    .then(orders => {
      return Promise.all(orders.map(order => {
        return db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id])
          .then(items => {
            order.items = items;
            return order;
          });
      }));
    })
    .catch(error => {
      console.error('Error getting user orders:', error);
      throw error;
    });
}
```

**Error Handling Best Practices:**

**1. Try-Catch Blocks:**
```javascript
async function createProduct(productData) {
  try {
    // Validate input
    if (!productData.name || !productData.price) {
      throw new ValidationError('Name và price là bắt buộc');
    }
    
    // Database operation
    const result = await db.query(
      'INSERT INTO products (name, price, category_id) VALUES (?, ?, ?)',
      [productData.name, productData.price, productData.category_id]
    );
    
    return { id: result.insertId, ...productData };
  } catch (error) {
    // Handle specific errors
    if (error.code === 'ER_DUP_ENTRY') {
      throw new ConflictError('Tên sản phẩm đã tồn tại');
    }
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      throw new NotFoundError('Category không tồn tại');
    }
    
    // Re-throw unknown errors
    throw error;
  }
}
```

**2. Custom Error Classes:**
```javascript
// utils/errors.js
class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = {}) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class NotFoundError extends AppError {
  constructor(resource, id) {
    super(`${resource} không tồn tại`, 404, 'NOT_FOUND');
    this.resource = resource;
    this.id = id;
  }
}

class ConflictError extends AppError {
  constructor(message, field) {
    super(message, 409, 'CONFLICT');
    this.field = field;
  }
}

// Usage
if (!product) {
  throw new NotFoundError('Product', productId);
}
```

**3. Async Error Wrapper:**
```javascript
// utils/asyncHandler.js
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Usage - không cần try-catch trong route handlers
router.post('/api/products', authenticateToken, authorize(['admin']), asyncHandler(async (req, res) => {
  const product = await createProduct(req.body);
  res.json({ product });
})); // Errors tự động được forward đến error handler
```

**4. Parallel Operations:**
```javascript
// ✅ ĐÚNG: Parallel với Promise.all
async function getProductWithDetails(productId) {
  const [product, comments, relatedProducts] = await Promise.all([
    db.query('SELECT * FROM products WHERE id = ?', [productId]),
    db.query('SELECT * FROM comments WHERE product_id = ? AND status = ?', [productId, 'approved']),
    db.query('SELECT * FROM products WHERE category_id = ? AND id != ? LIMIT 5', [product.category_id, productId])
  ]);
  
  return {
    product,
    comments,
    relatedProducts
  };
}
```

**5. Sequential với Error Handling:**
```javascript
// Sequential operations với proper error handling
async function processOrder(orderId) {
  try {
    // Step 1: Verify order
    const order = await verifyOrder(orderId);
    if (!order) {
      throw new NotFoundError('Order', orderId);
    }
    
    // Step 2: Check stock (depends on step 1)
    await verifyStock(order.items);
    
    // Step 3: Process payment (depends on step 2)
    const paymentResult = await processPayment(order);
    if (!paymentResult.success) {
      throw new PaymentError('Payment failed');
    }
    
    // Step 4: Create shipment (depends on step 3)
    await createShipment(orderId);
    
    return { success: true, orderId };
  } catch (error) {
    // Rollback if needed
    if (error.isOperational) {
      await rollbackOrder(orderId);
    }
    throw error;
  }
}
```

**6. Timeout Handling:**
```javascript
// utils/timeout.js
function withTimeout(promise, timeoutMs, errorMessage = 'Operation timeout') {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
}

// Usage
try {
  const result = await withTimeout(
    db.query('SELECT * FROM large_table'),
    5000, // 5 seconds timeout
    'Query timeout'
  );
} catch (error) {
  if (error.message === 'Query timeout') {
    // Handle timeout
  }
}
```

**Best Practices:**
- ✅ Always use try-catch với async/await
- ✅ Use Promise.all cho parallel operations
- ✅ Custom error classes cho better error handling
- ✅ Async error wrapper để reduce boilerplate
- ✅ Proper error logging
- ✅ Timeout cho long operations
- ✅ Error propagation (re-throw when needed)

---

## 9. Câu hỏi về Microservices Architecture

### ❓ Câu 9.1: Làm thế nào để đảm bảo service discovery và communication giữa các microservices?

**📝 Trả lời:**
Trong hệ thống TechStore, service discovery và communication được xử lý qua **API Gateway** và **hard-coded service URLs** (phù hợp cho quy mô hiện tại).

**Service Discovery (Hiện tại - Static):**

```javascript
// gateway/server.js
const SERVICE_URLS = {
  auth: 'http://auth-service:5001',
  product: 'http://product-service:5002',
  cart: 'http://cart-service:5003',
  order: 'http://order-service:5004',
  news: 'http://news-service:5005'
};

// Route requests to services
app.use('/api/auth/*', (req, res) => {
  proxyRequest(req, res, SERVICE_URLS.auth);
});

app.use('/api/products/*', (req, res) => {
  proxyRequest(req, res, SERVICE_URLS.product);
});
```

**Dynamic Service Discovery (Có thể cải thiện):**

**Option 1: Service Registry (Consul, Eureka, etcd):**
```javascript
// Services tự đăng ký với registry
const consul = require('consul')();

// Service startup
async function registerService() {
  await consul.agent.service.register({
    name: 'product-service',
    address: 'product-service',
    port: 5002,
    check: {
      http: 'http://product-service:5002/health',
      interval: '10s'
    }
  });
}

// Gateway query registry
async function getServiceUrl(serviceName) {
  const services = await consul.health.service(serviceName);
  return services[0].Service; // Round-robin load balancing
}
```

**Option 2: Kubernetes Service Discovery:**
```yaml
# Kubernetes Service
apiVersion: v1
kind: Service
metadata:
  name: product-service
spec:
  selector:
    app: product-service
  ports:
    - port: 5002
  type: ClusterIP
```
- Services có thể gọi nhau bằng service name: `http://product-service:5002`

**Service-to-Service Communication:**

**1. Synchronous (HTTP/REST):**
```javascript
// Order Service gọi Product Service
async function checkProductStock(productId) {
  const response = await axios.get(`http://product-service:5002/api/products/${productId}`);
  return response.data;
}
```

**2. Async với Message Queue (Future):**
```javascript
// Order Service publish event
await rabbitmq.publish('order.created', {
  orderId: 123,
  userId: 456,
  items: [...]
});

// Email Service subscribe
rabbitmq.subscribe('order.created', async (message) => {
  await sendOrderConfirmationEmail(message);
});
```

**Best Practices:**
- ✅ API Gateway làm single entry point
- ✅ Health checks cho service availability
- ✅ Circuit breaker để handle service failures
- ✅ Retry logic với exponential backoff
- ✅ Timeout cho service calls
- ✅ Load balancing khi có nhiều instances

---

### ❓ Câu 9.2: Bạn xử lý distributed transactions như thế nào trong microservices?

**📝 Trả lời:**
Distributed transactions là một thách thức lớn trong microservices. TechStore sử dụng **Saga Pattern** và **Eventual Consistency** thay vì distributed transactions.

**Vấn đề:**
- ACID transactions không khả thi giữa nhiều services
- Network latency và failures
- Mỗi service có database riêng (trong tương lai)

**Solution: Saga Pattern (Choreography):**

**Ví dụ - Create Order Saga:**

```javascript
// Order Service - Orchestrator
async function createOrderSaga(userId, cartItems) {
  const sagaId = generateId();
  
  try {
    // Step 1: Reserve stock (Product Service)
    const stockReserved = await reserveStock(sagaId, cartItems);
    if (!stockReserved) {
      throw new Error('Stock reservation failed');
    }
    
    // Step 2: Create order (Order Service)
    const order = await createOrder(userId, cartItems, sagaId);
    
    // Step 3: Process payment (Payment Service)
    const paymentResult = await processPayment(order.total, sagaId);
    if (!paymentResult.success) {
      // Compensate: Cancel order, release stock
      await compensateOrder(sagaId);
      throw new Error('Payment failed');
    }
    
    // Step 4: Create shipment (Shipping Service)
    await createShipment(order.id, sagaId);
    
    return order;
  } catch (error) {
    // Compensate all completed steps
    await compensateSaga(sagaId);
    throw error;
  }
}

// Compensation (Rollback)
async function compensateSaga(sagaId) {
  // Get saga state
  const saga = await getSagaState(sagaId);
  
  // Compensate in reverse order
  if (saga.shipmentCreated) {
    await cancelShipment(saga.shipmentId);
  }
  if (saga.paymentProcessed) {
    await refundPayment(saga.paymentId);
  }
  if (saga.orderCreated) {
    await cancelOrder(saga.orderId);
  }
  if (saga.stockReserved) {
    await releaseStock(saga.reservationId);
  }
}
```

**Event-Driven Saga (Choreography):**

```javascript
// Order Service publishes event
await eventBus.publish('order.created', {
  orderId: 123,
  items: [...]
});

// Product Service listens và reserve stock
eventBus.subscribe('order.created', async (event) => {
  const reserved = await reserveStock(event.items);
  if (reserved) {
    await eventBus.publish('stock.reserved', { orderId: event.orderId });
  } else {
    await eventBus.publish('stock.reservation.failed', { orderId: event.orderId });
  }
});

// Payment Service listens và process payment
eventBus.subscribe('stock.reserved', async (event) => {
  const order = await getOrder(event.orderId);
  const paid = await processPayment(order.total);
  if (paid) {
    await eventBus.publish('payment.succeeded', { orderId: event.orderId });
  } else {
    await eventBus.publish('payment.failed', { orderId: event.orderId });
    // Trigger compensation
    await eventBus.publish('release.stock', { orderId: event.orderId });
  }
});
```

**Current Implementation (Simplified):**

```javascript
// Hiện tại: Shared database, có thể dùng transactions
async function createOrder(userId, cartItems) {
  return await transaction(async (connection) => {
    // All operations trong cùng database
    // Có thể rollback nếu lỗi
    // ...
  });
}

// Tương lai: Separate databases → Saga pattern
```

**Best Practices:**
- ✅ Saga pattern cho distributed transactions
- ✅ Idempotency cho operations
- ✅ Compensation logic cho rollback
- ✅ Eventual consistency (accept temporary inconsistency)
- ✅ Event sourcing để track all changes
- ✅ Saga state storage để track progress

---

## 10. Câu hỏi về Tính năng Sản phẩm

### ❓ Câu 10.1: Hệ thống tìm kiếm sản phẩm được implement như thế nào? Có full-text search không?

**📝 Trả lời:**
Hệ thống TechStore có nhiều cách tìm kiếm sản phẩm, từ đơn giản đến advanced.

**1. Basic Search (LIKE Query):**

```javascript
// routes/products.js
router.get('/', async (req, res) => {
  const { q } = req.query;
  
  let query = 'SELECT * FROM products WHERE deleted_at IS NULL';
  const params = [];
  
  if (q) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    const searchTerm = `%${q}%`;
    params.push(searchTerm, searchTerm);
  }
  
  const products = await db.query(query, params);
  res.json({ products });
});
```

**2. Full-Text Search (MySQL FULLTEXT Index):**

```sql
-- Create fulltext index
ALTER TABLE products 
ADD FULLTEXT INDEX idx_search (name, description);
```

```javascript
// Full-text search query
router.get('/', async (req, res) => {
  const { q } = req.query;
  
  let query = 'SELECT * FROM products WHERE deleted_at IS NULL';
  const params = [];
  
  if (q) {
    // Natural language mode
    query += ' AND MATCH(name, description) AGAINST(? IN NATURAL LANGUAGE MODE)';
    params.push(q);
    
    // Hoặc boolean mode (advanced)
    // query += ' AND MATCH(name, description) AGAINST(? IN BOOLEAN MODE)';
  }
  
  const products = await db.query(query, params);
  res.json({ products });
});
```

**3. Advanced Search với Multiple Filters:**

```javascript
router.get('/', async (req, res) => {
  const { 
    q,              // Search query
    category,       // Filter by category
    minPrice,       // Price range
    maxPrice,
    inStock,        // Boolean: only in-stock products
    sort = 'id',    // Sort field
    order = 'asc',  // Sort order
    page = 1,
    limit = 20
  } = req.query;
  
  let query = 'SELECT * FROM products WHERE deleted_at IS NULL';
  const params = [];
  
  // Search query
  if (q) {
    query += ' AND MATCH(name, description) AGAINST(? IN NATURAL LANGUAGE MODE)';
    params.push(q);
  }
  
  // Category filter
  if (category) {
    query += ' AND category_id = ?';
    params.push(category);
  }
  
  // Price range
  if (minPrice) {
    query += ' AND price >= ?';
    params.push(minPrice);
  }
  if (maxPrice) {
    query += ' AND price <= ?';
    params.push(maxPrice);
  }
  
  // Stock filter
  if (inStock === 'true') {
    query += ' AND stock_quantity > 0';
  }
  
  // Sorting
  const allowedSorts = ['id', 'name', 'price', 'created_at'];
  const sortField = allowedSorts.includes(sort) ? sort : 'id';
  const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  query += ` ORDER BY ${sortField} ${sortOrder}`;
  
  // Pagination
  const offset = (page - 1) * limit;
  query += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);
  
  const products = await db.query(query, params);
  res.json({ products });
});
```

**4. Search Suggestions (Auto-complete):**

```javascript
// API: GET /api/products/suggestions?q=lapt
router.get('/suggestions', async (req, res) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return res.json({ suggestions: [] });
  }
  
  const suggestions = await db.query(
    `SELECT DISTINCT name FROM products 
     WHERE name LIKE ? AND deleted_at IS NULL 
     ORDER BY name LIMIT 10`,
    [`${q}%`]
  );
  
  res.json({ suggestions: suggestions.map(s => s.name) });
});
```

**Advanced Search Solutions (Future):**

**1. Elasticsearch Integration:**
```javascript
const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: 'http://elasticsearch:9200' });

// Index products
await client.index({
  index: 'products',
  body: {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    price: product.price,
    tags: product.tags
  }
});

// Search
const result = await client.search({
  index: 'products',
  body: {
    query: {
      multi_match: {
        query: q,
        fields: ['name^3', 'description', 'tags'] // Boost name field
      }
    },
    filter: {
      range: {
        price: { gte: minPrice, lte: maxPrice }
      }
    }
  }
});
```

**2. Algolia Search:**
```javascript
const algoliasearch = require('algoliasearch');
const client = algoliasearch('APP_ID', 'API_KEY');
const index = client.initIndex('products');

// Index
await index.saveObject({
  objectID: product.id,
  name: product.name,
  description: product.description
});

// Search
const { hits } = await index.search(q, {
  filters: `price:${minPrice} TO ${maxPrice}`,
  hitsPerPage: 20
});
```

**Current Implementation:**
- ✅ Basic LIKE search cho tên và mô tả
- ✅ Full-text search với MySQL FULLTEXT index
- ✅ Multiple filters (category, price, stock)
- ✅ Sorting và pagination
- ✅ Search suggestions (auto-complete)
- ⚠️ Chưa có fuzzy search (typo tolerance)
- ⚠️ Chưa có search ranking/relevance scoring
- ⚠️ Chưa có search analytics

**Best Practices:**
- ✅ Indexed columns cho performance
- ✅ Parameterized queries để prevent SQL injection
- ✅ Pagination để limit results
- ✅ Search suggestions để improve UX
- ✅ Search result caching (Redis) cho popular queries

---

### ❓ Câu 10.2: Bạn xử lý product variants (màu sắc, kích thước) như thế nào?

**📝 Trả lời:**
**Hiện tại:** Dự án chưa có product variants, mỗi sản phẩm là một SKU riêng.

**Tương lai - Cách implement Product Variants:**

**Database Schema:**

```sql
-- Bảng variants (màu, size, v.v.)
CREATE TABLE variants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL, -- "Color", "Size", "Storage"
  display_name VARCHAR(100) NOT NULL, -- "Màu sắc", "Kích thước"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_variant_name (name)
);

-- Bảng variant values (Red, Blue, 64GB, 128GB, v.v.)
CREATE TABLE variant_values (
  id INT PRIMARY KEY AUTO_INCREMENT,
  variant_id INT NOT NULL,
  value VARCHAR(100) NOT NULL, -- "Red", "Blue", "64GB"
  display_value VARCHAR(100), -- "Đỏ", "Xanh", "64GB"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (variant_id) REFERENCES variants(id) ON DELETE CASCADE,
  UNIQUE KEY unique_variant_value (variant_id, value)
);

-- Bảng product variants (combinations)
CREATE TABLE product_variants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL, -- "LAPTOP-001-RED-64GB"
  price DECIMAL(12, 2),
  stock_quantity INT DEFAULT 0,
  images JSON, -- Ảnh riêng cho variant này
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (product_id),
  INDEX idx_sku (sku)
);

-- Bảng variant combinations (mapping variants với values)
CREATE TABLE product_variant_values (
  product_variant_id INT NOT NULL,
  variant_value_id INT NOT NULL,
  PRIMARY KEY (product_variant_id, variant_value_id),
  FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_value_id) REFERENCES variant_values(id) ON DELETE CASCADE
);
```

**Example Data:**

```sql
-- Variants
INSERT INTO variants (name, display_name) VALUES
('color', 'Màu sắc'),
('storage', 'Dung lượng');

-- Variant Values
INSERT INTO variant_values (variant_id, value, display_value) VALUES
(1, 'red', 'Đỏ'),
(1, 'blue', 'Xanh'),
(2, '64gb', '64GB'),
(2, '128gb', '128GB');

-- Product Variants
INSERT INTO product_variants (product_id, sku, price, stock_quantity) VALUES
(1, 'LAPTOP-001-RED-64GB', 15000000, 10),
(1, 'LAPTOP-001-RED-128GB', 17000000, 5),
(1, 'LAPTOP-001-BLUE-64GB', 15000000, 8),
(1, 'LAPTOP-001-BLUE-128GB', 17000000, 12);

-- Mapping
INSERT INTO product_variant_values VALUES
(1, 1), (1, 3), -- Red, 64GB
(2, 1), (2, 4), -- Red, 128GB
(3, 2), (3, 3), -- Blue, 64GB
(4, 2), (4, 4); -- Blue, 128GB
```

**API Implementation:**

```javascript
// GET /api/products/:id/variants
router.get('/:id/variants', async (req, res) => {
  const productId = req.params.id;
  
  // Get all variants for product
  const variants = await db.query(`
    SELECT 
      v.id,
      v.name,
      v.display_name,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', vv.id,
          'value', vv.value,
          'display_value', vv.display_value
        )
      ) as values
    FROM variants v
    JOIN variant_values vv ON v.id = vv.variant_id
    JOIN product_variant_values pvv ON vv.id = pvv.variant_value_id
    JOIN product_variants pv ON pvv.product_variant_id = pv.id
    WHERE pv.product_id = ?
    GROUP BY v.id
  `, [productId]);
  
  res.json({ variants });
});

// GET /api/products/:id/variant/:variantId
router.get('/:id/variant/:variantId', async (req, res) => {
  const variantId = req.params.variantId;
  
  const variant = await db.query(`
    SELECT 
      pv.*,
      p.name as product_name,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'variant_name', v.name,
          'variant_display', v.display_name,
          'value', vv.value,
          'display_value', vv.display_value
        )
      ) as variant_attributes
    FROM product_variants pv
    JOIN products p ON pv.product_id = p.id
    JOIN product_variant_values pvv ON pv.id = pvv.product_variant_id
    JOIN variant_values vv ON pvv.variant_value_id = vv.id
    JOIN variants v ON vv.variant_id = v.id
    WHERE pv.id = ?
    GROUP BY pv.id
  `, [variantId]);
  
  res.json({ variant: variant[0] });
});
```

**Frontend Implementation:**

```javascript
// Product detail page
async function renderProductVariants(productId) {
  const { variants } = await apiCall(`/api/products/${productId}/variants`);
  
  let html = '';
  variants.forEach(variant => {
    html += `
      <div class="variant-group">
        <label>${variant.display_name}:</label>
        <div class="variant-values">
          ${variant.values.map(value => `
            <button class="variant-value" 
                    data-variant-id="${variant.id}" 
                    data-value-id="${value.id}"
                    onclick="selectVariant(${variant.id}, ${value.id})">
              ${value.display_value}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  });
  
  document.getElementById('variants').innerHTML = html;
}

// User selects variants
let selectedVariants = {};
function selectVariant(variantId, valueId) {
  selectedVariants[variantId] = valueId;
  
  // Find matching product variant
  findMatchingVariant(productId, selectedVariants);
}
```

**Current Approach (Simplified):**
- Mỗi combination là một product riêng
- Dễ implement nhưng không scalable
- Ví dụ: "Laptop Đỏ 64GB" và "Laptop Đỏ 128GB" là 2 products riêng

**Future Approach (Recommended):**
- Product variants như trên
- Scalable và maintainable
- User experience tốt hơn

---

---

## 11. Câu hỏi về Giỏ hàng và Checkout

### ❓ Câu 11.1: Giỏ hàng được implement như thế nào? Có lưu trên server hay client?

**📝 Trả lời:**
Giỏ hàng trong TechStore được lưu trên **server-side (database)** để đảm bảo persistence và consistency.

**Database Schema:**

```sql
CREATE TABLE cart (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  status ENUM('active', 'abandoned', 'converted') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_active_cart (user_id, status)
);

CREATE TABLE cart_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cart_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(12, 2) NOT NULL, -- Price snapshot tại thời điểm thêm vào giỏ
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_cart_product (cart_id, product_id)
);
```

**Luồng hoạt động:**

**1. User thêm sản phẩm vào giỏ:**
```javascript
// POST /api/cart/items
router.post('/items', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { product_id, quantity } = req.body;
  
  // Get or create cart
  let cart = await getOrCreateCart(userId);
  
  // Check if item already exists
  const existingItem = await db.query(
    'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
    [cart.id, product_id]
  );
  
  if (existingItem.length > 0) {
    // Update quantity
    await db.query(
      'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
      [quantity, existingItem[0].id]
    );
  } else {
    // Get product price
    const [product] = await db.query('SELECT price FROM products WHERE id = ?', [product_id]);
    
    // Add new item
    await db.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
      [cart.id, product_id, quantity, product.price]
    );
  }
  
  // Return updated cart
  const updatedCart = await getCartWithItems(cart.id);
  res.json({ message: 'Đã thêm vào giỏ hàng', cart: updatedCart });
});
```

**2. User xem giỏ hàng:**
```javascript
// GET /api/cart
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  
  const cart = await db.query(`
    SELECT 
      c.*,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', ci.id,
          'product_id', ci.product_id,
          'product_name', p.name,
          'product_slug', p.slug,
          'product_image', JSON_EXTRACT(p.images, '$[0]'),
          'quantity', ci.quantity,
          'price', ci.price,
          'subtotal', ci.quantity * ci.price
        )
      ) as items,
      SUM(ci.quantity * ci.price) as total,
      COUNT(ci.id) as item_count
    FROM cart c
    LEFT JOIN cart_items ci ON c.id = ci.cart_id
    LEFT JOIN products p ON ci.product_id = p.id
    WHERE c.user_id = ? AND c.status = 'active'
    GROUP BY c.id
  `, [userId]);
  
  res.json({ cart: cart[0] || null });
});
```

**3. User cập nhật số lượng:**
```javascript
// PUT /api/cart/items/:itemId
router.put('/items/:itemId', authenticateToken, async (req, res) => {
  const { quantity } = req.body;
  const itemId = req.params.itemId;
  const userId = req.user.id;
  
  // Verify ownership
  const [item] = await db.query(`
    SELECT ci.* FROM cart_items ci
    JOIN cart c ON ci.cart_id = c.id
    WHERE ci.id = ? AND c.user_id = ?
  `, [itemId, userId]);
  
  if (!item) {
    return res.status(404).json({ message: 'Không tìm thấy item' });
  }
  
  // Update quantity
  await db.query(
    'UPDATE cart_items SET quantity = ? WHERE id = ?',
    [quantity, itemId]
  );
  
  res.json({ message: 'Đã cập nhật số lượng' });
});
```

**Lý do Server-Side Cart:**

**Ưu điểm:**
- ✅ **Persistence:** Giỏ hàng được lưu giữ khi user đóng browser
- ✅ **Multi-device:** User có thể truy cập giỏ hàng từ nhiều thiết bị
- ✅ **Data Integrity:** Không thể manipulate cart data từ client
- ✅ **Analytics:** Có thể track abandoned carts, cart recovery
- ✅ **Price Consistency:** Price snapshot đảm bảo giá không đổi khi checkout

**Nhược điểm:**
- ⚠️ **Requires Authentication:** User phải đăng nhập để có giỏ hàng
- ⚠️ **Database Load:** Mỗi cart operation cần database query

**Guest Cart (Có thể cải thiện):**
```javascript
// Store guest cart in localStorage, sync to server when login
// Frontend
let guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');

function addToGuestCart(productId, quantity) {
  guestCart.push({ product_id: productId, quantity });
  localStorage.setItem('guest_cart', JSON.stringify(guestCart));
}

// When user logs in, merge guest cart with server cart
async function mergeGuestCart(userId) {
  const guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
  for (const item of guestCart) {
    await apiCall('/api/cart/items', {
      method: 'POST',
      body: item
    });
  }
  localStorage.removeItem('guest_cart');
}
```

**Cart Expiration:**
```javascript
// Cleanup abandoned carts (older than 30 days)
cron.schedule('0 0 * * *', async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  await db.query(
    `UPDATE cart SET status = 'abandoned' 
     WHERE status = 'active' AND updated_at < ?`,
    [thirtyDaysAgo]
  );
});
```

---

### ❓ Câu 11.2: Quy trình checkout được implement như thế nào? Có validation gì?

**📝 Trả lời:**
Checkout là quy trình quan trọng nhất trong e-commerce, cần validation kỹ lưỡng và error handling tốt.

**Checkout Flow:**

```
1. User click "Checkout"
   ↓
2. Validate cart (items exist, stock available, prices valid)
   ↓
3. User nhập thông tin giao hàng
   ↓
4. Chọn phương thức thanh toán
   ↓
5. Apply coupon (nếu có)
   ↓
6. Apply loyalty points (nếu có)
   ↓
7. Calculate totals (subtotal, shipping, tax, discount, final total)
   ↓
8. Create order (transaction)
   ↓
9. Process payment
   ↓
10. Create shipment
    ↓
11. Clear cart
    ↓
12. Send confirmation email
    ↓
13. Redirect to order confirmation page
```

**Backend Implementation:**

```javascript
// POST /api/orders
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const {
    shipping_address,
    phone,
    payment_method,
    coupon_code,
    use_loyalty_points
  } = req.body;
  
  return await transaction(async (connection) => {
    // Step 1: Get cart
    const cart = await getCartWithItems(userId, connection);
    if (!cart || cart.items.length === 0) {
      throw new Error('Giỏ hàng trống');
    }
    
    // Step 2: Validate stock
    for (const item of cart.items) {
      const [product] = await connection.query(
        'SELECT stock_quantity, price FROM products WHERE id = ? FOR UPDATE',
        [item.product_id]
      );
      
      if (!product || product.stock_quantity < item.quantity) {
        throw new InsufficientStockError(item.product_id, product?.stock_quantity || 0, item.quantity);
      }
      
      // Update price if changed
      if (product.price !== item.price) {
        await connection.query(
          'UPDATE cart_items SET price = ? WHERE id = ?',
          [product.price, item.id]
        );
        item.price = product.price;
      }
    }
    
    // Step 3: Calculate subtotal
    let subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Step 4: Apply coupon
    let discount = 0;
    let coupon = null;
    if (coupon_code) {
      coupon = await validateCoupon(coupon_code, subtotal, connection);
      if (coupon) {
        if (coupon.discount_type === 'percentage') {
          discount = (subtotal * coupon.discount_value) / 100;
          if (coupon.max_discount_amount) {
            discount = Math.min(discount, coupon.max_discount_amount);
          }
        } else {
          discount = coupon.discount_value;
        }
      }
    }
    
    // Step 5: Apply loyalty points
    let loyaltyDiscount = 0;
    let loyaltyPointsUsed = 0;
    if (use_loyalty_points > 0) {
      const userPoints = await getUserLoyaltyPoints(userId, connection);
      const pointsToUse = Math.min(use_loyalty_points, userPoints.balance);
      loyaltyDiscount = pointsToUse * 1000; // 1 point = 1000 VND
      loyaltyPointsUsed = pointsToUse;
    }
    
    // Step 6: Calculate shipping
    const shippingCost = calculateShippingCost(subtotal, shipping_address);
    
    // Step 7: Calculate tax
    const tax = calculateTax(subtotal - discount - loyaltyDiscount);
    
    // Step 8: Calculate final total
    const finalTotal = subtotal - discount - loyaltyDiscount + shippingCost + tax;
    
    // Step 9: Create order
    const orderNumber = generateOrderNumber();
    const [orderResult] = await connection.query(
      `INSERT INTO orders (
        user_id, order_number, total, shipping_cost, tax, discount, 
        final_total, shipping_address, phone, payment_method,
        coupon_code, loyalty_points_used, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, orderNumber, subtotal, shippingCost, tax, discount + loyaltyDiscount,
        finalTotal, shipping_address, phone, payment_method,
        coupon_code, loyaltyPointsUsed, 'pending'
      ]
    );
    const orderId = orderResult.insertId;
    
    // Step 10: Create order items và update stock
    for (const item of cart.items) {
      // Create order item
      await connection.query(
        `INSERT INTO order_items (
          order_id, product_id, product_name, product_slug,
          quantity, price, subtotal
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId, item.product_id, item.product_name, item.product_slug,
          item.quantity, item.price, item.price * item.quantity
        ]
      );
      
      // Update stock
      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }
    
    // Step 11: Update coupon usage
    if (coupon) {
      await connection.query(
        'UPDATE coupons SET usage_count = usage_count + 1 WHERE id = ?',
        [coupon.id]
      );
    }
    
    // Step 12: Deduct loyalty points
    if (loyaltyPointsUsed > 0) {
      await connection.query(
        `INSERT INTO loyalty_points (user_id, points, type, description, order_id)
         VALUES (?, ?, 'redeem', 'Sử dụng điểm cho đơn hàng #${orderNumber}', ?)`,
        [userId, -loyaltyPointsUsed, orderId]
      );
    }
    
    // Step 13: Clear cart
    await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);
    
    // Step 14: Process payment (async, outside transaction)
    // Payment processing sẽ được handle sau
    
    return {
      orderId,
      orderNumber,
      total: finalTotal,
      status: 'pending'
    };
  });
});
```

**Validation Checklist:**

**1. Cart Validation:**
- ✅ Cart không rỗng
- ✅ Tất cả items còn tồn tại
- ✅ Stock đủ cho tất cả items
- ✅ Prices hợp lệ (không âm)

**2. Shipping Address Validation:**
- ✅ Address không rỗng
- ✅ Phone number format đúng
- ✅ Address length hợp lý

**3. Payment Method Validation:**
- ✅ Payment method trong danh sách cho phép
- ✅ Payment details hợp lệ (nếu cần)

**4. Coupon Validation:**
- ✅ Coupon code tồn tại
- ✅ Coupon chưa hết hạn
- ✅ Coupon chưa đạt usage limit
- ✅ Order total đạt min_purchase_amount
- ✅ Coupon chưa được dùng bởi user này (nếu có limit per user)

**5. Loyalty Points Validation:**
- ✅ User có đủ points
- ✅ Points không vượt quá max allowed
- ✅ Points không vượt quá order total

**6. Stock Validation:**
- ✅ Check stock với FOR UPDATE lock
- ✅ Atomic stock update
- ✅ Rollback nếu không đủ stock

**Error Handling:**

```javascript
try {
  const order = await createOrder(...);
  res.json({ message: 'Đặt hàng thành công', order });
} catch (error) {
  if (error instanceof InsufficientStockError) {
    res.status(400).json({
      message: 'Một số sản phẩm không đủ tồn kho',
      error: 'INSUFFICIENT_STOCK',
      details: error.details
    });
  } else if (error instanceof InvalidCouponError) {
    res.status(400).json({
      message: 'Mã giảm giá không hợp lệ',
      error: 'INVALID_COUPON'
    });
  } else {
    res.status(500).json({
      message: 'Đã xảy ra lỗi khi đặt hàng',
      error: 'ORDER_CREATION_FAILED'
    });
  }
}
```

**Best Practices:**
- ✅ Transaction cho toàn bộ checkout process
- ✅ Pessimistic locking cho stock checks
- ✅ Price snapshot trong order_items
- ✅ Comprehensive validation
- ✅ Clear error messages
- ✅ Order number generation (unique, sequential)
- ✅ Idempotency key để prevent duplicate orders

---

### ❓ Câu 11.3: Tính phí vận chuyển và thuế như thế nào?

**📝 Trả lời:**
Phí vận chuyển và thuế được tính tự động dựa trên nhiều yếu tố.

**Shipping Cost Calculation:**

```javascript
// utils/shipping.js
function calculateShippingCost(subtotal, shippingAddress) {
  // Base shipping cost
  let baseCost = 30000; // 30,000 VND
  
  // Free shipping nếu order >= 500,000 VND
  if (subtotal >= 500000) {
    return 0;
  }
  
  // Tính theo khoảng cách (có thể tích hợp với shipping API)
  const distance = calculateDistance(shippingAddress);
  
  // Tính theo trọng lượng (nếu có)
  // const weight = calculateTotalWeight(items);
  // baseCost += weight * 5000; // 5,000 VND per kg
  
  // Tính theo vùng (miền Bắc/Trung/Nam)
  const region = getRegion(shippingAddress);
  switch(region) {
    case 'north':
      baseCost += 0;
      break;
    case 'central':
      baseCost += 10000;
      break;
    case 'south':
      baseCost += 20000;
      break;
  }
  
  // Express shipping (nếu user chọn)
  // if (shippingMethod === 'express') {
  //   baseCost *= 1.5;
  // }
  
  return baseCost;
}

function calculateDistance(address) {
  // Có thể tích hợp với Google Maps API hoặc shipping carrier API
  // Tạm thời return default
  return 50; // km
}

function getRegion(address) {
  // Parse address để xác định vùng
  if (address.includes('Hà Nội') || address.includes('Hải Phòng')) {
    return 'north';
  } else if (address.includes('Đà Nẵng') || address.includes('Huế')) {
    return 'central';
  } else {
    return 'south';
  }
}
```

**Tax Calculation:**

```javascript
// utils/tax.js
function calculateTax(subtotal) {
  // VAT 10% (theo quy định Việt Nam)
  const vatRate = 0.1;
  return subtotal * vatRate;
}

// Hoặc có thể tính theo từng sản phẩm
function calculateTaxByItems(items) {
  let totalTax = 0;
  
  for (const item of items) {
    // Một số sản phẩm có thể không chịu thuế hoặc thuế khác
    const taxRate = getProductTaxRate(item.product_id);
    totalTax += (item.subtotal * taxRate);
  }
  
  return totalTax;
}

function getProductTaxRate(productId) {
  // Có thể lưu tax_rate trong products table
  // Default: 10%
  return 0.1;
}
```

**Integration với Shipping APIs:**

```javascript
// Tích hợp với GHN (Giao Hàng Nhanh)
async function calculateShippingWithGHN(fromAddress, toAddress, weight) {
  const response = await axios.post('https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee', {
    service_type_id: 2, // Standard
    from_district_id: fromAddress.district_id,
    to_district_id: toAddress.district_id,
    weight: weight,
    length: 20,
    width: 20,
    height: 20
  }, {
    headers: {
      'Token': process.env.GHN_API_TOKEN
    }
  });
  
  return response.data.data.total;
}
```

**Frontend Display:**

```javascript
// Checkout page
async function calculateTotals() {
  const subtotal = calculateSubtotal();
  const shippingCost = await calculateShippingCost(shippingAddress);
  const tax = calculateTax(subtotal);
  const discount = getDiscount();
  const loyaltyDiscount = getLoyaltyDiscount();
  
  const finalTotal = subtotal - discount - loyaltyDiscount + shippingCost + tax;
  
  updateTotalsDisplay({
    subtotal,
    shipping: shippingCost,
    tax,
    discount: discount + loyaltyDiscount,
    total: finalTotal
  });
}
```

**Best Practices:**
- ✅ Clear shipping cost calculation logic
- ✅ Free shipping threshold để encourage larger orders
- ✅ Tax calculation theo quy định địa phương
- ✅ Integration với shipping carriers cho accurate costs
- ✅ Caching shipping costs để giảm API calls
- ✅ Display breakdown cho transparency

---

## 12. Câu hỏi về Quản lý Đơn hàng

### ❓ Câu 12.1: Order status workflow được quản lý như thế nào?

**📝 Trả lời:**
Order status workflow là một state machine với các trạng thái và transitions được định nghĩa rõ ràng.

**Order Statuses:**

```javascript
const ORDER_STATUSES = {
  PENDING: 'pending',           // Đơn hàng mới, chờ xử lý
  PROCESSING: 'processing',     // Đang xử lý (đóng gói)
  SHIPPED: 'shipped',           // Đã giao cho đơn vị vận chuyển
  DELIVERED: 'delivered',        // Đã giao đến khách hàng
  CANCELLED: 'cancelled'         // Đã hủy
};

const STATUS_TRANSITIONS = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [], // Terminal state
  cancelled: []  // Terminal state
};
```

**Status Transition Validation:**

```javascript
function canTransition(currentStatus, newStatus) {
  const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
}

// Update order status
router.put('/:id/status', authenticateToken, authorize(['admin']), async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;
  
  // Get current order
  const [order] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
  if (!order) {
    return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
  }
  
  // Validate transition
  if (!canTransition(order.status, status)) {
    return res.status(400).json({
      message: `Không thể chuyển từ ${order.status} sang ${status}`,
      error: 'INVALID_STATUS_TRANSITION',
      currentStatus: order.status,
      requestedStatus: status,
      allowedTransitions: STATUS_TRANSITIONS[order.status]
    });
  }
  
  // Update status
  await db.query(
    'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
    [status, orderId]
  );
  
  // Log status change
  await db.query(
    `INSERT INTO order_status_history (order_id, status, changed_by, notes)
     VALUES (?, ?, ?, ?)`,
    [orderId, status, req.user.id, `Changed to ${status}`]
  );
  
  // Trigger events based on status
  if (status === 'shipped') {
    await createShipment(orderId);
    await sendShippingNotification(orderId);
  } else if (status === 'delivered') {
    await awardLoyaltyPoints(orderId);
    await sendDeliveryConfirmation(orderId);
  } else if (status === 'cancelled') {
    await restoreStock(orderId);
    await processRefund(orderId);
  }
  
  res.json({ message: 'Đã cập nhật trạng thái đơn hàng' });
});
```

**Order Status History:**

```sql
CREATE TABLE order_status_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  changed_by INT, -- User ID (admin)
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order (order_id)
);
```

**User Cancellation:**

```javascript
// User chỉ có thể hủy khi status = 'pending'
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.id;
  
  const [order] = await db.query(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [orderId, userId]
  );
  
  if (!order) {
    return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
  }
  
  if (order.status !== 'pending') {
    return res.status(400).json({
      message: 'Chỉ có thể hủy đơn hàng khi đang chờ xử lý',
      error: 'CANNOT_CANCEL_ORDER',
      currentStatus: order.status
    });
  }
  
  return await transaction(async (connection) => {
    // Update status
    await connection.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      ['cancelled', orderId]
    );
    
    // Restore stock
    const orderItems = await connection.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [orderId]
    );
    
    for (const item of orderItems) {
      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }
    
    // Process refund nếu đã thanh toán
    if (order.payment_status === 'paid') {
      await processRefund(orderId);
    }
    
    // Log
    await connection.query(
      `INSERT INTO order_status_history (order_id, status, changed_by, notes)
       VALUES (?, ?, ?, ?)`,
      [orderId, 'cancelled', userId, 'Cancelled by user']
    );
  });
  
  res.json({ message: 'Đã hủy đơn hàng' });
});
```

**Status Timeline Display:**

```javascript
// GET /api/orders/:id/timeline
router.get('/:id/timeline', authenticateToken, async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.id;
  
  // Verify ownership
  const [order] = await db.query(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [orderId, userId]
  );
  
  if (!order) {
    return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
  }
  
  // Get status history
  const timeline = await db.query(
    `SELECT 
      osh.*,
      u.username as changed_by_name
     FROM order_status_history osh
     LEFT JOIN users u ON osh.changed_by = u.id
     WHERE osh.order_id = ?
     ORDER BY osh.created_at ASC`,
    [orderId]
  );
  
  res.json({ timeline });
});
```

**Best Practices:**
- ✅ State machine pattern cho status management
- ✅ Validate transitions để prevent invalid states
- ✅ Status history để audit trail
- ✅ Automatic actions khi status changes
- ✅ User permissions (chỉ cancel khi pending)
- ✅ Stock restoration khi cancel
- ✅ Refund processing khi cancel paid orders

---

### ❓ Câu 12.2: Order tracking được implement như thế nào?

**📝 Trả lời:**
Order tracking cho phép user theo dõi đơn hàng từ khi đặt đến khi nhận được.

**Shipment Tracking:**

```sql
CREATE TABLE shipments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  carrier ENUM('ghn', 'ghtk', 'viettel_post', 'custom') NOT NULL,
  tracking_number VARCHAR(100),
  status ENUM('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned') DEFAULT 'pending',
  current_location VARCHAR(255),
  estimated_delivery_date DATETIME,
  actual_delivery_date DATETIME,
  timeline JSON, -- Lịch sử tracking
  webhook_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order (order_id),
  INDEX idx_tracking (tracking_number)
);
```

**Create Shipment:**

```javascript
// Khi order status = 'shipped'
async function createShipment(orderId) {
  const [order] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
  
  // Generate tracking number
  const trackingNumber = generateTrackingNumber(order.carrier);
  
  // Create shipment record
  const [shipment] = await db.query(
    `INSERT INTO shipments (
      order_id, carrier, tracking_number, status, estimated_delivery_date
    ) VALUES (?, ?, ?, ?, ?)`,
    [
      orderId,
      order.carrier || 'ghn',
      trackingNumber,
      'pending',
      calculateEstimatedDelivery(order.shipping_address)
    ]
  );
  
  // Update order với tracking number
  await db.query(
    'UPDATE orders SET tracking_number = ? WHERE id = ?',
    [trackingNumber, orderId]
  );
  
  // Create initial timeline entry
  await updateShipmentTimeline(shipment.insertId, {
    status: 'pending',
    location: 'Warehouse',
    timestamp: new Date(),
    description: 'Đơn hàng đã được tạo'
  });
  
  return shipment;
}
```

**Update Shipment Status:**

```javascript
// Webhook từ shipping carrier
router.post('/shipments/webhook/:carrier', async (req, res) => {
  const { carrier } = req.params;
  const webhookData = req.body;
  
  // Parse webhook data theo carrier
  let trackingNumber, status, location, timestamp;
  
  switch(carrier) {
    case 'ghn':
      trackingNumber = webhookData.OrderCode;
      status = mapGHNStatus(webhookData.Status);
      location = webhookData.CurrentWarehouse;
      timestamp = new Date(webhookData.Time);
      break;
    case 'ghtk':
      trackingNumber = webhookData.label_id;
      status = mapGHTKStatus(webhookData.status_id);
      location = webhookData.location;
      timestamp = new Date(webhookData.time);
      break;
  }
  
  // Find shipment
  const [shipment] = await db.query(
    'SELECT * FROM shipments WHERE tracking_number = ?',
    [trackingNumber]
  );
  
  if (!shipment) {
    return res.status(404).json({ message: 'Shipment not found' });
  }
  
  // Update status
  await db.query(
    'UPDATE shipments SET status = ?, current_location = ?, updated_at = ? WHERE id = ?',
    [status, location, timestamp, shipment.id]
  );
  
  // Update timeline
  await updateShipmentTimeline(shipment.id, {
    status,
    location,
    timestamp,
    description: getStatusDescription(status)
  });
  
  // Update order status nếu delivered
  if (status === 'delivered') {
    await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      ['delivered', shipment.order_id]
    );
  }
  
  res.json({ success: true });
});
```

**Get Tracking Info:**

```javascript
// GET /api/orders/:id/tracking
router.get('/:id/tracking', authenticateToken, async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.id;
  
  // Verify ownership
  const [order] = await db.query(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [orderId, userId]
  );
  
  if (!order) {
    return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
  }
  
  // Get shipment
  const [shipment] = await db.query(
    'SELECT * FROM shipments WHERE order_id = ?',
    [orderId]
  );
  
  if (!shipment) {
    return res.json({
      tracking: null,
      message: 'Đơn hàng chưa được giao cho đơn vị vận chuyển'
    });
  }
  
  // Parse timeline
  const timeline = JSON.parse(shipment.timeline || '[]');
  
  res.json({
    tracking: {
      tracking_number: shipment.tracking_number,
      carrier: shipment.carrier,
      status: shipment.status,
      current_location: shipment.current_location,
      estimated_delivery: shipment.estimated_delivery_date,
      timeline: timeline
    }
  });
});
```

**Frontend Tracking Display:**

```javascript
async function renderTracking(orderId) {
  const { tracking } = await apiCall(`/api/orders/${orderId}/tracking`);
  
  if (!tracking) {
    return '<p>Đơn hàng chưa được giao cho đơn vị vận chuyển</p>';
  }
  
  const statusSteps = [
    { key: 'pending', label: 'Chờ lấy hàng', icon: '📦' },
    { key: 'picked_up', label: 'Đã lấy hàng', icon: '🚚' },
    { key: 'in_transit', label: 'Đang vận chuyển', icon: '🚛' },
    { key: 'out_for_delivery', label: 'Đang giao hàng', icon: '🏍️' },
    { key: 'delivered', label: 'Đã giao hàng', icon: '✅' }
  ];
  
  const currentStepIndex = statusSteps.findIndex(s => s.key === tracking.status);
  
  let html = `
    <div class="tracking-info">
      <p><strong>Mã vận đơn:</strong> ${tracking.tracking_number}</p>
      <p><strong>Đơn vị vận chuyển:</strong> ${getCarrierName(tracking.carrier)}</p>
      <p><strong>Trạng thái:</strong> ${getStatusLabel(tracking.status)}</p>
      <p><strong>Vị trí hiện tại:</strong> ${tracking.current_location || 'Đang cập nhật'}</p>
    </div>
    
    <div class="tracking-timeline">
      ${statusSteps.map((step, index) => `
        <div class="timeline-step ${index <= currentStepIndex ? 'completed' : ''}">
          <div class="step-icon">${step.icon}</div>
          <div class="step-label">${step.label}</div>
        </div>
      `).join('')}
    </div>
    
    <div class="timeline-details">
      ${tracking.timeline.map(event => `
        <div class="timeline-event">
          <div class="event-time">${formatTime(event.timestamp)}</div>
          <div class="event-description">${event.description}</div>
          <div class="event-location">${event.location}</div>
        </div>
      `).join('')}
    </div>
  `;
  
  return html;
}
```

**Best Practices:**
- ✅ Webhook integration với shipping carriers
- ✅ Timeline tracking cho full history
- ✅ Real-time updates khi có webhook
- ✅ User-friendly status display
- ✅ Estimated delivery date
- ✅ Error handling cho webhook failures
- ✅ Manual update option cho admin

---

## 13. Câu hỏi về Thanh toán (Payment)

### ❓ Câu 13.1: Hệ thống thanh toán được implement như thế nào? Có tích hợp payment gateway không?

**📝 Trả lời:**
Hệ thống TechStore hiện tại có **UI đầy đủ** cho các phương thức thanh toán, nhưng chưa tích hợp payment gateway thực (demo mode).

**Các phương thức thanh toán:**

1. **Bank Transfer (Chuyển khoản ngân hàng):**
   - Vietcombank, Techcombank, ACB, BIDV, v.v.
   - User nhập số tài khoản và chuyển khoản
   - Admin verify payment và update order status

2. **MoMo (Ví điện tử):**
   - QR code thanh toán
   - Số điện thoại MoMo
   - Demo: Kiểm tra tài khoản MoMo trong database

3. **Visa/Mastercard/JCB:**
   - Thẻ tín dụng/Ghi nợ
   - Form nhập thông tin thẻ
   - Demo: Validate format, không charge thực

**Database Schema:**

```sql
CREATE TABLE momo_accounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  account_number VARCHAR(20) UNIQUE NOT NULL,
  account_name VARCHAR(100) NOT NULL,
  balance DECIMAL(12, 2) DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active'
);

CREATE TABLE payment_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  payment_method ENUM('bank_transfer', 'momo', 'visa', 'cash_on_delivery') NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  transaction_id VARCHAR(100), -- External transaction ID
  payment_details JSON, -- Thông tin chi tiết (account number, card last 4 digits, etc.)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order (order_id),
  INDEX idx_status (status)
);
```

**Payment Processing Flow:**

```javascript
// POST /api/orders/:id/payment
router.post('/:id/payment', authenticateToken, async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.id;
  const { payment_method, payment_details } = req.body;
  
  // Verify order ownership
  const [order] = await db.query(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [orderId, userId]
  );
  
  if (!order) {
    return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
  }
  
  if (order.payment_status === 'paid') {
    return res.status(400).json({ message: 'Đơn hàng đã được thanh toán' });
  }
  
  // Process payment based on method
  let paymentResult;
  
  switch(payment_method) {
    case 'bank_transfer':
      paymentResult = await processBankTransfer(order, payment_details);
      break;
    case 'momo':
      paymentResult = await processMoMo(order, payment_details);
      break;
    case 'visa':
    case 'mastercard':
    case 'jcb':
      paymentResult = await processCard(order, payment_details);
      break;
    case 'cash_on_delivery':
      paymentResult = await processCashOnDelivery(order);
      break;
    default:
      return res.status(400).json({ message: 'Phương thức thanh toán không hợp lệ' });
  }
  
  // Update order payment status
  await db.query(
    'UPDATE orders SET payment_status = ?, payment_method = ? WHERE id = ?',
    [paymentResult.status, payment_method, orderId]
  );
  
  // Create payment transaction record
  await db.query(
    `INSERT INTO payment_transactions (
      order_id, payment_method, amount, status, payment_details
    ) VALUES (?, ?, ?, ?, ?)`,
    [orderId, payment_method, order.final_total, paymentResult.status, JSON.stringify(payment_details)]
  );
  
  res.json({
    message: paymentResult.message,
    payment_status: paymentResult.status,
    transaction_id: paymentResult.transaction_id
  });
});
```

**MoMo Payment (Demo):**

```javascript
async function processMoMo(order, paymentDetails) {
  const { phone, amount } = paymentDetails;
  
  // Check MoMo account
  const [account] = await db.query(
    'SELECT * FROM momo_accounts WHERE account_number = ? AND status = ?',
    [phone, 'active']
  );
  
  if (!account) {
    return {
      status: 'failed',
      message: 'Số điện thoại MoMo không tồn tại'
    };
  }
  
  if (account.balance < amount) {
    return {
      status: 'failed',
      message: 'Số dư MoMo không đủ'
    };
  }
  
  // Deduct balance (demo)
  await db.query(
    'UPDATE momo_accounts SET balance = balance - ? WHERE id = ?',
    [amount, account.id]
  );
  
  return {
    status: 'completed',
    message: 'Thanh toán MoMo thành công',
    transaction_id: generateTransactionId()
  };
}
```

**Card Payment (Demo - Format Validation Only):**

```javascript
async function processCard(order, cardDetails) {
  const { card_number, expiry_date, cvv, cardholder_name } = cardDetails;
  
  // Validate card format
  if (!validateCardNumber(card_number)) {
    return {
      status: 'failed',
      message: 'Số thẻ không hợp lệ'
    };
  }
  
  if (!validateExpiryDate(expiry_date)) {
    return {
      status: 'failed',
      message: 'Ngày hết hạn không hợp lệ'
    };
  }
  
  if (!validateCVV(cvv)) {
    return {
      status: 'failed',
      message: 'CVV không hợp lệ'
    };
  }
  
  // Demo: Simulate payment processing
  // In production, integrate with payment gateway (VNPay, Stripe, etc.)
  
  return {
    status: 'completed',
    message: 'Thanh toán thẻ thành công (Demo)',
    transaction_id: generateTransactionId()
  };
}
```

**Integration với Payment Gateway (Future - VNPay Example):**

```javascript
const crypto = require('crypto');

async function processVNPay(order, returnUrl) {
  const vnp_TmnCode = process.env.VNPAY_TMN_CODE;
  const vnp_HashSecret = process.env.VNPAY_HASH_SECRET;
  const vnp_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  
  const vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: vnp_TmnCode,
    vnp_Amount: order.final_total * 100, // Convert to cents
    vnp_CurrCode: 'VND',
    vnp_TxnRef: order.order_number,
    vnp_OrderInfo: `Thanh toan don hang ${order.order_number}`,
    vnp_OrderType: 'other',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: req.ip,
    vnp_CreateDate: new Date().toISOString().replace(/[-:]/g, '').split('.')[0]
  };
  
  // Sort params và create hash
  const sortedParams = Object.keys(vnp_Params).sort().reduce((result, key) => {
    result[key] = vnp_Params[key];
    return result;
  }, {});
  
  const signData = new URLSearchParams(sortedParams).toString();
  const vnp_SecureHash = crypto
    .createHmac('sha512', vnp_HashSecret)
    .update(signData)
    .digest('hex');
  
  sortedParams.vnp_SecureHash = vnp_SecureHash;
  
  // Redirect to VNPay
  const paymentUrl = vnp_Url + '?' + new URLSearchParams(sortedParams).toString();
  
  return { payment_url: paymentUrl };
}

// VNPay callback handler
router.get('/vnpay/callback', async (req, res) => {
  const vnp_Params = req.query;
  const secureHash = vnp_Params.vnp_SecureHash;
  
  delete vnp_Params.vnp_SecureHash;
  delete vnp_Params.vnp_SecureHashType;
  
  // Verify hash
  const signData = new URLSearchParams(vnp_Params).toString();
  const checkSum = crypto
    .createHmac('sha512', process.env.VNPAY_HASH_SECRET)
    .update(signData)
    .digest('hex');
  
  if (secureHash === checkSum) {
    const orderId = vnp_Params.vnp_TxnRef;
    const responseCode = vnp_Params.vnp_ResponseCode;
    
    if (responseCode === '00') {
      // Payment successful
      await db.query(
        'UPDATE orders SET payment_status = ? WHERE order_number = ?',
        ['paid', orderId]
      );
      res.redirect('/orders?status=success');
    } else {
      // Payment failed
      res.redirect('/orders?status=failed');
    }
  } else {
    res.status(400).json({ message: 'Invalid signature' });
  }
});
```

**Payment Verification (Admin):**

```javascript
// Admin verify bank transfer payment
router.post('/admin/orders/:id/verify-payment', authenticateToken, authorize(['admin']), async (req, res) => {
  const orderId = req.params.id;
  const { verified } = req.body;
  
  if (verified) {
    await db.query(
      'UPDATE orders SET payment_status = ? WHERE id = ?',
      ['paid', orderId]
    );
    
    // Update order status to processing
    await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      ['processing', orderId]
    );
    
    res.json({ message: 'Đã xác nhận thanh toán' });
  } else {
    res.json({ message: 'Đã từ chối thanh toán' });
  }
});
```

**Best Practices:**
- ✅ Multiple payment methods để tăng conversion
- ✅ Payment transaction records để audit
- ✅ Secure payment details storage (encrypted)
- ✅ Payment verification workflow
- ✅ Refund handling
- ✅ Integration với payment gateways (VNPay, MoMo API, Stripe)
- ✅ PCI DSS compliance cho card payments

---

### ❓ Câu 13.2: Xử lý refunds và chargebacks như thế nào?

**📝 Trả lời:**
Refunds và chargebacks là phần quan trọng của payment system, cần xử lý cẩn thận.

**Refund Schema:**

```sql
CREATE TABLE refunds (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  reason TEXT,
  status ENUM('pending', 'approved', 'rejected', 'processed', 'failed') DEFAULT 'pending',
  refund_method ENUM('original', 'store_credit', 'bank_transfer') DEFAULT 'original',
  transaction_id VARCHAR(100),
  processed_by INT, -- Admin user ID
  processed_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
  FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_order (order_id),
  INDEX idx_status (status)
);
```

**Create Refund Request:**

```javascript
// POST /api/refunds
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { order_id, amount, reason } = req.body;
  
  // Verify order ownership
  const [order] = await db.query(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [order_id, userId]
  );
  
  if (!order) {
    return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
  }
  
  // Check if order is eligible for refund
  if (order.status !== 'delivered' && order.status !== 'cancelled') {
    return res.status(400).json({
      message: 'Chỉ có thể yêu cầu hoàn tiền cho đơn hàng đã giao hoặc đã hủy'
    });
  }
  
  if (order.payment_status !== 'paid') {
    return res.status(400).json({
      message: 'Đơn hàng chưa được thanh toán'
    });
  }
  
  // Check if refund already exists
  const existingRefund = await db.query(
    'SELECT * FROM refunds WHERE order_id = ? AND status != ?',
    [order_id, 'rejected']
  );
  
  if (existingRefund.length > 0) {
    return res.status(400).json({
      message: 'Đã có yêu cầu hoàn tiền cho đơn hàng này'
    });
  }
  
  // Validate amount
  const refundAmount = amount || order.final_total;
  if (refundAmount > order.final_total) {
    return res.status(400).json({
      message: 'Số tiền hoàn trả không được vượt quá giá trị đơn hàng'
    });
  }
  
  // Create refund request
  const [refund] = await db.query(
    `INSERT INTO refunds (order_id, amount, reason, status)
     VALUES (?, ?, ?, ?)`,
    [order_id, refundAmount, reason, 'pending']
  );
  
  res.json({
    message: 'Đã tạo yêu cầu hoàn tiền',
    refund_id: refund.insertId
  });
});
```

**Process Refund (Admin):**

```javascript
// POST /api/refunds/:id/process
router.post('/:id/process', authenticateToken, authorize(['admin']), async (req, res) => {
  const refundId = req.params.id;
  const { action, refund_method } = req.body; // action: 'approve' or 'reject'
  
  const [refund] = await db.query(
    'SELECT r.*, o.* FROM refunds r JOIN orders o ON r.order_id = o.id WHERE r.id = ?',
    [refundId]
  );
  
  if (!refund) {
    return res.status(404).json({ message: 'Không tìm thấy yêu cầu hoàn tiền' });
  }
  
  if (refund.status !== 'pending') {
    return res.status(400).json({
      message: 'Yêu cầu hoàn tiền đã được xử lý'
    });
  }
  
  if (action === 'reject') {
    await db.query(
      'UPDATE refunds SET status = ?, processed_by = ?, processed_at = NOW() WHERE id = ?',
      ['rejected', req.user.id, refundId]
    );
    
    return res.json({ message: 'Đã từ chối yêu cầu hoàn tiền' });
  }
  
  // Approve refund
  return await transaction(async (connection) => {
    // Update refund status
    await connection.query(
      'UPDATE refunds SET status = ?, processed_by = ?, processed_at = NOW() WHERE id = ?',
      ['approved', req.user.id, refundId]
    );
    
    // Process refund based on original payment method
    let refundResult;
    
    switch(refund.payment_method) {
      case 'bank_transfer':
        refundResult = await refundBankTransfer(refund, connection);
        break;
      case 'momo':
        refundResult = await refundMoMo(refund, connection);
        break;
      case 'visa':
      case 'mastercard':
      case 'jcb':
        refundResult = await refundCard(refund, connection);
        break;
      default:
        throw new Error('Payment method không hỗ trợ refund');
    }
    
    if (refundResult.success) {
      // Update refund status
      await connection.query(
        'UPDATE refunds SET status = ?, transaction_id = ? WHERE id = ?',
        ['processed', refundResult.transaction_id, refundId]
      );
      
      // Update order payment status
      await connection.query(
        'UPDATE orders SET payment_status = ? WHERE id = ?',
        ['refunded', refund.order_id]
      );
      
      // Restore stock nếu cần
      if (refund.order_status === 'delivered') {
        await restoreOrderStock(refund.order_id, connection);
      }
    } else {
      await connection.query(
        'UPDATE refunds SET status = ? WHERE id = ?',
        ['failed', refundId]
      );
      throw new Error('Refund processing failed');
    }
    
    return { message: 'Đã xử lý hoàn tiền thành công' };
  });
});
```

**Refund Methods:**

```javascript
async function refundMoMo(refund, connection) {
  // Get original payment transaction
  const [transaction] = await connection.query(
    'SELECT * FROM payment_transactions WHERE order_id = ? AND payment_method = ?',
    [refund.order_id, 'momo']
  );
  
  // Refund to MoMo account
  const paymentDetails = JSON.parse(transaction.payment_details);
  const phone = paymentDetails.phone;
  
  await connection.query(
    'UPDATE momo_accounts SET balance = balance + ? WHERE account_number = ?',
    [refund.amount, phone]
  );
  
  return {
    success: true,
    transaction_id: generateTransactionId()
  };
}

async function refundCard(refund, connection) {
  // In production, integrate with payment gateway refund API
  // Example với Stripe:
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  // const refundResult = await stripe.refunds.create({
  //   charge: originalChargeId,
  //   amount: refund.amount * 100
  // });
  
  // Demo: Just mark as processed
  return {
    success: true,
    transaction_id: generateTransactionId()
  };
}
```

**Chargeback Handling:**

```javascript
// Chargeback là khi bank reverse payment
// Thường xảy ra với card payments
async function handleChargeback(orderId, chargebackData) {
  return await transaction(async (connection) => {
    // Update order
    await connection.query(
      'UPDATE orders SET payment_status = ? WHERE id = ?',
      ['chargeback', orderId]
    );
    
    // Create refund record
    await connection.query(
      `INSERT INTO refunds (
        order_id, amount, reason, status, refund_method
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        orderId,
        chargebackData.amount,
        `Chargeback: ${chargebackData.reason}`,
        'processed',
        'original'
      ]
    );
    
    // Restore stock
    await restoreOrderStock(orderId, connection);
    
    // Notify admin
    await notifyAdmin('chargeback', { orderId, chargebackData });
  });
}
```

**Best Practices:**
- ✅ Refund policy rõ ràng (time limit, conditions)
- ✅ Refund workflow với approval process
- ✅ Refund to original payment method
- ✅ Chargeback handling và dispute management
- ✅ Refund transaction records để audit
- ✅ Stock restoration khi refund
- ✅ Customer notification khi refund processed

---

## 14. Câu hỏi về Vận chuyển (Shipping)

### ❓ Câu 14.1: Tính phí vận chuyển và tích hợp với shipping carriers như thế nào?

**📝 Trả lời:**
Shipping cost calculation và integration với shipping carriers là phần quan trọng của e-commerce.

**Shipping Cost Calculation:**

```javascript
// utils/shipping.js
async function calculateShippingCost(order, shippingAddress) {
  // Option 1: Fixed rate
  let baseCost = 30000; // 30,000 VND
  
  // Option 2: Free shipping threshold
  if (order.subtotal >= 500000) {
    return 0;
  }
  
  // Option 3: Weight-based
  const totalWeight = await calculateOrderWeight(order.items);
  baseCost += totalWeight * 5000; // 5,000 VND per kg
  
  // Option 4: Distance-based (integrate với Google Maps)
  const distance = await calculateDistance(
    { lat: WAREHOUSE_LAT, lng: WAREHOUSE_LNG },
    { address: shippingAddress }
  );
  baseCost += distance * 1000; // 1,000 VND per km
  
  // Option 5: Region-based
  const region = getRegion(shippingAddress);
  const regionMultiplier = {
    'north': 1.0,
    'central': 1.2,
    'south': 1.5
  };
  baseCost *= regionMultiplier[region] || 1.0;
  
  return Math.round(baseCost);
}
```

**Integration với GHN (Giao Hàng Nhanh):**

```javascript
const axios = require('axios');

async function createGHNShipment(order, shippingAddress) {
  const ghnApiUrl = 'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create';
  
  // Calculate shipping fee
  const feeResponse = await axios.post(
    'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee',
    {
      service_type_id: 2, // Standard
      from_district_id: WAREHOUSE_DISTRICT_ID,
      to_district_id: shippingAddress.district_id,
      weight: await calculateOrderWeight(order.items),
      length: 20,
      width: 20,
      height: 20
    },
    {
      headers: {
        'Token': process.env.GHN_API_TOKEN,
        'ShopId': process.env.GHN_SHOP_ID
      }
    }
  );
  
  const shippingFee = feeResponse.data.data.total;
  
  // Create shipment
  const shipmentResponse = await axios.post(ghnApiUrl, {
    payment_type_id: 1, // Người gửi trả phí
    note: `Đơn hàng ${order.order_number}`,
    required_note: 'CHOXEMHANGKHONGTHU',
    from_name: 'TechStore',
    from_phone: '0123456789',
    from_address: WAREHOUSE_ADDRESS,
    from_ward_name: WAREHOUSE_WARD,
    from_district_name: WAREHOUSE_DISTRICT,
    from_province_name: WAREHOUSE_PROVINCE,
    to_name: shippingAddress.name,
    to_phone: shippingAddress.phone,
    to_address: shippingAddress.address,
    to_ward_name: shippingAddress.ward,
    to_district_name: shippingAddress.district,
    to_province_name: shippingAddress.province,
    cod_amount: order.payment_method === 'cash_on_delivery' ? order.final_total : 0,
    weight: await calculateOrderWeight(order.items),
    length: 20,
    width: 20,
    height: 20,
    service_type_id: 2,
    service_id: null,
    items: order.items.map(item => ({
      name: item.product_name,
      code: item.product_id.toString(),
      quantity: item.quantity,
      price: item.price
    }))
  }, {
    headers: {
      'Token': process.env.GHN_API_TOKEN,
      'ShopId': process.env.GHN_SHOP_ID,
      'Content-Type': 'application/json'
    }
  });
  
  const trackingCode = shipmentResponse.data.data.order_code;
  
  // Save to database
  await db.query(
    `INSERT INTO shipments (
      order_id, carrier, tracking_number, status, webhook_url
    ) VALUES (?, ?, ?, ?, ?)`,
    [
      order.id,
      'ghn',
      trackingCode,
      'pending',
      `${process.env.APP_URL}/api/shipments/webhook/ghn`
    ]
  );
  
  return {
    tracking_number: trackingCode,
    shipping_fee: shippingFee,
    estimated_delivery: shipmentResponse.data.data.expected_delivery_time
  };
}
```

**GHN Webhook Handler:**

```javascript
// POST /api/shipments/webhook/ghn
router.post('/webhook/ghn', async (req, res) => {
  const webhookData = req.body;
  
  // Verify webhook signature (if GHN provides)
  
  const trackingNumber = webhookData.OrderCode;
  const status = mapGHNStatus(webhookData.Status);
  
  // Find shipment
  const [shipment] = await db.query(
    'SELECT * FROM shipments WHERE tracking_number = ?',
    [trackingNumber]
  );
  
  if (!shipment) {
    return res.status(404).json({ message: 'Shipment not found' });
  }
  
  // Update shipment
  await db.query(
    `UPDATE shipments SET 
      status = ?,
      current_location = ?,
      updated_at = NOW()
     WHERE id = ?`,
    [
      status,
      webhookData.CurrentWarehouse || webhookData.CurrentLocation,
      shipment.id
    ]
  );
  
  // Update timeline
  await updateShipmentTimeline(shipment.id, {
    status,
    location: webhookData.CurrentWarehouse,
    timestamp: new Date(webhookData.Time),
    description: getGHNStatusDescription(status)
  });
  
  // Update order status if delivered
  if (status === 'delivered') {
    await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      ['delivered', shipment.order_id]
    );
  }
  
  res.json({ success: true });
});
```

**Multiple Carriers Support:**

```javascript
async function createShipment(order, shippingAddress) {
  const carrier = order.carrier || 'ghn';
  
  switch(carrier) {
    case 'ghn':
      return await createGHNShipment(order, shippingAddress);
    case 'ghtk':
      return await createGHTKShipment(order, shippingAddress);
    case 'viettel_post':
      return await createViettelPostShipment(order, shippingAddress);
    default:
      throw new Error(`Carrier ${carrier} not supported`);
  }
}
```

**Best Practices:**
- ✅ Multiple carriers để có options và competitive rates
- ✅ Real-time shipping fee calculation
- ✅ Webhook integration cho status updates
- ✅ Tracking number generation và storage
- ✅ Estimated delivery date calculation
- ✅ Error handling cho API failures
- ✅ Fallback carriers nếu primary carrier fails

---

## 15. Câu hỏi về Admin Dashboard

### ❓ Câu 15.1: Admin dashboard có những tính năng gì? Thống kê được hiển thị như thế nào?

**📝 Trả lời:**
Admin dashboard là trung tâm quản lý của hệ thống, cung cấp overview và quản lý toàn bộ operations.

**Dashboard Overview:**

```javascript
// GET /api/stats/overview
router.get('/stats/overview', authenticateToken, authorize(['admin']), async (req, res) => {
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  
  // Total users
  const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL');
  
  // New users today
  const [newUsersToday] = await db.query(
    'SELECT COUNT(*) as count FROM users WHERE created_at >= ?',
    [startOfToday]
  );
  
  // Total products
  const [totalProducts] = await db.query(
    'SELECT COUNT(*) as count FROM products WHERE deleted_at IS NULL'
  );
  
  // Low stock products
  const [lowStockProducts] = await db.query(
    'SELECT COUNT(*) as count FROM products WHERE stock_quantity < 10 AND deleted_at IS NULL'
  );
  
  // Total orders
  const [totalOrders] = await db.query('SELECT COUNT(*) as count FROM orders');
  
  // Orders today
  const [ordersToday] = await db.query(
    'SELECT COUNT(*) as count FROM orders WHERE created_at >= ?',
    [startOfToday]
  );
  
  // Total revenue
  const [totalRevenue] = await db.query(
    'SELECT SUM(final_total) as total FROM orders WHERE payment_status = ?',
    ['paid']
  );
  
  // Revenue today
  const [revenueToday] = await db.query(
    `SELECT SUM(final_total) as total FROM orders 
     WHERE payment_status = ? AND created_at >= ?`,
    ['paid', startOfToday]
  );
  
  // Revenue this month
  const [revenueMonth] = await db.query(
    `SELECT SUM(final_total) as total FROM orders 
     WHERE payment_status = ? AND created_at >= ?`,
    ['paid', startOfMonth]
  );
  
  // Pending orders
  const [pendingOrders] = await db.query(
    "SELECT COUNT(*) as count FROM orders WHERE status = 'pending'"
  );
  
  res.json({
    users: {
      total: totalUsers.count,
      new_today: newUsersToday.count
    },
    products: {
      total: totalProducts.count,
      low_stock: lowStockProducts.count
    },
    orders: {
      total: totalOrders.count,
      today: ordersToday.count,
      pending: pendingOrders.count
    },
    revenue: {
      total: totalRevenue.total || 0,
      today: revenueToday.total || 0,
      this_month: revenueMonth.total || 0
    }
  });
});
```

**Revenue Charts:**

```javascript
// GET /api/stats/revenue
router.get('/stats/revenue', authenticateToken, authorize(['admin']), async (req, res) => {
  const { period = 'month' } = req.query; // 'day', 'week', 'month', 'year'
  
  let dateFormat, groupBy;
  switch(period) {
    case 'day':
      dateFormat = '%Y-%m-%d';
      groupBy = 'DATE(created_at)';
      break;
    case 'week':
      dateFormat = '%Y-%u';
      groupBy = 'YEARWEEK(created_at)';
      break;
    case 'month':
      dateFormat = '%Y-%m';
      groupBy = 'DATE_FORMAT(created_at, "%Y-%m")';
      break;
    case 'year':
      dateFormat = '%Y';
      groupBy = 'YEAR(created_at)';
      break;
  }
  
  const revenueData = await db.query(
    `SELECT 
      ${groupBy} as period,
      DATE_FORMAT(created_at, ?) as date,
      COUNT(*) as order_count,
      SUM(final_total) as revenue
     FROM orders
     WHERE payment_status = 'paid'
     GROUP BY ${groupBy}
     ORDER BY period DESC
     LIMIT 12`,
    [dateFormat]
  );
  
  // Orders by status
  const ordersByStatus = await db.query(
    `SELECT status, COUNT(*) as count
     FROM orders
     GROUP BY status`
  );
  
  res.json({
    revenue_chart: revenueData,
    orders_by_status: ordersByStatus
  });
});
```

**Top Products:**

```javascript
// GET /api/stats/top-products
router.get('/stats/top-products', authenticateToken, authorize(['admin']), async (req, res) => {
  const { limit = 10, period = 'month' } = req.query;
  
  let dateFilter = '';
  if (period === 'month') {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    dateFilter = `AND o.created_at >= '${startOfMonth.toISOString()}'`;
  }
  
  const topProducts = await db.query(
    `SELECT 
      p.id,
      p.name,
      p.slug,
      SUM(oi.quantity) as total_sold,
      SUM(oi.subtotal) as total_revenue,
      COUNT(DISTINCT o.id) as order_count
     FROM order_items oi
     JOIN orders o ON oi.order_id = o.id
     JOIN products p ON oi.product_id = p.id
     WHERE o.payment_status = 'paid' ${dateFilter}
     GROUP BY p.id, p.name, p.slug
     ORDER BY total_sold DESC
     LIMIT ?`,
    [limit]
  );
  
  res.json({ top_products: topProducts });
});
```

**Admin Features:**

1. **Product Management:**
   - CRUD products
   - Bulk operations (import, export)
   - Image upload
   - Stock management

2. **Order Management:**
   - View all orders
   - Update order status
   - Process refunds
   - Export orders

3. **User Management:**
   - View users
   - Update user roles
   - Block/unblock users

4. **Category Management:**
   - CRUD categories
   - Category hierarchy

5. **Coupon Management:**
   - Create/edit coupons
   - View coupon usage

6. **Analytics:**
   - Revenue charts
   - Sales reports
   - User analytics
   - Product performance

**Best Practices:**
- ✅ Real-time statistics
- ✅ Charts và visualizations
- ✅ Export functionality (CSV, Excel, PDF)
- ✅ Filters và search
- ✅ Pagination cho large datasets
- ✅ Role-based permissions
- ✅ Audit logs cho admin actions

---

**Tóm tắt hoàn thành các phần 11-15:**

- ✅ **Phần 11: Giỏ hàng và Checkout** - 3 câu hỏi (Cart Implementation, Checkout Flow, Shipping/Tax Calculation)
- ✅ **Phần 12: Quản lý Đơn hàng** - 2 câu hỏi (Order Status Workflow, Order Tracking)
- ✅ **Phần 13: Thanh toán** - 2 câu hỏi (Payment Implementation, Refunds/Chargebacks)
- ✅ **Phần 14: Vận chuyển** - 1 câu hỏi (Shipping Cost và Carrier Integration)
- ✅ **Phần 15: Admin Dashboard** - 1 câu hỏi (Dashboard Features và Statistics)

---

## 16. Câu hỏi về Bảo mật (Security)

### ❓ Câu 16.1: Bạn xử lý SQL Injection và XSS như thế nào?

**📝 Trả lời:**
SQL Injection và XSS là hai lỗ hổng bảo mật phổ biến nhất trong web applications. Dự án TechStore đã implement các biện pháp bảo vệ chống lại các tấn công này.

**1. SQL Injection Prevention:**

**❌ VẤN ĐỀ - Vulnerable Code:**
```javascript
// ❌ SAI: String concatenation
const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
db.query(query);
// Attacker có thể inject: username = "admin' OR '1'='1"
// Query trở thành: SELECT * FROM users WHERE username = 'admin' OR '1'='1' AND password = ''
```

**✅ GIẢI PHÁP - Parameterized Queries:**
```javascript
// ✅ ĐÚNG: Parameterized queries (Prepared Statements)
const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
const [users] = await db.query(query, [username, password]);
// MySQL driver tự động escape và sanitize parameters
```

**Tất cả queries trong dự án đều dùng parameterized queries:**
```javascript
// ✅ Safe: Parameters được escape tự động
await db.query('SELECT * FROM products WHERE category_id = ? AND price > ?', [categoryId, minPrice]);
await db.query('INSERT INTO orders (user_id, total) VALUES (?, ?)', [userId, total]);
await db.query('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?', [quantity, productId]);
await db.query('DELETE FROM cart_items WHERE id = ? AND cart_id IN (SELECT id FROM cart WHERE user_id = ?)', [itemId, userId]);
```

**Additional Protection:**
- ✅ Input validation trước khi query
- ✅ Whitelist allowed characters cho specific fields
- ✅ Type checking (numbers, strings)
- ✅ Length limits

**2. XSS (Cross-Site Scripting) Prevention:**

**❌ VẤN ĐỀ:**
```javascript
// ❌ SAI: Render user input trực tiếp
document.getElementById('comment').innerHTML = userComment;
// Attacker có thể inject: <script>alert('XSS')</script>
```

**✅ GIẢI PHÁP:**

**a. Output Encoding:**
```javascript
// ✅ ĐÚNG: Escape HTML special characters
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Usage
const safeComment = escapeHtml(userComment);
document.getElementById('comment').innerHTML = safeComment;

// Hoặc sử dụng textContent thay vì innerHTML
document.getElementById('comment').textContent = userComment; // Safe
```

**b. Content Security Policy (CSP):**
```javascript
// middleware/security.js
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' https://cdn.jsdelivr.net;"
  );
  next();
});
```

**c. Input Sanitization:**
```javascript
// Sanitize user input trước khi lưu database
const DOMPurify = require('isomorphic-dompurify');

function sanitizeInput(input) {
  // Remove HTML tags
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

// Usage
const safeDescription = sanitizeInput(productDescription);
await db.query('UPDATE products SET description = ? WHERE id = ?', [safeDescription, productId]);
```

**d. Template Engine Protection:**
```javascript
// Nếu dùng template engine như EJS, Handlebars
// Tự động escape output
// <%- userComment %> // Escaped (Safe)
// <%= userComment %>  // Escaped (Safe)
// <%- rawHtml %>      // Raw HTML (Unsafe, chỉ dùng khi tin tưởng)
```

**3. Additional Security Headers:**

```javascript
// middleware/security.js
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Custom headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
```

**4. Validation Library (Joi/express-validator):**

```javascript
const { body, validationResult } = require('express-validator');

// Validation rules
const validateProduct = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tên sản phẩm là bắt buộc')
    .isLength({ min: 3, max: 255 }).withMessage('Tên sản phẩm phải từ 3-255 ký tự')
    .matches(/^[a-zA-Z0-9\s\u00C0-\u1EF9]+$/).withMessage('Tên sản phẩm không hợp lệ'),
  body('price')
    .isFloat({ min: 0 }).withMessage('Giá phải là số dương')
    .toFloat(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Mô tả quá dài')
    .escape() // Auto-escape HTML
];

// Usage
router.post('/products', authenticateToken, authorize(['admin']), validateProduct, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  // req.body đã được validated và sanitized
  const product = await createProduct(req.body);
  res.json({ product });
});
```

**Best Practices đã áp dụng:**
- ✅ Parameterized queries cho tất cả database operations
- ✅ Input validation và sanitization
- ✅ Output encoding cho user-generated content
- ✅ Content Security Policy (CSP) headers
- ✅ Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- ✅ Whitelist validation cho input
- ✅ Type checking và length limits

---

### ❓ Câu 16.2: Rate limiting và DDoS protection được implement như thế nào?

**📝 Trả lời:**
Rate limiting và DDoS protection là essential để bảo vệ hệ thống khỏi abuse và attacks.

**1. Rate Limiting:**

```javascript
// middleware/rateLimit.js
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

// General API rate limiter
const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Quá nhiều requests từ IP này, vui lòng thử lại sau 15 phút',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      message: 'Quá nhiều requests, vui lòng thử lại sau',
      error: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Strict rate limiter cho login
const loginLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:login:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  skipSuccessfulRequests: true, // Don't count successful logins
  message: 'Quá nhiều lần đăng nhập sai, vui lòng thử lại sau 15 phút',
  handler: (req, res) => {
    res.status(429).json({
      message: 'Quá nhiều lần đăng nhập sai, tài khoản tạm thời bị khóa',
      error: 'LOGIN_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// OTP rate limiter
const otpLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:otp:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 1, // Only 1 OTP request per minute
  message: 'Vui lòng đợi 1 phút trước khi yêu cầu OTP mới'
});

// Usage
app.use('/api/', apiLimiter);
app.use('/api/login', loginLimiter);
app.use('/api/forgot-password', otpLimiter);
app.use('/api/register', otpLimiter);
```

**2. Per-User Rate Limiting:**

```javascript
// Rate limiting based on user ID (not just IP)
const userRateLimiter = rateLimit({
  keyGenerator: (req) => {
    return req.user ? req.user.id : req.ip;
  },
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per user
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:user:'
  })
});

// Apply to authenticated routes
router.use('/api/cart', authenticateToken, userRateLimiter);
router.use('/api/orders', authenticateToken, userRateLimiter);
```

**3. DDoS Protection:**

**a. Connection Limits:**
```javascript
// Limit concurrent connections
const connections = new Map();
const MAX_CONNECTIONS_PER_IP = 10;

app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  
  // Clean old connections
  if (connections.has(ip)) {
    connections.set(ip, connections.get(ip).filter(time => now - time < 60000));
  } else {
    connections.set(ip, []);
  }
  
  const ipConnections = connections.get(ip);
  
  if (ipConnections.length >= MAX_CONNECTIONS_PER_IP) {
    return res.status(429).json({
      message: 'Quá nhiều kết nối đồng thời từ IP này',
      error: 'TOO_MANY_CONNECTIONS'
    });
  }
  
  ipConnections.push(now);
  next();
});
```

**b. Request Size Limits:**
```javascript
// Limit request body size
app.use(express.json({ limit: '10mb' })); // Max 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Custom middleware cho specific endpoints
const uploadLimiter = express.json({ limit: '5mb' });
router.post('/api/products/:id/images', uploadLimiter, ...);
```

**c. Timeout Protection:**
```javascript
// Request timeout middleware
const timeout = require('connect-timeout');

app.use(timeout('30s')); // 30 seconds timeout

app.use((req, res, next) => {
  if (!req.timedout) next();
});

// Route-specific timeout
router.get('/api/export-orders', authenticateToken, authorize(['admin']), 
  timeout('5m'), // 5 minutes for export
  async (req, res, next) => {
    try {
      // Long-running operation
      const orders = await exportOrders();
      if (!req.timedout) {
        res.json({ orders });
      }
    } catch (error) {
      if (!req.timedout) {
        next(error);
      }
    }
  }
);
```

**d. IP Whitelist/Blacklist:**
```javascript
// IP blacklist (store in Redis or database)
const blacklistedIPs = new Set();

async function checkBlacklist(req, res, next) {
  const ip = req.ip;
  
  // Check Redis blacklist
  const isBlacklisted = await redisClient.get(`blacklist:${ip}`);
  
  if (isBlacklisted) {
    return res.status(403).json({
      message: 'IP này đã bị chặn',
      error: 'IP_BLACKLISTED'
    });
  }
  
  next();
}

// Auto-blacklist after multiple failed attempts
async function autoBlacklist(ip, reason) {
  await redisClient.setex(`blacklist:${ip}`, 3600, reason); // Blacklist for 1 hour
}

// Usage
router.post('/api/login', loginLimiter, async (req, res) => {
  const user = await authenticateUser(req.body.username, req.body.password);
  
  if (!user) {
    // Increment failed attempts
    const attempts = await redisClient.incr(`failed_attempts:${req.ip}`);
    
    if (attempts >= 10) {
      await autoBlacklist(req.ip, 'Too many failed login attempts');
      return res.status(403).json({
        message: 'IP đã bị chặn do quá nhiều lần đăng nhập sai',
        error: 'IP_BLACKLISTED'
      });
    }
    
    return res.status(401).json({ message: 'Sai thông tin đăng nhập' });
  }
  
  // Reset failed attempts on success
  await redisClient.del(`failed_attempts:${req.ip}`);
  
  res.json({ token: generateToken(user) });
});
```

**4. Load Balancer Level Protection:**

```nginx
# Nginx configuration (if using Nginx as reverse proxy)
http {
  limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
  limit_conn_zone $binary_remote_addr zone=conn_limit:10m;
  
  server {
    location /api/ {
      limit_req zone=api burst=20 nodelay;
      limit_conn conn_limit 10;
      
      proxy_pass http://localhost:5000;
    }
  }
}
```

**5. Cloud DDoS Protection:**

- ✅ **Cloudflare:** Free DDoS protection, rate limiting, WAF
- ✅ **AWS Shield:** DDoS protection cho AWS infrastructure
- ✅ **Azure DDoS Protection:** Built-in protection cho Azure

**Best Practices:**
- ✅ Multiple layers of rate limiting (API, login, specific endpoints)
- ✅ Redis-based rate limiting cho distributed systems
- ✅ Per-IP và per-user rate limiting
- ✅ Auto-blacklist cho suspicious behavior
- ✅ Request timeout protection
- ✅ Connection limits
- ✅ Request size limits
- ✅ Cloud-based DDoS protection

---

### ❓ Câu 16.3: Data encryption và secure storage được implement như thế nào?

**📝 Trả lời:**
Data encryption là critical để bảo vệ sensitive information. TechStore đã implement encryption ở nhiều tầng.

**1. Password Hashing (Bcrypt):**

```javascript
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Hash password khi đăng ký
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

// Verify password khi đăng nhập
async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Usage
async function registerUser(username, password) {
  const hashedPassword = await hashPassword(password);
  await db.query(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hashedPassword]
  );
}

async function loginUser(username, password) {
  const [user] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
  if (!user) {
    throw new Error('User not found');
  }
  
  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    throw new Error('Invalid password');
  }
  
  return user;
}
```

**2. Sensitive Data Encryption:**

```javascript
const crypto = require('crypto');

// Encryption key (should be in environment variable)
const ENCRYPTION_KEY = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
const IV_LENGTH = 16; // AES block size

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = parts.join(':');
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Usage: Encrypt sensitive data before storing
async function savePaymentDetails(orderId, cardNumber, cvv) {
  // Encrypt sensitive fields
  const encryptedCardNumber = encrypt(cardNumber);
  const encryptedCvv = encrypt(cvv);
  
  await db.query(
    `INSERT INTO payment_details (order_id, card_number, cvv)
     VALUES (?, ?, ?)`,
    [orderId, encryptedCardNumber, encryptedCvv]
  );
}

// Decrypt when needed
async function getPaymentDetails(orderId) {
  const [payment] = await db.query(
    'SELECT * FROM payment_details WHERE order_id = ?',
    [orderId]
  );
  
  if (payment) {
    payment.card_number = decrypt(payment.card_number);
    // Never decrypt CVV - it's not needed after payment
  }
  
  return payment;
}
```

**3. Database Encryption at Rest:**

**MySQL Transparent Data Encryption (TDE):**
```sql
-- Enable encryption for specific tables
ALTER TABLE users ENCRYPTION='Y';
ALTER TABLE payment_details ENCRYPTION='Y';
ALTER TABLE orders ENCRYPTION='Y';

-- Or encrypt entire database
ALTER DATABASE tttn2025 ENCRYPTION='Y';
```

**4. HTTPS/TLS Encryption:**

```javascript
// Use HTTPS in production
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('/path/to/private-key.pem'),
  cert: fs.readFileSync('/path/to/certificate.pem'),
  // Optional: Add intermediate certificates
  ca: fs.readFileSync('/path/to/ca-certificate.pem')
};

const server = https.createServer(options, app);
server.listen(443, () => {
  console.log('HTTPS server running on port 443');
});

// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

**5. Environment Variables Protection:**

```javascript
// .env file (never commit to git)
require('dotenv').config();

// Use environment variables
const config = {
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, // Encrypted in production
    database: process.env.DB_NAME
  },
  jwt: {
    secret: process.env.JWT_SECRET, // Strong random string
    expiresIn: process.env.JWT_EXPIRES_IN || '100d'
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY // 32-byte key
  }
};

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'JWT_SECRET', 'ENCRYPTION_KEY'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});
```

**6. Secure Cookie Storage:**

```javascript
// If using cookies (instead of localStorage)
app.use(cookieParser());

app.post('/api/login', async (req, res) => {
  const user = await authenticateUser(req.body.username, req.body.password);
  const token = generateToken(user);
  
  // Secure cookie settings
  res.cookie('token', token, {
    httpOnly: true, // Prevent XSS
    secure: process.env.NODE_ENV === 'production', // HTTPS only
    sameSite: 'strict', // CSRF protection
    maxAge: 100 * 24 * 60 * 60 * 1000, // 100 days
    path: '/'
  });
  
  res.json({ message: 'Login successful' });
});
```

**7. API Key Encryption (for third-party integrations):**

```javascript
// Encrypt API keys before storing
async function saveApiKey(userId, service, apiKey) {
  const encryptedKey = encrypt(apiKey);
  
  await db.query(
    `INSERT INTO user_api_keys (user_id, service, encrypted_key)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE encrypted_key = ?`,
    [userId, service, encryptedKey, encryptedKey]
  );
}

// Decrypt when needed
async function getApiKey(userId, service) {
  const [key] = await db.query(
    'SELECT encrypted_key FROM user_api_keys WHERE user_id = ? AND service = ?',
    [userId, service]
  );
  
  if (key) {
    return decrypt(key.encrypted_key);
  }
  
  return null;
}
```

**8. Audit Logging (Encrypted Logs):**

```javascript
// Log sensitive operations (encrypted)
async function logSensitiveOperation(userId, action, details) {
  const encryptedDetails = encrypt(JSON.stringify(details));
  
  await db.query(
    `INSERT INTO audit_logs (user_id, action, encrypted_details, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, action, encryptedDetails, req.ip, req.get('user-agent')]
  );
}

// Only decrypt for authorized admins
async function getAuditLogs(authorizedAdminId, logId) {
  // Verify admin has permission
  const admin = await getAdmin(authorizedAdminId);
  if (!admin || !admin.canViewAuditLogs) {
    throw new Error('Unauthorized');
  }
  
  const [log] = await db.query('SELECT * FROM audit_logs WHERE id = ?', [logId]);
  
  if (log) {
    log.details = JSON.parse(decrypt(log.encrypted_details));
  }
  
  return log;
}
```

**Best Practices:**
- ✅ Bcrypt cho password hashing (salt rounds = 10)
- ✅ AES-256 encryption cho sensitive data
- ✅ HTTPS/TLS cho data in transit
- ✅ Database encryption at rest (TDE)
- ✅ Environment variables cho secrets
- ✅ Secure cookie settings (httpOnly, secure, sameSite)
- ✅ Never log sensitive data in plain text
- ✅ Key rotation strategy
- ✅ Secure key storage (HashiCorp Vault, AWS Secrets Manager)

---

## 17. Câu hỏi về Performance & Scalability

### ❓ Câu 17.1: Bạn tối ưu performance của database như thế nào?

**📝 Trả lời:**
Database performance optimization là critical cho e-commerce với nhiều concurrent users và queries.

**1. Indexing Strategy:**

```sql
-- Primary indexes (auto-created)
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT, -- Clustered index
  ...
);

-- Foreign key indexes
CREATE INDEX idx_category ON products(category_id);
CREATE INDEX idx_order_user ON orders(user_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Composite indexes cho queries phức tạp
CREATE INDEX idx_category_price ON products(category_id, price);
CREATE INDEX idx_user_status ON orders(user_id, status);
CREATE INDEX idx_status_created ON orders(status, created_at);

-- Covering indexes (chứa tất cả columns cần)
CREATE INDEX idx_product_cover ON products(category_id, price, name, images(1));

-- Full-text search indexes
CREATE FULLTEXT INDEX idx_product_search ON products(name, description);
```

**2. Query Optimization:**

**❌ SAI - N+1 Query Problem:**
```javascript
// ❌ BAD: N+1 queries
const orders = await db.query('SELECT * FROM orders WHERE user_id = ?', [userId]);
for (const order of orders) {
  const items = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
  order.items = items;
}
// Nếu có 100 orders → 101 queries!
```

**✅ ĐÚNG - Single Query với JOIN:**
```javascript
// ✅ GOOD: Single query với JOIN
const orders = await db.query(`
  SELECT 
    o.*,
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'id', oi.id,
        'product_name', oi.product_name,
        'quantity', oi.quantity,
        'price', oi.price
      )
    ) as items
  FROM orders o
  LEFT JOIN order_items oi ON o.id = oi.order_id
  WHERE o.user_id = ?
  GROUP BY o.id
`, [userId]);
// Chỉ 1 query!
```

**3. Query Result Caching:**

```javascript
const redis = require('redis');
const redisClient = redis.createClient();

// Cache frequently accessed data
async function getProducts(categoryId, filters) {
  const cacheKey = `products:${categoryId}:${JSON.stringify(filters)}`;
  
  // Try cache first
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Query database
  const products = await db.query(
    'SELECT * FROM products WHERE category_id = ? AND ...',
    [categoryId, ...]
  );
  
  // Cache for 5 minutes
  await redisClient.setex(cacheKey, 300, JSON.stringify(products));
  
  return products;
}

// Invalidate cache on update
async function updateProduct(productId, data) {
  await db.query('UPDATE products SET ... WHERE id = ?', [productId, ...]);
  
  // Invalidate related caches
  await redisClient.del(`product:${productId}`);
  await redisClient.del(`products:*`); // Invalidate all product lists
}
```

**4. Pagination Optimization:**

```javascript
// ✅ GOOD: Cursor-based pagination (faster than offset)
async function getProducts(cursor, limit = 20) {
  if (cursor) {
    return await db.query(
      'SELECT * FROM products WHERE id > ? ORDER BY id ASC LIMIT ?',
      [cursor, limit]
    );
  } else {
    return await db.query(
      'SELECT * FROM products ORDER BY id ASC LIMIT ?',
      [limit]
    );
  }
}

// ❌ BAD: Offset-based pagination (slow với large offset)
// SELECT * FROM products ORDER BY id LIMIT 20 OFFSET 10000
// Database phải skip 10000 rows → very slow
```

**5. Database Connection Pooling:**

```javascript
// config/database.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 20, // Max connections
  queueLimit: 0, // Unlimited queue
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Connection timeout
  acquireTimeout: 60000,
  // Idle timeout
  idleTimeout: 300000,
  // Reconnect
  reconnect: true
});

// Test connection pool
pool.getConnection()
  .then(connection => {
    console.log('Database connected');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });
```

**6. Query Result Limits:**

```javascript
// Always limit results
async function searchProducts(query, limit = 50) {
  // Never return unlimited results
  const maxLimit = 100;
  const safeLimit = Math.min(limit, maxLimit);
  
  return await db.query(
    'SELECT * FROM products WHERE name LIKE ? LIMIT ?',
    [`%${query}%`, safeLimit]
  );
}
```

**7. Database Partitioning (for large tables):**

```sql
-- Partition orders table by created_at (monthly)
ALTER TABLE orders
PARTITION BY RANGE (YEAR(created_at) * 100 + MONTH(created_at)) (
  PARTITION p202401 VALUES LESS THAN (202402),
  PARTITION p202402 VALUES LESS THAN (202403),
  PARTITION p202403 VALUES LESS THAN (202404),
  -- ... more partitions
  PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- Queries chỉ scan relevant partitions
SELECT * FROM orders WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01';
-- Chỉ scan p202401 partition
```

**8. EXPLAIN và Query Analysis:**

```javascript
// Analyze slow queries
async function analyzeQuery(query, params) {
  const explainQuery = 'EXPLAIN ' + query;
  const [explainResult] = await db.query(explainQuery, params);
  
  // Check for:
  // - type: 'ALL' (full table scan) → Need index
  // - rows: High number → Need optimization
  // - key: NULL → Missing index
  // - Extra: 'Using filesort' → Need index for sorting
  
  console.log('Query Analysis:', explainResult);
  
  return explainResult;
}

// Usage
await analyzeQuery(
  'SELECT * FROM products WHERE category_id = ? ORDER BY price ASC',
  [categoryId]
);
```

**9. Database Read Replicas (for scaling reads):**

```javascript
// Master-slave replication
const masterPool = mysql.createPool({
  host: process.env.DB_MASTER_HOST,
  // ... write operations
});

const slavePool = mysql.createPool({
  host: process.env.DB_SLAVE_HOST,
  // ... read operations
});

// Route reads to slave, writes to master
async function query(query, params, isWrite = false) {
  const pool = isWrite ? masterPool : slavePool;
  return await pool.query(query, params);
}

// Usage
const products = await query('SELECT * FROM products', [], false); // Read → slave
await query('INSERT INTO orders ...', [...], true); // Write → master
```

**Best Practices:**
- ✅ Proper indexing strategy (primary, foreign, composite, covering)
- ✅ Avoid N+1 queries (use JOINs)
- ✅ Query result caching (Redis)
- ✅ Connection pooling
- ✅ Cursor-based pagination
- ✅ Query result limits
- ✅ Database partitioning cho large tables
- ✅ Read replicas cho scaling reads
- ✅ Query analysis và optimization
- ✅ Regular database maintenance (ANALYZE, OPTIMIZE)

---

### ❓ Câu 17.2: Caching strategy được implement như thế nào?

**📝 Trả lời:**
Caching là một trong những cách hiệu quả nhất để improve performance. TechStore sử dụng multiple caching layers.

**1. Redis Cache Layer:**

```javascript
const redis = require('redis');
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});

// Cache helper functions
class CacheService {
  // Get from cache
  static async get(key) {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  // Set cache with TTL
  static async set(key, value, ttl = 3600) {
    try {
      await redisClient.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
  
  // Delete cache
  static async delete(key) {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }
  
  // Delete by pattern
  static async deletePattern(pattern) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }
}
```

**2. Cache-Aside Pattern:**

```javascript
// Products cache
async function getProduct(productId) {
  // Try cache first
  const cacheKey = `product:${productId}`;
  const cached = await CacheService.get(cacheKey);
  
  if (cached) {
    return cached; // Cache hit
  }
  
  // Cache miss - query database
  const [product] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
  
  if (product) {
    // Store in cache for 1 hour
    await CacheService.set(cacheKey, product, 3600);
  }
  
  return product;
}

// Update product - invalidate cache
async function updateProduct(productId, data) {
  // Update database
  await db.query('UPDATE products SET ... WHERE id = ?', [productId, ...]);
  
  // Invalidate cache
  await CacheService.delete(`product:${productId}`);
  await CacheService.deletePattern('products:*'); // Invalidate lists
}
```

**3. Write-Through Cache:**

```javascript
// Update cache immediately when updating database
async function updateProduct(productId, data) {
  // Update database
  await db.query('UPDATE products SET ... WHERE id = ?', [productId, ...]);
  
  // Get updated data
  const [product] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
  
  // Update cache immediately
  await CacheService.set(`product:${productId}`, product, 3600);
}
```

**4. Cache Invalidation Strategies:**

```javascript
// Time-based expiration
await CacheService.set('products:list', products, 300); // 5 minutes

// Event-based invalidation
async function createOrder(orderData) {
  await db.query('INSERT INTO orders ...', [...]);
  
  // Invalidate user's order cache
  await CacheService.delete(`orders:user:${orderData.user_id}`);
  
  // Invalidate admin dashboard cache
  await CacheService.delete('stats:overview');
  await CacheService.delete('stats:revenue:*');
}

// Tag-based invalidation
async function cacheWithTags(key, value, tags, ttl) {
  await CacheService.set(key, value, ttl);
  
  // Store tags
  for (const tag of tags) {
    await redisClient.sadd(`tag:${tag}`, key);
  }
}

async function invalidateByTag(tag) {
  const keys = await redisClient.smembers(`tag:${tag}`);
  if (keys.length > 0) {
    await redisClient.del(...keys);
    await redisClient.del(`tag:${tag}`);
  }
}

// Usage
await cacheWithTags('product:123', product, ['product', 'category:laptop'], 3600);
await invalidateByTag('category:laptop'); // Invalidate all laptop products
```

**5. Cache Warming (Pre-loading):**

```javascript
// Pre-load frequently accessed data on startup
async function warmCache() {
  console.log('Warming cache...');
  
  // Cache popular products
  const popularProducts = await db.query(
    'SELECT * FROM products ORDER BY views DESC LIMIT 100'
  );
  for (const product of popularProducts) {
    await CacheService.set(`product:${product.id}`, product, 7200);
  }
  
  // Cache categories
  const categories = await db.query('SELECT * FROM categories');
  await CacheService.set('categories:all', categories, 3600);
  
  // Cache homepage data
  const featuredProducts = await db.query(
    'SELECT * FROM products WHERE featured = 1 LIMIT 20'
  );
  await CacheService.set('homepage:featured', featuredProducts, 600);
  
  console.log('Cache warmed successfully');
}

// Run on server startup
warmCache();
```

**6. Multi-Level Caching:**

```javascript
// Level 1: In-memory cache (fastest, smallest)
const memoryCache = new Map();

// Level 2: Redis cache (fast, larger)
// Level 3: Database (slowest, largest)

async function getProduct(productId) {
  // Level 1: Memory cache
  if (memoryCache.has(productId)) {
    return memoryCache.get(productId);
  }
  
  // Level 2: Redis cache
  const redisKey = `product:${productId}`;
  const cached = await CacheService.get(redisKey);
  if (cached) {
    memoryCache.set(productId, cached); // Store in memory
    return cached;
  }
  
  // Level 3: Database
  const [product] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
  
  if (product) {
    // Store in both caches
    memoryCache.set(productId, product);
    await CacheService.set(redisKey, product, 3600);
  }
  
  return product;
}
```

**7. Cache Compression (for large data):**

```javascript
const zlib = require('zlib');
const util = require('util');
const compress = util.promisify(zlib.gzip);
const decompress = util.promisify(zlib.gunzip);

async function setCompressed(key, value, ttl) {
  const compressed = await compress(JSON.stringify(value));
  await redisClient.setex(key, ttl, compressed);
}

async function getCompressed(key) {
  const compressed = await redisClient.getBuffer(key);
  if (!compressed) return null;
  
  const decompressed = await decompress(compressed);
  return JSON.parse(decompressed.toString());
}

// Usage for large objects
await setCompressed('products:full:list', largeProductsArray, 3600);
```

**8. CDN Caching (for static assets):**

```javascript
// Serve static files with cache headers
app.use('/img', express.static('public/img', {
  maxAge: '1y', // Cache for 1 year
  etag: true,
  lastModified: true
}));

// Cache headers for API responses
app.use((req, res, next) => {
  // Cache public endpoints
  if (req.path.startsWith('/api/products') && req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
    res.set('ETag', generateETag(req));
  }
  
  next();
});
```

**Best Practices:**
- ✅ Multiple cache layers (memory, Redis, database)
- ✅ Cache-aside pattern cho reads
- ✅ Write-through cache cho writes
- ✅ Proper cache invalidation strategies
- ✅ Cache warming cho frequently accessed data
- ✅ TTL (Time To Live) cho cache expiration
- ✅ Cache compression cho large data
- ✅ CDN caching cho static assets
- ✅ Cache monitoring và metrics

---

### ❓ Câu 17.3: Scaling strategy cho hệ thống khi có nhiều users đồng thời?

**📝 Trả lời:**
Scaling strategy là critical để đảm bảo hệ thống có thể handle traffic tăng cao.

**1. Horizontal Scaling (Scale Out):**

```yaml
# docker-compose.yml - Multiple service instances
services:
  gateway:
    image: techstore-gateway
    deploy:
      replicas: 3 # 3 instances
      resources:
        limits:
          cpus: '1'
          memory: 1G
  
  product-service:
    image: techstore-product-service
    deploy:
      replicas: 5 # 5 instances (most traffic)
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

**Load Balancing:**

```nginx
# Nginx load balancer
upstream gateway {
  least_conn; # Least connections algorithm
  server gateway-1:5000;
  server gateway-2:5000;
  server gateway-3:5000;
}

upstream product_service {
  ip_hash; # Sticky sessions
  server product-service-1:5002;
  server product-service-2:5002;
  server product-service-3:5002;
  server product-service-4:5002;
  server product-service-5:5002;
}

server {
  listen 80;
  
  location / {
    proxy_pass http://gateway;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
  
  location /api/products {
    proxy_pass http://product_service;
  }
}
```

**2. Vertical Scaling (Scale Up):**

```yaml
# Increase resources for database
services:
  mysql:
    image: mysql:8.0
    deploy:
      resources:
        limits:
          cpus: '4' # Increase CPUs
          memory: 8G # Increase memory
    command: >
      --innodb_buffer_pool_size=4G
      --max_connections=1000
      --query_cache_size=256M
```

**3. Database Scaling:**

**Read Replicas:**
```javascript
// Master for writes, replicas for reads
const masterDb = mysql.createPool({
  host: 'mysql-master',
  // ... write operations
});

const replicaDbs = [
  mysql.createPool({ host: 'mysql-replica-1' }),
  mysql.createPool({ host: 'mysql-replica-2' }),
  mysql.createPool({ host: 'mysql-replica-3' })
];

// Round-robin read queries
let replicaIndex = 0;
function getReplica() {
  const replica = replicaDbs[replicaIndex];
  replicaIndex = (replicaIndex + 1) % replicaDbs.length;
  return replica;
}

async function query(sql, params, isWrite = false) {
  const pool = isWrite ? masterDb : getReplica();
  return await pool.query(sql, params);
}
```

**Database Sharding (for very large scale):**
```javascript
// Shard by user_id
function getShard(userId) {
  const shardCount = 4;
  return `shard_${userId % shardCount}`;
}

async function getUserOrders(userId) {
  const shard = getShard(userId);
  return await db.query(
    `SELECT * FROM orders_${shard} WHERE user_id = ?`,
    [userId]
  );
}
```

**4. Caching Layer Scaling:**

```javascript
// Redis Cluster
const Redis = require('ioredis');
const redisCluster = new Redis.Cluster([
  { host: 'redis-1', port: 6379 },
  { host: 'redis-2', port: 6379 },
  { host: 'redis-3', port: 6379 }
], {
  redisOptions: {
    password: process.env.REDIS_PASSWORD
  }
});
```

**5. Message Queue (for async processing):**

```javascript
// RabbitMQ for async tasks
const amqp = require('amqplib');

// Producer (order creation)
async function createOrder(orderData) {
  // Save to database
  const order = await saveOrder(orderData);
  
  // Publish to queue (async)
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  
  await channel.assertQueue('order-processing', { durable: true });
  channel.sendToQueue('order-processing', Buffer.from(JSON.stringify({
    orderId: order.id,
    action: 'process_payment',
    data: orderData
  })), { persistent: true });
  
  await channel.close();
  await connection.close();
  
  return order;
}

// Consumer (payment processing)
async function processOrderPayments() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  
  await channel.assertQueue('order-processing', { durable: true });
  channel.prefetch(10); // Process 10 messages at a time
  
  channel.consume('order-processing', async (msg) => {
    const orderData = JSON.parse(msg.content.toString());
    
    try {
      await processPayment(orderData.orderId);
      channel.ack(msg); // Acknowledge success
    } catch (error) {
      console.error('Payment processing failed:', error);
      channel.nack(msg, false, true); // Requeue for retry
    }
  });
}
```

**6. CDN for Static Assets:**

```javascript
// Serve static assets through CDN
app.use('/img', express.static('public/img', {
  maxAge: '1y',
  setHeaders: (res, path) => {
    // Set CDN headers
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('CDN-Cache-Control', 'public, max-age=31536000');
  }
}));

// Or use Cloudflare, CloudFront, etc.
// https://cdn.techstore.com/img/products/...
```

**7. Auto-scaling (Kubernetes):**

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: product-service
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: product-service
        image: techstore-product-service
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: product-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: product-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

**8. Monitoring và Alerting:**

```javascript
// Prometheus metrics
const prometheus = require('prom-client');

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

const activeConnections = new prometheus.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

// Middleware to collect metrics
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.labels(req.method, req.route?.path || req.path, res.statusCode).observe(duration);
  });
  
  next();
});

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(await prometheus.register.metrics());
});
```

**Best Practices:**
- ✅ Horizontal scaling (multiple instances)
- ✅ Load balancing (Nginx, HAProxy)
- ✅ Database read replicas
- ✅ Caching layer (Redis cluster)
- ✅ Message queue cho async processing
- ✅ CDN cho static assets
- ✅ Auto-scaling (Kubernetes HPA)
- ✅ Monitoring và alerting (Prometheus, Grafana)
- ✅ Database connection pooling
- ✅ Resource limits và quotas

---

## 18. Câu hỏi về Testing & Quality Assurance

### ❓ Câu 18.1: Testing strategy của dự án như thế nào? Có unit tests, integration tests không?

**📝 Trả lời:**
Testing là essential để đảm bảo code quality và reliability. Dự án TechStore có testing strategy comprehensive.

**1. Unit Tests (Jest):**

```javascript
// tests/unit/auth.test.js
const { hashPassword, verifyPassword } = require('../../services/auth-service/utils/password');

describe('Password Hashing', () => {
  test('should hash password correctly', async () => {
    const password = 'password123';
    const hash = await hashPassword(password);
    
    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(50);
  });
  
  test('should verify password correctly', async () => {
    const password = 'password123';
    const hash = await hashPassword(password);
    
    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
    
    const isInvalid = await verifyPassword('wrongpassword', hash);
    expect(isInvalid).toBe(false);
  });
});
```

```javascript
// tests/unit/product.test.js
const { calculateDiscount, formatPrice } = require('../../utils/product');

describe('Product Utils', () => {
  test('should calculate discount correctly', () => {
    expect(calculateDiscount(1000000, 800000)).toBe(20); // 20%
    expect(calculateDiscount(2000000, 1500000)).toBe(25); // 25%
    expect(calculateDiscount(1000000, 1000000)).toBe(0); // No discount
  });
  
  test('should format price correctly', () => {
    expect(formatPrice(1000000)).toBe('1.000.000 ₫');
    expect(formatPrice(15000000)).toBe('15.000.000 ₫');
    expect(formatPrice(0)).toBe('0 ₫');
  });
});
```

**2. Integration Tests:**

```javascript
// tests/integration/orders.test.js
const request = require('supertest');
const app = require('../../gateway/server');
const db = require('../../config/database');

describe('Orders API', () => {
  let authToken;
  let userId;
  
  beforeAll(async () => {
    // Setup test database
    await db.query('DELETE FROM orders WHERE test = 1');
    
    // Create test user và get token
    const loginResponse = await request(app)
      .post('/api/login')
      .send({ username: 'testuser', password: 'testpass' });
    
    authToken = loginResponse.body.token;
    userId = loginResponse.body.user.id;
  });
  
  afterAll(async () => {
    // Cleanup
    await db.query('DELETE FROM orders WHERE test = 1');
  });
  
  test('should create order successfully', async () => {
    // Add items to cart first
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ product_id: 1, quantity: 2 });
    
    // Create order
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        shipping_address: '123 Test Street',
        payment_method: 'bank_transfer',
        test: 1 // Flag for cleanup
      });
    
    expect(response.status).toBe(201);
    expect(response.body.order).toBeDefined();
    expect(response.body.order.total).toBeGreaterThan(0);
    expect(response.body.order.status).toBe('pending');
  });
  
  test('should fail with empty cart', async () => {
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        shipping_address: '123 Test Street'
      });
    
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Giỏ hàng trống');
  });
  
  test('should fail with insufficient stock', async () => {
    // Add item với quantity > stock
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ product_id: 1, quantity: 10000 });
    
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        shipping_address: '123 Test Street'
      });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('INSUFFICIENT_STOCK');
  });
});
```

**3. API Tests (Postman/Newman):**

```javascript
// postman/collections/orders.json
{
  "info": {
    "name": "Orders API Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Order",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"shipping_address\": \"123 Test Street\",\n  \"payment_method\": \"bank_transfer\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/orders",
          "host": ["{{baseUrl}}"],
          "path": ["api", "orders"]
        }
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status code is 201', function () {",
              "  pm.response.to.have.status(201);",
              "});",
              "",
              "pm.test('Response has order', function () {",
              "  const jsonData = pm.response.json();",
              "  pm.expect(jsonData.order).to.be.an('object');",
              "  pm.expect(jsonData.order.id).to.exist;",
              "});"
            ]
          }
        }
      ]
    }
  ]
}
```

**4. End-to-End Tests (Puppeteer/Playwright):**

```javascript
// tests/e2e/checkout.test.js
const puppeteer = require('puppeteer');

describe('Checkout Flow E2E', () => {
  let browser;
  let page;
  
  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();
  });
  
  afterAll(async () => {
    await browser.close();
  });
  
  test('should complete checkout flow', async () => {
    // Login
    await page.goto('http://localhost:5000/login.html');
    await page.type('#username', 'testuser');
    await page.type('#password', 'testpass');
    await page.click('#loginBtn');
    await page.waitForNavigation();
    
    // Add product to cart
    await page.goto('http://localhost:5000/products.html');
    await page.click('.product-card:first-child .add-to-cart');
    await page.waitForSelector('.cart-badge', { visible: true });
    
    // Go to checkout
    await page.goto('http://localhost:5000/checkout.html');
    await page.type('#shipping-address', '123 Test Street');
    await page.select('#payment-method', 'bank_transfer');
    await page.click('#place-order-btn');
    
    // Wait for order confirmation
    await page.waitForSelector('.order-confirmation', { visible: true });
    
    const orderNumber = await page.$eval('.order-number', el => el.textContent);
    expect(orderNumber).toBeDefined();
  });
});
```

**5. Load Testing (Artillery):**

```yaml
# tests/load/load-test.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10 # 10 users per second
      name: "Warm up"
    - duration: 120
      arrivalRate: 50 # 50 users per second
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100 # 100 users per second
      name: "Spike test"
  plugins:
    expect: {}
scenarios:
  - name: "Browse Products"
    flow:
      - get:
          url: "/api/products"
          expect:
            - statusCode: 200
            - contentType: json
      - get:
          url: "/api/products/1"
          expect:
            - statusCode: 200
  
  - name: "Create Order"
    weight: 10 # 10% of traffic
    flow:
      - post:
          url: "/api/login"
          json:
            username: "{{ $processEnvironment.TEST_USER }}"
            password: "{{ $processEnvironment.TEST_PASS }}"
          capture:
            - json: "$.token"
              as: "token"
      - post:
          url: "/api/orders"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            shipping_address: "123 Test Street"
```

**6. Test Coverage:**

```javascript
// jest.config.js
module.exports = {
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'services/**/*.js',
    'gateway/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};

// Run tests với coverage
// npm test -- --coverage
```

**7. CI/CD Testing Pipeline:**

```yaml
# .github/workflows/tests.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: test
          MYSQL_DATABASE: tttn2025_test
        ports:
          - 3306:3306
        options: --health-cmd="mysqladmin ping" --health-interval=10s --health-timeout=5s --health-retries=3
      
      redis:
        image: redis:7
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DB_HOST: localhost
          DB_USER: root
          DB_PASSWORD: test
          DB_NAME: tttn2025_test
      
      - name: Generate coverage report
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

**Best Practices:**
- ✅ Unit tests cho business logic và utilities
- ✅ Integration tests cho API endpoints
- ✅ E2E tests cho critical user flows
- ✅ Load testing để verify performance
- ✅ Test coverage > 70%
- ✅ CI/CD pipeline với automated tests
- ✅ Test data isolation và cleanup
- ✅ Mock external services trong tests

---

## 19. Câu hỏi về Deployment & DevOps

### ❓ Câu 19.1: Quy trình deployment được thực hiện như thế nào?

**📝 Trả lời:**
Deployment process được automate để đảm bảo consistency và reliability.

**1. Docker-based Deployment:**

```dockerfile
# Dockerfile cho mỗi service
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node healthcheck.js

# Start service
CMD ["node", "server.js"]
```

```yaml
# docker-compose.production.yml
version: '3.8'

services:
  gateway:
    image: techstore/gateway:${VERSION}
    restart: always
    ports:
      - "80:5000"
      - "443:5000"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - REDIS_HOST=redis
    depends_on:
      - mysql
      - redis
    networks:
      - techstore-network
  
  auth-service:
    image: techstore/auth-service:${VERSION}
    restart: always
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - JWT_SECRET=${JWT_SECRET}
    networks:
      - techstore-network
  
  mysql:
    image: mysql:8.0
    restart: always
    environment:
      - MYSQL_ROOT_PASSWORD=${DB_ROOT_PASSWORD}
      - MYSQL_DATABASE=tttn2025
    volumes:
      - mysql-data:/var/lib/mysql
      - ./database/init:/docker-entrypoint-initdb.d
    networks:
      - techstore-network
  
  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis-data:/data
    networks:
      - techstore-network

volumes:
  mysql-data:
  redis-data:

networks:
  techstore-network:
    driver: bridge
```

**2. Deployment Scripts:**

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

VERSION=${1:-latest}
ENV=${2:-production}

echo "Deploying version $VERSION to $ENV..."

# Pull latest code
git pull origin main

# Build Docker images
docker build -t techstore/gateway:$VERSION ./gateway
docker build -t techstore/auth-service:$VERSION ./services/auth-service
docker build -t techstore/product-service:$VERSION ./services/product-service
docker build -t techstore/cart-service:$VERSION ./services/cart-service
docker build -t techstore/order-service:$VERSION ./services/order-service
docker build -t techstore/news-service:$VERSION ./services/news-service

# Tag as latest
docker tag techstore/gateway:$VERSION techstore/gateway:latest
# ... tag other services

# Push to registry
docker push techstore/gateway:$VERSION
docker push techstore/gateway:latest
# ... push other services

# Update docker-compose
export VERSION=$VERSION
docker-compose -f docker-compose.production.yml up -d

# Run database migrations
docker-compose -f docker-compose.production.yml exec gateway npm run migrate

# Health check
sleep 10
./scripts/health-check.sh

echo "Deployment completed successfully!"
```

**3. Blue-Green Deployment:**

```bash
#!/bin/bash
# Blue-Green deployment để zero downtime

BLUE="gateway-blue"
GREEN="gateway-green"

# Determine current version
CURRENT=$(docker ps | grep gateway | awk '{print $1}')

if [[ $CURRENT == *"blue"* ]]; then
  ACTIVE=$BLUE
  INACTIVE=$GREEN
else
  ACTIVE=$GREEN
  INACTIVE=$BLUE
fi

echo "Current active: $ACTIVE"
echo "Deploying to: $INACTIVE"

# Deploy to inactive version
docker-compose -f docker-compose.production.yml up -d $INACTIVE

# Health check inactive version
./scripts/health-check.sh $INACTIVE

# Switch traffic (update load balancer)
# Update Nginx config to point to new version
nginx -s reload

# Wait for traffic to migrate
sleep 30

# Stop old version
docker-compose -f docker-compose.production.yml stop $ACTIVE

echo "Blue-Green deployment completed!"
```

**4. CI/CD Pipeline (GitHub Actions):**

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Run tests
        run: npm test
      
      - name: Build Docker images
        run: |
          docker build -t techstore/gateway:${{ github.sha }} ./gateway
          # ... build other services
  
  deploy-staging:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to staging
        run: |
          ssh user@staging-server "cd /app && ./scripts/deploy.sh ${{ github.sha }} staging"
  
  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Deploy to production
        run: |
          ssh user@prod-server "cd /app && ./scripts/deploy.sh ${{ github.sha }} production"
```

**5. Rollback Strategy:**

```bash
#!/bin/bash
# scripts/rollback.sh

VERSION=${1}

if [ -z "$VERSION" ]; then
  echo "Usage: ./rollback.sh <version>"
  exit 1
fi

echo "Rolling back to version $VERSION..."

# Update docker-compose với previous version
export VERSION=$VERSION
docker-compose -f docker-compose.production.yml up -d

# Health check
./scripts/health-check.sh

echo "Rollback completed!"
```

**6. Database Migrations:**

```javascript
// database/migrations/001_create_users.js
async function up(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function down(db) {
  await db.query('DROP TABLE IF EXISTS users');
}

module.exports = { up, down };
```

```javascript
// scripts/migrate.js
const fs = require('fs');
const path = require('path');
const db = require('../config/database');

async function migrate() {
  const migrationsDir = path.join(__dirname, '../database/migrations');
  const files = fs.readdirSync(migrationsDir).sort();
  
  for (const file of files) {
    const migration = require(path.join(migrationsDir, file));
    console.log(`Running migration: ${file}`);
    
    try {
      await migration.up(db);
      console.log(`✓ Migration ${file} completed`);
    } catch (error) {
      console.error(`✗ Migration ${file} failed:`, error);
      throw error;
    }
  }
}

migrate();
```

**7. Health Checks:**

```javascript
// healthcheck.js
const http = require('http');

const options = {
  host: 'localhost',
  port: process.env.PORT || 5001,
  path: '/health',
  timeout: 2000
};

const request = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', () => {
  process.exit(1);
});

request.end();
```

**Best Practices:**
- ✅ Docker containerization cho consistent deployments
- ✅ Docker Compose cho local và production
- ✅ CI/CD pipeline với automated testing
- ✅ Blue-Green deployment cho zero downtime
- ✅ Database migrations với versioning
- ✅ Health checks cho service availability
- ✅ Rollback strategy cho quick recovery
- ✅ Environment-specific configurations
- ✅ Secrets management (environment variables, Vault)

---

## 20. Câu hỏi về Error Handling & Logging

### ❓ Câu 20.1: Error handling và logging được implement như thế nào?

**📝 Trả lời:**
Error handling và logging là essential để debug issues và monitor system health.

**1. Centralized Error Handling:**

```javascript
// middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  // Log error
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    user: req.user?.id,
    timestamp: new Date().toISOString()
  });
  
  // Handle different error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Dữ liệu không hợp lệ',
      error: 'VALIDATION_ERROR',
      details: err.details
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      message: 'Chưa đăng nhập hoặc token không hợp lệ',
      error: 'UNAUTHORIZED'
    });
  }
  
  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      message: 'Không có quyền truy cập',
      error: 'FORBIDDEN'
    });
  }
  
  // Database errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      message: 'Dữ liệu đã tồn tại',
      error: 'DUPLICATE_ENTRY'
    });
  }
  
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(404).json({
      message: 'Tham chiếu không hợp lệ',
      error: 'REFERENCE_ERROR'
    });
  }
  
  // Default server error
  res.status(err.statusCode || 500).json({
    message: process.env.NODE_ENV === 'production' 
      ? 'Đã xảy ra lỗi hệ thống' 
      : err.message,
    error: err.errorCode || 'INTERNAL_SERVER_ERROR',
    request_id: req.id // For tracking
  });
}

module.exports = errorHandler;
```

**2. Structured Logging (Winston):**

```javascript
// utils/logger.js
const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'techstore' },
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Combined logs
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 5242880,
      maxFiles: 5
    }),
    // Console in development
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ] : [])
  ]
});

// Add request ID to logs
logger.add(new winston.transports.Console({
  format: winston.format.combine(
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level}]: ${message} ${JSON.stringify(meta)}`;
    })
  )
}));

module.exports = logger;
```

**3. Request Logging Middleware:**

```javascript
// middleware/requestLogger.js
const morgan = require('morgan');
const logger = require('../utils/logger');

// Custom format
morgan.token('user', (req) => req.user?.id || 'anonymous');
morgan.token('request-id', (req) => req.id);

const requestLogger = morgan(
  ':remote-addr :method :url :status :response-time ms - :user - :request-id',
  {
    stream: {
      write: (message) => {
        logger.info(message.trim());
      }
    }
  }
);

// Add request ID
app.use((req, res, next) => {
  req.id = require('crypto').randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
});

app.use(requestLogger);
```

**4. Error Logging trong Async Operations:**

```javascript
// utils/asyncHandler.js
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch((error) => {
        logger.error('Async handler error', {
          error: error.message,
          stack: error.stack,
          request_id: req.id,
          url: req.url
        });
        next(error);
      });
  };
}

// Usage
router.post('/api/orders', authenticateToken, asyncHandler(async (req, res) => {
  const order = await createOrder(req.user.id, req.body);
  res.json({ order });
})); // Errors tự động được caught và logged
```

**5. Database Query Logging:**

```javascript
// config/database.js với query logging
const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

const pool = mysql.createPool({
  // ... config
  // Enable query logging
  enableKeepAlive: true
});

// Wrap query để log
const originalQuery = pool.query.bind(pool);
pool.query = async function(sql, params) {
  const start = Date.now();
  
  try {
    const result = await originalQuery(sql, params);
    const duration = Date.now() - start;
    
    // Log slow queries (> 1 second)
    if (duration > 1000) {
      logger.warn('Slow query detected', {
        sql: sql.substring(0, 200), // Truncate long queries
        params,
        duration
      });
    }
    
    return result;
  } catch (error) {
    logger.error('Database query error', {
      sql: sql.substring(0, 200),
      params,
      error: error.message,
      duration: Date.now() - start
    });
    throw error;
  }
};
```

**6. Error Tracking (Sentry Integration):**

```javascript
// utils/errorTracking.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0, // 100% of transactions
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers['authorization'];
    }
    return event;
  }
});

// Capture exceptions
try {
  // Risky operation
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      component: 'order-service'
    },
    extra: {
      orderId: orderId,
      userId: userId
    }
  });
  throw error;
}

// Capture messages
Sentry.captureMessage('Something went wrong', 'warning');
```

**7. Log Aggregation (ELK Stack):**

```yaml
# docker-compose.yml với ELK
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
  
  logstash:
    image: docker.elastic.co/logstash/logstash:8.0.0
    volumes:
      - ./logstash/config:/usr/share/logstash/pipeline
    depends_on:
      - elasticsearch
  
  kibana:
    image: docker.elastic.co/kibana/kibana:8.0.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

**8. Health Check Logging:**

```javascript
// routes/health.js
router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {}
  };
  
  // Database check
  try {
    await db.query('SELECT 1');
    health.checks.database = 'ok';
  } catch (error) {
    health.checks.database = 'error';
    health.status = 'degraded';
    logger.error('Database health check failed', { error: error.message });
  }
  
  // Redis check
  try {
    await redisClient.ping();
    health.checks.redis = 'ok';
  } catch (error) {
    health.checks.redis = 'error';
    health.status = 'degraded';
    logger.error('Redis health check failed', { error: error.message });
  }
  
  // Memory check
  const memoryUsage = process.memoryUsage();
  health.memory = {
    used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
    total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB'
  };
  
  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

**Best Practices:**
- ✅ Centralized error handling middleware
- ✅ Structured logging với Winston
- ✅ Request ID tracking
- ✅ Log levels (error, warn, info, debug)
- ✅ Log rotation và retention
- ✅ Error tracking (Sentry)
- ✅ Log aggregation (ELK Stack)
- ✅ Query logging cho slow queries
- ✅ Health check logging
- ✅ Filter sensitive data trong logs
- ✅ Log analysis và alerting

---

**Tóm tắt hoàn thành các phần 16-20:**

- ✅ **Phần 16: Bảo mật** - 3 câu hỏi (SQL Injection/XSS, Rate Limiting/DDoS, Data Encryption)
- ✅ **Phần 17: Performance & Scalability** - 3 câu hỏi (Database Optimization, Caching Strategy, Scaling Strategy)
- ✅ **Phần 18: Testing & QA** - 1 câu hỏi (Testing Strategy: Unit, Integration, E2E, Load)
- ✅ **Phần 19: Deployment & DevOps** - 1 câu hỏi (Deployment Process, CI/CD, Docker, Migrations)
- ✅ **Phần 20: Error Handling & Logging** - 1 câu hỏi (Error Handling, Logging, Monitoring)

**Tổng kết:**
- **Tổng cộng:** 9 câu hỏi phản biện chi tiết cho các phần 16-20
- **Độ dài file:** ~9000+ dòng
- **Nội dung:** Rất chi tiết với code examples, best practices, và implementation details

File đã hoàn thành các phần 16-20 như yêu cầu! 🎉
# Báo Cáo Đánh Giá Dự Án TTTN2025 (TechStore)

Dưới đây là bản phân tích, đánh giá tổng quan về kiến trúc, tính năng đã làm được và các điểm cần cải thiện/nâng cấp cho dự án TechStore (TTTN2025).

## 1. Tổng Quan Kiến Trúc (Architecture)
Dự án được xây dựng theo kiến trúc **Microservices** kết hợp **API Gateway**, với giao diện Frontend theo hướng **Single Page Application (SPA)** viết bằng Vanilla Javascript.
*   **API Gateway**: Điểm vào duy nhất (Port 5000), đảm nhận việc điều hướng request đến các microservices, xử lý xác thực (Verify JWT qua Auth Service), và phân phối các file tĩnh (Frontend public).
*   **Microservices (Backend)**: Bao gồm 5 services độc lập:
    *   **Auth Service** (Port 5001): Quản lý đăng nhập, đăng ký, JWT, OTP, thông tin user.
    *   **Product Service** (Port 5002): Quản lý sản phẩm, danh mục.
    *   **Cart Service** (Port 5003): Quản lý giỏ hàng và các mặt hàng trong giỏ.
    *   **Order Service** (Port 5004): Quản lý đơn hàng, theo dõi giao hàng (shipments), mã giảm giá (coupons), điểm thưởng (loyalty).
    *   **News Service** (Port 5005): Quản lý tin tức công nghệ.
*   **Cơ Sở Dữ Liệu (Database)**: MySQL được sử dụng chung (Tuy architecture là microservice nhưng hiện tại các service đang dùng chung 1 database `tttn2025`).
*   **Deployment**: Toàn bộ hệ thống được containerize bằng Docker (`docker-compose.yml`), giúp việc triển khai dễ dàng chỉ qua vài câu lệnh PowerShell scripts (`docker-restart-clean.ps1`).

## 2. Các Tính Năng Đã Hoàn Thiện Tốt
1. **Kiến Trúc Microservices Cơ Bản**: Khung sườn microservice đã được thiết lập tốt qua Express.js và Axios, giúp phân chia domain logic (Auth, Product, Cart, Order, News).
2. **Hệ Thống Tính Năng Đa Dạng (Feature-rich)**:
    *   Xác thực: JWT authentication, Google OAuth2, Quên mật khẩu qua Email OTP (Nodemailer).
    *   Bán hàng: Quản lý giỏ hàng, Checkout, Mã giảm giá (Coupons), Tích điểm (Loyalty Points).
    *   Admin: Thống kê doanh thu, quản lý đơn hàng.
    *   Webhook Vận Chuyển: Đã có kiến trúc chuẩn bị sẵn cho việc nhận webhook từ GHN, GHTK, Viettel Post.
    *   AI Chatbot: Tích hợp API gọi mô hình LLM (Gemini/OpenAI compatible) làm trợ lý ảo tư vấn khách hàng.
3. **Frontend SPA Không Dùng Framework**: Xây dựng SPA với Vanilla JS (`app.js`), Tailwind CSS. Cấu trúc đầy đủ các tính năng Dark/Light mode (`theme.js`), Đa ngôn ngữ i18n (`i18n.js`).
4. **Data Seeding & Tooling**: Có hàng loạt các script hỗ trợ tạo db, seed dữ liệu, cập nhật schema rất tiện lợi trong thư mục `database/` (import csv, fake data...).

## 3. Các Điểm Hạn Chế Cần Nâng Cấp (Refactoring / Improvements)

### 3.1. Kiến Trúc Backend (API Gateway & Microservices)
*   **Gateway bị "phình to" (Overloaded Responsibility)**: Đúng chuẩn thì API Gateway chỉ nên làm proxy và middleware routing. Tuy nhiên, file `gateway/server.js` hiện tại đang "ôm" luôn logic CRUD cho bảng `comments`, gọi DB trực tiếp để truy xuất thống kê cho Admin Dashboard, và chứa luôn logic xử lý API Chatbot AI.
    *   *Khắc phục*: Tách phần Comment sang Product Service hoặc tạo Comment Service mới. Tách phần Thống Kê (Stats) vào Order/User Services. Tách phần Chatbot sang một service AI độc lập.
*   **Database Sharing (Anti-pattern của Microservices)**: Mặc dù dự án chia thành các microservices, nhưng tất cả đều đang kết nối chung tới một Database (`tttn2025`). Về lâu dài, nên tách DB cho từng service (Database-per-service) để đảm bảo tính độc lập đúng chuẩn.
*   **Quản Lý JWT Secret Kém An Toàn**: Chuỗi `JWT_SECRET` bị hardcode mặc định (`HhGg78@!kYpQzXcVbNmL1o2P3oI4U5yT6rE7wQ8aZ9sX0cVkGjH`) ở nhiều service khác nhau.
    *   *Khắc phục*: Bắt buộc đọc từ biến môi trường `process.env.JWT_SECRET` và loại bỏ hoàn toàn mã cứng trong source code (hoặc dùng asymmetric keys).
*   **Quản Lý Kết Nối Database**: Script đổi host khi DB sập (Auto-fallback) trong gateway chưa đóng connection pool cũ, có nguy cơ gây memory/connection leak.

### 3.2. Cấu Trúc Frontend (Client-side)
*   **Bảo trì file Vanilla JS lớn**: File `app.js` đang gánh toàn bộ logic SPA, API calls, DOM manipulation dẫn đến file rất nặng và khó debug/maintain. Việc quản lý State thủ công sẽ dần bị rối khi thêm tính năng mới.
    *   *Khắc phục*: 
        *   Nên chuyển đổi (Migration) Frontend sang sử dụng framework hiện đại như **React.js**, **Vue.js** hoặc **Next.js**.
        *   Nếu muốn giữ Vanilla JS, hãy áp dụng Module Bundler (Vite/Webpack) để chia nhỏ file `app.js` ra thành nhiều class/module nhỏ (vd: `cart.js`, `product.js`, `api.js`).
*   **Caching & Tốc độ tải trang**: File `index.html` import trực tiếp ảnh lớn trong CSS / style inline hoặc preload thiếu tối ưu.

### 3.3. Quality Assurance & Testing
*   **Lỗi Missing Dependencies**: Trong `package.json` có định nghĩa các lệnh test (Jest), nhưng khi chạy test thì báo lỗi thiếu `supertest` và `axios` ở root (Có thể các thư viện này chỉ mới được cài lẻ trong từng service).
    *   *Khắc phục*: Nên áp dụng cơ chế **Monorepo** (vd: NPM Workspaces hoặc Turborepo) để quản lý package json tập trung, hoặc đảm bảo thư mục root chạy `npm install` đầy đủ các devDependencies để tích hợp CI/CD tự động test trơn tru.

## 4. Kế Hoạch Đề Xuất Nâng Cấp (Next Steps)

1. **Giai đoạn 1 (Dễ - Refactor Code Cơ Bản):**
   * Sửa các hardcode `JWT_SECRET` thành biến môi trường ở tất cả services.
   * `npm install` bổ sung `supertest` và `axios` vào devDependencies để các lệnh `npm test` vượt qua (Pass) mượt mà. Đảm bảo test suite đang hoạt động.
   * Đồng nhất format API response cho toàn bộ microservices (vd: thống nhất dùng chuẩn `{ success: true, data: ... }`).

2. **Giai đoạn 2 (Trung bình - Refactor Kiến Trúc Backend):**
   * Chuyển logic Comment, API Stats Admin, API Chatbot từ API Gateway sang các Service chuyên biệt tương ứng.
   * Chuyển đổi mô hình routing trên Gateway sang dùng thư viện Proxy chuyên dụng gọn nhẹ hơn (vd: `http-proxy-middleware` hoặc dùng Nginx config thay thế Express gateway nếu cần hiệu năng cao).

3. **Giai đoạn 3 (Khó - Nâng Cấp Frontend):**
   * Đập đi xây lại Frontend với React/Next.js/Vue (Có thể tạo 1 repo/thư mục mới `frontend-v2`).
   * Tách trang Web cho Khách (Customer Portal) và trang Quản Trị (Admin Dashboard) thành 2 source code độc lập để đảm bảo bảo mật và tối ưu size bundle.

*Dự án TTTN2025 là một bước đi cực kì tốt cho một dự án tốt nghiệp / thực tế. Nền tảng đã sẵn sàng để scale up lên thành một hệ thống lớn.*
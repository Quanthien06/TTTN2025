# Hướng dẫn sử dụng Tailwind CSS

## Cách 1: Dùng Tailwind CDN (Đơn giản nhất) ✅

File `login.html` hiện tại đang dùng cách này:

```html
<head>
    <!-- Tailwind CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Custom CSS nếu cần -->
    <link rel="stylesheet" href="/login_styles.css">
</head>
```

**Ưu điểm:**
- Không cần cài đặt
- Dùng ngay được
- Phù hợp cho development

**Nhược điểm:**
- File CSS lớn (load từ CDN)
- Không tối ưu cho production

---

## Cách 2: Dùng Tailwind với file CSS (Build Process) 🚀

File `login_styles.css` có các directive:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Bước 1: Cài đặt Tailwind CSS

```bash
# Khởi tạo npm (nếu chưa có package.json)
npm init -y

# Cài đặt Tailwind CSS
npm install -D tailwindcss

# Tạo file config
npx tailwindcss init
```

### Bước 2: Cấu hình `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.{html,js}",
    "./public/*.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Bước 3: Build CSS

Tạo script trong `package.json`:

```json
{
  "scripts": {
    "build-css": "tailwindcss -i ./public/login_styles.css -o ./public/login_output.css --watch"
  }
}
```

Chạy lệnh:
```bash
npm run build-css
```

### Bước 4: Sử dụng trong HTML

```html
<head>
    <!-- Dùng file CSS đã build -->
    <link rel="stylesheet" href="/login_output.css">
</head>
```

---

## Cách 3: Kết hợp cả hai (Khuyến nghị) ⭐

```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đăng nhập - TechStore</title>
    
    <!-- Tailwind CDN cho development -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Custom styles từ login_styles.css -->
    <link rel="stylesheet" href="/login_styles.css">
    
    <!-- Custom CSS bổ sung -->
    <style>
        /* Custom animations, utilities */
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
            animation: slideUp 0.5s ease-out;
        }
    </style>
</head>
```

---

## Custom Tailwind Theme trong `login_styles.css`

Bạn có thể thêm custom styles vào `login_styles.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom components */
@layer components {
    .btn-primary {
        @apply bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
    }
    
    .input-custom {
        @apply bg-gray-50 border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500;
    }
}

/* Custom utilities */
@layer utilities {
    .text-gradient {
        @apply bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent;
    }
}
```

Sau đó dùng trong HTML:
```html
<button class="btn-primary">Đăng nhập</button>
<input class="input-custom" type="text">
<h1 class="text-gradient">TechStore</h1>
```

---

## So sánh các cách

| Cách | Ưu điểm | Nhược điểm | Phù hợp |
|------|---------|------------|---------|
| **CDN** | Dễ dùng, không cần build | File lớn, chậm | Development |
| **Build Process** | Tối ưu, nhẹ | Cần cài đặt, build | Production |
| **Kết hợp** | Linh hoạt | Phức tạp hơn | Cả hai |

---

## Lưu ý

1. **File `login_styles.css` với @tailwind directives:**
   - Chỉ hoạt động khi có build process
   - Nếu dùng CDN, file này sẽ không có tác dụng (vì không có @tailwind trong CDN)

2. **Nếu muốn dùng `login_styles.css` với CDN:**
   - Xóa `@tailwind` directives
   - Viết CSS thông thường hoặc dùng Tailwind classes trong HTML

3. **Production:**
   - Nên build CSS để tối ưu
   - File output sẽ nhỏ hơn và load nhanh hơn

---

## Ví dụ file `login_styles.css` cho CDN

Nếu muốn dùng với CDN, file có thể như sau:

```css
/* Custom styles bổ sung cho Tailwind */
.custom-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.animate-fade-in {
    animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
```

Sau đó dùng trong HTML:
```html
<div class="custom-gradient animate-fade-in">...</div>
```


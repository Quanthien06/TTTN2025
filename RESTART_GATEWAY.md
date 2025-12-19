# Hướng dẫn Restart Gateway để load file mới

## Nếu đang chạy Docker:

### Option 1: Rebuild chỉ gateway container (nhanh hơn)
```bash
docker-compose build gateway
docker-compose up -d gateway
```

### Option 2: Restart toàn bộ services
```bash
docker-compose restart gateway
```

### Option 3: Rebuild và restart (nếu vẫn không được)
```bash
docker-compose down
docker-compose build gateway
docker-compose up -d
```

## Nếu đang chạy local (không dùng Docker):

Chỉ cần:
1. Hard refresh browser: **Ctrl+F5** hoặc **Ctrl+Shift+R**
2. Hoặc xóa cache browser và refresh

## Kiểm tra sau khi restart:

1. Mở `http://localhost:5000/checkout.html`
2. Mở Console (F12) và xem log:
   - Nếu thấy "✅ Created accountNumber input immediately" → thành công
   - Nếu không thấy, kiểm tra xem có lỗi gì không

## Nếu vẫn không thấy input:

Chạy lệnh này trong Console (F12):
```javascript
const bankDetails = document.getElementById('bankDetails');
const select = bankDetails?.querySelector('select#bankSelect');
if (select) {
    const selectDiv = select.closest('div');
    if (selectDiv) {
        const newDiv = document.createElement('div');
        newDiv.innerHTML = `
            <label class="block text-sm font-medium text-gray-700 mb-1">Số tài khoản <span class="text-red-500">*</span></label>
            <input type="text" id="accountNumber" class="w-full border rounded-lg p-2" placeholder="Nhập số tài khoản" maxlength="20" style="display: block !important; visibility: visible !important; width: 100% !important; opacity: 1 !important;" />
        `;
        newDiv.style.cssText = 'display: block !important; visibility: visible !important;';
        selectDiv.parentNode.insertBefore(newDiv, selectDiv.nextSibling);
        console.log('✅ Input created manually');
    }
}
```


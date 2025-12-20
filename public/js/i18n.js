// Internationalization (i18n) System
(function() {
    'use strict';

    const LANG_KEY = 'language_preference';
    const DEFAULT_LANG = 'vi';

    const translations = {
        vi: {
            // Navigation
            'nav.home': 'Trang Chủ',
            'nav.products': 'Sản Phẩm',
            'nav.cart': 'Giỏ Hàng',
            'nav.orders': 'Đơn Hàng',
            'nav.profile': 'Hồ Sơ',
            'nav.login': 'Đăng Nhập',
            'nav.logout': 'Đăng Xuất',
            'nav.register': 'Đăng Ký',
            'nav.search': 'Tìm kiếm...',
            // Common
            'common.addToCart': 'Thêm vào giỏ',
            'common.buyNow': 'Mua ngay',
            'common.price': 'Giá',
            'common.total': 'Tổng',
            'common.quantity': 'Số lượng',
            'common.remove': 'Xóa',
            'common.checkout': 'Thanh toán',
            'common.loading': 'Đang tải...',
            'common.error': 'Có lỗi xảy ra',
            'common.success': 'Thành công',
            // Products
            'products.title': 'Sản Phẩm',
            'products.new': 'Sản phẩm mới',
            'products.featured': 'Sản phẩm nổi bật',
            'products.noResults': 'Không tìm thấy sản phẩm',
            // Cart
            'cart.title': 'Giỏ Hàng',
            'cart.empty': 'Giỏ hàng trống',
            'cart.subtotal': 'Tạm tính',
            'cart.shipping': 'Phí vận chuyển',
            'cart.total': 'Tổng cộng',
            // Orders
            'orders.title': 'Đơn Hàng',
            'orders.empty': 'Chưa có đơn hàng',
            'orders.status.pending': 'Chờ xử lý',
            'orders.status.processing': 'Đang xử lý',
            'orders.status.shipped': 'Đang giao',
            'orders.status.delivered': 'Đã giao',
            'orders.status.cancelled': 'Đã hủy',
            // Theme
            'theme.light': 'Sáng',
            'theme.dark': 'Tối',
            // Language
            'lang.vi': 'Tiếng Việt',
            'lang.en': 'English'
        },
        en: {
            // Navigation
            'nav.home': 'Home',
            'nav.products': 'Products',
            'nav.cart': 'Cart',
            'nav.orders': 'Orders',
            'nav.profile': 'Profile',
            'nav.login': 'Login',
            'nav.logout': 'Logout',
            'nav.register': 'Register',
            'nav.search': 'Search...',
            // Common
            'common.addToCart': 'Add to Cart',
            'common.buyNow': 'Buy Now',
            'common.price': 'Price',
            'common.total': 'Total',
            'common.quantity': 'Quantity',
            'common.remove': 'Remove',
            'common.checkout': 'Checkout',
            'common.loading': 'Loading...',
            'common.error': 'An error occurred',
            'common.success': 'Success',
            // Products
            'products.title': 'Products',
            'products.new': 'New Products',
            'products.featured': 'Featured Products',
            'products.noResults': 'No products found',
            // Cart
            'cart.title': 'Shopping Cart',
            'cart.empty': 'Cart is empty',
            'cart.subtotal': 'Subtotal',
            'cart.shipping': 'Shipping',
            'cart.total': 'Total',
            // Orders
            'orders.title': 'Orders',
            'orders.empty': 'No orders yet',
            'orders.status.pending': 'Pending',
            'orders.status.processing': 'Processing',
            'orders.status.shipped': 'Shipped',
            'orders.status.delivered': 'Delivered',
            'orders.status.cancelled': 'Cancelled',
            // Theme
            'theme.light': 'Light',
            'theme.dark': 'Dark',
            // Language
            'lang.vi': 'Tiếng Việt',
            'lang.en': 'English'
        }
    };

    // Get current language
    function getLanguage() {
        const saved = localStorage.getItem(LANG_KEY);
        return saved && translations[saved] ? saved : DEFAULT_LANG;
    }

    // Set language
    function setLanguage(lang) {
        if (translations[lang]) {
            localStorage.setItem(LANG_KEY, lang);
            document.documentElement.setAttribute('lang', lang);
            translatePage();
        }
    }

    // Translate a key
    function t(key, fallback = key) {
        const lang = getLanguage();
        const keys = key.split('.');
        let value = translations[lang];
        
        for (const k of keys) {
            value = value?.[k];
        }
        
        return value || fallback;
    }

    // Translate all elements with data-i18n attribute
    function translatePage() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translated = t(key);
            if (el.tagName === 'INPUT' && el.type === 'text' || el.tagName === 'INPUT' && el.type === 'search') {
                el.placeholder = translated;
            } else {
                el.textContent = translated;
            }
        });
    }

    // Export functions
    window.i18n = {
        t: t,
        setLanguage: setLanguage,
        getLanguage: getLanguage,
        translate: translatePage
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setLanguage(getLanguage());
        });
    } else {
        setLanguage(getLanguage());
    }
})();


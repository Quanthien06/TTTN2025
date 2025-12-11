// ============================================
// CONFIGURATION
// ============================================
const API_BASE_URL = 'http://localhost:5000/api';

// ============================================
// STATE MANAGEMENT
// ============================================
let currentUser = null;
let currentPage = 'home';
let currentProducts = [];
let currentPagination = { page: 1, limit: 12, total: 0, totalPages: 0 };
let currentFilters = {};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Placeholder image inline (tránh phụ thuộc CDN bị chặn)
const PLACEHOLDER_IMG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="24" font-family="Arial">No image</text></svg>';

// Lấy token từ localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Lấy user cache từ localStorage (fallback để ẩn nút đăng ký/đăng nhập ngay)
function getCachedUser() {
    try {
        const raw = localStorage.getItem('user_info');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

// Lưu token vào localStorage
function saveToken(token) {
    localStorage.setItem('token', token);
}

// Lưu user info vào localStorage
function saveUserInfo(user) {
    if (!user) return;
    localStorage.setItem('user_info', JSON.stringify(user));
}

// Xóa token khỏi localStorage
function removeToken() {
    localStorage.removeItem('token');
}

// Xóa thông tin user cache
function removeUserInfo() {
    localStorage.removeItem('user_info');
}

// Format số tiền VNĐ
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
}

// Hiển thị toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    toast.className = `toast fixed bottom-4 right-4 ${bgColor} text-white rounded-lg shadow-lg p-4 z-50 animate-fade-in`;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Hiển thị loading overlay
function showLoading() {
    document.getElementById('loadingOverlay').classList.add('active');
}

// Ẩn loading overlay
function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

// Gọi API với error handling
async function apiCall(endpoint, options = {}) {
    try {
        const token = getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        // Gửi token cho tất cả endpoint ngoại trừ login và register
        if (token && !endpoint.includes('/login') && !endpoint.includes('/register') && !endpoint.includes('/forgot-password') && !endpoint.includes('/reset-password') && !endpoint.includes('/verify-email') && !endpoint.includes('/resend-verification')) {
            headers['Authorization'] = `Bearer ${token}`;
            console.log('Sending token for endpoint:', endpoint);
        } else if (!token && (endpoint.includes('/me') || endpoint.includes('/profile') || endpoint.includes('/cart') || endpoint.includes('/orders'))) {
            // Nếu không có token nhưng endpoint cần auth
            throw new Error('Vui lòng đăng nhập để tiếp tục');
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            // Nếu lỗi 401, có thể token đã hết hạn
            if (response.status === 401) {
                removeToken();
                removeUserInfo();
                currentUser = null;
                updateUIForAuth(false);
            }
            throw new Error(data.message || 'Có lỗi xảy ra');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        console.error('Endpoint:', endpoint);
        console.error('Token exists:', !!getToken());
        throw error;
    }
}

// ============================================
// AUTHENTICATION
// ============================================

// Kiểm tra đăng nhập
async function checkAuth() {
    const token = getToken();
    if (!token) {
        updateUIForAuth(false);
        return;
    }

    // Nếu đã có user cache, hiển thị ngay để ẩn nút đăng nhập/đăng ký
    const cachedUser = getCachedUser();
    if (cachedUser) {
        currentUser = cachedUser;
        updateUIForAuth(true);
    } else {
        // Không có cache nhưng có token -> vẫn ẩn nút login/register ngay
        updateUIForAuth(true);
    }

    try {
        const data = await apiCall('/me');
        currentUser = data.user;
        updateUIForAuth(true);
        loadCartCount();
        redirectIfAdmin();
    } catch (error) {
        // Nếu có cache + token thì vẫn giữ UI đăng nhập để tránh nhấp nháy
        const hasToken = !!getToken();
        const cached = getCachedUser();
        if (cached && hasToken) {
            currentUser = cached;
            updateUIForAuth(true);
            redirectIfAdmin();
        } else {
            removeToken();
            removeUserInfo();
            updateUIForAuth(false);
        }
    }
}

// Nếu user là admin, chuyển sang trang admin
function redirectIfAdmin() {
    const isAdmin = currentUser && currentUser.role === 'admin';
    const onAdminPage = window.location.pathname.includes('/admin');
    if (isAdmin && !onAdminPage) {
        window.location.href = '/admin.html';
    }
}

// Đăng nhập
async function login(username, password) {
    try {
        showLoading();
        const data = await apiCall('/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        saveToken(data.token);
        currentUser = data.user;
        saveUserInfo(data.user);
        updateUIForAuth(true);
        closeModal('loginModal');
        showToast('Đăng nhập thành công!', 'success');
        loadCartCount();
        redirectIfAdmin();
        return true;
    } catch (error) {
        showToast(error.message, 'error');
        return false;
    } finally {
        hideLoading();
    }
}

// Đăng ký
async function register(username, password) {
    try {
        showLoading();
        await apiCall('/register', {
            method: 'POST',
            body: JSON.stringify({ username, password, role: 'user' })
        });

        closeModal('registerModal');
        showToast('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
        
        // Tự động mở modal đăng nhập
        setTimeout(() => {
            document.getElementById('loginModal').classList.add('active');
            document.getElementById('loginUsername').value = username;
            document.getElementById('loginPassword').focus();
        }, 500);
        return true;
    } catch (error) {
        showToast(error.message, 'error');
        return false;
    } finally {
        hideLoading();
    }
}

// Đăng xuất
function logout() {
    removeToken();
    removeUserInfo();
    currentUser = null;
    updateUIForAuth(false);
    showToast('Đã đăng xuất', 'success');
    navigateTo('home');
}

// Cập nhật UI theo trạng thái đăng nhập
function updateUIForAuth(isLoggedIn) {
    const navAuth = document.getElementById('navAuth');
    const navUser = document.getElementById('navUser');
    const userName = document.getElementById('userName');

    if (isLoggedIn) {
        if (navAuth) navAuth.classList.add('hidden');
        if (navUser) navUser.classList.remove('hidden');
        if (userName) {
            const username = currentUser?.username || 'User';
            userName.textContent = `Xin chào, ${username}`;
        }
    } else {
        if (navAuth) navAuth.classList.remove('hidden');
        if (navUser) navUser.classList.add('hidden');
    }
}

// ============================================
// NAVIGATION
// ============================================

// Danh sách route cho navigation
const CATEGORY_ROUTES = [
    'phone-tablet', 'phone', 'tablet', 'phone-accessories',
    'laptop', 'audio', 'watch-camera', 'accessories',
    'pc-monitor-printer', 'pc', 'monitor', 'printer', 'pc-parts',
    'promotions', 'tech-news'
];

const SUPPORTED_PAGES = [
    'home', 'products', 'categories', 'cart', 'orders', 'profile',
    ...CATEGORY_ROUTES
];

let currentCategoryTitle = 'Sản phẩm';
let currentCategorySubtitle = 'Tất cả sản phẩm đang có';

function isValidPage(page) {
    return !!page && SUPPORTED_PAGES.includes(page);
}

function buildPageHref(page) {
    if (!isValidPage(page)) return '/';
    return page === 'home' ? '/' : `/${page}.html`;
}

function getInitialPage() {
    const params = new URLSearchParams(window.location.search);
    const queryPage = params.get('page');
    if (isValidPage(queryPage)) return queryPage;

    const pathname = window.location.pathname.split('/').pop() || '';
    if (pathname.endsWith('.html')) {
        const pageFromPath = pathname.replace('.html', '');
        if (isValidPage(pageFromPath)) return pageFromPath;
    }

    const hashPage = window.location.hash.replace('#', '').trim();
    if (isValidPage(hashPage)) return hashPage;

    return 'home';
}

function updateURLForPage(page, replace = false) {
    if (!isValidPage(page)) return;
    const target = buildPageHref(page);
    const current = window.location.pathname + window.location.search + window.location.hash;
    if (current === target) return;
    const method = replace ? 'replaceState' : 'pushState';
    window.history[method]({}, '', target);
}

function refreshProductsHeader(totalItems = null) {
    const heading = document.getElementById('productsHeading');
    const subtitle = document.getElementById('productsSubtitle');
    const counter = document.getElementById('productsCounter');

    if (heading) heading.textContent = currentCategoryTitle || 'Sản phẩm';
    if (subtitle) subtitle.textContent = currentCategorySubtitle || 'Danh sách sản phẩm';

    if (counter) {
        const countText = totalItems !== null ? `${totalItems} sản phẩm` : 'Đang tải...';
        counter.textContent = countText;
    }
}

function renderActiveFilters() {
    const container = document.getElementById('activeFilters');
    if (!container) return;

    const chips = [];
    if (currentFilters.q) chips.push({ label: `Từ khóa: "${currentFilters.q}"`, key: 'q' });
    if (currentFilters.category) chips.push({ label: `Danh mục: ${currentFilters.category}`, key: 'category' });
    if (currentFilters.minPrice) chips.push({ label: `Giá từ ${currentFilters.minPrice.toLocaleString()}₫`, key: 'minPrice' });
    if (currentFilters.maxPrice) chips.push({ label: `Đến ${currentFilters.maxPrice.toLocaleString()}₫`, key: 'maxPrice' });
    if (currentFilters.sort && currentFilters.sort !== 'id') chips.push({ label: `Sắp xếp: ${currentFilters.sort}`, key: 'sort' });

    if (chips.length === 0) {
        container.innerHTML = '<span class="text-sm text-gray-500">Chưa áp dụng bộ lọc nào</span>';
        return;
    }

    container.innerHTML = chips.map(chip => `
        <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-sm border border-red-100">
            ${chip.label}
            <button class="text-xs hover:text-red-900" onclick="removeFilter('${chip.key}')">✕</button>
        </span>
    `).join('');
}

function removeFilter(key) {
    if (!key) return;
    switch (key) {
        case 'q':
            document.getElementById('searchInput').value = '';
            currentFilters.q = '';
            break;
        case 'category':
            document.getElementById('categoryFilter').value = '';
            currentFilters.category = '';
            break;
        case 'minPrice':
            document.getElementById('minPrice').value = '';
            currentFilters.minPrice = null;
            break;
        case 'maxPrice':
            document.getElementById('maxPrice').value = '';
            currentFilters.maxPrice = null;
            break;
        case 'sort':
            document.getElementById('sortSelect').value = 'id';
            currentFilters.sort = null;
            break;
    }
    applyFilters();
}

// Điều hướng trang
function navigateTo(page) {
    // Đặt tiêu đề mặc định cho trang sản phẩm
    if (page === 'products') {
        currentCategoryTitle = 'Sản phẩm';
        currentCategorySubtitle = 'Tất cả sản phẩm đang có';
    }

    // Ẩn tất cả các trang
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    
    // Nếu là category route, hiển thị trang products
    let pageId = page;
    if (CATEGORY_ROUTES.includes(page)) {
        pageId = 'products';
    } else {
        // Chuyển đổi page name thành pageId (ví dụ: 'home' -> 'Home')
        pageId = page.charAt(0).toUpperCase() + page.slice(1);
    }
    
    // Hiển thị trang được chọn
    const pageElement = document.getElementById(`page${pageId}`);
    if (pageElement) {
        pageElement.classList.remove('hidden');
    }

    // Cập nhật active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });

    currentPage = page;

    // Load dữ liệu cho trang
    switch (page) {
        case 'home':
            loadHomePage();
            break;
        case 'products':
            loadProducts();
            break;
        case 'categories':
            loadCategoriesPage();
            break;
        // Routes cho các danh mục sản phẩm
        case 'phone-tablet':
            navigateToCategory('Điện thoại, Tablet', ['Điện thoại', 'Tablet']);
            break;
        case 'phone':
            navigateToCategory('Điện thoại', ['Điện thoại']);
            break;
        case 'tablet':
            navigateToCategory('Tablet', ['Tablet']);
            break;
        case 'phone-accessories':
            navigateToCategory('Phụ kiện điện thoại', ['Phụ kiện điện thoại', 'Phụ kiện']);
            break;
        case 'laptop':
            navigateToCategory('Laptop', ['Laptop']);
            break;
        case 'audio':
            navigateToCategory('Âm thanh, Mic thu âm', ['Âm thanh', 'Mic', 'Loa', 'Tai nghe']);
            break;
        case 'watch-camera':
            navigateToCategory('Đồng hồ, Camera', ['Đồng hồ', 'Camera']);
            break;
        case 'accessories':
            navigateToCategory('Phụ kiện', ['Phụ kiện']);
            break;
        case 'pc-monitor-printer':
            navigateToCategory('PC, Màn hình, Máy in', ['PC', 'Màn hình', 'Máy in', 'Máy tính để bàn']);
            break;
        case 'pc':
            navigateToCategory('PC', ['PC', 'Máy tính để bàn']);
            break;
        case 'monitor':
            navigateToCategory('Màn hình', ['Màn hình']);
            break;
        case 'printer':
            navigateToCategory('Máy in', ['Máy in']);
            break;
        case 'pc-parts':
            navigateToCategory('Linh kiện PC', ['Linh kiện PC', 'Linh kiện']);
            break;
        case 'promotions':
            navigateToPromotions();
            break;
        case 'tech-news':
            navigateToTechNews();
            break;
        case 'cart':
            // Kiểm tra token - nếu có token thì cho vào cart.html
            // cart.html sẽ tự kiểm tra authentication và redirect nếu cần
            const token = getToken();
            if (token) {
                // Có token -> chuyển đến cart.html (cart.html sẽ tự verify)
                window.location.href = '/cart.html';
            } else {
                // Chưa có token -> chuyển đến trang login với redirect về cart
                window.location.href = '/login.html?redirect=cart';
            }
            break;
        case 'orders':
            if (currentUser) loadOrders();
            else {
                showToast('Vui lòng đăng nhập để xem đơn hàng', 'error');
                navigateTo('home');
            }
            break;
        case 'profile':
            // Kiểm tra token trước, nếu có token thì load profile (kể cả khi currentUser chưa được set)
            const profileToken = getToken();
            if (profileToken) {
                // Đảm bảo trang profile được hiển thị trước
                const profilePage = document.getElementById('pageProfile');
                if (profilePage) {
                    profilePage.classList.remove('hidden');
                }
                // Sau đó load dữ liệu
                loadProfile();
            } else {
                showToast('Vui lòng đăng nhập để xem hồ sơ', 'error');
                navigateTo('home');
            }
            break;
    }
}

// Hàm điều hướng đến trang sản phẩm với category filter
async function navigateToCategory(categoryName, searchTerms) {
    // Hiển thị trang products
    const pageElement = document.getElementById('pageProducts');
    if (pageElement) {
        pageElement.classList.remove('hidden');
    }

    currentCategoryTitle = categoryName || 'Sản phẩm';
    currentCategorySubtitle = `Kết quả cho ${categoryName || 'danh mục'}`;
    
    // Reset filters
    currentFilters = {};
    currentPagination.page = 1;
    
    // Thử sử dụng category filter trước, nếu không có thì dùng search query
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        try {
            // Đợi categories load xong rồi mới set filter
            await loadCategoryFilterOptions();
            
            // Thử tìm category name chính xác hoặc tương tự
            const option = Array.from(categoryFilter.options).find(
                opt => {
                    const optText = opt.text.toLowerCase();
                    const categoryLower = categoryName.toLowerCase();
                    return optText.includes(categoryLower) || 
                           categoryLower.includes(optText) ||
                           searchTerms.some(term => optText.includes(term.toLowerCase()));
                }
            );
            
            if (option && option.value) {
                categoryFilter.value = option.value;
                currentFilters.category = option.value;
            } else {
                // Nếu không tìm thấy category, dùng search query
                currentFilters.q = searchTerms.join(' ');
            }
        } catch (error) {
            // Nếu có lỗi, dùng search query
            console.error('Error loading categories:', error);
            currentFilters.q = searchTerms.join(' ');
        }
    } else {
        // Fallback: dùng search query
        currentFilters.q = searchTerms.join(' ');
    }
    
    // Cập nhật UI
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = currentFilters.q || '';
    }
    refreshProductsHeader();
    renderActiveFilters();
    
    // Load products với filter
    loadProducts();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Hàm điều hướng đến trang khuyến mãi
function navigateToPromotions() {
    // Hiển thị trang products
    const pageElement = document.getElementById('pageProducts');
    if (pageElement) {
        pageElement.classList.remove('hidden');
    }
    
    currentCategoryTitle = 'Khuyến mãi';
    currentCategorySubtitle = 'Sản phẩm đang giảm giá';

    // Reset filters và tìm sản phẩm có giảm giá
    currentFilters = {};
    currentFilters.q = 'khuyến mãi giảm giá';
    currentPagination.page = 1;
    
    // Cập nhật UI
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    if (searchInput) searchInput.value = 'khuyến mãi';
    if (categoryFilter) categoryFilter.value = '';
    refreshProductsHeader();
    renderActiveFilters();
    
    // Load products với filter
    loadProducts();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Hàm điều hướng đến trang tin công nghệ
function navigateToTechNews() {
    // Hiển thị trang products với filter tin công nghệ
    // Hoặc có thể tạo một trang riêng cho tin tức
    const pageElement = document.getElementById('pageProducts');
    if (pageElement) {
        pageElement.classList.remove('hidden');
    }
    
    currentCategoryTitle = 'Tin công nghệ';
    currentCategorySubtitle = 'Sản phẩm, thiết bị liên quan tin tức';

    // Reset filters
    currentFilters = {};
    currentFilters.q = 'tin công nghệ';
    currentPagination.page = 1;
    
    // Cập nhật UI
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    if (searchInput) searchInput.value = 'tin công nghệ';
    if (categoryFilter) categoryFilter.value = '';
    refreshProductsHeader();
    renderActiveFilters();
    
    // Load products với filter
    loadProducts();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Có thể hiển thị thông báo nếu đây là tính năng chưa có
    // showToast('Trang tin công nghệ đang được phát triển', 'info');
}

// ============================================
// HOME PAGE
// ============================================

async function loadHomePage() {
    loadCategories();
    loadFeaturedProducts();
}

async function loadCategories() {
    try {
        const data = await apiCall('/categories');
        const grid = document.getElementById('categoriesGrid');
        
        if (data.categories.length === 0) {
            grid.innerHTML = '<div class="empty-state">Chưa có danh mục nào</div>';
            return;
        }

        grid.innerHTML = data.categories.slice(0, 6).map(cat => `
            <div 
                class="category-card bg-white rounded-lg shadow-md p-6 text-center cursor-pointer hover:shadow-lg transition-shadow animate-fade-in"
                onclick="viewCategory(${cat.id})"
            >
                <div class="text-4xl mb-3">📦</div>
                <h3 class="font-bold text-gray-800 mb-2">${cat.name}</h3>
                <div class="text-sm text-gray-500">${cat.product_count || 0} sản phẩm</div>
            </div>
        `).join('');
    } catch (error) {
        document.getElementById('categoriesGrid').innerHTML = 
            `<div class="empty-state">Lỗi khi tải danh mục: ${error.message}</div>`;
    }
}

async function loadFeaturedProducts() {
    try {
        const data = await apiCall('/products?limit=8&sort=id&order=desc');
        const grid = document.getElementById('featuredProducts');
        
        if (!data.products || data.products.length === 0) {
            grid.innerHTML = '<div class="empty-state">Chưa có sản phẩm nào</div>';
            return;
        }

        renderProducts(data.products, grid);
    } catch (error) {
        document.getElementById('featuredProducts').innerHTML = 
            `<div class="empty-state">Lỗi khi tải sản phẩm: ${error.message}</div>`;
    }
}

function viewCategory(categoryId) {
    navigateTo('categories');
    // Có thể implement xem chi tiết category sau
}

// ============================================
// PRODUCTS PAGE
// ============================================

async function loadProducts() {
    try {
        showLoading();
        
        // Build query string từ filters
        const params = new URLSearchParams();
        if (currentFilters.q) params.append('q', currentFilters.q);
        if (currentFilters.category) params.append('category', currentFilters.category);
        if (currentFilters.minPrice) params.append('minPrice', currentFilters.minPrice);
        if (currentFilters.maxPrice) params.append('maxPrice', currentFilters.maxPrice);
        if (currentFilters.sort) {
            const [field, order] = currentFilters.sort.split('-');
            params.append('sort', field);
            params.append('order', order);
        }
        params.append('page', currentPagination.page);
        params.append('limit', currentPagination.limit);

        const data = await apiCall(`/products?${params.toString()}`);
        currentProducts = data.products || [];
        currentPagination = data.pagination || currentPagination;

        renderProducts(currentProducts, document.getElementById('productsGrid'));
        renderPagination();
        loadCategoryFilterOptions();
        refreshProductsHeader(data.pagination?.totalItems ?? currentProducts.length);
        renderActiveFilters();
    } catch (error) {
        document.getElementById('productsGrid').innerHTML = 
            `<div class="empty-state">Lỗi khi tải sản phẩm: ${error.message}</div>`;
    } finally {
        hideLoading();
    }
}

function renderProducts(products, container) {
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-500 py-12">Không tìm thấy sản phẩm nào</div>';
        return;
    }

    container.innerHTML = products.map(product => {
        // Tính phần trăm giảm giá (giả sử có giá gốc)
        const originalPrice = product.original_price || product.price * 1.1;
        const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);
        const hasDiscount = discountPercent > 0;

        return `
        <div class="product-card animate-fade-in">
            <div class="media relative">
                ${hasDiscount ? `
                    <div class="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded z-10 shadow">
                        Giảm ${discountPercent}%
                    </div>
                ` : ''}
                <img 
                    src="${product.image_url || product.image || '/img/placeholder.png'}" 
                    alt="${product.name}"
                    loading="lazy"
                    onerror="this.src='/img/placeholder.png'"
                />
            </div>
            <div class="body">
                <div class="text-xs text-gray-500 mb-1">${product.category || 'Chưa phân loại'}</div>
                <h3 class="font-bold text-gray-800 mb-1 line-clamp-2 min-h-[44px]">${product.name}</h3>
                <div class="price-row">
                    <span class="price">${formatPrice(product.price)}</span>
                    ${hasDiscount ? `
                        <span class="price-old">${formatPrice(originalPrice)}</span>
                    ` : ''}
                </div>
                ${product.description ? `
                    <p class="text-sm text-gray-600 mb-3 line-clamp-2">${product.description}</p>
                ` : ''}
                ${currentUser ? `
                    <button 
                        onclick="addToCart(${product.id}, '${product.name}', ${product.price})"
                        class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Thêm vào giỏ
                    </button>
                ` : `
                    <a 
                        href="/login.html"
                        class="block w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg text-center transition-colors"
                    >
                        Đăng nhập để mua
                    </a>
                `}
            </div>
        </div>
        `;
    }).join('');
}

async function loadCategoryFilterOptions() {
    try {
        const data = await apiCall('/categories');
        const select = document.getElementById('categoryFilter');
        const currentValue = select.value;
        
        select.innerHTML = '<option value="">Tất cả danh mục</option>' +
            data.categories.map(cat => 
                `<option value="${cat.name}" ${currentValue === cat.name ? 'selected' : ''}>${cat.name}</option>`
            ).join('');
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function applyFilters() {
    currentFilters.q = document.getElementById('searchInput').value.trim();
    currentFilters.category = document.getElementById('categoryFilter').value;
    currentFilters.minPrice = document.getElementById('minPrice').value || null;
    currentFilters.maxPrice = document.getElementById('maxPrice').value || null;
    currentFilters.sort = document.getElementById('sortSelect').value || null;
    currentPagination.page = 1; // Reset về trang đầu
    renderActiveFilters();
    refreshProductsHeader();
    loadProducts();
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('sortSelect').value = 'id';
    currentFilters = {};
    currentPagination.page = 1;
    currentCategoryTitle = 'Sản phẩm';
    currentCategorySubtitle = 'Tất cả sản phẩm đang có';
    renderActiveFilters();
    refreshProductsHeader();
    loadProducts();
}

function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!currentPagination.totalPages || currentPagination.totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = '';
    
    // Previous button
    html += `<button 
        ${currentPagination.page === 1 ? 'disabled' : ''} 
        onclick="changePage(${currentPagination.page - 1})"
        class="px-4 py-2 border border-gray-300 rounded-lg ${currentPagination.page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'} transition-colors"
    >‹</button>`;
    
    // Page numbers
    for (let i = 1; i <= currentPagination.totalPages; i++) {
        if (i === 1 || i === currentPagination.totalPages || 
            (i >= currentPagination.page - 2 && i <= currentPagination.page + 2)) {
            html += `<button 
                class="px-4 py-2 border border-gray-300 rounded-lg ${i === currentPagination.page ? 'bg-red-600 text-white border-red-600' : 'hover:bg-gray-100'} transition-colors"
                onclick="changePage(${i})"
            >${i}</button>`;
        } else if (i === currentPagination.page - 3 || i === currentPagination.page + 3) {
            html += `<button disabled class="px-4 py-2 opacity-50">...</button>`;
        }
    }
    
    // Next button
    html += `<button 
        ${currentPagination.page === currentPagination.totalPages ? 'disabled' : ''} 
        onclick="changePage(${currentPagination.page + 1})"
        class="px-4 py-2 border border-gray-300 rounded-lg ${currentPagination.page === currentPagination.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'} transition-colors"
    >›</button>`;
    
    pagination.innerHTML = html;
}

function changePage(page) {
    currentPagination.page = page;
    loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// CART
// ============================================

async function loadCart() {
    try {
        showLoading();
        const data = await apiCall('/cart');
        const content = document.getElementById('cartContent');
        
        if (!data.cart.items || data.cart.items.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <h3>Giỏ hàng trống</h3>
                    <p>Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
                    <button class="btn btn-primary" onclick="navigateTo('products')">Xem sản phẩm</button>
                </div>
            `;
            return;
        }

        const itemsCount = data.cart.items.length;
        const subtotal = data.cart.total || 0;
        const shipping = 0; // Có thể cập nhật nếu backend trả về phí ship
        const total = subtotal + shipping;

        const itemsHTML = data.cart.items.map(item => `
            <div class="cart-row">
                <div class="cart-thumb">
                    <img src="${item.product_image || '/img/placeholder.png'}" alt="${item.product_name || 'Sản phẩm'}" onerror="this.src='/img/placeholder.png'">
                </div>
                <div class="cart-info">
                    <div class="name">${item.product_name || 'Sản phẩm'}</div>
                    <div class="meta">${item.product_category || ''}</div>
                </div>
                <div class="cart-qty">
                    <button onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <input type="number" value="${item.quantity}" min="1" onchange="updateCartItemQuantity(${item.id}, this.value)">
                    <button onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <div class="cart-price text-right">
                    ${formatPrice(item.subtotal || item.price * item.quantity)}
                    <span class="cart-remove" onclick="removeCartItem(${item.id})">&#10005;</span>
                </div>
            </div>
        `).join('');

        content.innerHTML = `
            <div class="cart-template">
                <div class="cart-card">
                    <div class="row g-0">
                        <div class="col-lg-8">
                            <div class="cart-panel">
                                <div class="cart-title d-flex justify-content-between align-items-center">
                                    <span>Shopping Cart</span>
                                    <span class="text-muted">${itemsCount} items</span>
                                </div>
                                <div class="cart-items">
                                    ${itemsHTML}
                                </div>
                                <div class="back-to-shop" onclick="navigateTo('products')">
                                    <span>&larr;</span>
                                    <span class="text-muted">Tiếp tục mua sắm</span>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-4">
                            <div class="cart-panel summary h-100">
                                <div><h5><b>Tổng quan</b></h5></div>
                                <hr>
                                <div class="cart-summary">
                                    <div class="line">
                                        <span>ITEMS ${itemsCount}</span>
                                        <span>${formatPrice(subtotal)}</span>
                                    </div>
                                    <div class="line">
                                        <span>SHIPPING</span>
                                        <span>${shipping > 0 ? formatPrice(shipping) : 'Miễn phí'}</span>
                                    </div>
                                    <div class="line total">
                                        <span>TOTAL</span>
                                        <span>${formatPrice(total)}</span>
                                    </div>
                                </div>
                                <div class="cart-code mt-3">
                                    <input id="code" class="input" placeholder="Mã giảm giá (nếu có)" />
                                    <span class="icon">&#10148;</span>
                                </div>
                                <button class="btn btn-primary btn-block btn-lg mt-3" onclick="openCheckoutModal(${total})">CHECKOUT</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        document.getElementById('cartContent').innerHTML = 
            `<div class="empty-state">Lỗi khi tải giỏ hàng: ${error.message}</div>`;
    } finally {
        hideLoading();
    }
}

async function loadCartCount() {
    if (!currentUser) return;
    
    try {
        const data = await apiCall('/cart');
        const badge = document.getElementById('cartBadge');
        const badgeHeader = document.getElementById('cartBadgeHeader');
        const count = data.cart.items?.length || 0;
        
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
        }
        if (badgeHeader) {
            badgeHeader.textContent = count;
            if (count > 0) {
                badgeHeader.classList.remove('hidden');
            } else {
                badgeHeader.classList.add('hidden');
            }
        }
    } catch (error) {
        console.error('Error loading cart count:', error);
    }
}

async function addToCart(productId, productName, price) {
    try {
        showLoading();
        await apiCall('/cart/items', {
            method: 'POST',
            body: JSON.stringify({ product_id: productId, quantity: 1 })
        });
        showToast(`Đã thêm "${productName}" vào giỏ hàng`, 'success');
        loadCartCount();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function updateCartItemQuantity(itemId, quantity) {
    if (quantity < 1) quantity = 1;
    
    try {
        showLoading();
        await apiCall(`/cart/items/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity: parseInt(quantity) })
        });
        loadCart();
        loadCartCount();
    } catch (error) {
        showToast(error.message, 'error');
        loadCart();
    } finally {
        hideLoading();
    }
}

async function removeCartItem(itemId) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) return;
    
    try {
        showLoading();
        await apiCall(`/cart/items/${itemId}`, { method: 'DELETE' });
        showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'success');
        loadCart();
        loadCartCount();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

function openCheckoutModal(total) {
    document.getElementById('orderTotal').value = formatPrice(total);
    document.getElementById('checkoutModal').classList.add('active');
}

async function checkout(shippingAddress, phone) {
    try {
        showLoading();
        const data = await apiCall('/orders', {
            method: 'POST',
            body: JSON.stringify({ shipping_address: shippingAddress, phone })
        });
        
        closeModal('checkoutModal');
        showToast('Đặt hàng thành công!', 'success');
        loadCart();
        loadCartCount();
        
        // Navigate to orders page
        setTimeout(() => navigateTo('orders'), 1000);
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// ============================================
// ORDERS
// ============================================

async function loadOrders() {
    try {
        showLoading();
        const data = await apiCall('/orders');
        const content = document.getElementById('ordersContent');
        
        if (!data.orders || data.orders.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <h3>Chưa có đơn hàng nào</h3>
                    <p>Hãy mua sắm và đặt hàng ngay!</p>
                    <button class="btn btn-primary" onclick="navigateTo('products')">Xem sản phẩm</button>
                </div>
            `;
            return;
        }

        content.innerHTML = data.orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <strong>Đơn hàng #${order.id}</strong>
                        <div style="color: var(--text-muted); font-size: 0.875rem; margin-top: 0.25rem;">
                            ${new Date(order.created_at).toLocaleString('vi-VN')}
                        </div>
                    </div>
                    <div>
                        <span class="order-status ${order.status}">${getStatusText(order.status)}</span>
                        <div style="text-align: right; margin-top: 0.5rem; font-weight: 700; color: var(--accent);">
                            ${formatPrice(order.total)}
                        </div>
                    </div>
                </div>
                <div>
                    <div><strong>Địa chỉ giao hàng:</strong> ${order.shipping_address || 'N/A'}</div>
                    <div style="margin-top: 0.5rem;"><strong>Số điện thoại:</strong> ${order.phone || 'N/A'}</div>
                </div>
                <div class="order-items" style="margin-top: 1rem;">
                    <div style="font-weight: 600; margin-bottom: 0.5rem;">Sản phẩm (${order.item_count}):</div>
                    <div style="color: var(--text-muted); font-size: 0.875rem;">
                        Tổng số lượng: ${order.total_quantity || order.item_count}
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        document.getElementById('ordersContent').innerHTML = 
            `<div class="empty-state">Lỗi khi tải đơn hàng: ${error.message}</div>`;
    } finally {
        hideLoading();
    }
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Chờ xử lý',
        'processing': 'Đang xử lý',
        'shipped': 'Đang giao hàng',
        'delivered': 'Đã giao hàng',
        'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
}

// ============================================
// PROFILE
// ============================================

async function loadProfile() {
    const content = document.getElementById('profileContent');
    if (!content) {
        console.error('Không tìm thấy element profileContent');
        return;
    }
    
    // Kiểm tra token trước
    const token = getToken();
    if (!token) {
        content.innerHTML = `
            <div class="alert alert-warning" role="alert">
                <h4 class="alert-heading">Chưa đăng nhập!</h4>
                <p>Vui lòng đăng nhập để xem hồ sơ của bạn.</p>
                <hr>
                <p class="mb-0">
                    <a href="/login.html" class="btn btn-primary">Đăng nhập</a>
                </p>
            </div>
        `;
        return;
    }
    
    try {
        showLoading();
        console.log('Loading profile with token:', token.substring(0, 20) + '...');
        const data = await apiCall('/me');
        const user = data.user;
        
        if (!user) {
            throw new Error('Không có dữ liệu user');
        }
        
        // Format role display
        const roleDisplay = user.role === 'admin' ? 'Quản trị viên' : 'Người dùng';
        const roleBadgeColor = user.role === 'admin' ? 'bg-red-600' : 'bg-blue-600';
        
        // Format date
        const createdDate = new Date(user.created_at).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Check if email verified (xử lý null/undefined)
        const emailStatus = (user.email_verified === true || user.email_verified === 1) ? 
            '<span class="text-green-600"><i class="fas fa-check-circle mr-1"></i>Đã xác thực</span>' : 
            '<span class="text-yellow-600"><i class="fas fa-exclamation-circle mr-1"></i>Chưa xác thực</span>';
        
        // Check if Google account (xử lý null/undefined)
        const loginMethod = (user.google_id && user.google_id !== '') ? 
            '<span class="text-blue-600"><i class="fab fa-google mr-1"></i>Đăng nhập bằng Google</span>' : 
            '<span class="text-gray-600"><i class="fas fa-envelope mr-1"></i>Đăng nhập bằng Email</span>';
        
        content.innerHTML = `
            <section style="background-color: #eee;">
                <div class="container py-5">
                    <div class="row">
                        <div class="col">
                            <nav aria-label="breadcrumb" class="bg-body-tertiary rounded-3 p-3 mb-4">
                                <ol class="breadcrumb mb-0">
                                    <li class="breadcrumb-item"><a href="#" onclick="navigateTo('home'); return false;">Trang chủ</a></li>
                                    <li class="breadcrumb-item"><a href="#" onclick="navigateTo('profile'); return false;">Tài khoản</a></li>
                                    <li class="breadcrumb-item active" aria-current="page">Hồ sơ cá nhân</li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-lg-4">
                            <div class="card mb-4">
                                <div class="card-body text-center">
                                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=dc2626&color=fff&size=150" 
                                        alt="avatar" class="rounded-circle img-fluid" style="width: 150px;">
                                    <h5 class="my-3">${user.username}</h5>
                                    <p class="text-muted mb-1">
                                        <span class="px-3 py-1 rounded-full text-white text-sm ${roleBadgeColor}">${roleDisplay}</span>
                                    </p>
                                    <p class="text-muted mb-4">${loginMethod}</p>
                                    <div class="d-flex justify-content-center mb-2">
                                        <button type="button" onclick="editProfile()" class="btn btn-primary">
                                            <i class="fas fa-edit mr-2"></i>Chỉnh sửa
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="card mb-4 mb-lg-0">
                                <div class="card-body p-0">
                                    <ul class="list-group list-group-flush rounded-3">
                                        <li class="list-group-item d-flex justify-content-between align-items-center p-3">
                                            <i class="fas fa-envelope fa-lg text-primary"></i>
                                            <p class="mb-0">${user.email || 'Chưa cập nhật'}</p>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between align-items-center p-3">
                                            <i class="fas fa-shield-alt fa-lg text-success"></i>
                                            <p class="mb-0">${emailStatus}</p>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between align-items-center p-3">
                                            <i class="fas fa-calendar fa-lg text-info"></i>
                                            <p class="mb-0">Tham gia: ${createdDate}</p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-8">
                            <div class="card mb-4">
                                <div class="card-body">
                                    <h5 class="mb-4">Thông tin tài khoản</h5>
                                    <div class="row">
                                        <div class="col-sm-3">
                                            <p class="mb-0">Tên đăng nhập</p>
                                        </div>
                                        <div class="col-sm-9">
                                            <p class="text-muted mb-0">${user.username}</p>
                                        </div>
                                    </div>
                                    <hr>
                                    <div class="row">
                                        <div class="col-sm-3">
                                            <p class="mb-0">Email</p>
                                        </div>
                                        <div class="col-sm-9">
                                            <p class="text-muted mb-0">${user.email || 'Chưa cập nhật'}</p>
                                        </div>
                                    </div>
                                    <hr>
                                    <div class="row">
                                        <div class="col-sm-3">
                                            <p class="mb-0">Vai trò</p>
                                        </div>
                                        <div class="col-sm-9">
                                            <p class="text-muted mb-0">${roleDisplay}</p>
                                        </div>
                                    </div>
                                    <hr>
                                    <div class="row">
                                        <div class="col-sm-3">
                                            <p class="mb-0">Trạng thái email</p>
                                        </div>
                                        <div class="col-sm-9">
                                            <p class="mb-0">${emailStatus}</p>
                                        </div>
                                    </div>
                                    <hr>
                                    <div class="row">
                                        <div class="col-sm-3">
                                            <p class="mb-0">Phương thức đăng nhập</p>
                                        </div>
                                        <div class="col-sm-9">
                                            <p class="mb-0">${loginMethod}</p>
                                        </div>
                                    </div>
                                    <hr>
                                    <div class="row">
                                        <div class="col-sm-3">
                                            <p class="mb-0">Ngày tham gia</p>
                                        </div>
                                        <div class="col-sm-9">
                                            <p class="text-muted mb-0">${createdDate}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="card mb-4 mb-md-0">
                                        <div class="card-body">
                                            <h5 class="mb-4"><span class="text-primary font-italic me-1">Cài đặt</span> Tài khoản</h5>
                                            <div class="mb-3">
                                                <button onclick="showEditUsername()" class="btn btn-outline-primary btn-sm w-100">
                                                    <i class="fas fa-edit mr-2"></i>Cập nhật tên đăng nhập
                                                </button>
                                            </div>
                                            <div class="mb-3">
                                                <button onclick="showChangePassword()" class="btn btn-outline-danger btn-sm w-100">
                                                    <i class="fas fa-key mr-2"></i>Đổi mật khẩu
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card mb-4 mb-md-0">
                                        <div class="card-body">
                                            <h5 class="mb-4"><span class="text-primary font-italic me-1">Thống kê</span> Hoạt động</h5>
                                            <p class="mb-1" style="font-size: .77rem;">Tổng đơn hàng</p>
                                            <div class="progress rounded" style="height: 5px;">
                                                <div class="progress-bar bg-success" role="progressbar" style="width: 100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
                                            </div>
                                            <p class="mt-4 mb-1" style="font-size: .77rem;">Đơn đã giao</p>
                                            <div class="progress rounded" style="height: 5px;">
                                                <div class="progress-bar bg-info" role="progressbar" style="width: 80%" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100"></div>
                                            </div>
                                            <p class="mt-4 mb-1" style="font-size: .77rem;">Đơn đang xử lý</p>
                                            <div class="progress rounded" style="height: 5px;">
                                                <div class="progress-bar bg-warning" role="progressbar" style="width: 20%" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Edit Username Modal -->
            <div id="editUsernameModal" class="modal hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div class="modal-content bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-bold text-gray-800">Cập nhật tên đăng nhập</h2>
                        <button onclick="closeEditModal()" class="text-gray-500 hover:text-gray-700">&times;</button>
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2">Tên đăng nhập mới</label>
                        <input type="text" id="profileUsername" value="${user.username}" 
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500" required>
                    </div>
                    <button onclick="updateProfile()" class="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-bold">
                        Cập nhật
                    </button>
                </div>
            </div>
            
            <!-- Change Password Modal -->
            <div id="changePasswordModal" class="modal hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div class="modal-content bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-bold text-gray-800">Đổi mật khẩu</h2>
                        <button onclick="closePasswordModal()" class="text-gray-500 hover:text-gray-700">&times;</button>
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2">Mật khẩu hiện tại</label>
                        <input type="password" id="currentPassword" 
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500" required>
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2">Mật khẩu mới</label>
                        <input type="password" id="newPassword" minlength="6"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500" required>
                    </div>
                    <button onclick="changePassword()" class="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-bold">
                        Đổi mật khẩu
                    </button>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Lỗi khi load profile:', error);
        const content = document.getElementById('profileContent');
        if (content) {
            content.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Lỗi!</h4>
                    <p>Không thể tải thông tin hồ sơ: ${error.message}</p>
                    <hr>
                    <p class="mb-0">
                        <button onclick="loadProfile()" class="btn btn-primary">Thử lại</button>
                        <a href="/login.html" class="btn btn-outline-secondary">Đăng nhập lại</a>
                    </p>
                </div>
            `;
        }
    } finally {
        hideLoading();
    }
}

function editProfile() {
    showEditUsername();
}

function showEditUsername() {
    const modal = document.getElementById('editUsernameModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeEditModal() {
    const modal = document.getElementById('editUsernameModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function showChangePassword() {
    const modal = document.getElementById('changePasswordModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    if (modal) {
        modal.classList.add('hidden');
        const currentPassword = document.getElementById('currentPassword');
        const newPassword = document.getElementById('newPassword');
        if (currentPassword) currentPassword.value = '';
        if (newPassword) newPassword.value = '';
    }
}

async function updateProfile() {
    const username = document.getElementById('profileUsername').value.trim();
    if (!username) {
        showToast('Tên đăng nhập không được để trống', 'error');
        return;
    }
    
    try {
        showLoading();
        await apiCall('/profile', {
            method: 'PUT',
            body: JSON.stringify({ username })
        });
        showToast('Cập nhật thông tin thành công!', 'success');
        closeEditModal();
        checkAuth(); // Refresh user info
        loadProfile(); // Reload profile page
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    
    if (!currentPassword || !newPassword) {
        showToast('Vui lòng điền đầy đủ thông tin', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showToast('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
        return;
    }
    
    try {
        showLoading();
        await apiCall('/change-password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword })
        });
        showToast('Đổi mật khẩu thành công!', 'success');
        closePasswordModal();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// ============================================
// CATEGORIES PAGE
// ============================================

async function loadCategoriesPage() {
    try {
        showLoading();
        const data = await apiCall('/categories');
        const content = document.getElementById('categoriesList');
        
        if (!data.categories || data.categories.length === 0) {
            content.innerHTML = '<div class="empty-state">Chưa có danh mục nào</div>';
            return;
        }

        content.innerHTML = data.categories.map(cat => `
            <div 
                class="category-card bg-white rounded-lg shadow-md p-6 text-center cursor-pointer hover:shadow-lg transition-shadow animate-fade-in"
                onclick="viewCategoryProducts('${cat.name}')"
            >
                <div class="text-4xl mb-3">📦</div>
                <h3 class="font-bold text-gray-800 mb-2">${cat.name}</h3>
                <div class="text-sm text-gray-500 mb-2">${cat.product_count || 0} sản phẩm</div>
                ${cat.description ? `<p class="text-xs text-gray-600 mt-2">${cat.description}</p>` : ''}
            </div>
        `).join('');
    } catch (error) {
        document.getElementById('categoriesList').innerHTML = 
            `<div class="empty-state">Lỗi khi tải danh mục: ${error.message}</div>`;
    } finally {
        hideLoading();
    }
}

function viewCategoryProducts(categoryName) {
    navigateTo('products');
    document.getElementById('categoryFilter').value = categoryName;
    applyFilters();
}

// ============================================
// MODAL FUNCTIONS
// ============================================

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Đồng bộ UI ngay lập tức theo localStorage trước khi gọi API
    const cachedUser = getCachedUser();
    if (cachedUser) {
        currentUser = cachedUser;
        updateUIForAuth(true);
    } else if (getToken()) {
        // Có token nhưng chưa fetch /me: vẫn ẩn nút đăng ký/đăng nhập
        updateUIForAuth(true);
    }

    // Kiểm tra đăng nhập khi trang load
    checkAuth();

    // Navigation
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
        const page = link.dataset.page;
        const href = buildPageHref(page);
        if (href) {
            link.setAttribute('href', href);
        }

        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.dataset.page;
            if (targetPage === 'cart' || targetPage === 'orders' || targetPage === 'profile') {
                if (!currentUser) {
                    showToast('Vui lòng đăng nhập', 'error');
                    window.location.href = '/login.html';
                    return;
                }
            }
            updateURLForPage(targetPage);
            navigateTo(targetPage);
        });
    });

    // Main search bar
    const mainSearchInput = document.getElementById('mainSearchInput');
    if (mainSearchInput) {
        mainSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                navigateTo('products');
                document.getElementById('searchInput').value = mainSearchInput.value;
                applyFilters();
            }
        });
    }

    // User menu toggle
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenuDropdown = document.getElementById('userMenuDropdown');
    if (userMenuBtn && userMenuDropdown) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenuDropdown.classList.toggle('hidden');
        });
        document.addEventListener('click', () => {
            userMenuDropdown.classList.add('hidden');
        });
    }

    document.getElementById('logoutBtn').addEventListener('click', () => {
        logout();
    });

    // Close modals
    document.getElementById('loginModalClose').addEventListener('click', () => {
        closeModal('loginModal');
    });

    document.getElementById('registerModalClose').addEventListener('click', () => {
        closeModal('registerModal');
    });

    document.getElementById('checkoutModalClose').addEventListener('click', () => {
        closeModal('checkoutModal');
    });

    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });

    // Forms
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        await login(username, password);
    });

    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        await register(username, password);
    });

    document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const address = document.getElementById('shippingAddress').value;
        const phone = document.getElementById('shippingPhone').value;
        await checkout(address, phone);
    });

    // Filters
    document.getElementById('applyFiltersBtn').addEventListener('click', applyFilters);
    document.getElementById('resetFiltersBtn').addEventListener('click', resetFilters);

    // Enter key in search
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });

    // Điều hướng trang ban đầu
    const initialPage = getInitialPage();
    updateURLForPage(initialPage, true);
    navigateTo(initialPage);

    window.addEventListener('popstate', () => {
        const pageFromHistory = getInitialPage();
        navigateTo(pageFromHistory);
    });
});

// Make functions available globally for onclick handlers
window.addToCart = addToCart;
window.navigateTo = navigateTo;
window.viewCategory = viewCategory;
window.viewCategoryProducts = viewCategoryProducts;
window.changePage = changePage;
window.updateCartItemQuantity = updateCartItemQuantity;
window.removeCartItem = removeCartItem;
window.openCheckoutModal = openCheckoutModal;
window.updateProfile = updateProfile;
window.changePassword = changePassword;
window.showEditUsername = showEditUsername;
window.closeEditModal = closeEditModal;
window.showChangePassword = showChangePassword;
window.closePasswordModal = closePasswordModal;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;


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
let currentView = 'products'; // 'products' | 'news'
let isLoggingIn = false; // Flag để tránh gọi checkAuth() ngay sau khi login

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Placeholder image inline (tránh phụ thuộc CDN bị chặn)
const PLACEHOLDER_IMG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="24" font-family="Arial">No image</text></svg>';

// Lấy token từ localStorage
function getToken() {
    const token = localStorage.getItem('token');
    // Chỉ trả về token nếu nó tồn tại và không rỗng
    if (!token || token.trim() === '' || token === 'null' || token === 'undefined') {
        return null;
    }
    return token;
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
    // Trigger event để sync header trên các trang khác
    window.dispatchEvent(new Event('authStateChanged'));
    // Also trigger storage event manually for same-tab sync
    if (window.syncHeaderAuthUI) {
        setTimeout(() => window.syncHeaderAuthUI(), 100);
    }
}

// Lưu user info vào localStorage
function saveUserInfo(user) {
    if (!user) return;
    localStorage.setItem('user_info', JSON.stringify(user));
    // Trigger event để sync header trên các trang khác
    window.dispatchEvent(new Event('authStateChanged'));
    // Also trigger storage event manually for same-tab sync
    if (window.syncHeaderAuthUI) {
        setTimeout(() => window.syncHeaderAuthUI(), 100);
    }
}

// Xóa token khỏi localStorage
function removeToken() {
    localStorage.removeItem('token');
    // Trigger event để sync header trên các trang khác
    window.dispatchEvent(new Event('authStateChanged'));
    // Also trigger storage event manually for same-tab sync
    if (window.syncHeaderAuthUI) {
        setTimeout(() => window.syncHeaderAuthUI(), 100);
    }
}

// Xóa thông tin user cache
function removeUserInfo() {
    localStorage.removeItem('user_info');
    // Trigger event để sync header trên các trang khác
    window.dispatchEvent(new Event('authStateChanged'));
    // Also trigger storage event manually for same-tab sync
    if (window.syncHeaderAuthUI) {
        setTimeout(() => window.syncHeaderAuthUI(), 100);
    }
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
        const needsAuth = endpoint.includes('/me') || endpoint.includes('/profile') || endpoint.includes('/cart') || endpoint.includes('/orders');
        
        if (!token && needsAuth) {
            // Nếu không có token nhưng endpoint cần auth, không gọi API
            console.log('No token for protected endpoint:', endpoint);
            throw new Error('Vui lòng đăng nhập để tiếp tục');
        }
        
        if (token && !endpoint.includes('/login') && !endpoint.includes('/register') && !endpoint.includes('/forgot-password') && !endpoint.includes('/reset-password') && !endpoint.includes('/verify-email') && !endpoint.includes('/resend-verification')) {
            headers['Authorization'] = `Bearer ${token}`;
            console.log('Sending token for endpoint:', endpoint);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            // Nếu lỗi 401 và có token, có thể token đã hết hạn hoặc không hợp lệ
            // NHƯNG: Không xóa token ngay cho endpoint /me - để checkAuth() quyết định
            if (response.status === 401 && token && !endpoint.includes('/me')) {
                console.log('API returned 401 for non-/me endpoint, token may be invalid or expired');
                // Chỉ xóa token cho các endpoint khác /me
                removeToken();
                removeUserInfo();
                currentUser = null;
                updateUIForAuth(false);
            } else if (response.status === 401 && token && endpoint.includes('/me')) {
                console.log('API returned 401 for /me endpoint, but keeping token for checkAuth to decide');
                // Không xóa token ở đây, để checkAuth() quyết định dựa trên cached user
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
    // Nếu đang trong quá trình login, không gọi checkAuth() để tránh xóa token
    if (isLoggingIn) {
        console.log('checkAuth: Skipping - login in progress');
        return;
    }
    
    const token = getToken();
    if (!token) {
        console.log('checkAuth: No valid token found');
        // Làm sạch localStorage nếu có giá trị không hợp lệ
        const rawToken = localStorage.getItem('token');
        if (rawToken && (rawToken === 'null' || rawToken === 'undefined' || rawToken.trim() === '')) {
            console.log('checkAuth: Cleaning invalid token from localStorage');
            removeToken();
            removeUserInfo();
        }
        currentUser = null;
        updateUIForAuth(false);
        return;
    }

    console.log('checkAuth: Valid token found, checking auth...');

    // Nếu đã có user cache, hiển thị ngay để ẩn nút đăng nhập/đăng ký
    const cachedUser = getCachedUser();
    if (cachedUser) {
        currentUser = cachedUser;
        updateUIForAuth(true);
        console.log('checkAuth: Using cached user:', currentUser);
    } else {
        // Không có cache nhưng có token -> vẫn ẩn nút login/register ngay
        updateUIForAuth(true);
        console.log('checkAuth: Token exists but no cached user, fetching /me...');
    }

    try {
        const data = await apiCall('/me');
        currentUser = data.user;
        saveUserInfo(data.user); // Cập nhật cache
        updateUIForAuth(true);
        loadCartCount();
        checkAdminAccess();
        console.log('checkAuth success:', currentUser);
    } catch (error) {
        console.error('checkAuth error:', error.message);
        
        // QUAN TRỌNG: Kiểm tra lại token và cache TRƯỚC KHI quyết định xóa
        const hasToken = !!getToken();
        const cached = getCachedUser();
        
        if (cached && hasToken) {
            // Vẫn có token và cache -> GIỮ token và UI đăng nhập
            // Có thể API /me tạm thời lỗi nhưng token vẫn hợp lệ
            currentUser = cached;
            updateUIForAuth(true);
            checkAdminAccess();
            console.log('checkAuth: Using cached user after error (keeping token):', currentUser);
        } else if (error.message.includes('Token không hợp lệ') || error.message.includes('401')) {
            // Chỉ xóa token nếu thực sự không hợp lệ VÀ không có cache
            console.log('checkAuth: Token invalid and no cache, clearing auth state');
            removeToken();
            removeUserInfo();
            currentUser = null;
            updateUIForAuth(false);
        } else {
            // Lỗi khác (network, server) -> giữ token và cache nếu có
            if (cached) {
                currentUser = cached;
                updateUIForAuth(true);
                checkAdminAccess();
                console.log('checkAuth: Network/server error, keeping cached user');
            } else {
                currentUser = null;
                updateUIForAuth(false);
                console.log('checkAuth: Network/server error, no cache, cleared auth state');
            }
        }
    }
}

// Kiểm tra và hiển thị nút admin (không redirect tự động)
function checkAdminAccess() {
    const isAdmin = currentUser && currentUser.role === 'admin';
    const adminMenuLink = document.getElementById('adminMenuLink');
    if (adminMenuLink) {
        if (isAdmin) {
            adminMenuLink.classList.remove('hidden');
        } else {
            adminMenuLink.classList.add('hidden');
        }
    }
}

// Đăng nhập
async function login(username, password) {
    try {
        // Set flag để tránh checkAuth() gọi ngay sau khi login
        isLoggingIn = true;
        console.log('Login: Set isLoggingIn = true');
        
        showLoading();
        console.log('Login attempt for username:', username);
        
        const data = await apiCall('/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        console.log('Login API response:', data);

        if (!data.token || !data.user) {
            throw new Error('Đăng nhập thất bại: Thiếu thông tin từ server');
        }

        // Lưu token và user info
        saveToken(data.token);
        currentUser = data.user;
        saveUserInfo(data.user);
        
        // Kiểm tra lại token đã được lưu chưa
        const savedToken = getToken();
        console.log('Login: Token saved:', !!savedToken, 'Token length:', savedToken ? savedToken.length : 0);
        console.log('Login: User saved:', currentUser);
        
        // QUAN TRỌNG: Cập nhật UI ngay lập tức DỰA TRÊN DATA TỪ LOGIN
        // KHÔNG gọi checkAuth() ngay để tránh xóa token
        updateUIForAuth(true);
        
        // Đóng modal và hiển thị thông báo
        closeModal('loginModal');
        showToast(`Đăng nhập thành công! Xin chào, ${currentUser.username}!`, 'success');
        
        // Load cart count và kiểm tra admin access
        loadCartCount();
        checkAdminAccess();
        
        // Delay việc verify token qua /me để đảm bảo token đã được lưu vào localStorage
        // Và reset flag sau khi verify xong
        setTimeout(async () => {
            try {
                const verifyData = await apiCall('/me');
                // Cập nhật lại user info nếu có thay đổi
                if (verifyData.user) {
                    currentUser = verifyData.user;
                    saveUserInfo(verifyData.user);
                    updateUIForAuth(true);
                    checkAdminAccess();
                    console.log('Login: Token verified successfully');
                }
            } catch (error) {
                // Nếu verify fail nhưng vẫn có cached user, giữ UI đăng nhập
                console.log('Login: Token verification failed, but keeping UI logged in:', error.message);
                if (currentUser) {
                    updateUIForAuth(true);
                }
            } finally {
                // Reset flag sau khi verify xong
                isLoggingIn = false;
                console.log('Login: Reset isLoggingIn flag');
            }
        }, 1000); // Tăng delay lên 1 giây để đảm bảo token đã được lưu
        
        return true;
    } catch (error) {
        console.error('Login error:', error);
        showToast(error.message || 'Đăng nhập thất bại', 'error');
        isLoggingIn = false; // Reset flag nếu có lỗi
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
    const navNotifications = document.getElementById('navNotifications');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');

    console.log('updateUIForAuth called:', { 
        isLoggedIn, 
        currentUser, 
        username: currentUser?.username,
        hasToken: !!getToken() 
    });

    if (isLoggedIn && currentUser && currentUser.username) {
        // Ẩn nút đăng nhập/đăng ký
        if (navAuth) {
            navAuth.classList.add('hidden');
            console.log('Hidden navAuth');
        }
        
        // Hiển thị user menu
        if (navUser) {
            navUser.classList.remove('hidden');
            console.log('Shown navUser');
        }
        
        // Hiển thị notifications
        if (navNotifications) {
            navNotifications.classList.remove('hidden');
            updateNotificationUI();
        }
        
        // Cập nhật tên user
        if (userName) {
            const username = currentUser.username;
            userName.textContent = `Xin chào, ${username}!`;
            console.log('Updated userName to:', `Xin chào, ${username}!`);
        }
        
        // Cập nhật avatar - ưu tiên avatar_url từ database, nếu không có thì dùng ui-avatars
        if (userAvatar) {
            const displayName = currentUser.full_name || currentUser.username;
            let avatarUrl;
            if (currentUser.avatar_url && currentUser.avatar_url.trim() !== '') {
                avatarUrl = currentUser.avatar_url;
            } else {
                // Sử dụng ui-avatars với màu đỏ (dc2626) để match theme
                avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=dc2626&color=fff&size=32&bold=true`;
            }
            userAvatar.src = avatarUrl;
            userAvatar.alt = displayName;
            // Xử lý lỗi nếu ảnh không load được
            userAvatar.onerror = function() {
                // Fallback về ui-avatars nếu avatar_url không load được
                const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=dc2626&color=fff&size=32&bold=true`;
                if (this.src !== fallbackUrl) {
                    this.src = fallbackUrl;
                }
            };
            console.log('Updated userAvatar to:', avatarUrl);
        }
        
        // Kiểm tra và hiển thị nút admin
        checkAdminAccess();
    } else {
        // Hiển thị nút đăng nhập/đăng ký
        if (navAuth) {
            navAuth.classList.remove('hidden');
            console.log('Shown navAuth');
        }
        
        // Ẩn user menu
        if (navUser) {
            navUser.classList.add('hidden');
            console.log('Hidden navUser');
        }
        
        // Ẩn notifications
        if (navNotifications) {
            navNotifications.classList.add('hidden');
        }
        
        // Xóa tên user
        if (userName) {
            userName.textContent = '';
            console.log('Cleared userName');
        }
        
        // Xóa avatar
        if (userAvatar) {
            userAvatar.src = '';
            userAvatar.alt = '';
        }
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

const STATIC_PAGES = ['faq', 'about', 'warranty', 'returns', 'shipping'];

const SUPPORTED_PAGES = [
    'home', 'products', 'categories', 'cart', 'orders', 'profile',
    ...CATEGORY_ROUTES,
    ...STATIC_PAGES
];

let currentCategoryTitle = 'Sản phẩm';
let currentCategorySubtitle = 'Tất cả sản phẩm đang có';

function isValidPage(page) {
    return !!page && SUPPORTED_PAGES.includes(page);
}

function buildPageHref(page) {
    if (!isValidPage(page)) return '/';
    if (page === 'home') return '/';
    return `/${page}.html`;
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

function applyProductsModeFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const mode = (params.get('mode') || '').toLowerCase();
    const page = (params.get('page') || '').toLowerCase();

    if (page === 'products' && mode === 'new') {
        activateNewProductsMode();
    }
}

function updateURLForPage(page, replace = false) {
    if (!isValidPage(page)) return;
    const target = buildPageHref(page);
    const current = window.location.pathname + window.location.search + window.location.hash;
    if (current === target) return;
    const method = replace ? 'replaceState' : 'pushState';
    window.history[method]({}, '', target);
}

function toggleFilters(show) {
    const sidebar = document.getElementById('filtersSidebar');
    const chips = document.getElementById('activeFilters');
    if (sidebar) sidebar.classList.toggle('hidden', !show);
    if (chips) chips.classList.toggle('hidden', !show);
}

function refreshProductsHeader(totalItems = null) {
    const heading = document.getElementById('productsHeading');
    const subtitle = document.getElementById('productsSubtitle');
    const counter = document.getElementById('productsCounter');
    const headerBox = document.getElementById('productsHeaderBox');

    if (heading) heading.textContent = currentCategoryTitle || 'Sản phẩm';
    if (subtitle) subtitle.textContent = currentCategorySubtitle || 'Danh sách sản phẩm';

    if (counter) {
        const countText = totalItems !== null ? `${totalItems} sản phẩm` : 'Đang tải...';
        counter.textContent = countText;
    }

    // Center align when viewing "Sản phẩm mới"
    if (headerBox) {
        headerBox.classList.toggle('products-header-centered', (currentCategoryTitle || '').toLowerCase() === 'sản phẩm mới');
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
        currentView = 'products';
        currentPagination.limit = 12;
        toggleFilters(true);
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

function activateNewProductsMode() {
    currentCategoryTitle = 'Sản phẩm mới';
    currentCategorySubtitle = '4 sản phẩm mới nhất và danh sách theo mới nhất';
    currentView = 'products';
    toggleFilters(true);

    // reset filters but keep newest sort
    currentFilters = {};
    currentPagination.page = 1;

    // Sort newest (id desc) – supported by backend as sort=id&order=desc
    currentFilters.sort = 'id-desc';
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'id-desc';

    refreshProductsHeader();
    renderActiveFilters();
    loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Expose for buttons/links
window.navigateToNewProducts = function () {
    // If we are in SPA index already, just navigate and activate mode
    if (document.getElementById('pageProducts')) {
        // Ensure products page visible
        navigateTo('products');
        // navigateTo('products') will call loadProducts(), so override state then reload
        activateNewProductsMode();
        return;
    }
    // Fallback for any standalone page
    window.location.href = '/?page=products&mode=new';
};

// Hàm điều hướng đến trang sản phẩm với category filter
async function navigateToCategory(categoryName, searchTerms) {
    // Hiển thị trang products
    const pageElement = document.getElementById('pageProducts');
    if (pageElement) {
        pageElement.classList.remove('hidden');
    }

    currentCategoryTitle = categoryName || 'Sản phẩm';
    currentCategorySubtitle = `Kết quả cho ${categoryName || 'danh mục'}`;
    currentView = 'products';
    currentPagination.limit = 12;
    toggleFilters(true);
    
    // Reset filters
    currentFilters = {};
    currentPagination.page = 1;
    
    // Set category filter trực tiếp bằng category name
    currentFilters.category = categoryName;
    
    // Cập nhật dropdown nếu có
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        try {
            // Đợi categories load xong
            await loadCategoryFilterOptions();
            
            // Tìm option khớp với category name
            const option = Array.from(categoryFilter.options).find(
                opt => {
                    const optText = opt.text.trim();
                    return optText === categoryName;
                }
            );
            
            if (option && option.value) {
                categoryFilter.value = option.value;
                // Đảm bảo currentFilters.category = giá trị từ option (có thể khác format)
                currentFilters.category = categoryName; // Giữ nguyên category name chính xác
            } else {
                // Nếu không tìm thấy trong dropdown, vẫn set category filter
                console.log('Category not found in dropdown, using direct filter:', categoryName);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            // Vẫn giữ category filter
        }
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
    currentView = 'products';
    currentPagination.limit = 12;
    toggleFilters(true);

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
    currentCategorySubtitle = 'Tin tức công nghệ mới nhất';
    currentView = 'news';
    currentPagination = { ...currentPagination, page: 1, limit: 5 };
    toggleFilters(false);
    refreshProductsHeader();
    renderActiveFilters();
    loadNews();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// HOME PAGE
// ============================================

async function loadHomePage() {
    loadCategories();
    loadFeaturedProducts();
    loadNewProducts();
}

async function loadCategories() {
    try {
        const data = await apiCall('/categories');
        const grid = document.getElementById('categoriesGrid');
        
        if (data.categories.length === 0) {
            const scrollWrapper = grid.querySelector('.categories-scroll-wrapper');
            if (scrollWrapper) {
                scrollWrapper.innerHTML = '<div class="empty-state">Chưa có danh mục nào</div>';
            } else {
                grid.innerHTML = '<div class="empty-state">Chưa có danh mục nào</div>';
            }
            return;
        }

        // Load product image for each category
        const categoriesWithImages = await Promise.all(
            data.categories.map(async (cat) => {
                let productImage = null;
                try {
                    // Fetch one product from this category
                    const productsData = await apiCall(`/products?category=${encodeURIComponent(cat.name)}&limit=1`);
                    if (productsData.products && productsData.products.length > 0) {
                        const product = productsData.products[0];
                        const imageData = getProductImage(product);
                        productImage = imageData.primary;
                    }
                } catch (err) {
                    console.warn(`Could not load product image for category ${cat.name}:`, err);
                }
                return { ...cat, productImage };
            })
        );

        // Hiển thị tất cả categories với hình ảnh sản phẩm
        const scrollWrapper = grid.querySelector('.categories-scroll-wrapper');
        const cardsHTML = categoriesWithImages.map(cat => {
            const route = cat.route || 'products';
            const categoryName = cat.name;
            
            return `
            <a 
                href="/${route}.html"
                onclick="event.preventDefault(); navigateTo('${route}'); return false;"
                class="category-card-new bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-all duration-300 animate-fade-in block flex items-center gap-3"
            >
                ${cat.productImage ? `
                    <div class="category-image-wrapper flex-shrink-0">
                        <img 
                            src="${cat.productImage}" 
                            alt="${categoryName}"
                            class="category-product-image w-16 h-16 object-cover rounded-lg"
                            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                        />
                        <div class="text-3xl hidden w-16 h-16 items-center justify-center bg-gray-100 rounded-lg">${cat.icon || '📦'}</div>
                    </div>
                ` : `
                    <div class="category-image-wrapper flex-shrink-0">
                        <div class="text-3xl w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg">${cat.icon || '📦'}</div>
                    </div>
                `}
                <div class="category-info flex-1 min-w-0">
                    <h3 class="font-bold text-gray-800 mb-1 text-sm md:text-base">${categoryName}</h3>
                    <div class="text-xs text-gray-500">${cat.product_count || 0} sản phẩm</div>
                </div>
            </a>
            `;
        }).join('');
        
        if (scrollWrapper) {
            scrollWrapper.innerHTML = cardsHTML;
        } else {
            // Fallback: create wrapper if it doesn't exist
            grid.innerHTML = `<div class="categories-scroll-wrapper flex gap-3 min-w-max">${cardsHTML}</div>`;
        }
    } catch (error) {
        const grid = document.getElementById('categoriesGrid');
        const scrollWrapper = grid?.querySelector('.categories-scroll-wrapper');
        if (scrollWrapper) {
            scrollWrapper.innerHTML = `<div class="empty-state">Lỗi khi tải danh mục: ${error.message}</div>`;
        } else {
            grid.innerHTML = `<div class="empty-state">Lỗi khi tải danh mục: ${error.message}</div>`;
        }
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

async function loadNewProducts() {
    const grid = document.getElementById('newProductsGrid');
    if (!grid) return;

    try {
        const data = await apiCall('/products?limit=4&sort=id&order=desc');

        if (!data.products || data.products.length === 0) {
            grid.innerHTML = '<div class="empty-state">Chưa có sản phẩm nào</div>';
            return;
        }

        renderProducts(data.products, grid);
    } catch (error) {
        grid.innerHTML = `<div class="empty-state">Lỗi khi tải sản phẩm mới: ${error.message}</div>`;
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
    currentView = 'products';
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

async function loadNews() {
    try {
        showLoading();
        const params = new URLSearchParams();
        params.append('page', currentPagination.page);
        params.append('limit', currentPagination.limit || 5);

        const data = await apiCall(`/news?${params.toString()}`);
        const news = data.news || [];
        currentPagination = data.pagination || currentPagination;

        renderNews(news, document.getElementById('productsGrid'));
        renderPagination();
        refreshProductsHeader(data.pagination?.totalItems ?? news.length);
        renderActiveFilters();
    } catch (error) {
        document.getElementById('productsGrid').innerHTML = 
            `<div class="empty-state">Lỗi khi tải tin công nghệ: ${error.message}</div>`;
    } finally {
        hideLoading();
    }
}

// Tạo slug từ tên sản phẩm (dùng chung cho cả app.js và product-details.html)
function createSlug(name) {
    if (!name) return '';
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// Lấy ảnh sản phẩm từ folder structure hoặc database
function getProductImage(product) {
    // Tạo slug từ tên sản phẩm
    const slug = product.slug || createSlug(product.name);
    const basePath = `/img/products/${slug}`;
    
    // Ưu tiên load từ folder structure: /img/products/[slug]/1.jpg
    const folderImage = `${basePath}/1.jpg`;
    
    // Fallback về database nếu folder không có ảnh
    const fallbackImage = product.main_image_url || product.image_url || product.image || '/img/placeholder.png';
    
    // Trả về cả 2 để xử lý onerror
    return {
        primary: folderImage,
        fallback: fallbackImage
    };
}

function renderProducts(products, container) {
    if (container) {
        container.className = 'products-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6';
    }

    if (!products || products.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-500 py-12">Không tìm thấy sản phẩm nào</div>';
        return;
    }

    container.innerHTML = products.map(product => {
        // Tính phần trăm giảm giá (giả sử có giá gốc)
        const originalPrice = product.original_price || product.price * 1.1;
        const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);
        const hasDiscount = discountPercent > 0;
        
        // Tạo link tới product detail (dùng slug nếu có, không thì dùng id)
        const productSlug = product.slug || `product-${product.id}`;
        const productDetailUrl = `/product-details.html?slug=${encodeURIComponent(productSlug)}`;
        
        // Lấy ảnh từ folder structure hoặc database
        const imageData = getProductImage(product);
        const mainImage = imageData.primary;
        const fallbackImage = imageData.fallback;

        return `
        <a href="${productDetailUrl}" 
           class="product-card animate-fade-in block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group h-full flex flex-col"
           onclick="event.stopPropagation();">
            <div class="media relative overflow-hidden flex-shrink-0">
                ${hasDiscount ? `
                    <div class="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded z-10 shadow">
                        Giảm ${discountPercent}%
                    </div>
                ` : ''}
                <img 
                    src="${mainImage}" 
                    alt="${product.name}"
                    loading="lazy"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onerror="this.src='${fallbackImage}'; this.onerror=null;"
                />
            </div>
            <div class="body p-4 flex flex-col flex-1">
                <div class="text-xs text-gray-500 mb-1">${product.category || 'Chưa phân loại'}</div>
                <h3 class="font-bold text-gray-800 mb-1 line-clamp-2 min-h-[3.5rem] group-hover:text-red-600 transition-colors">${product.name}</h3>
                <div class="price-row mb-2 flex-shrink-0">
                    <span class="price text-red-600 font-bold text-lg">${formatPrice(product.price)}</span>
                    ${hasDiscount ? `
                        <span class="price-old text-gray-400 line-through text-sm ml-2">${formatPrice(originalPrice)}</span>
                    ` : ''}
                </div>
                ${product.description ? `
                    <p class="text-sm text-gray-600 mb-3 line-clamp-2 product-description">${product.description}</p>
                ` : '<div class="product-description mb-3"></div>'}
                ${currentUser ? `
                    <div class="flex gap-2 mt-auto flex-nowrap">
                        <button 
                            onclick="event.preventDefault(); event.stopPropagation(); addToCart(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${product.price})"
                            class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2.5 px-2 rounded-lg transition-colors whitespace-nowrap flex items-center justify-center text-sm"
                        >
                            <span>Thêm vào giỏ</span>
                        </button>
                        <button 
                            onclick="event.preventDefault(); event.stopPropagation(); buyNow(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${product.price})"
                            class="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-2 rounded-lg transition-colors whitespace-nowrap flex items-center justify-center text-sm"
                        >
                            <span>Mua ngay</span>
                        </button>
                    </div>
                ` : `
                    <div 
                        onclick="event.preventDefault(); event.stopPropagation(); window.location.href='/login.html'"
                        class="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2.5 px-4 rounded-lg text-center transition-colors mt-auto cursor-pointer"
                    >
                        Đăng nhập để mua
                    </div>
                `}
            </div>
        </a>
        `;
    }).join('');
}

function renderNews(newsItems, container) {
    if (container) {
        container.className = 'news-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
    }

    if (!newsItems || newsItems.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-500 py-12">Chưa có tin công nghệ nào</div>';
        return;
    }

    container.innerHTML = newsItems.map(item => `
        <a href="/news-details.html?slug=${encodeURIComponent(item.slug)}"
            class="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow h-full">
            <div class="relative aspect-[4/3] bg-gray-100">
                <img 
                    src="${item.thumbnail_url || PLACEHOLDER_IMG}" 
                    alt="${item.title}" 
                    class="absolute inset-0 w-full h-full object-cover"
                    onerror="this.src='${PLACEHOLDER_IMG}'"
                >
            </div>
            <div class="p-4 flex flex-col gap-2 flex-1">
                <div class="text-[11px] uppercase text-red-600 font-semibold tracking-wide">${item.category || 'Tech'}</div>
                <h3 class="font-semibold text-gray-900 line-clamp-2">${item.title}</h3>
                <p class="text-sm text-gray-600 line-clamp-3">${item.summary || ''}</p>
                <div class="text-xs text-gray-500">${item.author || 'TechStore News'} • ${item.published_at ? new Date(item.published_at).toLocaleString('vi-VN') : ''}</div>
                <div class="mt-auto inline-flex items-center gap-2 text-red-600 font-semibold">
                    Đọc thêm
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </div>
            </div>
        </a>
    `).join('');
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
    if (currentView === 'news') {
        loadNews();
    } else {
        loadProducts();
    }
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
        
        // Handle both response formats (backward compatibility)
        const cart = data.cart || data;
        const items = cart?.items || [];
        
        // Calculate total quantity (sum of all item quantities)
        const count = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        
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
        // Hide badge on error
        const badge = document.getElementById('cartBadge');
        const badgeHeader = document.getElementById('cartBadgeHeader');
        if (badge) badge.style.display = 'none';
        if (badgeHeader) badgeHeader.classList.add('hidden');
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
        // Add notification
        if (typeof addNotification !== 'undefined' && typeof NOTIFICATION_TYPES !== 'undefined') {
            addNotification(
                NOTIFICATION_TYPES.CART_ADDED,
                `Đã thêm "${productName}" vào giỏ hàng`,
                { productId, productName }
            );
        }
        // Reload cart count
        if (typeof loadCartCount === 'function') {
            loadCartCount();
        }
        
        // Update cart badge in header
        if (typeof window.syncCartBadge === 'function') {
            window.syncCartBadge();
        }
        
        // Trigger cart updated event
        window.dispatchEvent(new Event('cartUpdated'));
        localStorage.setItem('cart_updated', Date.now().toString());
        
        // If on cart page, reload cart to show new item
        if (window.location.pathname === '/cart.html' || window.location.pathname.includes('cart.html')) {
            // Use setTimeout để đảm bảo event đã được dispatch
            setTimeout(() => {
                if (typeof loadCart === 'function') {
                    loadCart();
                }
            }, 200);
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function buyNow(productId, productName, price) {
    try {
        showLoading();
        // Thêm sản phẩm vào giỏ hàng
        await apiCall('/cart/items', {
            method: 'POST',
            body: JSON.stringify({ product_id: productId, quantity: 1 })
        });
        
        // Lấy giỏ hàng hiện tại
        const cartData = await apiCall('/cart');
        // API /api/cart trả về { cart: { ... } } nên unwrap nếu cần
        const cart = (cartData && cartData.cart) ? cartData.cart : cartData;

        // Tạo checkoutData
        const checkoutData = {
            cart: cart,
            shippingMethod: 'standard',
            discount: 0,
            promoCode: null,
            total: cart.total || 0
        };
        
        // Lưu vào sessionStorage
        sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
        
        // Chuyển đến trang checkout
        window.location.href = '/checkout.html';
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
        
        // Add notification
        const orderId = data.order?.id || data.id;
        addNotification(
            NOTIFICATION_TYPES.ORDER_PLACED,
            `Đặt hàng thành công! Đơn hàng #${orderId}`,
            { orderId }
        );
        
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
// NOTIFICATIONS
// ============================================

// Notification types
const NOTIFICATION_TYPES = {
    CART_ADDED: 'cart_added',
    ORDER_PLACED: 'order_placed',
    ORDER_DELIVERED: 'order_delivered',
    ORDER_CANCELLED: 'order_cancelled'
};

// Get notifications from localStorage
function getNotifications() {
    try {
        const stored = localStorage.getItem('notifications');
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

// Save notifications to localStorage
function saveNotifications(notifications) {
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

// Add a new notification
function addNotification(type, message, data = {}) {
    const notifications = getNotifications();
    const newNotification = {
        id: Date.now(),
        type,
        message,
        data,
        read: false,
        timestamp: new Date().toISOString()
    };
    notifications.unshift(newNotification); // Add to beginning
    // Keep only last 50 notifications
    if (notifications.length > 50) {
        notifications.splice(50);
    }
    saveNotifications(notifications);
    updateNotificationUI();
    return newNotification;
}

// Mark notification as read
function markNotificationRead(notificationId) {
    const notifications = getNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        saveNotifications(notifications);
        updateNotificationUI();
    }
}

// Mark all notifications as read
function markAllNotificationsRead() {
    const notifications = getNotifications();
    notifications.forEach(n => n.read = true);
    saveNotifications(notifications);
    updateNotificationUI();
}

// Get unread count
function getUnreadCount() {
    const notifications = getNotifications();
    return notifications.filter(n => !n.read).length;
}

// Update notification UI
function updateNotificationUI() {
    const navNotifications = document.getElementById('navNotifications');
    const notificationBadge = document.getElementById('notificationBadge');
    const notificationList = document.getElementById('notificationList');
    
    if (!navNotifications || !notificationBadge || !notificationList) return;
    
    const notifications = getNotifications();
    const unreadCount = getUnreadCount();
    
    // Update badge
    if (unreadCount > 0) {
        notificationBadge.textContent = unreadCount > 10 ? '10+' : unreadCount;
        notificationBadge.classList.remove('hidden');
    } else {
        notificationBadge.classList.add('hidden');
    }
    
    // Update list
    if (notifications.length === 0) {
        notificationList.innerHTML = '<div class="p-4 text-center text-gray-500">Không có thông báo nào</div>';
        return;
    }
    
    notificationList.innerHTML = notifications.map(notif => {
        const date = new Date(notif.timestamp);
        const timeAgo = getTimeAgo(date);
        const icon = getNotificationIcon(notif.type);
        const bgColor = notif.read ? 'bg-white' : 'bg-red-50';
        
        return `
            <div class="notification-item ${bgColor} border-b border-gray-100 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                 onclick="markNotificationRead(${notif.id}); this.classList.remove('bg-red-50'); this.classList.add('bg-white');">
                <div class="flex items-start gap-3">
                    <div class="flex-shrink-0 mt-1">
                        ${icon}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm text-gray-800 ${notif.read ? '' : 'font-semibold'}">${notif.message}</p>
                        <p class="text-xs text-gray-500 mt-1">${timeAgo}</p>
                    </div>
                    ${!notif.read ? '<div class="flex-shrink-0 w-2 h-2 bg-red-600 rounded-full mt-2"></div>' : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Get notification icon
function getNotificationIcon(type) {
    const icons = {
        [NOTIFICATION_TYPES.CART_ADDED]: '<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>',
        [NOTIFICATION_TYPES.ORDER_PLACED]: '<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
        [NOTIFICATION_TYPES.ORDER_DELIVERED]: '<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
        [NOTIFICATION_TYPES.ORDER_CANCELLED]: '<svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>'
    };
    return icons[type] || '<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>';
}

// Get time ago string
function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    if (minutes > 0) return `${minutes} phút trước`;
    return 'Vừa xong';
}

// Initialize notification system
function initNotifications() {
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    
    if (!notificationBtn || !notificationDropdown) {
        console.warn('Notification elements not found');
        return;
    }
    
    notificationBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationDropdown.classList.toggle('hidden');
        updateNotificationUI();
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (notificationDropdown && !notificationDropdown.contains(e.target) && !notificationBtn.contains(e.target)) {
            notificationDropdown.classList.add('hidden');
        }
    });
    
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', () => {
            markAllNotificationsRead();
        });
    }
    
    // Update UI immediately
    updateNotificationUI();
    
    console.log('Notifications initialized');
    
    // Debug: Log notification element status
    const navNotifications = document.getElementById('navNotifications');
    if (navNotifications) {
        console.log('Notification element found, hidden:', navNotifications.classList.contains('hidden'));
    } else {
        console.warn('Notification element not found in DOM');
    }
}

// Check for order status changes
let lastOrderStatuses = {}; // Store last known order statuses

function checkOrderStatusChanges(orders) {
    const currentStatuses = {};
    orders.forEach(order => {
        currentStatuses[order.id] = order.status;
    });
    
    // Check for status changes
    orders.forEach(order => {
        const lastStatus = lastOrderStatuses[order.id];
        if (lastStatus && lastStatus !== order.status) {
            // Status changed
            if (order.status === 'delivered') {
                addNotification(
                    NOTIFICATION_TYPES.ORDER_DELIVERED,
                    `Đơn hàng #${order.id} đã được giao thành công!`,
                    { orderId: order.id }
                );
            } else if (order.status === 'cancelled') {
                addNotification(
                    NOTIFICATION_TYPES.ORDER_CANCELLED,
                    `Đơn hàng #${order.id} đã bị hủy`,
                    { orderId: order.id }
                );
            }
        }
    });
    
    // Update last known statuses
    lastOrderStatuses = currentStatuses;
}

// Make functions available globally
window.markNotificationRead = markNotificationRead;

// ============================================
// ORDERS
// ============================================

let currentOrdersPagination = { page: 1, limit: 10, totalPages: 1, totalItems: 0 };

function renderOrdersPagination() {
    const el = document.getElementById('ordersPagination');
    if (!el) return;

    if (!currentOrdersPagination.totalPages || currentOrdersPagination.totalPages <= 1) {
        el.innerHTML = '';
        return;
    }

    const page = currentOrdersPagination.page;
    const totalPages = currentOrdersPagination.totalPages;

    let html = '';
    html += `<button 
        ${page === 1 ? 'disabled' : ''}
        onclick="changeOrdersPage(${page - 1})"
        class="px-4 py-2 border border-gray-300 rounded-lg ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'} transition-colors"
    >‹</button>`;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
            html += `<button 
                class="px-4 py-2 border border-gray-300 rounded-lg ${i === page ? 'bg-red-600 text-white border-red-600' : 'hover:bg-gray-100'} transition-colors"
                onclick="changeOrdersPage(${i})"
            >${i}</button>`;
        } else if (i === page - 3 || i === page + 3) {
            html += `<button disabled class="px-4 py-2 opacity-50">...</button>`;
        }
    }

    html += `<button 
        ${page === totalPages ? 'disabled' : ''}
        onclick="changeOrdersPage(${page + 1})"
        class="px-4 py-2 border border-gray-300 rounded-lg ${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'} transition-colors"
    >›</button>`;

    el.innerHTML = html;
}

window.changeOrdersPage = function(page) {
    currentOrdersPagination.page = Math.max(1, page);
    loadOrders();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

async function loadOrders() {
    try {
        showLoading();
        const params = new URLSearchParams();
        params.set('page', String(currentOrdersPagination.page || 1));
        params.set('limit', String(currentOrdersPagination.limit || 10));
        const data = await apiCall(`/orders?${params.toString()}`);
        const content = document.getElementById('ordersContent');
        
        if (!data.orders || data.orders.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <h3>Chưa có đơn hàng nào</h3>
                    <p>Hãy mua sắm và đặt hàng ngay!</p>
                    <button class="btn btn-primary" onclick="navigateTo('products')">Xem sản phẩm</button>
                </div>
            `;
            currentOrdersPagination = { ...currentOrdersPagination, totalPages: 1, totalItems: 0 };
            renderOrdersPagination();
            return;
        }

        if (data.pagination) {
            currentOrdersPagination = {
                ...currentOrdersPagination,
                page: Number(data.pagination.currentPage || currentOrdersPagination.page || 1),
                limit: Number(data.pagination.limit || currentOrdersPagination.limit || 10),
                totalPages: Number(data.pagination.totalPages || 1),
                totalItems: Number(data.pagination.totalItems || 0)
            };
        }

        // Check for order status changes
        checkOrderStatusChanges(data.orders || []);

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
                <div style="margin-top: 1rem;">
                    <button onclick="viewOrderTracking(${order.id})" class="btn btn-outline-primary btn-sm" type="button">
                        <i class="fas fa-truck mr-2"></i> Theo dõi đơn hàng
                    </button>
                </div>
            </div>
        `).join('');

        renderOrdersPagination();
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

// Load và hiển thị tracking timeline
// Expose ra global scope để onclick hoạt động
window.viewOrderTracking = async function(orderId) {
    try {
        // If the current page includes the orders UI, load and show modal directly
        const ordersContainer = document.getElementById('ordersContainer');
        const trackingModalElem = document.getElementById('trackingModal');

        if (ordersContainer || trackingModalElem) {
            console.log('Loading tracking for order (inline):', orderId);
            const data = await apiCall(`/orders/${orderId}/tracking`);
            console.log('Tracking data received:', data);
            if (!data || !data.tracking) {
                console.error('Invalid tracking data:', data);
                showToast('Dữ liệu tracking không hợp lệ', 'error');
                return;
            }
            showTrackingModal(orderId, data.tracking);
            return;
        }

        // Otherwise navigate to the orders page and include a focus param so it opens there
        // Try SPA-friendly param first (page=orders), then fallback to /orders.html
        const search = new URLSearchParams(window.location.search);
        // preserve other params if any
        search.set('focus', String(orderId));
        // If site supports ?page=orders as entry, use that; otherwise navigate to /orders.html?focus=...
        if (search.get('page') === 'orders' || window.location.pathname.endsWith('/')) {
            // Build URL with page param (if present) or use path
            const target = new URL(window.location.href);
            target.searchParams.set('page', 'orders');
            target.searchParams.set('focus', String(orderId));
            window.location.href = target.pathname + '?' + target.searchParams.toString();
        } else {
            // Fallback to /orders.html?focus=ID
            window.location.href = `/orders.html?focus=${orderId}`;
        }

    } catch (error) {
        console.error('Error loading tracking:', error);
        showToast('Không thể tải thông tin tracking: ' + error.message, 'error');
    }
};

// Giữ function cũ để code khác có thể dùng
function viewOrderTracking(orderId) {
    window.viewOrderTracking(orderId);
}

function showTrackingModal(orderId, tracking) {
    console.log('Showing tracking modal for order:', orderId, 'with tracking:', tracking);
    
    // Tạo modal để hiển thị tracking timeline
    const timelineHTML = renderTrackingTimeline(tracking);
    
    const modalHTML = `
        <div id="trackingModal" class="modal" style="display: flex; position: fixed; z-index: 10000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); align-items: center; justify-content: center;">
            <div class="modal-content" style="background-color: white; padding: 2rem; border-radius: 8px; max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto; position: relative;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2 style="font-size: 1.5rem; font-weight: bold;">Theo dõi đơn hàng #${orderId}</h2>
                    <button onclick="window.closeTrackingModal()" type="button" style="background: none; border: none; font-size: 2rem; cursor: pointer; color: #666; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">&times;</button>
                </div>
                <div id="trackingTimeline">
                    ${timelineHTML}
                </div>
            </div>
        </div>
    `;
    
    // Xóa modal cũ nếu có
    const existingModal = document.getElementById('trackingModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Thêm modal mới
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log('Modal added to DOM');
}

// Expose function to global scope để onclick hoạt động
window.closeTrackingModal = function() {
    const modal = document.getElementById('trackingModal');
    if (modal) {
        modal.remove();
    }
};

// Giữ function cũ để code khác có thể dùng
function closeTrackingModal() {
    window.closeTrackingModal();
}

function renderTrackingTimeline(tracking) {
    if (!tracking || tracking.length === 0) {
        return '<p style="color: #999; text-align: center; padding: 2rem;">Chưa có thông tin tracking</p>';
    }

    // Định nghĩa các icon và màu sắc cho từng trạng thái
    const statusConfig = {
        'order_placed': { icon: '📄', color: '#10b981', label: 'Đơn hàng đã đặt' },
        'order_paid': { icon: '💰', color: '#3b82f6', label: 'Đơn hàng đã thanh toán' },
        'shipped': { icon: '🚚', color: '#f59e0b', label: 'Đã giao cho đơn vị vận chuyển' },
        'delivered': { icon: '✅', color: '#10b981', label: 'Đã nhận được hàng' },
        'cancelled': { icon: '❌', color: '#ef4444', label: 'Đơn hàng đã hủy' }
    };

    let html = '<div style="position: relative; padding-left: 2rem;">';
    
    tracking.forEach((item, index) => {
        const config = statusConfig[item.status] || { icon: '●', color: '#6b7280', label: item.status_label };
        const isLast = index === tracking.length - 1;
        const date = new Date(item.created_at).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        html += `
            <div style="position: relative; padding-bottom: ${isLast ? '0' : '2rem'};">
                <!-- Line connector -->
                ${!isLast ? `<div style="position: absolute; left: -1.75rem; top: 2rem; width: 2px; height: calc(100% - 0.5rem); background-color: ${config.color};"></div>` : ''}
                
                <!-- Status icon -->
                <div style="position: absolute; left: -2rem; top: 0; width: 1.5rem; height: 1.5rem; border-radius: 50%; background-color: ${config.color}; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.875rem; z-index: 1;">
                    ${config.icon}
                </div>
                
                <!-- Content -->
                <div style="background-color: ${index === tracking.length - 1 ? '#f0fdf4' : '#fff'}; padding: 1rem; border-radius: 8px; border-left: 3px solid ${config.color};">
                    <div style="font-weight: 600; color: ${config.color}; margin-bottom: 0.5rem;">
                        ${item.status_label || config.label}
                    </div>
                    ${item.description ? `<div style="color: #6b7280; margin-bottom: 0.5rem;">${item.description}</div>` : ''}
                    <div style="color: #9ca3af; font-size: 0.875rem;">
                        ${date}
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

// Đóng modal khi click bên ngoài (chỉ thêm listener một lần)
if (!window.trackingModalListenerAdded) {
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('trackingModal');
        if (modal && e.target === modal) {
            window.closeTrackingModal();
        }
    });
    window.trackingModalListenerAdded = true;
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
                                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.username)}&background=dc2626&color=fff&size=150" 
                                        alt="avatar" class="rounded-circle img-fluid" style="width: 150px;">
                                    <h5 class="my-3">${user.full_name || user.username}</h5>
                                    ${user.full_name ? `<p class="text-muted mb-1">@${user.username}</p>` : ''}
                                    <p class="text-muted mb-1">
                                        <span class="px-3 py-1 rounded-full text-white text-sm ${roleBadgeColor}">${roleDisplay}</span>
                                    </p>
                                    <p class="text-muted mb-4">${loginMethod}</p>
                                    <div class="d-flex justify-content-center mb-2 gap-2 flex-wrap">
                                        <button type="button" onclick="editProfile()" class="btn btn-primary">
                                            <i class="fas fa-edit mr-2"></i>Chỉnh sửa
                                        </button>
                                        ${user.role === 'admin' ? `
                                        <a href="/admin.html" class="btn btn-danger">
                                            <i class="fas fa-cog mr-2"></i>Quản trị
                                        </a>
                                        ` : ''}
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
                                    <hr>
                                    <div class="row">
                                        <div class="col-sm-3">
                                            <p class="mb-0">Họ và tên</p>
                                        </div>
                                        <div class="col-sm-9">
                                            <p class="text-muted mb-0">${user.full_name || 'Chưa cập nhật'}</p>
                                        </div>
                                    </div>
                                    <hr>
                                    <div class="row">
                                        <div class="col-sm-3">
                                            <p class="mb-0">Số điện thoại</p>
                                        </div>
                                        <div class="col-sm-9">
                                            <p class="text-muted mb-0">${user.phone || 'Chưa cập nhật'}</p>
                                        </div>
                                    </div>
                                    <hr>
                                    <div class="row">
                                        <div class="col-sm-3">
                                            <p class="mb-0">Địa chỉ</p>
                                        </div>
                                        <div class="col-sm-9">
                                            <p class="text-muted mb-0">${user.address || 'Chưa cập nhật'}</p>
                                        </div>
                                    </div>
                                    <hr>
                                    <div class="row">
                                        <div class="col-sm-3">
                                            <p class="mb-0">Ngày sinh</p>
                                        </div>
                                        <div class="col-sm-9">
                                            <p class="text-muted mb-0">${user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
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
                                                <button onclick="showEditProfile()" class="btn btn-outline-primary btn-sm w-100">
                                                    <i class="fas fa-edit mr-2"></i>Cập nhật thông tin
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
            
            <!-- Edit Profile Modal -->
            <div id="editProfileModal" class="modal hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" style="overflow-y: auto;">
                <div class="modal-content bg-white rounded-lg p-6 max-w-2xl w-full mx-4 my-8">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-bold text-gray-800">Cập nhật thông tin cá nhân</h2>
                        <button onclick="closeEditModal()" class="text-gray-500 hover:text-gray-700 text-3xl">&times;</button>
                    </div>
                    <form onsubmit="updateProfile(event)">
                        <div class="mb-4">
                            <label class="block text-gray-700 text-sm font-bold mb-2">Tên đăng nhập</label>
                            <input type="text" id="profileUsername" value="${user.username}" 
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500" required>
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 text-sm font-bold mb-2">Họ và tên</label>
                            <input type="text" id="profileFullName" value="${user.full_name || ''}" 
                                placeholder="Nhập họ và tên đầy đủ"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500">
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 text-sm font-bold mb-2">Số điện thoại</label>
                            <input type="tel" id="profilePhone" value="${user.phone || ''}" 
                                placeholder="Nhập số điện thoại (10-11 chữ số)"
                                pattern="[0-9]{10,11}"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500">
                            <p class="text-xs text-gray-500 mt-1">Ví dụ: 0912345678 hoặc 0123456789</p>
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 text-sm font-bold mb-2">Địa chỉ</label>
                            <textarea id="profileAddress" rows="3" 
                                placeholder="Nhập địa chỉ của bạn"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500">${user.address || ''}</textarea>
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 text-sm font-bold mb-2">Ngày sinh</label>
                            <input type="date" id="profileDateOfBirth" value="${user.date_of_birth || ''}" 
                                max="${new Date().toISOString().split('T')[0]}"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500">
                        </div>
                        <div class="flex gap-2">
                            <button type="button" onclick="closeEditModal()" class="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition-colors font-bold">
                                Hủy
                            </button>
                            <button type="submit" class="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-bold">
                                Cập nhật
                            </button>
                        </div>
                    </form>
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
    showEditProfile();
}

function showEditProfile() {
    const modal = document.getElementById('editProfileModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function showEditUsername() {
    // Giữ lại để tương thích, nhưng sẽ mở modal chỉnh sửa đầy đủ
    showEditProfile();
}

function closeEditModal() {
    const modal = document.getElementById('editProfileModal');
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

async function updateProfile(event) {
    if (event) {
        event.preventDefault();
    }
    
    const username = document.getElementById('profileUsername').value.trim();
    const full_name = document.getElementById('profileFullName').value.trim();
    const phone = document.getElementById('profilePhone').value.trim();
    const address = document.getElementById('profileAddress').value.trim();
    const date_of_birth = document.getElementById('profileDateOfBirth').value;
    
    if (!username) {
        showToast('Tên đăng nhập không được để trống', 'error');
        return;
    }
    
    // Validation phone
    if (phone && phone.trim() !== '') {
        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 10 || phoneDigits.length > 11) {
            showToast('Số điện thoại không hợp lệ (phải có 10-11 chữ số)', 'error');
            return;
        }
    }
    
    try {
        showLoading();
        const updateData = {
            username,
            full_name: full_name || null,
            phone: phone || null,
            address: address || null,
            date_of_birth: date_of_birth || null
        };
        
        await apiCall('/profile', {
            method: 'PUT',
            body: JSON.stringify(updateData)
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

        content.innerHTML = data.categories.map(cat => {
            const route = cat.route || 'products';
            return `
            <div 
                class="category-card bg-white rounded-lg shadow-md p-6 text-center cursor-pointer hover:shadow-lg transition-shadow animate-fade-in"
                onclick="navigateTo('${route}')"
            >
                <div class="text-4xl mb-3">${cat.icon || '📦'}</div>
                <h3 class="font-bold text-gray-800 mb-2">${cat.name}</h3>
                <div class="text-sm text-gray-500 mb-2">${cat.product_count || 0} sản phẩm</div>
                ${cat.description ? `<p class="text-xs text-gray-600 mt-2">${cat.description}</p>` : ''}
            </div>
        `;
        }).join('');
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
    // Initialize notifications
    if (typeof initNotifications === 'function') {
        initNotifications();
    }
    
    // Đồng bộ UI ngay lập tức theo localStorage trước khi gọi API
    const cachedUser = getCachedUser();
    const token = getToken();
    
    if (cachedUser && token) {
        currentUser = cachedUser;
        console.log('DOMContentLoaded: Found cached user:', currentUser);
        updateUIForAuth(true);
    } else if (token) {
        // Có token nhưng chưa fetch /me: vẫn ẩn nút đăng ký/đăng nhập
        console.log('DOMContentLoaded: Found token but no cached user');
        updateUIForAuth(true);
    } else {
        console.log('DOMContentLoaded: No token or cached user');
        updateUIForAuth(false);
    }

    // Kiểm tra đăng nhập khi trang load
    checkAuth();

    // Navigation
    const isSpa = !!document.querySelector('.page');
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
        const page = link.dataset.page;
        const href = buildPageHref(page);
        if (href) {
            link.setAttribute('href', href);
        }

        link.addEventListener('click', (e) => {
            const targetPage = link.dataset.page;
            const hrefTarget = href || link.getAttribute('href') || '/';

            // If not in SPA (no .page containers), let browser follow normal href
            if (!isSpa) return;

            // Static pages should navigate with full page load
            if (STATIC_PAGES.includes(targetPage)) {
                // Fallback: ensure navigation happens even if JS interferes
                window.location.href = hrefTarget;
                return;
            }

            e.preventDefault();
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

    // Main search bar with autocomplete
    const mainSearchInput = document.getElementById('mainSearchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');
    const searchSuggestionsContent = document.getElementById('searchSuggestionsContent');
    const mainSearchButton = document.getElementById('mainSearchButton');
    
    let searchTimeout = null;
    let currentSearchResults = [];
    
    // Function to perform search
    async function performSearch(query) {
        if (!query || query.trim().length < 1) {
            searchSuggestions.classList.add('hidden');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/products?q=${encodeURIComponent(query.trim())}&limit=8`);
            if (response.ok) {
                const data = await response.json();
                const products = data.products || data || [];
                currentSearchResults = products;
                displaySearchSuggestions(products, query);
            } else {
                searchSuggestions.classList.add('hidden');
            }
        } catch (error) {
            console.error('Search error:', error);
            searchSuggestions.classList.add('hidden');
        }
    }
    
    // Function to display search suggestions
    function displaySearchSuggestions(products, query) {
        if (!products || products.length === 0) {
            searchSuggestionsContent.innerHTML = `
                <div class="px-4 py-3 text-gray-500 text-sm">
                    Không tìm thấy sản phẩm nào cho "${query}"
                </div>
            `;
            searchSuggestions.classList.remove('hidden');
            return;
        }
        
        const suggestionsHTML = products.map(product => {
            // Use same image logic as renderProducts
            const imageData = getProductImage(product);
            const productImage = imageData.primary;
            const productName = highlightMatch(product.name, query);
            const productPrice = formatPrice(product.price);
            
            return `
                <div class="search-suggestion-item px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                     data-product-id="${product.id}" 
                     data-product-slug="${product.slug || ''}">
                    <img src="${productImage}" 
                         alt="${product.name}" 
                         class="w-12 h-12 object-cover rounded"
                         onerror="this.src='${imageData.fallback}'; this.onerror=null;">
                    <div class="flex-1 min-w-0">
                        <div class="font-medium text-gray-900 text-sm">${productName}</div>
                        <div class="text-red-600 font-semibold text-sm">${productPrice}</div>
                    </div>
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </div>
            `;
        }).join('');
        
        searchSuggestionsContent.innerHTML = suggestionsHTML;
        searchSuggestions.classList.remove('hidden');
        
        // Attach click handlers to suggestions
        document.querySelectorAll('.search-suggestion-item').forEach(item => {
            item.addEventListener('click', function() {
                const productId = this.getAttribute('data-product-id');
                const productSlug = this.getAttribute('data-product-slug');
                
                if (productSlug) {
                    window.location.href = `/product-details.html?slug=${productSlug}`;
                } else {
                    window.location.href = `/product-details.html?id=${productId}`;
                }
            });
        });
    }
    
    // Function to highlight matching text
    function highlightMatch(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
    }
    
    // Handle input with debounce
    if (mainSearchInput) {
        mainSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            // Clear previous timeout
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
            
            // Set new timeout for debounce (300ms)
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 300);
        });
        
        // Handle Enter key
        mainSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = mainSearchInput.value.trim();
                if (query) {
                    navigateTo('products');
                    // Set search value in products page
                    setTimeout(() => {
                        const searchInput = document.getElementById('searchInput');
                        if (searchInput) {
                            searchInput.value = query;
                            applyFilters();
                        }
                    }, 100);
                    searchSuggestions.classList.add('hidden');
                }
            }
        });
        
        // Handle Escape key to close suggestions
        mainSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchSuggestions.classList.add('hidden');
            }
        });
        
        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#mainSearchInput') && 
                !e.target.closest('#searchSuggestions') &&
                !e.target.closest('#mainSearchButton')) {
                searchSuggestions.classList.add('hidden');
            }
        });
    }
    
    // Handle search button click
    if (mainSearchButton) {
        mainSearchButton.addEventListener('click', () => {
            const query = mainSearchInput.value.trim();
            if (query) {
                navigateTo('products');
                setTimeout(() => {
                    const searchInput = document.getElementById('searchInput');
                    if (searchInput) {
                        searchInput.value = query;
                        applyFilters();
                    }
                }, 100);
                searchSuggestions.classList.add('hidden');
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

    // Slider functionality
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    
    // Preload all slider images
    function preloadSliderImages() {
        const imagePaths = [
            '/img/slider/slider1.jpg',
            '/img/slider/slider2.png',
            '/img/slider/slider3.png'
        ];
        
        imagePaths.forEach(path => {
            const img = new Image();
            img.src = path;
        });
    }
    
    // Preload images immediately
    if (slides.length > 0) {
        preloadSliderImages();
    }
    
    function showSlide(index) {
        slides.forEach((slide, i) => {
            if (i === index) {
                slide.classList.remove('opacity-0');
                slide.classList.add('opacity-100');
            } else {
                slide.classList.remove('opacity-100');
                slide.classList.add('opacity-0');
            }
        });
        
        // Update dots
        const dots = document.querySelectorAll('.slider-dot');
        dots.forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active-dot');
                dot.classList.remove('bg-opacity-50');
                dot.classList.add('bg-opacity-100');
            } else {
                dot.classList.remove('active-dot');
                dot.classList.remove('bg-opacity-100');
                dot.classList.add('bg-opacity-50');
            }
        });
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(currentSlide);
    }
    
    // Auto-play slider
    if (totalSlides > 0) {
        setInterval(nextSlide, 5000); // Change slide every 5 seconds
        
        // Navigation buttons
        const prevBtn = document.querySelector('.slider-prev');
        const nextBtn = document.querySelector('.slider-next');
        
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        
        // Dots navigation
        const dots = document.querySelectorAll('.slider-dot');
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                showSlide(currentSlide);
            });
        });
        
        // Initialize first slide
        showSlide(0);
    }

    // Điều hướng trang ban đầu
    const initialPage = getInitialPage();
    updateURLForPage(initialPage, true);
    navigateTo(initialPage);
    // Apply mode overrides after initial navigation renders target page
    applyProductsModeFromUrl();

    window.addEventListener('popstate', () => {
        const pageFromHistory = getInitialPage();
        navigateTo(pageFromHistory);
        applyProductsModeFromUrl();
    });
});

// Make functions available globally for onclick handlers
window.addToCart = addToCart;
window.buyNow = buyNow;
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

// Make notification functions available globally
window.initNotifications = initNotifications;
window.updateNotificationUI = updateNotificationUI;
window.markAllNotificationsRead = markAllNotificationsRead;
window.markNotificationRead = markNotificationRead;
window.addNotification = addNotification;
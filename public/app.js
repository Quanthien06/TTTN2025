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

// Lấy token từ localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Lưu token vào localStorage
function saveToken(token) {
    localStorage.setItem('token', token);
}

// Xóa token khỏi localStorage
function removeToken() {
    localStorage.removeItem('token');
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

        if (token && !endpoint.includes('/login') && !endpoint.includes('/register')) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Có lỗi xảy ra');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
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

    try {
        const data = await apiCall('/me');
        currentUser = data.user;
        updateUIForAuth(true);
        loadCartCount();
    } catch (error) {
        removeToken();
        updateUIForAuth(false);
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
        updateUIForAuth(true);
        closeModal('loginModal');
        showToast('Đăng nhập thành công!', 'success');
        loadCartCount();
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

// Điều hướng trang
function navigateTo(page) {
    // Ẩn tất cả các trang
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    
    // Hiển thị trang được chọn
    const pageElement = document.getElementById(`page${page.charAt(0).toUpperCase() + page.slice(1)}`);
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
            if (currentUser) loadProfile();
            else {
                showToast('Vui lòng đăng nhập', 'error');
                navigateTo('home');
            }
            break;
    }
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
        <div class="product-card bg-white rounded-lg shadow-md overflow-hidden animate-fade-in">
            ${hasDiscount ? `
                <div class="relative">
                    <div class="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded z-10">
                        Giảm ${discountPercent}%
                    </div>
                </div>
            ` : ''}
            <div class="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                <img 
                    src="${product.image_url || product.image || 'https://via.placeholder.com/400x400?text=' + encodeURIComponent(product.name)}" 
                    alt="${product.name}"
                    class="w-full h-full object-cover"
                    loading="lazy"
                    onerror="this.src='https://via.placeholder.com/400x400?text=${encodeURIComponent(product.name)}'"
                />
            </div>
            <div class="p-4">
                <div class="text-xs text-gray-500 mb-1">${product.category || 'Chưa phân loại'}</div>
                <h3 class="font-bold text-gray-800 mb-2 line-clamp-2 h-12">${product.name}</h3>
                <div class="mb-2">
                    <span class="text-lg font-bold text-red-600">${formatPrice(product.price)}</span>
                    ${hasDiscount ? `
                        <span class="text-sm text-gray-400 line-through ml-2">${formatPrice(originalPrice)}</span>
                    ` : ''}
                </div>
                ${product.description ? `
                    <p class="text-xs text-gray-600 mb-3 line-clamp-2">${product.description}</p>
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

        let html = '';
        
        // Cart items
        data.cart.items.forEach(item => {
            html += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h3>${item.product_name || 'Sản phẩm'}</h3>
                        <div class="category">${item.product_category || ''}</div>
                        <div class="price">${formatPrice(item.price)}</div>
                    </div>
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button class="quantity-btn" onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
                            <input type="number" class="quantity-input" value="${item.quantity}" min="1" 
                                onchange="updateCartItemQuantity(${item.id}, this.value)">
                            <button class="quantity-btn" onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        </div>
                        <div class="price">${formatPrice(item.subtotal)}</div>
                        <button class="btn btn-ghost" onclick="removeCartItem(${item.id})">Xóa</button>
                    </div>
                </div>
            `;
        });

        // Cart summary
        html += `
            <div class="cart-summary">
                <div class="cart-summary-row">
                    <span>Tạm tính:</span>
                    <span>${formatPrice(data.cart.total)}</span>
                </div>
                <div class="cart-summary-row total">
                    <span>Tổng cộng:</span>
                    <span>${formatPrice(data.cart.total)}</span>
                </div>
                <button class="btn btn-primary btn-block btn-lg" onclick="openCheckoutModal(${data.cart.total})">
                    Đặt hàng
                </button>
            </div>
        `;

        content.innerHTML = html;
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
    try {
        showLoading();
        const data = await apiCall('/me');
        const content = document.getElementById('profileContent');
        
        content.innerHTML = `
            <div class="profile-section">
                <h3>Thông tin tài khoản</h3>
                <div class="form-group">
                    <label>Tên đăng nhập</label>
                    <input type="text" class="input" id="profileUsername" value="${data.user.username}">
                </div>
                <div class="form-group">
                    <label>Vai trò</label>
                    <input type="text" class="input" value="${data.user.role}" readonly>
                </div>
                <div class="form-group">
                    <label>Ngày tạo</label>
                    <input type="text" class="input" value="${new Date(data.user.created_at).toLocaleString('vi-VN')}" readonly>
                </div>
                <button class="btn btn-primary" onclick="updateProfile()">Cập nhật thông tin</button>
            </div>
            
            <div class="profile-section">
                <h3>Đổi mật khẩu</h3>
                <div class="form-group">
                    <label>Mật khẩu hiện tại</label>
                    <input type="password" class="input" id="currentPassword">
                </div>
                <div class="form-group">
                    <label>Mật khẩu mới</label>
                    <input type="password" class="input" id="newPassword" minlength="6">
                </div>
                <button class="btn btn-primary" onclick="changePassword()">Đổi mật khẩu</button>
            </div>
        `;
    } catch (error) {
        document.getElementById('profileContent').innerHTML = 
            `<div class="empty-state">Lỗi khi tải thông tin: ${error.message}</div>`;
    } finally {
        hideLoading();
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
        checkAuth(); // Refresh user info
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
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
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
    // Kiểm tra đăng nhập khi trang load
    checkAuth();
    
    // Navigation
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            if (page === 'cart' || page === 'orders' || page === 'profile') {
                if (!currentUser) {
                    showToast('Vui lòng đăng nhập', 'error');
                    window.location.href = '/login.html';
                    return;
                }
            }
            navigateTo(page);
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

    // Initialize
    checkAuth();
    navigateTo('home');
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
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;


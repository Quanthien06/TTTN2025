// public/include-partials.js
// Loads shared UI partials (header/footer) into placeholders.
// Usage:
//  - Add <div id="site-header"></div> near top of <body>
//  - (Optional) Add <div id="site-footer"></div> near bottom of <body>
//  - Include this script: <script src="/include-partials.js" defer></script>

(function () {
  async function loadPartial(selector, url) {
    const el = document.querySelector(selector);
    if (!el) return false;
    try {
      // Add cache busting parameter
      const cacheBuster = '?v=' + Date.now();
      const urlWithCache = url.includes('?') ? url + '&_=' + Date.now() : url + cacheBuster;
      const res = await fetch(urlWithCache, { 
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!res.ok) return false;
      el.innerHTML = await res.text();
      return true;
    } catch (e) {
      console.warn('Failed to load partial', url, e);
      return false;
    }
  }

  function adjustForFixedHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;
    const h = header.offsetHeight || 0;
    document.documentElement.style.setProperty('--site-header-height', h + 'px');

    // Prefer padding on main; fallback to body.
    const main = document.querySelector('main');
    if (main) {
      main.style.paddingTop = 'var(--site-header-height)';
    } else {
      document.body.style.paddingTop = 'var(--site-header-height)';
    }
  }

  function safeParseJson(raw) {
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  }

  function getToken() {
    const t = localStorage.getItem('token');
    if (!t || t === 'null' || t === 'undefined' || t.trim() === '') return null;
    return t;
  }

  function syncHeaderAuthUI() {
    const token = getToken();
    const cachedUser = safeParseJson(localStorage.getItem('user_info'));

    const navAuth = document.getElementById('navAuth');
    const navUser = document.getElementById('navUser');
    const navNotifications = document.getElementById('navNotifications');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminMenuLink = document.getElementById('adminMenuLink');

    const loggedIn = !!token;
    
    // Debug logging
    console.log('[syncHeaderAuthUI]', {
      hasToken: !!token,
      hasUser: !!cachedUser,
      username: cachedUser?.username,
      navAuth: !!navAuth,
      navUser: !!navUser
    });

    // Show/hide auth buttons vs user menu
    if (navAuth) navAuth.classList.toggle('hidden', loggedIn);
    if (navUser) navUser.classList.toggle('hidden', !loggedIn);
    
    // Show notifications only when logged in
    if (navNotifications) {
      navNotifications.classList.toggle('hidden', !loggedIn);
    }

    if (loggedIn) {
      // Set user info
      if (userName) {
        const username = cachedUser?.username || cachedUser?.full_name || 'User';
        // Format: "Xin chào, {username}!" như trong index.html
        userName.textContent = username;
      }
      if (userAvatar) {
        const displayName = cachedUser?.full_name || cachedUser?.username || 'User';
        if (cachedUser?.avatar_url && cachedUser.avatar_url.trim() !== '') {
          userAvatar.src = cachedUser.avatar_url;
        } else {
          // Use ui-avatars as fallback (same as index.html)
          userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=dc2626&color=fff&size=32&bold=true`;
        }
        userAvatar.alt = displayName;
        userAvatar.onerror = function() {
          // Fallback to ui-avatars if avatar_url fails
          const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=dc2626&color=fff&size=32&bold=true`;
          if (this.src !== fallbackUrl) {
            this.src = fallbackUrl;
          }
        };
      }

      // Show admin link if admin
      if (adminMenuLink && cachedUser?.role === 'admin') {
        adminMenuLink.classList.remove('hidden');
      } else if (adminMenuLink) {
        adminMenuLink.classList.add('hidden');
      }
    } else {
      // Hide admin link when logged out
      if (adminMenuLink) {
        adminMenuLink.classList.add('hidden');
      }
    }

    // Logout handler
    if (logoutBtn) {
      logoutBtn.onclick = (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user_info');
        window.location.href = '/';
      };
    }
  }

  function setupUserMenuDropdown() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenuDropdown = document.getElementById('userMenuDropdown');

    if (!userMenuBtn || !userMenuDropdown) return;

    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenuDropdown.classList.toggle('hidden');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!userMenuBtn.contains(e.target) && !userMenuDropdown.contains(e.target)) {
        userMenuDropdown.classList.add('hidden');
      }
    });
  }

  // Initialize notifications system
  function initNotificationsSystem() {
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    const notificationList = document.getElementById('notificationList');
    const notificationBadge = document.getElementById('notificationBadge');

    if (!notificationBtn || !notificationDropdown) return false;

    // Setup click handler for notification button
    notificationBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notificationDropdown.classList.toggle('hidden');
      // Update notification UI when dropdown is opened
      updateNotificationsUI();
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!notificationBtn.contains(e.target) && !notificationDropdown.contains(e.target)) {
        notificationDropdown.classList.add('hidden');
      }
    });

    // Setup mark all as read button
    if (markAllReadBtn) {
      markAllReadBtn.addEventListener('click', () => {
        if (window.markAllNotificationsRead && typeof window.markAllNotificationsRead === 'function') {
          window.markAllNotificationsRead();
        } else {
          // Fallback: mark all as read manually
          const notifications = getNotificationsFromStorage();
          notifications.forEach(n => n.read = true);
          saveNotificationsToStorage(notifications);
          updateNotificationsUI();
        }
      });
    }

    // Try to use app.js functions, otherwise use fallback
    if (window.initNotifications && typeof window.initNotifications === 'function') {
      window.initNotifications();
      return true;
    } else {
      // Fallback: initialize our own notification system
      updateNotificationsUI();
      return true;
    }
  }

  // Fallback functions for notifications (if app.js not loaded)
  function getNotificationsFromStorage() {
    try {
      const stored = localStorage.getItem('notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  function saveNotificationsToStorage(notifications) {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (e) {
      console.warn('Failed to save notifications:', e);
    }
  }

  function updateNotificationsUI() {
    // Try to use app.js function first
    if (window.updateNotificationUI && typeof window.updateNotificationUI === 'function') {
      window.updateNotificationUI();
      return;
    }

    // Fallback: update UI manually
    const notificationList = document.getElementById('notificationList');
    const notificationBadge = document.getElementById('notificationBadge');
    
    if (!notificationList) return;

    const notifications = getNotificationsFromStorage();
    const unreadCount = notifications.filter(n => !n.read).length;

    // Update badge
    if (notificationBadge) {
      if (unreadCount > 0) {
        notificationBadge.textContent = unreadCount > 10 ? '10+' : unreadCount;
        notificationBadge.classList.remove('hidden');
      } else {
        notificationBadge.classList.add('hidden');
      }
    }

    // Update list
    if (notifications.length === 0) {
      notificationList.innerHTML = '<div class="p-4 text-center text-gray-500">Không có thông báo nào</div>';
      return;
    }

    notificationList.innerHTML = notifications.map(notif => {
      const date = new Date(notif.timestamp);
      const timeAgo = getTimeAgoString(date);
      const bgColor = notif.read ? 'bg-white' : 'bg-red-50';
      
      return `
        <div class="notification-item ${bgColor} border-b border-gray-100 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
             onclick="if(window.markNotificationRead) { window.markNotificationRead(${notif.id}); } else { const notifs = JSON.parse(localStorage.getItem('notifications') || '[]'); const n = notifs.find(n => n.id === ${notif.id}); if(n) { n.read = true; localStorage.setItem('notifications', JSON.stringify(notifs)); window.location.reload(); } }">
          <div class="flex items-start gap-3">
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

  function getTimeAgoString(date) {
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

  function setupNotificationDropdown() {
    // Try to initialize notifications system
    let attempts = 0;
    const maxAttempts = 10;
    
    function tryInit() {
      attempts++;
      if (initNotificationsSystem()) {
        return true;
      }
      if (attempts < maxAttempts) {
        setTimeout(tryInit, 200);
      } else {
        // Final attempt with fallback
        initNotificationsSystem();
      }
      return false;
    }

    // Start trying
    setTimeout(tryInit, 100);
  }

  function setupSearch() {
    const mainSearchInput = document.getElementById('mainSearchInput');
    const mainSearchButton = document.getElementById('mainSearchButton');
    const searchSuggestions = document.getElementById('searchSuggestions');

    if (mainSearchButton) {
      mainSearchButton.addEventListener('click', () => {
        const query = mainSearchInput?.value?.trim() || '';
        if (query) {
          window.location.href = `/?page=products&q=${encodeURIComponent(query)}`;
        }
      });
    }

    if (mainSearchInput) {
      mainSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const query = mainSearchInput.value.trim();
          if (query) {
            window.location.href = `/?page=products&q=${encodeURIComponent(query)}`;
          }
        }
      });

      // Close suggestions when clicking outside
      document.addEventListener('click', (e) => {
        if (searchSuggestions && !mainSearchInput.contains(e.target) && 
            !searchSuggestions.contains(e.target) && 
            !mainSearchButton?.contains(e.target)) {
          searchSuggestions.classList.add('hidden');
        }
      });
    }
  }

  // Inject CSS for cart badge animation
  function injectCartBadgeAnimationCSS() {
    if (document.getElementById('cartBadgeAnimationStyle')) return;
    
    const style = document.createElement('style');
    style.id = 'cartBadgeAnimationStyle';
    style.textContent = `
      @keyframes badgePulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }
      @keyframes badgeBounce {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-5px) scale(1.1); }
      }
      .cart-badge-update {
        animation: badgePulse 0.3s ease-in-out;
      }
      .cart-badge-bounce {
        animation: badgeBounce 0.5s ease-in-out;
      }
      #cartBadgeHeader {
        transition: transform 0.2s ease-in-out;
      }
    `;
    document.head.appendChild(style);
  }

  async function syncCartBadge() {
    // Inject CSS animation on first call
    injectCartBadgeAnimationCSS();
    const badge = document.getElementById('cartBadgeHeader');
    if (!badge) return;

    // If not logged in, hide badge
    const token = getToken();
    if (!token) {
      badge.classList.add('hidden');
      badge.textContent = '0';
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 401) {
          // Not logged in
          badge.classList.add('hidden');
          badge.textContent = '0';
          return;
        }
        throw new Error('cart fetch failed');
      }
      const data = await res.json();
      
      // Handle both response formats (backward compatibility)
      const cart = data.cart || data;
      const items = cart?.items || [];
      
      // Calculate total quantity (sum of all item quantities)
      const newCount = items.reduce((sum, it) => sum + Number(it.quantity || 0), 0);
      const oldCount = parseInt(badge.textContent || '0') || 0;
      
      // Update badge with animation if count changed
      if (newCount !== oldCount) {
        // Remove previous animation classes
        badge.classList.remove('cart-badge-update', 'cart-badge-bounce');
        
        // Trigger reflow to restart animation
        void badge.offsetWidth;
        
        // Add animation class based on whether count increased or decreased
        if (newCount > oldCount) {
          badge.classList.add('cart-badge-bounce');
        } else {
          badge.classList.add('cart-badge-update');
        }
        
        // Remove animation class after animation completes
        setTimeout(() => {
          badge.classList.remove('cart-badge-update', 'cart-badge-bounce');
        }, 500);
      }
      
      badge.textContent = String(newCount);
      badge.classList.toggle('hidden', newCount <= 0);
    } catch (error) {
      console.warn('Failed to sync cart badge:', error);
      // Silent: don't break pages if cart API fails
      badge.classList.add('hidden');
      badge.textContent = '0';
    }
  }

  // Listen for storage changes (when login/logout happens in another tab/page)
  function setupStorageListener() {
    window.addEventListener('storage', (e) => {
      if (e.key === 'token' || e.key === 'user_info') {
        // Re-sync header when token or user_info changes
        setTimeout(() => {
          syncHeaderAuthUI();
          syncCartBadge();
        }, 100);
      }
      
      // Listen for cart updates
      if (e.key === 'cart_updated') {
        // Reload cart badge when cart is updated from another tab/page
        setTimeout(() => {
          syncCartBadge();
        }, 100);
      }
    });
    
    // Also listen for custom events (for same-tab updates)
    window.addEventListener('authStateChanged', () => {
      setTimeout(() => {
        syncHeaderAuthUI();
        syncCartBadge();
        // Update notifications when auth state changes
        setTimeout(() => {
          if (window.updateNotificationUI && typeof window.updateNotificationUI === 'function') {
            window.updateNotificationUI();
          } else {
            updateNotificationsUI();
          }
        }, 100);
      }, 100);
    });
    
    // Listen for cart updated event (same-tab)
    window.addEventListener('cartUpdated', () => {
      setTimeout(() => {
        syncCartBadge();
      }, 100);
    });
  }

  async function init() {
    // Inject CSS animation for cart badge early
    injectCartBadgeAnimationCSS();
    
    await loadPartial('#site-header', '/components/header.html');
    await loadPartial('#site-footer', '/components/footer.html');
    adjustForFixedHeader();
    window.addEventListener('resize', adjustForFixedHeader);

    // Setup storage listener first
    setupStorageListener();

    // Function to setup navigation handlers for non-SPA pages
    function setupNavigation() {
      // Check if this is a SPA page (has .page containers)
      const isSpa = !!document.querySelector('.page');
      
      // Only setup navigation handler for non-SPA pages
      if (!isSpa) {
        document.querySelectorAll('.nav-link[data-page]').forEach(link => {
          // Check if already has our handler (avoid duplicates)
          if (link.dataset.navHandler === 'true') return;
          link.dataset.navHandler = 'true';
          
          link.addEventListener('click', (e) => {
            const page = link.dataset.page;
            if (page) {
              e.preventDefault();
              e.stopPropagation();
              // Redirect to index.html with page query param
              window.location.href = `/?page=${page}`;
            }
          });
        });
      }
    }

    // Function to setup all header functionality
    function setupHeader() {
      syncHeaderAuthUI();
      syncCartBadge();
      setupUserMenuDropdown();
      setupNotificationDropdown();
      setupSearch();
      setupNavigation(); // Setup navigation handlers
      
      // Update notifications UI - try both methods
      setTimeout(() => {
        if (window.updateNotificationUI && typeof window.updateNotificationUI === 'function') {
          window.updateNotificationUI();
        } else {
          updateNotificationsUI();
        }
      }, 300);
    }

    // Setup immediately after header loads
    setupHeader();

    // Also setup after a short delay to ensure DOM is fully ready
    setTimeout(() => {
      setupHeader();
    }, 50);

    // One more time after a longer delay to catch any edge cases
    setTimeout(() => {
      setupHeader();
    }, 200);
    
    // Initialize theme and language selectors
    if (window.themeManager) {
      window.themeManager.init();
      const themeToggle = document.getElementById('themeToggle');
      if (themeToggle) {
        themeToggle.addEventListener('click', () => window.themeManager.toggle());
      }
    }
    
    if (window.i18n) {
      const langToggle = document.getElementById('langToggle');
      if (langToggle) {
        langToggle.value = window.i18n.getLanguage();
        langToggle.addEventListener('change', (e) => window.i18n.setLanguage(e.target.value));
      }
    }
  }

  // Make functions available globally so other scripts can call them
  window.syncHeaderAuthUI = syncHeaderAuthUI;
  window.syncCartBadge = syncCartBadge;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();



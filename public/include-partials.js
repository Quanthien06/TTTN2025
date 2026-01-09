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

  function setupNotificationDropdown() {
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');

    if (!notificationBtn || !notificationDropdown) return;

    notificationBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notificationDropdown.classList.toggle('hidden');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!notificationBtn.contains(e.target) && !notificationDropdown.contains(e.target)) {
        notificationDropdown.classList.add('hidden');
      }
    });
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

  async function syncCartBadge() {
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
      if (!res.ok) throw new Error('cart fetch failed');
      const data = await res.json();
      const items = data?.cart?.items || [];
      const count = items.reduce((sum, it) => sum + Number(it.quantity || 0), 0);
      badge.textContent = String(count);
      badge.classList.toggle('hidden', count <= 0);
    } catch {
      // Silent: don't break pages if cart API fails
      badge.classList.add('hidden');
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
    });
    
    // Also listen for custom events (for same-tab updates)
    window.addEventListener('authStateChanged', () => {
      setTimeout(() => {
        syncHeaderAuthUI();
        syncCartBadge();
      }, 100);
    });
  }

  async function init() {
    await loadPartial('#site-header', '/components/header.html');
    await loadPartial('#site-footer', '/components/footer.html');
    adjustForFixedHeader();
    window.addEventListener('resize', adjustForFixedHeader);

    // Setup storage listener first
    setupStorageListener();

    // Function to setup all header functionality
    function setupHeader() {
      syncHeaderAuthUI();
      syncCartBadge();
      setupUserMenuDropdown();
      setupNotificationDropdown();
      setupSearch();
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

  // Make syncHeaderAuthUI available globally so other scripts can call it
  window.syncHeaderAuthUI = syncHeaderAuthUI;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();



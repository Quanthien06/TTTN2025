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
      const res = await fetch(url, { cache: 'no-cache' });
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

    const loginLink = document.getElementById('headerLoginLink');
    const registerLink = document.getElementById('headerRegisterLink');
    const navAuth = document.getElementById('navAuth');
    const navUser = document.getElementById('navUser');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminMenuLink = document.getElementById('adminMenuLink');

    const loggedIn = !!token;

    // Show/hide auth buttons vs user menu
    if (navAuth) navAuth.classList.toggle('hidden', loggedIn);
    if (navUser) navUser.classList.toggle('hidden', !loggedIn);

    if (loggedIn) {
      // Set user info
      if (userName) {
        const name = cachedUser?.username || cachedUser?.full_name || 'User';
        userName.textContent = name;
      }
      if (userAvatar && cachedUser?.avatar_url) {
        userAvatar.src = cachedUser.avatar_url;
      } else if (userAvatar) {
        userAvatar.src = '/img/default-avatar.png';
      }

      // Show admin link if admin
      if (adminMenuLink && cachedUser?.role === 'admin') {
        adminMenuLink.classList.remove('hidden');
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

  async function init() {
    await loadPartial('#site-header', '/components/header.html');
    await loadPartial('#site-footer', '/components/footer.html');
    adjustForFixedHeader();
    window.addEventListener('resize', adjustForFixedHeader);

    // After header is loaded, setup event handlers
    syncHeaderAuthUI();
    syncCartBadge();
    setupUserMenuDropdown();
    setupNotificationDropdown();
    setupSearch();
    
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();



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
    const userMenu = document.getElementById('headerUserMenu');
    const usernameEl = document.getElementById('headerUsername');
    const logoutBtn = document.getElementById('headerLogoutBtn');

    const loggedIn = !!token;

    if (loginLink) loginLink.classList.toggle('hidden', loggedIn);
    if (registerLink) registerLink.classList.toggle('hidden', loggedIn);
    if (userMenu) userMenu.classList.toggle('hidden', !loggedIn);

    if (loggedIn && usernameEl) {
      const name = cachedUser?.username || cachedUser?.full_name || 'User';
      usernameEl.textContent = name;
    }

    if (logoutBtn) {
      logoutBtn.onclick = (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user_info');
        window.location.href = '/';
      };
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

    // After header is loaded
    syncHeaderAuthUI();
    syncCartBadge();
    
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



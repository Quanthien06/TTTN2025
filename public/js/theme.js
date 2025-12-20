// Theme Management (Dark Mode)
(function() {
    'use strict';

    const THEME_KEY = 'theme_preference';
    const THEMES = {
        LIGHT: 'light',
        DARK: 'dark'
    };

    // Get saved theme or default to light
    function getTheme() {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved && (saved === THEMES.LIGHT || saved === THEMES.DARK)) {
            return saved;
        }
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return THEMES.DARK;
        }
        return THEMES.LIGHT;
    }

    // Apply theme
    function applyTheme(theme) {
        const html = document.documentElement;
        if (theme === THEMES.DARK) {
            html.setAttribute('data-theme', 'dark');
        } else {
            html.removeAttribute('data-theme');
        }
        localStorage.setItem(THEME_KEY, theme);
    }

    // Toggle theme
    function toggleTheme() {
        const current = getTheme();
        const newTheme = current === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
        applyTheme(newTheme);
        updateThemeToggleIcon(newTheme);
        return newTheme;
    }

    // Update toggle button icon
    function updateThemeToggleIcon(theme) {
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.className = theme === THEMES.DARK 
                    ? 'fas fa-sun' 
                    : 'fas fa-moon';
            }
        }
    }

    // Initialize theme on page load
    function initTheme() {
        const theme = getTheme();
        applyTheme(theme);
        updateThemeToggleIcon(theme);
    }

    // Listen for system theme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(THEME_KEY)) {
                applyTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
            }
        });
    }

    // Export functions
    window.themeManager = {
        toggle: toggleTheme,
        get: getTheme,
        apply: applyTheme,
        init: initTheme
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
})();


// Features initialization script
// This file loads all new features: theme, i18n, animations, and PWA

(function() {
    'use strict';

    // Load theme manager
    function loadTheme() {
        if (!document.getElementById('theme-script')) {
            const script = document.createElement('script');
            script.id = 'theme-script';
            script.src = '/js/theme.js';
            script.defer = true;
            document.head.appendChild(script);
        }
    }

    // Load i18n
    function loadI18n() {
        if (!document.getElementById('i18n-script')) {
            const script = document.createElement('script');
            script.id = 'i18n-script';
            script.src = '/js/i18n.js';
            script.defer = true;
            document.head.appendChild(script);
        }
    }

    // Load animations
    function loadAnimations() {
        if (!document.getElementById('animations-script')) {
            const script = document.createElement('script');
            script.id = 'animations-script';
            script.src = '/js/animations.js';
            script.defer = true;
            document.head.appendChild(script);
        }
    }

    // Register service worker
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                        console.log('[PWA] Service Worker registered:', registration.scope);
                        
                        // Check for updates
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    console.log('[PWA] New version available. Please refresh.');
                                }
                            });
                        });
                    })
                    .catch((error) => {
                        console.warn('[PWA] Service Worker registration failed:', error);
                    });
            });
        }
    }

    // Initialize all features
    function initFeatures() {
        loadTheme();
        loadI18n();
        loadAnimations();
        registerServiceWorker();
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFeatures);
    } else {
        initFeatures();
    }
})();


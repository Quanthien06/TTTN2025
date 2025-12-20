// Service Worker for PWA and Offline Support
const CACHE_NAME = 'techstore-v1';
const RUNTIME_CACHE = 'techstore-runtime-v1';

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/js/theme.js',
    '/js/i18n.js',
    '/js/animations.js',
    '/img/logo/favicon-32x32.png',
    '/img/logo/apple-touch-icon.png',
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching static assets');
            return cache.addAll(STATIC_ASSETS).catch((err) => {
                console.warn('[Service Worker] Failed to cache some assets:', err);
            });
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip API calls (always use network)
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request).catch(() => {
                // Return offline response for API calls
                return new Response(
                    JSON.stringify({ 
                        message: 'You are offline. Please check your connection.',
                        offline: true 
                    }),
                    {
                        headers: { 'Content-Type': 'application/json' },
                        status: 503
                    }
                );
            })
        );
        return;
    }

    // Cache strategy: Cache First, then Network
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request).then((response) => {
                // Don't cache if not a valid response
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // Clone the response
                const responseToCache = response.clone();

                // Cache the response
                caches.open(RUNTIME_CACHE).then((cache) => {
                    cache.put(request, responseToCache);
                });

                return response;
            }).catch(() => {
                // Return offline page for navigation requests
                if (request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
                // Return placeholder for other requests
                return new Response('Offline', {
                    headers: { 'Content-Type': 'text/plain' },
                    status: 503
                });
            });
        })
    );
});

// Background sync (for offline actions)
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag);
    if (event.tag === 'sync-cart') {
        event.waitUntil(syncCart());
    }
});

// Push notifications (optional)
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push notification received');
    const options = {
        body: event.data ? event.data.text() : 'New notification',
        icon: '/img/logo/favicon-32x32.png',
        badge: '/img/logo/favicon-32x32.png',
        vibrate: [200, 100, 200],
        tag: 'notification'
    };

    event.waitUntil(
        self.registration.showNotification('TechStore', options)
    );
});

// Helper function for syncing cart (placeholder)
async function syncCart() {
    // Implement cart sync logic here
    console.log('[Service Worker] Syncing cart...');
}


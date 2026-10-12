// =====================================================================
// PWA Service Worker - Cibenda Mart
// Handles offline caching, network-first strategy, and Firebase Push Messaging
// =====================================================================

try {
    importScripts('/firebase-messaging-sw.js');
} catch (e) {
    console.warn('[sw.js] Failed to import firebase-messaging-sw.js:', e);
}

const CACHE_NAME = 'cibenda-mart-v5';

// Asset yang di-cache saat install (App Shell)
const PRECACHE_URLS = [
    '/manifest.json',
    '/manifest-merchant.json',
    '/favicon.png',
    '/sounds/notification.mp3',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/icons/icon-merchant-192.png',
    '/icons/icon-merchant-512.png',
];

// Install: pre-cache app shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_URLS);
        }).then(() => self.skipWaiting())
    );
});

// Activate: hapus cache lama
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: Static assets cache-first; never cache authenticated HTML or Inertia JSON
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET & cross-origin requests
    if (request.method !== 'GET' || url.origin !== location.origin) return;

    // Skip Inertia XHR requests & dynamic/authenticated routes → always network, never cache
    if (request.headers.get('X-Inertia')) return;

    const dynamicPaths = [
        '/api/', '/auth/', '/login', '/register', '/dashboard',
        '/pedagang', '/cibenda-portal', '/admin', '/profile',
        '/checkout', '/payment', '/history', '/cart', '/chat', '/tracker',
        '/sw.js', '/firebase-messaging-sw.js'
    ];
    if (dynamicPaths.some((path) => url.pathname.startsWith(path))) return;

    // Static assets: cache-first (only cache 200 OK responses)
    if (url.pathname.match(/\.(js|css|png|jpg|jpeg|webp|svg|woff2?)$/)) {
        event.respondWith(
            caches.match(request).then((cached) => {
                return cached || fetch(request).then((response) => {
                    if (response && response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return response;
                });
            })
        );
    }
});

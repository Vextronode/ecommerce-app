// =====================================================================
// PWA Service Worker - Cibenda Mart
// Handles offline caching & network-first strategy
// NOTE: Firebase Messaging SW (firebase-messaging-sw.js) handles push
//       notifications separately — this SW handles caching only.
// =====================================================================

const CACHE_NAME = 'cibenda-mart-v3';

// Asset yang di-cache saat install (App Shell)
const PRECACHE_URLS = [
    '/',
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

// Fetch: Network-first, fallback ke cache
// Inertia/API request → selalu network first
// Static assets (js, css, images) → cache first
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET & cross-origin requests
    if (request.method !== 'GET' || url.origin !== location.origin) return;

    // Skip Inertia/API/auth routes → always network
    const dynamicPaths = ['/api/', '/auth/', '/login', '/register', '/dashboard'];
    if (dynamicPaths.some((path) => url.pathname.startsWith(path))) return;

    // Static assets: cache-first
    if (url.pathname.match(/\.(js|css|png|jpg|jpeg|webp|svg|woff2?)$/)) {
        event.respondWith(
            caches.match(request).then((cached) => {
                return cached || fetch(request).then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                });
            })
        );
        return;
    }

    // HTML pages: network-first, fallback ke cache
    event.respondWith(
        fetch(request)
            .then((response) => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                return response;
            })
            .catch(() => caches.match(request))
    );
});

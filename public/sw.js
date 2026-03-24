// Rabona Service Worker — Cache-first for assets, network-first for navigation
const CACHE_NAME = 'rabona-v1';
const PRECACHE = [
  '/',
  '/index.html',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) return;

  // Navigation: network-first
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Assets: cache-first with network fallback
  e.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        // Cache JS/CSS/images for offline
        if (response.ok && (request.url.match(/\.(js|css|png|jpg|svg|woff2?|mp3|ogg|m4a)$/))) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});

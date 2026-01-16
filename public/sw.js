const CACHE_NAME = 'shelfie-ease-v3';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Network first strategy voor API calls en dynamische content
  if (event.request.url.includes('/api/') || event.request.url.includes('openlibrary.org')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Fallback naar cache als network faalt
        return caches.match(event.request);
      })
    );
  } else {
    // Cache first strategy voor statische assets
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});




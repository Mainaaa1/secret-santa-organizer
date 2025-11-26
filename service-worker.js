const CACHE_VERSION = 2;
const CACHE_NAME = `secret-santa-v${CACHE_VERSION}`;
const RUNTIME_CACHE = 'secret-santa-runtime';

// Files to precache (app shell)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/css/style.css',
  '/js/app.js',
  '/js/pairing.js',
  '/js/visuals.js',
  '/favicon.svg',
  '/manifest.json'
];

// External libs we want cached for offline reliability (will be fetched & cached on install)
const EXTERNALS = [
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/vanta/0.5.24/vanta.waves.min.js'
];

self.addEventListener('install', event => {
  // Precache the app shell first. Don't fail the install if external CDN resources fail.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => {
        // Try to fetch external libs and cache them, but ignore failures so install succeeds.
        return caches.open(CACHE_NAME).then(cache => {
          return Promise.all(EXTERNALS.map(url =>
            fetch(url, { mode: 'no-cors' })
              .then(resp => {
                try { cache.put(url, resp.clone()); } catch (e) { /* ignore clone errors for opaque */ }
              })
              .catch(() => { /* ignore external fetch errors */ })
          ));
        });
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME && key.startsWith('secret-santa-')) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

// Fetch handler: network-first for navigation (pages), cache-first for assets.
self.addEventListener('fetch', event => {
  const request = event.request;

  // Handle navigation: network-first, fallback to cache then offline page
  if (request.mode === 'navigate' || (request.method === 'GET' && request.headers.get('accept') && request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Update the cache with the latest index.html
          caches.open(CACHE_NAME).then(cache => cache.put('/index.html', response.clone()));
          return response;
        })
        .catch(() => caches.match('/index.html').then(cached => cached || caches.match('/offline.html')))
    );
    return;
  }

  // For other requests: try cache, then network, and put into runtime cache
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;
      return fetch(request).then(networkResponse => {
        // Don't cache opaque responses from other origins without checking
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
          return networkResponse;
        }
        return caches.open(RUNTIME_CACHE).then(cache => {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // If it's an image or other media, you might want to return a placeholder here
        return caches.match('/offline.html');
      });
    })
  );
});

// Allow clients to trigger skipWaiting for immediate activation
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

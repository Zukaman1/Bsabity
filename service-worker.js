/**
 * ==========================================================================
 * Bsabity Furniture Workshop - Progressive Web App Service Worker
 * ==========================================================================
 */

const CACHE_NAME = 'bsabity-furniture-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/about.html',
  '/services.html',
  '/gallery.html',
  '/products.html',
  '/contact.html',
  '/admin.html',
  '/css/style.css',
  '/css/responsive.css',
  '/js/app.js',
  '/js/gallery.js',
  '/js/admin.js',
  '/js/firebase.js',
  '/manifest.json'
];

// Install Service Worker and cache essential static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching critical app shell assets.');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Service Worker and clean up stale legacy caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing deprecated cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Intercept requests and serve with Stale-While-Revalidate caching pattern
self.addEventListener('fetch', (event) => {
  // Only handle standard HTTP/HTTPS requests (avoid chrome-extension issues)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached resource immediately, but fetch updated version in background
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {/* Ignore background network failures gracefully */});
        
        return cachedResponse;
      }

      // Fetch from network normally if not cached
      return fetch(event.request).then((networkResponse) => {
        // Cache newly discovered images or pages dynamically
        if (networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline custom fallback page for HTML navigation requests
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
      });
    })
  );
});

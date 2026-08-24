const CACHE_NAME = 'fast-image-compression-v3';
const APP_SHELL = ['/', '/index.html', '/styles.css', '/script.js', '/jszip.min.js', '/theme.js', '/site.webmanifest', '/favicon.svg', '/web-app-manifest-192x192.png', '/web-app-manifest-512x512.png'];
const NETWORK_FIRST_PATHS = new Set(['/', '/index.html', '/styles.css', '/script.js', '/theme.js', '/sw.js']);
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  const updateCache = response => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    }
    return response;
  };
  if (NETWORK_FIRST_PATHS.has(url.pathname)) {
    event.respondWith(fetch(event.request).then(updateCache).catch(() => caches.match(event.request)));
    return;
  }

  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(updateCache).catch(() => caches.match('/index.html'))));
});

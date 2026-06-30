const CACHE_NAME = 'iberfit-v11-f7-7-shell';
const APP_SHELL = [
  '/',
  '/index.html',
  '/coach.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/src/styles-v10.css?v=11.0.0-f7-7',
  '/src/config-v10.js?v=11.0.0-f7-7',
  '/src/api-v10.js?v=11.0.0-f7-7',
  '/src/client-v10.js?v=11.0.0-f7-7',
  '/src/coach-v10.js?v=11.0.0-f7-7',
  '/assets/iberfit-isotipo.png',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/icon-maskable-512.png',
  '/assets/apple-touch-icon.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if (url.pathname.startsWith('/api/') || url.hostname.includes('script.google')) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('/offline.html')));
    return;
  }
  if (req.method !== 'GET') return;
  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(res => {
    const copy = res.clone();
    if (res.ok && (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/src/'))) {
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
    }
    return res;
  }).catch(() => cached)));
});

/* SGE – simple SW (cache pages & static, offline fallback) */
const CACHE_NAME = 'sge-cache-v1';
const CORE = [
  '/', '/index.html',
  '/offline.html',
  '/manifest.json',
  // ضع هنا مسارات ثابتة إضافية إن رغبت (شعار، CSS عام...)
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.map(n => (n !== CACHE_NAME ? caches.delete(n) : undefined)));
    await self.clients.claim();
  })());
});

/* Network-first for navigations, cache-first for static assets */
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // 1) تنقلات (صفحات)
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preload = await event.preloadResponse;
        if (preload) return preload;
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone());
        return fresh;
      } catch (e) {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(req);
        return cached || cache.match('/offline.html');
      }
    })());
    return;
  }

  // 2) ملفات ثابتة (صور/CSS/JS) – cache-first
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (/\.(?:png|jpg|jpeg|webp|svg|gif|css|js|woff2?)$/i.test(url.pathname)) {
      event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(req);
        if (cached) return cached;
        try {
          const fresh = await fetch(req);
          cache.put(req, fresh.clone());
          return fresh;
        } catch {
          return cached || Response.error();
        }
      })());
    }
  }
});

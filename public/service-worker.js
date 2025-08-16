/* SGE – Workbox runtime caching + offline fallback */
self.__WB_DISABLE_DEV_LOGS = true;
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

const CORE = [
  '/', '/index.html', '/offline.html', '/manifest.json',
  // أضف هنا أي ملفات ثابتة مهمة تريدها مسبقًا
];

workbox.core.setCacheNameDetails({ prefix: 'sge', suffix: 'v1' });
workbox.precaching.precacheAndRoute(CORE.map(url => ({url, revision: null})));

const pageStrategy = new workbox.strategies.NetworkFirst({
  cacheName: 'sge-pages',
  plugins: [
    new workbox.expiration.ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 7 * 24 * 3600 }),
  ],
});

const staticStrategy = new workbox.strategies.StaleWhileRevalidate({
  cacheName: 'sge-static',
  plugins: [
    new workbox.expiration.ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 3600 }),
  ],
});

const imageStrategy = new workbox.strategies.CacheFirst({
  cacheName: 'sge-img',
  plugins: [
    new workbox.expiration.ExpirationPlugin({ maxEntries: 150, maxAgeSeconds: 30 * 24 * 3600 }),
  ],
});

const apiStrategy = new workbox.strategies.NetworkFirst({
  cacheName: 'sge-api',
  networkTimeoutSeconds: 4,
  plugins: [
    new workbox.expiration.ExpirationPlugin({ maxEntries: 120, maxAgeSeconds: 24 * 3600 }),
  ],
});

// صفحات (تنقل) – NetworkFirst مع fallback للأوفلاين
workbox.routing.registerRoute(({ request }) => request.mode === 'navigate', async ({ event }) => {
  try {
    return await pageStrategy.handle({ event });
  } catch (_) {
    return caches.match('/offline.html');
  }
});

// ملفات ثابتة (CSS/JS/Fonts) – SWR
workbox.routing.registerRoute(
  ({ request }) => ['style', 'script', 'worker', 'font'].includes(request.destination),
  staticStrategy
);

// صور – CacheFirst
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  imageStrategy
);

// نداءات API (Firestore/Storage…) – NetworkFirst
workbox.routing.registerRoute(
  ({ url }) => url.origin !== self.location.origin,
  apiStrategy
);

// skipWaiting لتحديث فوري
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

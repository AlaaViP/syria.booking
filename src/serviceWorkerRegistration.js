// src/serviceWorkerRegistration.js

const SW_URL = '/service-worker.js';

export function registerSW() {
  if (typeof window === 'undefined') return;

  // نسجّل فقط في الإنتاج وعلى المتصفحات التي تدعم SW
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register(SW_URL)
        .then((reg) => {
          // console.log('SW registered', reg);
        })
        .catch(() => {
          // تجاهل الأخطاء حتى لا نكسر التطبيق
        });
    });
  }
}

export function unregisterSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((reg) => reg.unregister())
      .catch(() => {});
  }
}
export { registerSW as register };

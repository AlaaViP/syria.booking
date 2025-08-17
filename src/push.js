// src/push.js
// تهيئة إشعارات Push مع Firebase Messaging (آمن لو غير مدعوم/غير مُهيأ)

export async function initPush() {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  try {
    // تسجيل Service Worker لإشعارات FCM
    const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    // التهيئة اختيارية—لن تعمل إلا إذا كانت Firebase موجودة ومهيأة
    try {
      // نحاول استيراد Firebase Messaging فقط عند الحاجة
      const { app } = await import('./firebase'); // يجب أن يصدّر app من firebase.js
      const { getMessaging, getToken, onMessage, isSupported } = await import('firebase/messaging');

      if (!(await isSupported())) return;

      const messaging = getMessaging(app);

      // اجلب توكن الجهاز (ضع مفتاح VAPID في .env)
      const vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY || '';
      if (!vapidKey) {
        console.warn('FCM: VAPID key is not set. Set REACT_APP_FIREBASE_VAPID_KEY to enable push.');
        return;
      }

      const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: reg,
      });

      if (token) {
        console.log('FCM token:', token);
        // TODO: أرسل التوكن للسيرفر/فايرستور إن أحببت
      }

      onMessage(messaging, (payload) => {
        console.log('FCM foreground message:', payload);
        // TODO: اعرض Toast/Badge إلخ
      });
    } catch (e) {
      // لو Firebase Messaging غير مضافة لن نكسر البناء
      console.log('Push init: Firebase Messaging not configured (skipping).', e?.message || e);
    }
  } catch (err) {
    console.warn('Service worker registration failed:', err);
  }
}

// لو كان هناك import './push' فقط بدون استدعاء، لا يحدث شيء
const noop = {};
export default noop;

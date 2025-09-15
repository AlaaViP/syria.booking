// src/push.js
import { getApp } from 'firebase/app';
import { isSupported, getMessaging, getToken, onMessage } from 'firebase/messaging';

const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY;

export async function initPush() {
  // لا تشغّل FCM إذا ما في Notifications أو ما في مفتاح VAPID
  if (!('Notification' in window)) return;
  if (!VAPID_KEY) {
    console.warn('FCM disabled: missing REACT_APP_FIREBASE_VAPID_KEY');
    return;
  }

  // تأكد أن المتصفح يدعم FCM
  const supported = await isSupported().catch(() => false);
  if (!supported) return;

  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return;

  // أنشئ messaging من التطبيق الافتراضي
  const app = getApp();                // يتطلب أن يكون initializeApp قد تم في firebase.js
  const messaging = getMessaging(app);

  // استخدم Service Worker إن وُجد (اختياري)
  const reg = await navigator.serviceWorker?.getRegistration();

  try {
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: reg || undefined,
    });
    // TODO: إذا تحتاج، أرسل token لسيرفرك
    // console.log('FCM token:', token);

    onMessage(messaging, (payload) => {
      // استقبال رسائل foreground (اختياري)
      // console.log('FCM message:', payload);
    });
  } catch (e) {
    console.error('FCM getToken error:', e);
  }
}

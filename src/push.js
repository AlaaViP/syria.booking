import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase"; // تأكد من التهيئة هناك

const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY;

export async function initPush() {
  // إذا ما في Notifications أو ما في مفتاح، لا تشغّل FCM
  if (!('Notification' in window)) return;
  if (!VAPID_KEY) {
    console.warn('FCM disabled: missing REACT_APP_FIREBASE_VAPID_KEY');
    return;
  }

  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return;

  try {
    // لو عندك Service Worker مخصص لـ FCM
    const reg = await navigator.serviceWorker.getRegistration();

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: reg || undefined,
    });

    // TODO: أرسل الـ token لسيرفرك إذا احتجته
    // console.log('FCM token:', token);

    onMessage(messaging, (payload) => {
      // تعامل مع الرسائل foreground إن رغبت
      // console.log('FCM message:', payload);
    });
  } catch (e) {
    console.error('FCM getToken error:', e);
  }
}
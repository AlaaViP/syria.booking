/* Firebase Messaging SW */
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCm9gH7teQdv5jETLuANm-J9pN1I3k9TRc",
  authDomain: "syriabooking-841e5.firebaseapp.com",
  projectId: "syriabooking-841e5",
  storageBucket: "syriabooking-841e5.appspot.com",
  messagingSenderId: "858108774964",
  appId: "1:858108774964:web:65ec66e6c38927d87c9861",
});

const messaging = firebase.messaging();

// تنسيق الإشعار عند الخلفية
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon, click_action } = payload.notification || {};
  self.registration.showNotification(title || 'Syria Golden Eagle', {
    body: body || '',
    icon: icon || '/icons/icon-192.png',
    data: { click_action: click_action || '/' }
  });
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.click_action) || '/';
  e.waitUntil(clients.openWindow(url));
});

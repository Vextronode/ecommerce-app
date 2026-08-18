importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyDn0sj_M8QkY8a399XJYRAhsSKYc8uF72U",
    authDomain: "cibendamart.firebaseapp.com",
    projectId: "cibendamart",
    storageBucket: "cibendamart.firebasestorage.app",
    messagingSenderId: "584045016651",
    appId: "1:584045016651:web:d9f61f4b892d2c547e7fce"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Notifikasi Baru';
  
  const isMerchant = payload.data?.is_merchant === 'true' || (payload.data?.action_url && payload.data.action_url.includes('/pedagang'));
  const defaultIcon = isMerchant ? '/icons/icon-merchant-192.png' : '/icons/icon-192.png';
  const customIcon = payload.data?.icon ? payload.data.icon : defaultIcon;

  const notificationOptions = {
    body: payload.notification?.body || payload.data?.message || 'Anda mendapatkan notifikasi baru dari CibendaMart.',
    icon: self.location.origin + customIcon,
    badge: self.location.origin + customIcon,
    sound: self.location.origin + '/sounds/notification.mp3',
    vibrate: [200, 100, 200, 100, 200],
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const actionUrl = event.notification.data?.action_url || '/';
  const targetUrl = new URL(actionUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

const CACHE_NAME = 'retro-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/chat.html',
  '/profile.html',
  '/auth.html',
  '/style.css',
  '/manifest.json',
  '/icon.png'
];

// 1. Install & Cache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// 2. Activate & Clean Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Serve Cached Assets
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

// 4. Handle Top-of-Phone System Push Notifications & App Badge
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'New Message', body: event.data.text() };
    }
  }

  const title = data.title || 'New Message on RETRO';
  const badgeCount = data.badgeCount || 1;

  const options = {
    body: data.body || 'You received a new message.',
    icon: '/icon.png',
    badge: '/icon.png',
    vibrate: [200, 100, 200],
    tag: 'retro-message', // Replaces old popups with fresh ones
    renotify: true,
    data: { url: data.url || '/index.html' }
  };

  // Update App Icon Badge on phone home screen with the REAL unread count
  if ('setAppBadge' in navigator) {
    navigator.setAppBadge(badgeCount).catch(() => {});
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 5. Open App when Top Notification Banner is Tapped
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Clear App Icon Badge on notification click
  if ('clearAppBadge' in navigator) {
    navigator.clearAppBadge().catch(() => {});
  }

  const targetUrl = event.notification.data.url || '/index.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('index.html') || client.url.includes('chat.html')) {
          client.focus();
          return client.navigate(targetUrl);
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

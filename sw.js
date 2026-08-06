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

// 3. Serve Cached Assets (Skip API calls & non-GET requests)
self.addEventListener('fetch', (event) => {
  // Do not intercept or cache non-GET requests or API calls
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }

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
    tag: 'retro-message',
    renotify: true,
    data: { url: data.url || '/index.html' }
  };

  const notificationPromise = self.registration.showNotification(title, options);

  let badgePromise = Promise.resolve();
  if ('setAppBadge' in navigator) {
    badgePromise = navigator.setAppBadge(badgeCount).catch(() => {});
  }

  // Ensure worker stays alive until both notification and badge updates finish
  event.waitUntil(
    Promise.all([notificationPromise, badgePromise])
  );
});

// 5. Open App when Top Notification Banner is Tapped
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data ? event.notification.data.url : '/index.html';

  let clearBadgePromise = Promise.resolve();
  if ('clearAppBadge' in navigator) {
    clearBadgePromise = navigator.clearAppBadge().catch(() => {});
  }

  const focusWindowPromise = clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    for (const client of clientList) {
      if (client.url.includes(self.location.origin)) {
        client.focus();
        return client.navigate(targetUrl);
      }
    }
    if (clients.openWindow) {
      return clients.openWindow(targetUrl);
    }
  });

  event.waitUntil(
    Promise.all([clearBadgePromise, focusWindowPromise])
  );
});

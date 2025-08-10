const CACHE_NAME = 'gym-pwa-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/manifest-icon-192.maskable.png',
  '/icons/manifest-icon-512.maskable2.png',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache install failed:', error);
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'FitEspero',
    body: 'New notification from FitEspero',
    icon: '/icons/manifest-icon-192.maskable.png',
    badge: '/icons/manifest-icon-192.maskable.png',
    data: { url: '/' },
    tag: 'default',
    requireInteraction: false,
    vibrate: [100, 50, 100]
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.body || notificationData.body,
        icon: payload.icon || notificationData.icon,
        badge: payload.badge || notificationData.badge,
        image: payload.image,
        data: payload.data || notificationData.data,
        tag: payload.tag || notificationData.tag,
        requireInteraction: payload.requireInteraction || false,
        vibrate: payload.vibrate || notificationData.vibrate,
        actions: payload.actions || [],
        silent: payload.silent || false
      };
    } catch (error) {
      console.error('Error parsing push notification data:', error);
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  const clickedNotification = event.notification;
  const notificationData = clickedNotification.data || {};
  const urlToOpen = notificationData.url || '/';

  // Handle action clicks
  if (event.action) {
    console.log('Action clicked:', event.action);
    
    switch (event.action) {
      case 'check-in':
        urlToOpen = '/qr-code';
        break;
      case 'view':
        // Use the URL from notification data
        break;
      case 'dismiss':
        return; // Don't open any window
      default:
        break;
    }
  }

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Try to focus existing window/tab
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin)) {
          return client.focus().then(() => {
            // Navigate to the desired URL
            if (urlToOpen !== '/') {
              return client.navigate(urlToOpen);
            }
            return client;
          });
        }
      }
      
      // No existing window, open new one
      return clients.openWindow(urlToOpen);
    })
  );
});

// Ember Dust Admin Service Worker
const CACHE_NAME = "ember-admin-v1";
const ASSETS_TO_CACHE = [
  "/admin",
  "/admin-manifest.json",
  "/favicon-32x32.png",
  "/android-chrome-192x192.png",
  "/apple-touch-icon.png",
];

// Install: pre-cache minimal admin shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {
        // Silently continue if some assets aren't immediately available
      });
    })
  );
  self.skipWaiting();
});

// Activate: cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Handle incoming push messages
self.addEventListener("push", (event) => {
  let data = {
    title: "🔥 New Order Received!",
    body: "A new wood ash order was placed on Ember Dust.",
    orderId: null,
    orderNumber: "New Order",
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: "/android-chrome-192x192.png",
    badge: "/favicon-32x32.png",
    vibrate: [200, 100, 200, 100, 200],
    tag: data.orderNumber || "ember-order-alert",
    renotify: true,
    data: {
      url: "/admin",
      orderId: data.orderId,
    },
    actions: [
      {
        action: "view_order",
        title: "📦 View Order Details",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = "/admin";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url && client.url.includes("/admin") && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

// Minimal fetch pass-through
self.addEventListener("fetch", (event) => {
  // Pass-through to network
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

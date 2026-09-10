// ============================================================================
// KYRARA SERVICE WORKER - WEB PUSH NOTIFICATIONS (W3C / iOS Safari PWA)
// ============================================================================

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// Escuchar notificaciones push enviadas desde el backend
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const title = payload.title || "💈 Kyrara Barber";
    const options = {
      body: payload.body || "Nueva notificación de tu barbería",
      icon: payload.icon || "/assets/images/icon.png",
      badge: payload.badge || "/assets/images/icon.png",
      vibrate: [200, 100, 200],
      tag: payload.tag || "kyrara-alert",
      renotify: true,
      data: payload.data || { url: "/" },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    // Si el payload es texto plano
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification("💈 Kyrara Barber", {
        body: text,
        icon: "/assets/images/icon.png",
      })
    );
  }
});

// Al tocar la notificación, abrir o enfocar la aplicación
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una pestaña abierta de Kyrara, enfocarla
      for (const client of clientList) {
        if ("focus" in client) {
          return client.focus();
        }
      }
      // Si no hay pestañas abiertas, abrir una nueva ventana
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

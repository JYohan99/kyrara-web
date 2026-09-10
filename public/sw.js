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
    let payload;
    try {
      payload = event.data.json();
    } catch {
      payload = { body: event.data.text() };
    }

    const title = payload.title || "💈 Kyrara Barber";
    const options = {
      body: payload.body || "Nueva notificación de tu barbería",
      icon: payload.icon || "/icon.png",
      badge: payload.badge || "/icon.png",
      data: payload.data || { url: "/" },
    };

    if (payload.tag) {
      options.tag = payload.tag;
    }

    event.waitUntil(
      self.registration.showNotification(title, options).catch((err) => {
        console.error("[SW] Error al mostrar notificación:", err);
      })
    );
  } catch (err) {
    console.error("[SW] Error procesando push event:", err);
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

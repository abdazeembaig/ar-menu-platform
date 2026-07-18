const CACHE_NAME = "ar-menu-platform-shell-v4";
const APP_SHELL = [
  "/ar-menu-platform/offline/",
  "/ar-menu-platform/logo.svg",
  "/ar-menu-platform/manifest.webmanifest"
];
const RUNTIME_CACHEABLE_DESTINATIONS = new Set(["font", "image", "model"]);

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => undefined));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && RUNTIME_CACHEABLE_DESTINATIONS.has(event.request.destination)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => undefined);
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match("/ar-menu-platform/offline/")),
      ),
  );
});

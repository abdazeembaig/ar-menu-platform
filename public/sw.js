const CACHE_NAME = "ar-menu-platform-shell-v1";
const APP_SHELL = [
  "/ar-menu-platform/",
  "/ar-menu-platform/r/brunch-cafe/t/T12/",
  "/ar-menu-platform/offline/",
  "/ar-menu-platform/logo.svg",
  "/ar-menu-platform/manifest.webmanifest",
  "/ar-menu-platform/models/demo-dish.glb"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => undefined));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => undefined);
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match("/ar-menu-platform/offline/")),
      ),
  );
});

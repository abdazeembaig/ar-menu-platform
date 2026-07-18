const SHELL_CACHE_NAME = "ar-menu-platform-shell-v5";
const MODEL_CACHE_NAME = "ar-menu-platform-3d-v1";
const MAX_MODEL_CACHE_ITEMS = 4;
const APP_SHELL = [
  "/ar-menu-platform/offline/",
  "/ar-menu-platform/logo.svg",
  "/ar-menu-platform/manifest.webmanifest"
];
const MODEL_ASSET_PATTERN = /\.(glb|gltf|bin|usdz)(\?|$)/i;
const LIGHT_RUNTIME_DESTINATIONS = new Set(["font", "image"]);

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL_CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => undefined));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE_NAME && key !== MODEL_CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  if (MODEL_ASSET_PATTERN.test(new URL(event.request.url).pathname)) {
    event.respondWith(cacheModelAfterNetworkSuccess(event.request));
    return;
  }

  event.respondWith(networkFirstForShell(event.request));
});

async function networkFirstForShell(request) {
  try {
    const response = await fetch(request);
    if (response.ok && LIGHT_RUNTIME_DESTINATIONS.has(request.destination)) {
      const cache = await caches.open(SHELL_CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return (await caches.match(request)) || caches.match("/ar-menu-platform/offline/");
  }
}

async function cacheModelAfterNetworkSuccess(request) {
  const cache = await caches.open(MODEL_CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
      await evictOldModelAssets(cache);
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw new Error("Model asset unavailable and not cached.");
  }
}

async function evictOldModelAssets(cache) {
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - MAX_MODEL_CACHE_ITEMS)).map((request) => cache.delete(request)));
}

"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NEXT_PUBLIC_PREVIEW_BUILD_SHA) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
        .then(() => ("caches" in window ? caches.keys() : Promise.resolve([])))
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .catch(() => undefined);
      return;
    }

    const base = window.location.pathname.startsWith("/ar-menu-platform") ? "/ar-menu-platform" : "";
    navigator.serviceWorker.register(`${base}/sw.js`).catch(() => undefined);
  }, []);

  return null;
}

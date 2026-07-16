"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const base = window.location.pathname.startsWith("/ar-menu-platform") ? "/ar-menu-platform" : "";
    navigator.serviceWorker.register(`${base}/sw.js`).catch(() => undefined);
  }, []);

  return null;
}

"use client";

import { Box, ScanLine } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocale } from "@/components/layout/locale-provider";
import type { FeatureFlags, ThreeDAsset } from "@/types/domain";

interface ARLaunchButtonProps {
  asset?: ThreeDAsset;
  flags: FeatureFlags;
  className?: string;
}

export function ARLaunchButton({ asset, flags, className }: ARLaunchButtonProps) {
  const { t } = useLocale();
  const [message, setMessage] = useState("");
  const support = useMemo(() => getArSupport(asset), [asset]);

  if (!flags.arEnabled || !asset || !support.href) {
    return (
      <button
        type="button"
        disabled
        className={`touch-target inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-extrabold text-muted ${className ?? ""}`}
      >
        <Box aria-hidden="true" size={18} />
        {!flags.arEnabled ? t("featureDisabled") : asset ? t("unsupported3D") : t("arUnavailable")}
      </button>
    );
  }

  return (
    <span className={`inline-grid gap-1 ${className ?? ""}`}>
      <a
        href={support.href}
        rel={support.rel}
        onClick={() => setMessage(support.label)}
        className="touch-target inline-flex items-center justify-center gap-2 rounded-full bg-accent px-4 text-sm font-extrabold text-white"
      >
        <ScanLine aria-hidden="true" size={18} />
        {t("viewOnTable")}
      </a>
      <span className="text-xs font-bold text-muted" aria-live="polite">{message}</span>
    </span>
  );
}

function getArSupport(asset?: ThreeDAsset) {
  if (typeof window === "undefined" || typeof navigator === "undefined" || !asset) {
    return { href: "", rel: undefined, label: "" };
  }

  const userAgent = navigator.userAgent;
  const glb = asset.glbUrl ? absoluteAssetUrl(asset.glbUrl) : "";
  const usdz = asset.usdzUrl ? absoluteAssetUrl(asset.usdzUrl) : "";
  const isApple = /iPad|iPhone|iPod|Macintosh/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);

  if (isApple && usdz) {
    return { href: usdz, rel: "ar", label: "iOS Quick Look" };
  }

  if (isAndroid && glb) {
    const sceneViewer = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(glb)}&mode=ar_preferred&resizable=false#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(glb)};end;`;
    return { href: sceneViewer, rel: undefined, label: "Android Scene Viewer" };
  }

  if (glb) {
    return { href: glb, rel: undefined, label: "View-in-3D fallback" };
  }

  return { href: "", rel: undefined, label: "" };
}

function absoluteAssetUrl(path: string) {
  if (path.startsWith("http")) {
    return path;
  }

  const basePath = window.location.pathname.startsWith("/ar-menu-platform") ? "/ar-menu-platform" : "";
  return `${window.location.origin}${basePath}${path}`;
}

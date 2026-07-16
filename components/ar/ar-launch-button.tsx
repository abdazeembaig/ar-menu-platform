"use client";

import { ScanLine } from "lucide-react";
import { useMemo } from "react";
import { useLocale } from "@/components/layout/locale-provider";
import type { FeatureFlags, ThreeDAsset } from "@/types/domain";

interface ARLaunchButtonProps {
  asset?: ThreeDAsset;
  flags: FeatureFlags;
  className?: string;
}

export function ARLaunchButton({ asset, flags, className }: ARLaunchButtonProps) {
  const { t } = useLocale();
  const isApple = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
  }, []);
  const url = isApple ? asset?.usdzUrl : asset?.glbUrl;
  const enabled = flags.arEnabled && Boolean(asset) && Boolean(url);

  if (!enabled) {
    return (
      <button
        type="button"
        disabled
        className={`touch-target inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-extrabold text-muted ${className ?? ""}`}
      >
        <ScanLine aria-hidden="true" size={18} />
        {flags.arEnabled ? t("arUnavailable") : t("featureDisabled")}
      </button>
    );
  }

  return (
    <a
      href={url}
      rel="ar"
      className={`touch-target inline-flex items-center justify-center gap-2 rounded-full bg-accent px-4 text-sm font-extrabold text-white ${className ?? ""}`}
    >
      <ScanLine aria-hidden="true" size={18} />
      {t("viewOnTable")}
    </a>
  );
}

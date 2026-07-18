"use client";

import { Box, ScanLine } from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/components/layout/locale-provider";
import { trackAnalyticsEvent } from "@/lib/analytics";
import type { FeatureFlags, ThreeDAsset } from "@/types/domain";

export type ArCapabilityState = "unknown" | "available" | "unsupported";

interface ARLaunchButtonProps {
  asset?: ThreeDAsset;
  flags: FeatureFlags;
  className?: string;
  capability: ArCapabilityState;
  onRequestAR: () => void;
}

export function ARLaunchButton({ asset, flags, className, capability, onRequestAR }: ARLaunchButtonProps) {
  const { t } = useLocale();
  const [message, setMessage] = useState("");

  if (!flags.arEnabled || !asset || isUnavailableAsset(asset) || capability === "unsupported") {
    return (
      <button
        type="button"
        disabled
        className={`touch-target inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-extrabold text-muted ${className ?? ""}`}
      >
        <Box aria-hidden="true" size={18} />
        {!flags.arEnabled ? t("featureDisabled") : capability === "unsupported" ? t("arUnavailable") : asset ? t("unsupported3D") : t("arUnavailable")}
      </button>
    );
  }

  return (
    <span className={`inline-grid gap-1 ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => {
          trackAnalyticsEvent({ name: "ar_button_clicked", metadata: { assetId: asset.id, capability } });
          setMessage(capability === "available" ? t("arOpening") : t("arPreparing"));
          onRequestAR();
        }}
        className="touch-target inline-flex items-center justify-center gap-2 rounded-full bg-accent px-4 text-sm font-extrabold text-white"
      >
        <ScanLine aria-hidden="true" size={18} />
        {t("viewOnTable")}
      </button>
      <span className="text-xs font-bold text-muted" aria-live="polite">{message}</span>
    </span>
  );
}

function isUnavailableAsset(asset: ThreeDAsset) {
  return Boolean(asset.status && asset.status !== "ready");
}

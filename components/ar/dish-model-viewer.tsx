"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Box, Loader2, TriangleAlert } from "lucide-react";
import { useLocale } from "@/components/layout/locale-provider";
import type { FeatureFlags, ThreeDAsset } from "@/types/domain";

interface DishModelViewerProps {
  asset?: ThreeDAsset;
  flags: FeatureFlags;
}

type ViewerState = "disabled" | "missing" | "unsupported" | "loading" | "ready" | "error";

export function DishModelViewer({ asset, flags }: DishModelViewerProps) {
  const { t } = useLocale();
  const [loadedAssetUrl, setLoadedAssetUrl] = useState<string | null>(null);
  const [viewerError] = useState(false);

  useEffect(() => {
    if (!flags.threeDEnabled || !asset?.glbUrl) {
      return;
    }

    const supportsWebGl = (() => {
      try {
        const canvas = document.createElement("canvas");
        return Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
      } catch {
        return false;
      }
    })();

    if (!supportsWebGl) {
      return;
    }

    const timer = window.setTimeout(() => setLoadedAssetUrl(asset.glbUrl ?? null), 450);
    return () => window.clearTimeout(timer);
  }, [asset?.glbUrl, flags.threeDEnabled]);

  const supportsWebGl = (() => {
    if (typeof document === "undefined") return true;
    try {
      const canvas = document.createElement("canvas");
      return Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
    } catch {
      return false;
    }
  })();
  const state: ViewerState = !flags.threeDEnabled
    ? "disabled"
    : !asset?.glbUrl
      ? "missing"
      : !supportsWebGl
        ? "unsupported"
        : viewerError
          ? "error"
          : loadedAssetUrl === asset.glbUrl
            ? "ready"
            : "loading";

  const poster = asset?.posterImageUrl;
  const message =
    state === "disabled"
      ? t("featureDisabled")
      : state === "missing"
        ? t("missingModel")
        : state === "unsupported"
          ? t("unsupported3D")
          : state === "error"
            ? t("modelError")
            : state === "loading"
              ? t("loadingModel")
              : t("viewIn3D");

  return (
    <section className="overflow-hidden rounded-[var(--radius-brand)] border border-border bg-surface" aria-label={t("viewIn3D")}>
      <div className="relative grid min-h-72 place-items-center bg-primary/5">
        {poster ? (
          <Image src={poster} alt={t("posterFallback")} fill sizes="100vw" className="object-cover opacity-25" />
        ) : null}
        <div className="relative z-10 mx-6 max-w-sm rounded-3xl border border-border bg-surface/95 p-6 text-center shadow-lg">
          <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-accent/10 text-accent">
            {state === "loading" ? <Loader2 aria-hidden="true" className="animate-spin" size={26} /> : state === "ready" ? <Box aria-hidden="true" size={26} /> : <TriangleAlert aria-hidden="true" size={26} />}
          </div>
          <h2 className="text-lg font-black text-primary">{message}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            {state === "ready" ? t("modelReadyHint") : t("modelFallbackHint")}
          </p>
        </div>
      </div>
    </section>
  );
}

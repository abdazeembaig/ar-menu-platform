"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Box, Expand, Loader2, RotateCcw, TriangleAlert, X } from "lucide-react";
import { useLocale } from "@/components/layout/locale-provider";
import { withAssetBasePath } from "@/lib/asset-path";
import type { FeatureFlags, ThreeDAsset } from "@/types/domain";

interface DishModelViewerProps {
  asset?: ThreeDAsset;
  flags: FeatureFlags;
}

type ViewerState = "disabled" | "missing" | "loading" | "ready" | "error";

export function DishModelViewer({ asset, flags }: DishModelViewerProps) {
  const { t } = useLocale();
  const [state, setState] = useState<ViewerState>("loading");
  const [attempt, setAttempt] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const frameRef = useRef<HTMLIFrameElement | null>(null);

  const modelSrc = withAssetBasePath(asset?.glbUrl);
  const viewerSrc = withAssetBasePath(asset?.viewerUrl);
  const posterSrc = withAssetBasePath(asset?.posterImageUrl ?? asset?.posterUrl);
  const displayedState: ViewerState = !flags.threeDEnabled ? "disabled" : asset?.glbUrl ? state : "missing";
  const canRenderModel = flags.threeDEnabled && Boolean(asset?.glbUrl) && Boolean(viewerSrc) && state !== "error";
  const label = asset?.attribution ?? t("technicalModelLabel");

  const retryModel = () => {
    setState("loading");
    setAttempt((current) => current + 1);
  };

  const resetCamera = () => {
    const viewer = frameRef.current?.contentWindow?.document.querySelector("model-viewer");
    viewer?.setAttribute("camera-orbit", "35deg 58deg 0.32m");
  };

  const renderViewer = (isFullscreen = false) => (
    <div className="relative min-h-[300px] overflow-hidden rounded-[var(--radius-brand)] border border-border bg-surface" id={isFullscreen ? "dish-model-viewer-fullscreen" : "dish-model-viewer"}>
      {posterSrc ? (
        <Image src={posterSrc} alt={t("posterFallback")} fill sizes="100vw" className="object-cover opacity-20" />
      ) : null}
      {canRenderModel ? (
        <iframe
          key={`${attempt}-${isFullscreen ? "full" : "inline"}`}
          ref={frameRef}
          title={label}
          src={`${viewerSrc}?v=${attempt}`}
          className="relative z-10 block w-full border-0 bg-[#f7f1ea]"
          style={{ height: isFullscreen ? "75vh" : "360px" }}
          allow="xr-spatial-tracking; fullscreen; accelerometer; gyroscope; camera"
          onLoad={() => setState("ready")}
          onError={() => setState("error")}
        />
      ) : (
        <div className="relative z-10 grid min-h-[300px] place-items-center p-6 text-center">
          <div className="max-w-sm rounded-3xl border border-border bg-surface/95 p-6 shadow-lg">
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-accent/10 text-accent">
              {displayedState === "loading" ? <Loader2 aria-hidden="true" className="animate-spin" size={26} /> : displayedState === "ready" ? <Box aria-hidden="true" size={26} /> : <TriangleAlert aria-hidden="true" size={26} />}
            </div>
            <h2 className="text-lg font-black text-primary">
              {displayedState === "disabled" ? t("featureDisabled") : displayedState === "missing" ? t("missingModel") : displayedState === "error" ? t("modelError") : t("loadingModel")}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {displayedState === "loading" ? `${t("loadingProgress")} 0%` : t("modelFallbackHint")}
            </p>
            {displayedState === "error" ? (
              <button
                type="button"
                onClick={retryModel}
                className="touch-target mt-4 rounded-full bg-primary px-4 text-sm font-extrabold text-white"
              >
                {t("retryModel")}
              </button>
            ) : null}
          </div>
        </div>
      )}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-t border-border bg-surface p-3">
        <p className="text-xs font-bold text-muted">{label}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={resetCamera}
            className="touch-target grid place-items-center rounded-full border border-border"
            aria-label={t("resetCamera")}
          >
            <RotateCcw aria-hidden="true" size={17} />
          </button>
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="touch-target grid place-items-center rounded-full border border-border"
            aria-label={t("fullScreen")}
          >
            <Expand aria-hidden="true" size={17} />
          </button>
        </div>
      </div>
      {modelSrc ? <span className="sr-only">{modelSrc}</span> : null}
    </div>
  );

  return (
    <>
      {renderViewer()}
      {fullscreen ? (
        <div className="fixed inset-0 z-50 bg-primary/80 p-4" role="dialog" aria-modal="true" aria-label={t("viewIn3D")}>
          <div className="mx-auto max-w-4xl">
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              className="touch-target mb-3 ms-auto grid place-items-center rounded-full bg-surface text-primary"
              aria-label={t("close")}
            >
              <X aria-hidden="true" size={20} />
            </button>
            {renderViewer(true)}
          </div>
        </div>
      ) : null}
    </>
  );
}

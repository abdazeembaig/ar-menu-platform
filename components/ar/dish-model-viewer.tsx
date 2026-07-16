"use client";

import Image from "next/image";
import type { CSSProperties, ElementType, Ref } from "react";
import { useEffect, useRef, useState } from "react";
import { Box, Expand, Loader2, RotateCcw, TriangleAlert, X } from "lucide-react";
import { useLocale } from "@/components/layout/locale-provider";
import type { FeatureFlags, ThreeDAsset } from "@/types/domain";

interface DishModelViewerProps {
  asset?: ThreeDAsset;
  flags: FeatureFlags;
}

type ViewerState = "disabled" | "missing" | "loading" | "ready" | "error";
type ModelViewerElementProps = {
  ref?: Ref<HTMLElement>;
  src?: string;
  poster?: string;
  "camera-controls"?: boolean;
  "touch-action"?: string;
  "disable-tap"?: boolean;
  ar?: boolean;
  loading?: "auto" | "lazy" | "eager";
  reveal?: "auto" | "interaction" | "manual";
  "interaction-prompt"?: string;
  style?: CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  "aria-label"?: string;
};

const ModelViewerElement = "model-viewer" as ElementType<ModelViewerElementProps>;

export function DishModelViewer({ asset, flags }: DishModelViewerProps) {
  const { t } = useLocale();
  const [scriptReady, setScriptReady] = useState(
    () => typeof customElements !== "undefined" && Boolean(customElements.get("model-viewer")),
  );
  const [state, setState] = useState<ViewerState>("loading");
  const [fullscreen, setFullscreen] = useState(false);
  const viewerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!flags.threeDEnabled || !asset?.glbUrl) {
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-model-viewer="true"]');
    if (existing) {
      existing.addEventListener("load", () => setScriptReady(true), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/4.1.0/model-viewer.min.js";
    script.dataset.modelViewer = "true";
    script.addEventListener("load", () => setScriptReady(true), { once: true });
    script.addEventListener("error", () => setState("error"), { once: true });
    document.head.appendChild(script);
  }, [asset?.glbUrl, flags.threeDEnabled]);

  const modelSrc = asset?.glbUrl ? withBasePath(asset.glbUrl) : undefined;
  const posterSrc = asset?.posterImageUrl;
  const displayedState: ViewerState = !flags.threeDEnabled ? "disabled" : asset?.glbUrl ? state : "missing";
  const canRenderModel = flags.threeDEnabled && asset?.glbUrl && scriptReady && state !== "error";
  const label = asset?.attribution ?? t("technicalModelLabel");

  const viewer = (
    <div className="relative min-h-[300px] overflow-hidden rounded-[var(--radius-brand)] border border-border bg-surface" id="dish-model-viewer">
      {posterSrc ? (
        <Image src={posterSrc} alt={t("posterFallback")} fill sizes="100vw" className="object-cover opacity-20" />
      ) : null}
      {canRenderModel ? (
        <ModelViewerElement
          ref={viewerRef}
          src={modelSrc}
          poster={posterSrc}
          camera-controls
          touch-action="pan-y"
          disable-tap
          ar={false}
          loading="lazy"
          reveal="interaction"
          interaction-prompt="none"
          style={{ width: "100%", height: fullscreen ? "75vh" : "360px", position: "relative", zIndex: 1 }}
          onLoad={() => setState("ready")}
          onError={() => setState("error")}
          aria-label={label}
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
            <p className="mt-2 text-sm leading-6 text-muted">{t("modelFallbackHint")}</p>
          </div>
        </div>
      )}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-t border-border bg-surface p-3">
        <p className="text-xs font-bold text-muted">{label}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => viewerRef.current?.setAttribute("camera-orbit", "0deg 75deg 2.5m")}
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
    </div>
  );

  return (
    <>
      {viewer}
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
            {viewer}
          </div>
        </div>
      ) : null}
    </>
  );
}

function withBasePath(path: string) {
  if (typeof window === "undefined" || path.startsWith("http")) {
    return path;
  }

  const base = window.location.pathname.startsWith("/ar-menu-platform") ? "/ar-menu-platform" : "";
  return `${base}${path}`;
}

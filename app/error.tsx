"use client";

import { useLocale } from "@/components/layout/locale-provider";

export default function ErrorPage({ reset }: { reset: () => void }) {
  const { t } = useLocale();

  return (
    <main className="app-shell grid min-h-screen place-items-center py-12">
      <section className="max-w-md rounded-[var(--radius-brand)] border border-border bg-surface p-6 text-center shadow-sm">
        <h1 className="text-2xl font-black">{t("errorTitle")}</h1>
        <p className="mt-2 text-sm leading-6 text-muted">{t("errorBody")}</p>
        <button
          type="button"
          onClick={reset}
          className="touch-target mt-5 inline-flex items-center rounded-full bg-primary px-5 text-sm font-extrabold text-white"
        >
          {t("tryAgain")}
        </button>
      </section>
    </main>
  );
}

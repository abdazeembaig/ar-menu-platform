"use client";

import { Languages } from "lucide-react";
import { useLocale } from "@/components/layout/locale-provider";
import type { Locale } from "@/types/domain";

export function LanguageSelector() {
  const { locale, setLocale, t } = useLocale();

  return (
    <label className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-3 text-sm font-semibold text-primary shadow-sm">
      <Languages aria-hidden="true" size={17} />
      <span className="sr-only">{t("language")}</span>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="bg-transparent text-sm font-semibold outline-none"
        aria-label={t("language")}
      >
        <option value="en">{t("english")}</option>
        <option value="ar">{t("arabic")}</option>
      </select>
    </label>
  );
}

"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { dictionaries, getDirection, type TranslationKey } from "@/lib/i18n";
import type { Locale } from "@/types/domain";

interface LocaleContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = window.localStorage.getItem("ar-menu-locale");
      if (stored === "ar" || stored === "en") {
        setLocaleState(stored);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem("ar-menu-locale", nextLocale);
  };

  const dir = getDirection(locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [dir, locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      dir,
      setLocale,
      t: (key) => dictionaries[locale][key],
    }),
    [dir, locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used inside LocaleProvider");
  }

  return context;
}

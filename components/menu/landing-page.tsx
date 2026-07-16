"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, QrCode, Smartphone } from "lucide-react";
import { LanguageSelector } from "@/components/layout/language-selector";
import { useLocale } from "@/components/layout/locale-provider";

export function LandingPage() {
  const { t } = useLocale();

  return (
    <main className="min-h-screen bg-background">
      <div className="app-shell flex min-h-screen flex-col justify-center gap-10 py-12">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-primary text-white">
              <QrCode aria-hidden="true" size={24} />
            </div>
            <div>
              <p className="text-sm font-black text-primary">AR Menu Platform</p>
              <p className="text-xs font-semibold text-muted">{t("landingEyebrow")}</p>
            </div>
          </div>
          <LanguageSelector />
        </header>

        <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-bold text-accent">
              <Smartphone aria-hidden="true" size={17} />
              {t("demoRoute")}: /r/brunch-cafe/t/T12
            </p>
            <h1 className="text-4xl font-black leading-tight text-primary sm:text-5xl lg:text-6xl">
              {t("landingTitle")}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{t("landingBody")}</p>
            <Link
              href="/r/brunch-cafe/t/T12"
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 text-base font-extrabold text-white shadow-lg transition hover:bg-accent"
            >
              {t("openDemo")}
              <ArrowRight aria-hidden="true" size={18} className="rtl:rotate-180" />
            </Link>
          </div>

          <div className="mx-auto w-full max-w-sm rounded-[32px] border border-border bg-surface p-4 shadow-[0_24px_70px_rgb(36_30_27_/_0.14)]">
            <div className="rounded-[24px] bg-background p-4">
              <div className="relative mb-4 h-40 overflow-hidden rounded-[22px]">
                <Image
                  src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80"
                  alt=""
                  fill
                  sizes="320px"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="space-y-3">
                <div className="h-5 w-2/3 rounded bg-primary/90" />
                <div className="h-3 w-1/2 rounded bg-muted/25" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-10 rounded-full bg-primary" />
                  <div className="h-10 rounded-full bg-surface" />
                  <div className="h-10 rounded-full bg-surface" />
                </div>
                <div className="grid gap-3">
                  <div className="h-24 rounded-2xl bg-surface" />
                  <div className="h-24 rounded-2xl bg-surface" />
                  <div className="h-24 rounded-2xl bg-surface" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

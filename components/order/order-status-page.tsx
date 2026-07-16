"use client";

import Link from "next/link";
import { Check, Clock } from "lucide-react";
import { LanguageSelector } from "@/components/layout/language-selector";
import { useLocale } from "@/components/layout/locale-provider";
import { getText } from "@/lib/i18n";
import type { MenuPageData, Order } from "@/types/domain";

interface OrderStatusPageProps {
  data: MenuPageData;
  order: Order;
}

export function OrderStatusPage({ data, order }: OrderStatusPageProps) {
  const { restaurant, table } = data;
  const { locale, t } = useLocale();
  const basePath = `/r/${restaurant.slug}/t/${table.code}`;
  const currentEvent = order.timeline.find((event) => event.status === order.status);

  return (
    <main className="min-h-screen pb-12">
      <div className="app-shell py-5">
        <header className="mb-8 flex items-start justify-between gap-3">
          <div>
            <Link href={basePath} className="text-sm font-extrabold text-accent">{t("backToMenu")}</Link>
            <h1 className="mt-2 text-3xl font-black">{t("orderStatus")}</h1>
            <p className="mt-1 text-sm font-semibold text-muted">{t("orderStatusIntro")}</p>
          </div>
          <LanguageSelector />
        </header>

        <section className="mb-6 rounded-[var(--radius-brand)] border border-border bg-surface p-5 shadow-sm">
          <p className="text-xs font-extrabold uppercase text-muted">{t("currentStatus")}</p>
          <h2 className="mt-2 text-2xl font-black text-primary">
            {currentEvent ? getText(currentEvent.label, locale) : order.status}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">{currentEvent ? getText(currentEvent.description, locale) : ""}</p>
          <p className="mt-4 inline-flex rounded-full bg-background px-3 py-1 text-sm font-black text-primary">
            {t("table")} {order.tableCode}
          </p>
        </section>

        <ol className="space-y-3">
          {order.timeline.map((event) => (
            <li key={event.status} className="grid grid-cols-[44px_1fr] gap-3">
              <div className={`grid size-11 place-items-center rounded-full border ${event.completed ? "border-accent bg-accent text-white" : "border-border bg-surface text-muted"}`}>
                {event.completed ? <Check aria-hidden="true" size={18} /> : <Clock aria-hidden="true" size={18} />}
              </div>
              <div className="rounded-[var(--radius-brand)] border border-border bg-surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-black">{getText(event.label, locale)}</h3>
                  <time dateTime={event.at} className="text-xs font-bold text-muted">
                    {new Intl.DateTimeFormat(locale === "ar" ? "ar-LY" : "en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(event.at))}
                  </time>
                </div>
                <p className="mt-1 text-sm leading-6 text-muted">{getText(event.description, locale)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}

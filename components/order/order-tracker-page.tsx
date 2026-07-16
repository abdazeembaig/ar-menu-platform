"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Clock } from "lucide-react";
import { LanguageSelector } from "@/components/layout/language-selector";
import { ServiceActions } from "@/components/layout/service-actions";
import { TableContext } from "@/components/layout/table-context";
import { useLocale } from "@/components/layout/locale-provider";
import { useCart } from "@/components/cart/cart-provider";
import { SessionCartConfigurer } from "@/components/cart/session-cart-configurer";
import { formatMoney } from "@/lib/cart-math";
import { getText } from "@/lib/i18n";
import { getStoredMockOrder } from "@/services/client-order-service";
import type { MenuPageData, Order } from "@/types/domain";

interface OrderTrackerPageProps {
  data: MenuPageData;
  orderId: string;
}

export function OrderTrackerPage({ data, orderId }: OrderTrackerPageProps) {
  const { restaurant, branch, table, session } = data;
  const { locale, t } = useLocale();
  const { totals } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const basePath = `/r/${restaurant.slug}/t/${table.code}`;

  useEffect(() => {
    const read = () => setOrder(getStoredMockOrder(session.id, orderId));
    read();
    const timer = window.setInterval(read, 30_000);
    return () => window.clearInterval(timer);
  }, [orderId, session.id]);

  const currentEvent = order?.timeline.find((event) => event.status === order.status);

  return (
    <main className="min-h-screen pb-12">
      <SessionCartConfigurer
        restaurantSlug={restaurant.slug}
        sessionId={session.id}
        tableCode={table.code}
        serviceChargeRate={branch.serviceChargeRate}
        taxRate={branch.taxRate}
      />
      <div className="app-shell py-5">
        <header className="mb-8 flex items-start justify-between gap-3">
          <div>
            <Link href={basePath} className="text-sm font-extrabold text-accent">{t("backToMenu")}</Link>
            <h1 className="mt-2 text-3xl font-black">{t("orderStatus")}</h1>
            <TableContext restaurant={restaurant} branch={branch} table={table} locale={locale} tableLabel={t("table")} />
          </div>
          <LanguageSelector />
        </header>

        {!order ? (
          <section className="rounded-[var(--radius-brand)] border border-border bg-surface p-6">
            <h2 className="text-xl font-black">{t("awaitingConfirmation")}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{t("orderStatusIntro")}</p>
            <Link href={`${basePath}/checkout`} className="mt-5 inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-extrabold text-white">
              {t("checkout")}
            </Link>
          </section>
        ) : (
          <>
            <section className="mb-6 rounded-[var(--radius-brand)] border border-border bg-surface p-5 shadow-sm">
              <p className="text-xs font-extrabold uppercase text-muted">{t("currentStatus")}</p>
              <h2 className="mt-2 text-2xl font-black text-primary">
                {currentEvent ? getText(currentEvent.label, locale) : t("awaitingConfirmation")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">{getText(order.restaurantMessage, locale)}</p>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-background p-3"><dt className="text-xs font-bold text-muted">{t("orderNumber")}</dt><dd className="font-black">{order.orderNumber}</dd></div>
                <div className="rounded-2xl bg-background p-3"><dt className="text-xs font-bold text-muted">{t("submittedAt")}</dt><dd className="font-black">{formatDate(order.submittedAt, locale)}</dd></div>
                <div className="rounded-2xl bg-background p-3"><dt className="text-xs font-bold text-muted">{t("estimatedResponse")}</dt><dd className="font-black">{order.estimatedResponseMinutes} {t("minutesShort")}</dd></div>
                <div className="rounded-2xl bg-background p-3"><dt className="text-xs font-bold text-muted">{t("estimatedPreparation")}</dt><dd className="font-black">{order.estimatedPreparationMinutes ?? "-"} {t("minutesShort")}</dd></div>
              </dl>
            </section>

            <div className="mb-6 flex flex-wrap gap-2">
              <Link href={basePath} className="touch-target inline-flex items-center rounded-full bg-primary px-4 text-sm font-extrabold text-white">
                {t("addMoreItems")}
              </Link>
              <ServiceActions restaurant={restaurant} branch={branch} table={table} session={session} currentTotal={order.total || totals.total} />
            </div>

            <ol className="space-y-3">
              {order.timeline.map((event) => (
                <li key={event.status} className="grid grid-cols-[44px_1fr] gap-3">
                  <div className={`grid size-11 place-items-center rounded-full border ${event.completed ? "border-accent bg-accent text-white" : "border-border bg-surface text-muted"}`}>
                    {event.completed ? <Check aria-hidden="true" size={18} /> : <Clock aria-hidden="true" size={18} />}
                  </div>
                  <div className="rounded-[var(--radius-brand)] border border-border bg-surface p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-black">{getText(event.label, locale)}</h3>
                      <time dateTime={event.at} className="text-xs font-bold text-muted">{formatDate(event.at, locale)}</time>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted">{getText(event.description, locale)}</p>
                  </div>
                </li>
              ))}
            </ol>

            <p className="mt-6 text-lg font-black">{formatMoney(order.total, locale)}</p>
          </>
        )}
      </div>
    </main>
  );
}

function formatDate(value: string, locale: "en" | "ar") {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-LY" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

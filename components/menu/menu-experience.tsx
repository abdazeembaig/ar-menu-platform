"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { ConciergeBell, ReceiptText, Search, ShoppingBag } from "lucide-react";
import { SessionCartConfigurer } from "@/components/cart/session-cart-configurer";
import { StickyCartBar } from "@/components/cart/sticky-cart-bar";
import { useCart } from "@/components/cart/cart-provider";
import { LanguageSelector } from "@/components/layout/language-selector";
import { useLocale } from "@/components/layout/locale-provider";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { formatMoney } from "@/lib/cart-math";
import { getText } from "@/lib/i18n";
import type { MenuPageData } from "@/types/domain";

interface MenuExperienceProps {
  data: MenuPageData;
}

export function MenuExperience({ data }: MenuExperienceProps) {
  const { restaurant, branch, table, session, menu } = data;
  const { locale, t } = useLocale();
  const { totals } = useCart();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(menu.categories[0]?.id ?? "");

  const basePath = `/r/${restaurant.slug}/t/${table.code}`;
  const normalizedQuery = query.trim().toLocaleLowerCase(locale);

  const filteredByCategory = useMemo(
    () =>
      menu.categories
        .map((category) => {
          const items = menu.items.filter((item) => {
            const matchesCategory = item.categoryId === category.id;
            const searchable = [
              getText(item.name, locale),
              getText(item.shortDescription, locale),
              ...item.ingredients.map((ingredient) => getText(ingredient, locale)),
            ]
              .join(" ")
              .toLocaleLowerCase(locale);
            const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
            const matchesActive = !activeCategory || item.categoryId === activeCategory || normalizedQuery;

            return matchesCategory && matchesQuery && matchesActive;
          });

          return { category, items };
        })
        .filter((group) => group.items.length > 0),
    [activeCategory, locale, menu.categories, menu.items, normalizedQuery],
  );

  const featuredItems = menu.items.filter((item) => item.featured);

  return (
    <main
      className="min-h-screen pb-28"
      style={
        {
          "--color-primary": restaurant.theme.primaryColor,
          "--color-accent": restaurant.theme.accentColor,
          "--color-background": restaurant.theme.backgroundColor,
          "--color-surface": restaurant.theme.surfaceColor,
          "--color-muted": restaurant.theme.mutedTextColor,
          "--color-border": restaurant.theme.borderColor,
          "--radius-brand": restaurant.theme.radius,
        } as CSSProperties
      }
    >
      <SessionCartConfigurer
        sessionId={session.id}
        tableCode={table.code}
        serviceChargeRate={branch.serviceChargeRate}
        taxRate={branch.taxRate}
      />

      <section className="relative overflow-hidden bg-primary text-white">
        <Image
          src={restaurant.coverImageUrl}
          alt={getText(restaurant.name, locale)}
          width={1200}
          height={720}
          priority
          sizes="100vw"
          className="h-72 w-full object-cover opacity-70 sm:h-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/25 to-transparent" />
        <div className="app-shell absolute inset-x-0 bottom-0 pb-5">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-3 flex items-center gap-3">
                <Image src={restaurant.logoUrl} alt="" width={52} height={52} className="rounded-2xl bg-white p-1" />
                <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${branch.isOpen ? "bg-emerald-100 text-emerald-800" : "bg-zinc-200 text-zinc-700"}`}>
                  {branch.isOpen ? t("open") : t("closed")}
                </span>
              </div>
              <h1 className="text-3xl font-black leading-tight sm:text-4xl">{getText(restaurant.name, locale)}</h1>
              <p className="mt-1 text-sm font-semibold text-white/85">{getText(branch.name, locale)}</p>
            </div>
            <div className="shrink-0 rounded-2xl bg-white px-4 py-3 text-center text-primary shadow-lg">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{t("table")}</p>
              <p className="text-2xl font-black">{table.number}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="app-shell -mt-2 space-y-8 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <LanguageSelector />
          <div className="hidden gap-2 md:flex">
            <button type="button" className="touch-target inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-bold">
              <ConciergeBell aria-hidden="true" size={17} />
              {t("callWaiter")}
            </button>
            <button type="button" className="touch-target inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-bold">
              <ReceiptText aria-hidden="true" size={17} />
              {t("requestBill")}
            </button>
            <Link href={`${basePath}/cart`} className="touch-target inline-flex items-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-white">
              <ShoppingBag aria-hidden="true" size={17} />
              {t("cart")} · {formatMoney(totals.total)}
            </Link>
          </div>
        </div>

        <label className="relative block">
          <span className="sr-only">{t("searchPlaceholder")}</span>
          <Search aria-hidden="true" size={19} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-[52px] w-full rounded-full border border-border bg-surface px-12 text-base font-medium shadow-sm placeholder:text-muted"
            type="search"
          />
        </label>

        <nav aria-label={t("menu")} className="-mx-4 overflow-x-auto px-4 no-scrollbar">
          <div className="flex w-max gap-2">
            {menu.categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`touch-target rounded-full border px-4 text-sm font-extrabold transition ${
                  activeCategory === category.id && !normalizedQuery
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-surface text-primary"
                }`}
              >
                {getText(category.name, locale)}
              </button>
            ))}
          </div>
        </nav>

        {!normalizedQuery ? (
          <section aria-labelledby="featured-heading" className="space-y-3">
            <h2 id="featured-heading" className="text-xl font-black">{t("featured")}</h2>
            <div className="-mx-4 overflow-x-auto px-4 no-scrollbar">
              <div className="grid w-max grid-flow-col auto-cols-[82vw] gap-3 sm:auto-cols-[330px]">
                {featuredItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} href={`${basePath}/item/${item.id}`} />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="space-y-8" aria-labelledby="menu-heading">
          <h2 id="menu-heading" className="text-xl font-black">{t("menu")}</h2>
          {filteredByCategory.length > 0 ? (
            filteredByCategory.map(({ category, items }) => (
              <div key={category.id} id={category.slug} className="scroll-mt-24 space-y-3">
                <div>
                  <h3 className="text-lg font-black">{getText(category.name, locale)}</h3>
                  <p className="text-sm text-muted">{getText(category.description, locale)}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((item) => (
                    <MenuItemCard key={item.id} item={item} href={`${basePath}/item/${item.id}`} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[var(--radius-brand)] border border-dashed border-border bg-surface p-8 text-center text-muted">
              {t("noResults")}
            </div>
          )}
        </section>
      </div>

      <StickyCartBar cartHref={`${basePath}/cart`} />
    </main>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { Search, ShoppingBag, X } from "lucide-react";
import { SessionCartConfigurer } from "@/components/cart/session-cart-configurer";
import { StickyCartBar } from "@/components/cart/sticky-cart-bar";
import { useCart } from "@/components/cart/cart-provider";
import { LanguageSelector } from "@/components/layout/language-selector";
import { useLocale } from "@/components/layout/locale-provider";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { formatMoney } from "@/lib/cart-math";
import { getText } from "@/lib/i18n";
import type { MenuPageData } from "@/types/domain";
import { ServiceActions } from "@/components/layout/service-actions";
import { TableContext } from "@/components/layout/table-context";
import { getAllergenName } from "@/lib/allergens";

interface MenuExperienceProps {
  data: MenuPageData;
}

interface MenuFilters {
  query: string;
  activeCategory: string;
  vegetarianOnly: boolean;
  spicyOnly: boolean;
  allergen: string;
}

export function MenuExperience({ data }: MenuExperienceProps) {
  const { restaurant, branch, table, session, menu } = data;
  const { locale, t } = useLocale();
  const { totals } = useCart();

  const basePath = `/r/${restaurant.slug}/t/${table.code}`;
  const filterStorageKey = `ar-menu-filter:${restaurant.slug}:${table.code}`;
  const [filters, setFilters] = useState<MenuFilters>(() => readStoredFilters(filterStorageKey));
  const { query, activeCategory, vegetarianOnly, spicyOnly, allergen } = filters;
  const normalizedQuery = query.trim().toLocaleLowerCase(locale);
  const allergens = useMemo(() => Array.from(new Set(menu.items.flatMap((item) => item.allergens))).sort(), [menu.items]);

  const setQuery = (value: string) => setFilters((current) => ({ ...current, query: value }));
  const setActiveCategory = (value: string) => setFilters((current) => ({ ...current, activeCategory: value }));
  const setVegetarianOnly = (value: boolean) => setFilters((current) => ({ ...current, vegetarianOnly: value }));
  const setSpicyOnly = (value: boolean) => setFilters((current) => ({ ...current, spicyOnly: value }));
  const setAllergen = (value: string) => setFilters((current) => ({ ...current, allergen: value }));

  useEffect(() => {
    window.localStorage.setItem(
      filterStorageKey,
      JSON.stringify({ query, activeCategory, vegetarianOnly, spicyOnly, allergen }),
    );
  }, [activeCategory, allergen, filterStorageKey, query, spicyOnly, vegetarianOnly]);

  const filteredByCategory = useMemo(
    () =>
      menu.categories
        .map((category) => {
          const items = menu.items.filter((item) => {
            const matchesCategory = item.categoryId === category.id;
            const matchesChosenCategory = activeCategory === "all" || item.categoryId === activeCategory || normalizedQuery;
            const searchable = [
              getText(item.name, locale),
              getText(item.shortDescription, locale),
              ...item.ingredients.map((ingredient) => getText(ingredient, locale)),
            ]
              .join(" ")
              .toLocaleLowerCase(locale);
            const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
            const matchesVegetarian = !vegetarianOnly || item.vegetarian;
            const matchesSpicy = !spicyOnly || item.spicyLevel > 0;
            const matchesAllergen = allergen === "all" || !item.allergens.includes(allergen);
            const shouldHideFeaturedDuplicate = !normalizedQuery && activeCategory === "all" && item.featured;

            return matchesCategory && matchesChosenCategory && matchesQuery && matchesVegetarian && matchesSpicy && matchesAllergen && !shouldHideFeaturedDuplicate;
          });

          return { category, items };
        })
        .filter((group) => group.items.length > 0),
    [activeCategory, allergen, locale, menu.categories, menu.items, normalizedQuery, spicyOnly, vegetarianOnly],
  );

  const featuredItems = menu.items.filter((item) => item.featured);
  const resultCount = filteredByCategory.reduce((sum, group) => sum + group.items.length, 0) + (!normalizedQuery && activeCategory === "all" ? featuredItems.length : 0);

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
        restaurantSlug={restaurant.slug}
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
          className="h-52 w-full object-cover opacity-70 sm:h-72"
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
              <p className="mt-1 text-sm font-semibold text-white/85">
                {getText(branch.name, locale)} · {t("table")} {table.number}
              </p>
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
            <ServiceActions restaurant={restaurant} branch={branch} table={table} session={session} currentTotal={totals.total} />
            <Link href={`${basePath}/cart`} className="touch-target inline-flex items-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-white">
              <ShoppingBag aria-hidden="true" size={17} />
              {t("cart")} · {formatMoney(totals.total, locale)}
            </Link>
          </div>
        </div>
        <TableContext restaurant={restaurant} branch={branch} table={table} locale={locale} tableLabel={t("table")} />

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
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="touch-target absolute end-2 top-1/2 grid -translate-y-1/2 place-items-center rounded-full text-muted"
              aria-label={t("clearSearch")}
            >
              <X aria-hidden="true" size={18} />
            </button>
          ) : null}
        </label>
        <p className="text-sm font-bold text-muted" aria-live="polite">
          {resultCount} {t("results")}
        </p>

        <nav aria-label={t("menu")} className="-mx-4 overflow-x-auto px-4 no-scrollbar">
          <div className="flex w-max gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              aria-pressed={activeCategory === "all"}
              className={`touch-target rounded-full border px-4 text-sm font-extrabold transition ${
                activeCategory === "all" && !normalizedQuery
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface text-primary"
              }`}
            >
              {t("all")}
            </button>
            {menu.categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                aria-pressed={activeCategory === category.id}
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
        <section aria-label={t("filters")} className="grid gap-2 sm:grid-cols-3">
          <label className="flex min-h-11 items-center justify-between rounded-full border border-border bg-surface px-4 text-sm font-bold">
            {t("vegetarianOnly")}
            <input type="checkbox" checked={vegetarianOnly} onChange={(event) => setVegetarianOnly(event.target.checked)} className="size-5 accent-[var(--color-accent)]" />
          </label>
          <label className="flex min-h-11 items-center justify-between rounded-full border border-border bg-surface px-4 text-sm font-bold">
            {t("spicyOnly")}
            <input type="checkbox" checked={spicyOnly} onChange={(event) => setSpicyOnly(event.target.checked)} className="size-5 accent-[var(--color-accent)]" />
          </label>
          <label className="flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-bold">
            <span>{t("allergenFilter")}</span>
            <select value={allergen} onChange={(event) => setAllergen(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none">
              <option value="all">{t("anyAllergen")}</option>
              {allergens.map((allergenName) => (
                <option key={allergenName} value={allergenName}>{getAllergenName(allergenName, locale)}</option>
              ))}
            </select>
          </label>
        </section>

        {!normalizedQuery && activeCategory === "all" ? (
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

      <StickyCartBar cartHref={`${basePath}/cart`} restaurant={restaurant} branch={branch} table={table} session={session} />
    </main>
  );
}

function readStoredFilters(filterStorageKey: string): MenuFilters {
  const emptyFilters = {
    query: "",
    activeCategory: "all",
    vegetarianOnly: false,
    spicyOnly: false,
    allergen: "all",
  };

  if (typeof window === "undefined") {
    return emptyFilters;
  }

  const stored = window.localStorage.getItem(filterStorageKey);
  if (!stored) {
    return emptyFilters;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<MenuFilters>;
    return {
      query: parsed.query ?? "",
      activeCategory: parsed.activeCategory ?? "all",
      vegetarianOnly: Boolean(parsed.vegetarianOnly),
      spicyOnly: Boolean(parsed.spicyOnly),
      allergen: parsed.allergen ?? "all",
    };
  } catch {
    window.localStorage.removeItem(filterStorageKey);
    return emptyFilters;
  }
}

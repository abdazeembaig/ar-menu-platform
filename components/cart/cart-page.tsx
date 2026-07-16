"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { SessionCartConfigurer } from "@/components/cart/session-cart-configurer";
import { useCart } from "@/components/cart/cart-provider";
import { LanguageSelector } from "@/components/layout/language-selector";
import { useLocale } from "@/components/layout/locale-provider";
import { cartLineTotal, formatMoney } from "@/lib/cart-math";
import { getText } from "@/lib/i18n";
import type { MenuPageData } from "@/types/domain";
import { TableContext } from "@/components/layout/table-context";
import { toggleModifierOption } from "@/lib/modifiers";

interface CartPageProps {
  data: MenuPageData;
}

export function CartPage({ data }: CartPageProps) {
  const { restaurant, branch, table, session } = data;
  const { cart, totals, removeItem, updateLine, updateQuantity, clearCart } = useCart();
  const { locale, t } = useLocale();
  const basePath = `/r/${restaurant.slug}/t/${table.code}`;

  const handleClear = () => {
    if (window.confirm(t("confirmClearCart"))) {
      clearCart();
    }
  };

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
        <header className="mb-6 flex items-center justify-between gap-3">
          <div>
            <Link href={basePath} className="text-sm font-extrabold text-accent">{t("backToMenu")}</Link>
            <h1 className="mt-2 text-3xl font-black">{t("cart")}</h1>
            <TableContext restaurant={restaurant} branch={branch} table={table} locale={locale} tableLabel={t("table")} />
          </div>
          <LanguageSelector />
        </header>

        {cart.items.length ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <section className="space-y-3" aria-label={t("cart")}>
              {cart.items.map((item) => (
                <article key={item.lineId} className="grid grid-cols-[92px_1fr] gap-3 rounded-[var(--radius-brand)] border border-border bg-surface p-3 shadow-sm">
                  <Image
                    src={item.imageUrl}
                    alt=""
                    width={184}
                    height={184}
                    sizes="92px"
                    className="aspect-square rounded-2xl object-cover"
                  />
                  <div className="min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="line-clamp-2 text-base font-black">{getText(item.name, locale)}</h2>
                        {item.variant ? <p className="text-sm font-semibold text-muted">{getText(item.variant.name, locale)}</p> : null}
                        {item.modifiers.length ? (
                          <p className="text-sm text-muted">
                            {item.modifiers.map((modifier) => getText(modifier.name, locale)).join(", ")}
                          </p>
                        ) : null}
                        {item.specialInstructions ? <p className="text-sm italic text-muted">{item.specialInstructions}</p> : null}
                      </div>
                      <p className="shrink-0 text-sm font-black">{formatMoney(cartLineTotal(item), locale)}</p>
                    </div>
                    {(() => {
                      const menuItem = data.menu.items.find((candidate) => candidate.id === item.itemId);
                      if (!menuItem) return null;
                      return (
                        <div className="grid gap-2 rounded-2xl bg-background p-3">
                          {menuItem.variants.length ? (
                            <label className="text-sm font-bold">
                              {t("selectVariant")}
                              <select
                                value={item.variant?.id ?? ""}
                                onChange={(event) => {
                                  const variant = menuItem.variants.find((candidate) => candidate.id === event.target.value);
                                  updateLine(item.lineId, { variant });
                                }}
                                className="mt-1 w-full rounded-xl border border-border bg-surface p-2"
                              >
                                {menuItem.variants.map((variant) => (
                                  <option key={variant.id} value={variant.id}>
                                    {getText(variant.name, locale)} ({formatMoney(variant.priceDelta, locale)})
                                  </option>
                                ))}
                              </select>
                            </label>
                          ) : null}
                          {menuItem.modifierGroups.map((group) => (
                            <fieldset key={group.id} className="space-y-1">
                              <legend className="text-sm font-bold">{getText(group.name, locale)}</legend>
                              <div className="flex flex-wrap gap-2">
                                {group.options.map((option) => (
                                  <label key={option.id} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-xs font-bold">
                                    <input
                                      type={group.selectionType === "single" ? "radio" : "checkbox"}
                                      name={`${item.lineId}-${group.id}`}
                                      checked={item.modifiers.some((modifier) => modifier.id === option.id)}
                                      disabled={!option.available}
                                      onChange={() =>
                                        updateLine(item.lineId, {
                                          modifiers: toggleModifierOption(group, item.modifiers, option),
                                        })
                                      }
                                      className="accent-[var(--color-accent)]"
                                    />
                                    {getText(option.name, locale)}
                                  </label>
                                ))}
                              </div>
                            </fieldset>
                          ))}
                          <label className="text-sm font-bold">
                            {t("specialInstructions")}
                            <textarea
                              value={item.specialInstructions ?? ""}
                              onChange={(event) => updateLine(item.lineId, { specialInstructions: event.target.value })}
                              className="mt-1 min-h-20 w-full rounded-xl border border-border bg-surface p-2"
                            />
                          </label>
                        </div>
                      );
                    })()}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center rounded-full border border-border bg-background p-1">
                        <button type="button" className="touch-target grid place-items-center rounded-full" onClick={() => updateQuantity(item.lineId, item.quantity - 1)} aria-label={`${t("quantity")} -`}>
                          <Minus aria-hidden="true" size={16} />
                        </button>
                        <span className="min-w-8 text-center text-sm font-black">{item.quantity}</span>
                        <button type="button" className="touch-target grid place-items-center rounded-full" onClick={() => updateQuantity(item.lineId, item.quantity + 1)} aria-label={`${t("quantity")} +`}>
                          <Plus aria-hidden="true" size={16} />
                        </button>
                      </div>
                      <button type="button" onClick={() => removeItem(item.lineId)} className="touch-target inline-flex items-center justify-center rounded-full text-red-700" aria-label={t("remove")}>
                        <Trash2 aria-hidden="true" size={18} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="h-max rounded-[var(--radius-brand)] border border-border bg-surface p-5 shadow-sm">
              <h2 className="text-xl font-black">{t("total")}</h2>
              <dl className="mt-4 space-y-3 text-sm font-semibold">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">{t("subtotal")}</dt>
                  <dd>{formatMoney(totals.subtotal, locale)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">{t("serviceCharge")} ({Math.round(branch.serviceChargeRate * 100)}%)</dt>
                  <dd>{formatMoney(totals.serviceCharge, locale)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">{t("tax")} ({Math.round(branch.taxRate * 100)}%)</dt>
                  <dd>{formatMoney(totals.tax, locale)}</dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-border pt-3 text-lg font-black">
                  <dt>{t("total")}</dt>
                  <dd>{formatMoney(totals.total, locale)}</dd>
                </div>
              </dl>
              <p className="mt-4 rounded-2xl bg-background p-3 text-sm leading-6 text-muted">{t("checkoutPlaceholder")}</p>
              <div className="mt-4 grid gap-2">
                <Link href={`${basePath}/checkout`} className="touch-target inline-flex items-center justify-center rounded-full bg-primary px-4 text-sm font-extrabold text-white">
                  {t("checkout")}
                </Link>
                <button type="button" onClick={handleClear} className="touch-target inline-flex items-center justify-center rounded-full border border-border bg-surface px-4 text-sm font-extrabold text-primary">
                  {t("clearCart")}
                </button>
              </div>
            </aside>
          </div>
        ) : (
          <section className="rounded-[var(--radius-brand)] border border-dashed border-border bg-surface p-8 text-center">
            <h2 className="text-2xl font-black">{t("cartEmpty")}</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">{t("cartEmptyHint")}</p>
            <Link href={basePath} className="mt-6 inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-extrabold text-white">
              {t("continueBrowsing")}
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}

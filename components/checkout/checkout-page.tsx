"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SessionCartConfigurer } from "@/components/cart/session-cart-configurer";
import { useCart } from "@/components/cart/cart-provider";
import { LanguageSelector } from "@/components/layout/language-selector";
import { useLocale } from "@/components/layout/locale-provider";
import { TableContext } from "@/components/layout/table-context";
import { cartLineTotal, formatMoney } from "@/lib/cart-math";
import { getText } from "@/lib/i18n";
import { validateModifierSelections } from "@/lib/modifiers";
import { submitMockOrder, validateOrderItems } from "@/services/client-order-service";
import type { MenuPageData } from "@/types/domain";

interface CheckoutPageProps {
  data: MenuPageData;
}

export function CheckoutPage({ data }: CheckoutPageProps) {
  const { restaurant, branch, table, session, menu } = data;
  const { cart, totals, lockSubmittedCart } = useCart();
  const { locale, t } = useLocale();
  const router = useRouter();
  const [tableNote, setTableNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const basePath = `/r/${restaurant.slug}/t/${table.code}`;

  const modifierErrors = useMemo(
    () =>
      cart.items.flatMap((cartItem) => {
        const item = menu.items.find((menuItem) => menuItem.id === cartItem.itemId);
        return item ? validateModifierSelections(item, cartItem.modifiers) : [`${cartItem.itemId}:missing`];
      }),
    [cart.items, menu.items],
  );

  const canSubmit = validateOrderItems(cart.items) && !modifierErrors.length && !loading;

  const submit = async () => {
    if (!canSubmit) {
      setError(t("validationRequiredModifiers"));
      return;
    }

    setLoading(true);
    setError("");
    try {
      const order = await submitMockOrder({
        sessionId: session.id,
        tableCode: table.code,
        items: cart.items,
        subtotal: totals.subtotal,
        serviceCharge: totals.serviceCharge,
        tax: totals.tax,
        total: totals.total,
        tableNote,
      });
      lockSubmittedCart(order.id);
      router.push(`${basePath}/order/${order.id}`);
    } catch {
      setError(t("orderFailed"));
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pb-28">
      <SessionCartConfigurer
        restaurantSlug={restaurant.slug}
        sessionId={session.id}
        tableCode={table.code}
        serviceChargeRate={branch.serviceChargeRate}
        taxRate={branch.taxRate}
      />
      <div className="app-shell py-5">
        <header className="mb-6 flex items-start justify-between gap-3">
          <div>
            <Link href={`${basePath}/cart`} className="text-sm font-extrabold text-accent">{t("cart")}</Link>
            <h1 className="mt-2 text-3xl font-black">{t("checkout")}</h1>
            <TableContext restaurant={restaurant} branch={branch} table={table} locale={locale} tableLabel={t("table")} />
          </div>
          <LanguageSelector />
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="space-y-3" aria-labelledby="review-heading">
            <h2 id="review-heading" className="text-xl font-black">{t("reviewOrder")}</h2>
            {cart.items.map((item) => (
              <article key={item.lineId} className="grid grid-cols-[76px_1fr] gap-3 rounded-[var(--radius-brand)] border border-border bg-surface p-3">
                <Image src={item.imageUrl} alt="" width={152} height={152} className="aspect-square rounded-2xl object-cover" />
                <div>
                  <div className="flex justify-between gap-3">
                    <h3 className="font-black">{getText(item.name, locale)}</h3>
                    <p className="font-black">{formatMoney(cartLineTotal(item), locale)}</p>
                  </div>
                  <p className="text-sm text-muted">
                    {item.quantity} × {formatMoney(item.unitPrice + (item.variant?.priceDelta ?? 0), locale)}
                  </p>
                  {item.variant ? <p className="text-sm font-semibold text-muted">{getText(item.variant.name, locale)}</p> : null}
                  {item.modifiers.length ? (
                    <p className="text-sm text-muted">{item.modifiers.map((modifier) => getText(modifier.name, locale)).join(", ")}</p>
                  ) : null}
                  {item.specialInstructions ? <p className="text-sm italic text-muted">{item.specialInstructions}</p> : null}
                </div>
              </article>
            ))}
            <label className="block space-y-2">
              <span className="text-sm font-black">{t("tableNote")}</span>
              <textarea
                value={tableNote}
                onChange={(event) => setTableNote(event.target.value)}
                placeholder={t("tableNotePlaceholder")}
                className="min-h-28 w-full rounded-3xl border border-border bg-surface p-4"
              />
            </label>
          </section>

          <aside className="h-max rounded-[var(--radius-brand)] border border-border bg-surface p-5 shadow-sm">
            <h2 className="text-xl font-black">{t("total")}</h2>
            <dl className="mt-4 space-y-3 text-sm font-semibold">
              <div className="flex justify-between gap-4"><dt className="text-muted">{t("items")}</dt><dd>{totals.itemCount}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted">{t("subtotal")}</dt><dd>{formatMoney(totals.subtotal, locale)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted">{t("serviceCharge")} ({Math.round(branch.serviceChargeRate * 100)}%)</dt><dd>{formatMoney(totals.serviceCharge, locale)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted">{t("tax")} ({Math.round(branch.taxRate * 100)}%)</dt><dd>{formatMoney(totals.tax, locale)}</dd></div>
              <div className="flex justify-between gap-4 border-t border-border pt-3 text-lg font-black"><dt>{t("total")}</dt><dd>{formatMoney(totals.total, locale)}</dd></div>
            </dl>
            <p className="mt-4 rounded-2xl bg-background p-3 text-sm leading-6 text-muted">{t("paymentAtRestaurant")}</p>
            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit}
              className="touch-target mt-4 w-full rounded-full bg-primary px-4 text-sm font-extrabold text-white disabled:bg-zinc-300 disabled:text-zinc-600"
            >
              {loading ? t("submittingOrder") : t("submitOrder")}
            </button>
            <p className="mt-3 min-h-6 text-sm font-bold text-red-700" aria-live="polite">{error}</p>
          </aside>
        </div>
      </div>
    </main>
  );
}

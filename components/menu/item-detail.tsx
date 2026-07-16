"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Timer, Utensils } from "lucide-react";
import { useMemo, useState } from "react";
import { ARLaunchButton } from "@/components/ar/ar-launch-button";
import { DishModelViewer } from "@/components/ar/dish-model-viewer";
import { useCart } from "@/components/cart/cart-provider";
import { SessionCartConfigurer } from "@/components/cart/session-cart-configurer";
import { LanguageSelector } from "@/components/layout/language-selector";
import { useLocale } from "@/components/layout/locale-provider";
import { formatMoney } from "@/lib/cart-math";
import { getText } from "@/lib/i18n";
import type { MenuItem, MenuPageData } from "@/types/domain";

interface ItemDetailProps {
  data: MenuPageData;
  item: MenuItem;
}

export function ItemDetail({ data, item }: ItemDetailProps) {
  const { restaurant, branch, table, session } = data;
  const { locale, t } = useLocale();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [variantId, setVariantId] = useState(item.variants.find((variant) => variant.default)?.id ?? item.variants[0]?.id);
  const [modifierIds, setModifierIds] = useState<string[]>([]);
  const [instructions, setInstructions] = useState("");
  const basePath = `/r/${restaurant.slug}/t/${table.code}`;

  const selectedVariant = item.variants.find((variant) => variant.id === variantId);
  const selectedModifiers = item.modifierGroups.flatMap((group) =>
    group.options.filter((option) => modifierIds.includes(option.id)),
  );
  const unitTotal = item.price + (selectedVariant?.priceDelta ?? 0) + selectedModifiers.reduce((sum, modifier) => sum + modifier.priceDelta, 0);
  const lineTotal = unitTotal * quantity;

  const meta = useMemo(
    () => [
      { label: t("prepTime"), value: `${item.preparationTimeMinutes} ${t("minutes")}`, icon: Timer },
      { label: t("calories"), value: item.calories ? `${item.calories}` : "-", icon: Utensils },
      { label: t("portion"), value: getText(item.portion, locale), icon: Utensils },
    ],
    [item.calories, item.portion, item.preparationTimeMinutes, locale, t],
  );

  const toggleModifier = (optionId: string, maxSelections: number) => {
    setModifierIds((current) => {
      if (current.includes(optionId)) {
        return current.filter((id) => id !== optionId);
      }

      if (current.length >= maxSelections) {
        return [...current.slice(1), optionId];
      }

      return [...current, optionId];
    });
  };

  return (
    <main className="min-h-screen pb-32">
      <SessionCartConfigurer
        sessionId={session.id}
        tableCode={table.code}
        serviceChargeRate={branch.serviceChargeRate}
        taxRate={branch.taxRate}
      />

      <div className="app-shell py-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link href={basePath} className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-extrabold text-primary">
            {t("backToMenu")}
          </Link>
          <LanguageSelector />
        </div>

        <article className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-[28px] border border-border bg-surface shadow-lg">
              <Image
                src={item.imageUrl}
                alt={getText(item.imageAlt, locale)}
                width={1200}
                height={900}
                priority
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="aspect-[4/3] w-full object-cover"
              />
              {!item.available ? (
                <div className="absolute inset-0 grid place-items-center bg-primary/55 text-xl font-black text-white">
                  {t("soldOut")}
                </div>
              ) : null}
            </div>
            <DishModelViewer asset={item.threeDAsset} flags={restaurant.featureFlags} />
          </div>

          <div className="space-y-6">
            <header className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
                {item.featured ? <span className="rounded-full bg-accent/10 px-3 py-1 text-accent">{t("featured")}</span> : null}
                {item.vegetarian ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{t("vegetarian")}</span> : null}
                {item.spicyLevel > 0 ? <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">{t("spicy")} {item.spicyLevel}</span> : null}
              </div>
              <h1 className="text-3xl font-black leading-tight sm:text-5xl">{getText(item.name, locale)}</h1>
              <p className="text-2xl font-black text-accent">{formatMoney(item.price)}</p>
              <p className="text-base leading-7 text-muted">{getText(item.description, locale)}</p>
            </header>

            <dl className="grid gap-3 sm:grid-cols-3">
              {meta.map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-2xl border border-border bg-surface p-4">
                  <dt className="flex items-center gap-2 text-xs font-extrabold uppercase text-muted">
                    <Icon aria-hidden="true" size={15} />
                    {label}
                  </dt>
                  <dd className="mt-2 text-sm font-black text-primary">{value}</dd>
                </div>
              ))}
            </dl>

            <section className="space-y-3">
              <h2 className="text-lg font-black">{t("ingredients")}</h2>
              <div className="flex flex-wrap gap-2">
                {item.ingredients.map((ingredient) => (
                  <span key={getText(ingredient, locale)} className="rounded-full border border-border bg-surface px-3 py-1 text-sm font-semibold text-muted">
                    {getText(ingredient, locale)}
                  </span>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-black">{t("allergens")}</h2>
              <p className="text-sm font-semibold text-muted">{item.allergens.length ? item.allergens.join(", ") : "-"}</p>
            </section>

            {item.variants.length ? (
              <fieldset className="space-y-3">
                <legend className="text-lg font-black">{t("selectVariant")}</legend>
                <div className="grid gap-2">
                  {item.variants.map((variant) => (
                    <label key={variant.id} className="flex cursor-pointer items-center justify-between rounded-2xl border border-border bg-surface p-4">
                      <span className="font-bold">{getText(variant.name, locale)}</span>
                      <span className="flex items-center gap-3 text-sm font-extrabold">
                        {variant.priceDelta ? formatMoney(variant.priceDelta) : formatMoney(0)}
                        <input
                          type="radio"
                          name="variant"
                          value={variant.id}
                          checked={variantId === variant.id}
                          onChange={() => setVariantId(variant.id)}
                          className="size-5 accent-[var(--color-accent)]"
                        />
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}

            {item.modifierGroups.map((group) => (
              <fieldset key={group.id} className="space-y-3">
                <legend className="text-lg font-black">{getText(group.name, locale)}</legend>
                <div className="grid gap-2">
                  {group.options.map((option) => (
                    <label key={option.id} className={`flex items-center justify-between rounded-2xl border border-border bg-surface p-4 ${option.available ? "cursor-pointer" : "opacity-50"}`}>
                      <span className="font-bold">{getText(option.name, locale)}</span>
                      <span className="flex items-center gap-3 text-sm font-extrabold">
                        {formatMoney(option.priceDelta)}
                        <input
                          type="checkbox"
                          checked={modifierIds.includes(option.id)}
                          disabled={!option.available}
                          onChange={() => toggleModifier(option.id, group.maxSelections)}
                          className="size-5 rounded accent-[var(--color-accent)]"
                        />
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}

            <label className="block space-y-2">
              <span className="text-lg font-black">{t("specialInstructions")}</span>
              <textarea
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                placeholder={t("specialInstructionsPlaceholder")}
                className="min-h-28 w-full rounded-3xl border border-border bg-surface p-4 text-base shadow-sm placeholder:text-muted"
              />
            </label>

            <div className="hidden items-center gap-3 md:flex">
              <ARLaunchButton asset={item.threeDAsset} flags={restaurant.featureFlags} />
              <button type="button" className="touch-target inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-extrabold">
                {t("viewIn3D")}
              </button>
            </div>
          </div>
        </article>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 px-4 py-3 shadow-[0_-14px_30px_rgb(36_30_27_/_0.10)] backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="flex items-center rounded-full border border-border bg-background p-1">
            <button type="button" className="touch-target grid place-items-center rounded-full" onClick={() => setQuantity((current) => Math.max(1, current - 1))} aria-label={`${t("quantity")} -`}>
              <Minus aria-hidden="true" size={18} />
            </button>
            <span className="min-w-8 text-center text-base font-black">{quantity}</span>
            <button type="button" className="touch-target grid place-items-center rounded-full" onClick={() => setQuantity((current) => current + 1)} aria-label={`${t("quantity")} +`}>
              <Plus aria-hidden="true" size={18} />
            </button>
          </div>
          <button
            type="button"
            disabled={!item.available}
            onClick={() => addItem({ item, quantity, variant: selectedVariant, modifiers: selectedModifiers, specialInstructions: instructions })}
            className="touch-target flex flex-1 items-center justify-between rounded-full bg-primary px-5 text-sm font-extrabold text-white disabled:bg-zinc-300 disabled:text-zinc-600"
          >
            <span className="inline-flex items-center gap-2">
              <ShoppingBag aria-hidden="true" size={18} />
              {item.available ? t("addToOrder") : t("unavailableItem")}
            </span>
            <span>{formatMoney(lineTotal)}</span>
          </button>
        </div>
      </div>
    </main>
  );
}

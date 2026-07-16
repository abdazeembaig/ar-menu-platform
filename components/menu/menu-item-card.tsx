"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, Flame, Leaf, Plus, ScanSearch } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { useLocale } from "@/components/layout/locale-provider";
import { formatMoney } from "@/lib/cart-math";
import { getText } from "@/lib/i18n";
import type { MenuItem } from "@/types/domain";

interface MenuItemCardProps {
  item: MenuItem;
  href: string;
}

export function MenuItemCard({ item, href }: MenuItemCardProps) {
  const { addItem, removeItem } = useCart();
  const { locale, t } = useLocale();
  const [lastLineId, setLastLineId] = useState<string | null>(null);
  const unavailable = !item.available;
  const defaultVariant = item.variants.find((variant) => variant.default);
  const defaultModifiers = item.modifierGroups.flatMap((group) =>
    group.options.filter((option) => option.default && option.available).slice(0, group.selectionType === "single" ? 1 : group.maxSelections),
  );
  const lineId = [
    item.id,
    defaultVariant?.id ?? "base",
    defaultModifiers.map((modifier) => modifier.id).sort().join("-"),
    "",
  ].join(":");

  return (
    <article
      className={`group grid grid-cols-[112px_1fr] gap-3 rounded-[var(--radius-brand)] border bg-surface p-2 shadow-sm transition focus-within:ring-2 focus-within:ring-accent sm:grid-cols-1 ${
        unavailable ? "border-border opacity-65" : "border-border hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      <Link href={href} aria-label={`${t("viewDetails")}: ${getText(item.name, locale)}`} className="relative block overflow-hidden rounded-2xl bg-border">
        <Image
          src={item.imageUrl}
          alt={getText(item.imageAlt, locale)}
          width={320}
          height={240}
          sizes="(max-width: 640px) 112px, 320px"
          className="aspect-square h-full w-full object-cover sm:aspect-[4/3]"
          loading="lazy"
        />
        {item.has3DModel ? (
          <span className="absolute end-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary/85 px-2 py-1 text-[11px] font-bold text-white">
            <ScanSearch aria-hidden="true" size={12} />
            {t("model3d")}
          </span>
        ) : null}
      </Link>
      <div className="flex min-w-0 flex-col gap-2 py-1 pe-1">
        <div className="flex items-start justify-between gap-2">
          <Link href={href} className="min-w-0 rounded-md focus:outline-accent">
            <h3 className="line-clamp-2 text-base font-bold leading-snug text-primary">
              {getText(item.name, locale)}
            </h3>
          </Link>
          <p className="shrink-0 text-sm font-extrabold text-primary">{formatMoney(item.price, locale)}</p>
        </div>
        <p className="line-clamp-2 text-sm leading-5 text-muted">{getText(item.shortDescription, locale)}</p>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
          {item.featured ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-1 text-accent">
              <BadgeCheck aria-hidden="true" size={12} />
              {t("featured")}
            </span>
          ) : null}
          {item.vegetarian ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
              <Leaf aria-hidden="true" size={12} />
              {t("vegetarian")}
            </span>
          ) : null}
          {item.spicyLevel > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-red-700">
              <Flame aria-hidden="true" size={12} />
              {t("spicy")} {item.spicyLevel}
            </span>
          ) : null}
          <span className={`rounded-full px-2 py-1 ${unavailable ? "bg-zinc-100 text-muted" : "bg-primary/5 text-primary"}`}>
            {unavailable ? t("soldOut") : t("available")}
          </span>
        </div>
        <button
          type="button"
          disabled={unavailable}
          onClick={() => {
            if (addItem({ item, quantity: 1, variant: defaultVariant, modifiers: defaultModifiers })) {
              setLastLineId(lineId);
            }
          }}
          className="touch-target mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600 sm:w-auto"
        >
          <Plus aria-hidden="true" size={16} />
          {t("quickAdd")}
        </button>
        {lastLineId ? (
          <div className="rounded-2xl bg-accent/10 px-3 py-2 text-xs font-bold text-accent" role="status" aria-live="polite">
            {t("addedToCart")} ·{" "}
            <button
              type="button"
              onClick={() => {
                removeItem(lastLineId);
                setLastLineId(null);
              }}
              className="underline"
            >
              {t("undo")}
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

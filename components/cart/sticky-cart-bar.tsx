"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { useLocale } from "@/components/layout/locale-provider";
import { formatMoney } from "@/lib/cart-math";
import { ServiceActions } from "@/components/layout/service-actions";
import type { Branch, Restaurant, Table, TableSession } from "@/types/domain";

interface StickyCartBarProps {
  cartHref: string;
  restaurant: Restaurant;
  branch: Branch;
  table: Table;
  session: TableSession;
}

export function StickyCartBar({ cartHref, restaurant, branch, table, session }: StickyCartBarProps) {
  const { totals } = useCart();
  const { locale, t } = useLocale();
  const label = totals.itemCount === 1 ? t("item") : t("items");

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 px-4 py-3 shadow-[0_-14px_30px_rgb(36_30_27_/_0.10)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-center gap-2">
        <ServiceActions restaurant={restaurant} branch={branch} table={table} session={session} currentTotal={totals.total} compact />
        <Link
          href={cartHref}
          className="touch-target flex flex-1 items-center justify-between rounded-full bg-primary px-4 py-3 text-sm font-extrabold text-white"
        >
          <span className="inline-flex items-center gap-2">
            <ShoppingBag aria-hidden="true" size={18} />
            {t("viewCart")}
          </span>
          <span>
            {totals.itemCount} {label} · {formatMoney(totals.total, locale)}
          </span>
        </Link>
      </div>
    </div>
  );
}

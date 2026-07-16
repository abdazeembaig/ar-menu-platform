"use client";

import Link from "next/link";
import { ConciergeBell, ReceiptText, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { useLocale } from "@/components/layout/locale-provider";
import { formatMoney } from "@/lib/cart-math";

interface StickyCartBarProps {
  cartHref: string;
}

export function StickyCartBar({ cartHref }: StickyCartBarProps) {
  const { totals } = useCart();
  const { t } = useLocale();
  const label = totals.itemCount === 1 ? t("item") : t("items");

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 px-4 py-3 shadow-[0_-14px_30px_rgb(36_30_27_/_0.10)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-center gap-2">
        <button
          type="button"
          className="touch-target inline-flex items-center justify-center rounded-full border border-border bg-background text-primary"
          aria-label={t("callWaiter")}
        >
          <ConciergeBell aria-hidden="true" size={19} />
        </button>
        <button
          type="button"
          className="touch-target inline-flex items-center justify-center rounded-full border border-border bg-background text-primary"
          aria-label={t("requestBill")}
        >
          <ReceiptText aria-hidden="true" size={19} />
        </button>
        <Link
          href={cartHref}
          className="touch-target flex flex-1 items-center justify-between rounded-full bg-primary px-4 py-3 text-sm font-extrabold text-white"
        >
          <span className="inline-flex items-center gap-2">
            <ShoppingBag aria-hidden="true" size={18} />
            {t("viewCart")}
          </span>
          <span>
            {totals.itemCount} {label} · {formatMoney(totals.total)}
          </span>
        </Link>
      </div>
    </div>
  );
}

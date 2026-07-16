import type { Cart, CartItem } from "@/types/domain";
import type { Locale } from "@/types/domain";

export interface CartTotals {
  subtotal: number;
  serviceCharge: number;
  tax: number;
  total: number;
  itemCount: number;
}

export function cartLineTotal(item: CartItem): number {
  const variantDelta = item.variant?.priceDelta ?? 0;
  const modifiersTotal = item.modifiers.reduce((sum, modifier) => sum + modifier.priceDelta, 0);
  return (item.unitPrice + variantDelta + modifiersTotal) * item.quantity;
}

export function calculateCartTotals(cart: Cart): CartTotals {
  const subtotal = cart.items.reduce((sum, item) => sum + cartLineTotal(item), 0);
  const serviceCharge = subtotal * cart.serviceChargeRate;
  const tax = subtotal * cart.taxRate;
  const total = subtotal + serviceCharge + tax;
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return { subtotal, serviceCharge, tax, total, itemCount };
}

export function formatMoney(value: number, locale: Locale = "en"): string {
  return `${new Intl.NumberFormat(locale === "ar" ? "ar-LY" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} LYD`;
}

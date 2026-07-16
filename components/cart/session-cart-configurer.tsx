"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart/cart-provider";

interface SessionCartConfigurerProps {
  restaurantSlug: string;
  sessionId: string;
  tableCode: string;
  serviceChargeRate: number;
  taxRate: number;
}

export function SessionCartConfigurer({
  restaurantSlug,
  sessionId,
  tableCode,
  serviceChargeRate,
  taxRate,
}: SessionCartConfigurerProps) {
  const { configureCart, hydrated } = useCart();

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    configureCart(restaurantSlug, sessionId, tableCode, serviceChargeRate, taxRate);
  }, [configureCart, hydrated, restaurantSlug, serviceChargeRate, sessionId, tableCode, taxRate]);

  return null;
}

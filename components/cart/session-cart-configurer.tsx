"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart/cart-provider";

interface SessionCartConfigurerProps {
  sessionId: string;
  tableCode: string;
  serviceChargeRate: number;
  taxRate: number;
}

export function SessionCartConfigurer({
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

    configureCart(sessionId, tableCode, serviceChargeRate, taxRate);
  }, [configureCart, hydrated, serviceChargeRate, sessionId, tableCode, taxRate]);

  return null;
}

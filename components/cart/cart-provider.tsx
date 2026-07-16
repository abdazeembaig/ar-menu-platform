"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { calculateCartTotals, type CartTotals } from "@/lib/cart-math";
import type { Cart, CartItem, ItemVariant, MenuItem, ModifierOption } from "@/types/domain";

interface AddCartItemInput {
  item: MenuItem;
  quantity: number;
  variant?: ItemVariant;
  modifiers?: ModifierOption[];
  specialInstructions?: string;
}

interface CartContextValue {
  cart: Cart;
  totals: CartTotals;
  hydrated: boolean;
  configureCart: (sessionId: string, tableCode: string, serviceChargeRate: number, taxRate: number) => void;
  addItem: (input: AddCartItemInput) => boolean;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
}

const defaultCart: Cart = {
  sessionId: "demo",
  tableCode: "T12",
  items: [],
  serviceChargeRate: 0.05,
  taxRate: 0.02,
};

const storageKey = "ar-menu-cart";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>(defaultCart);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        try {
          setCart(JSON.parse(stored) as Cart);
        } catch {
          window.localStorage.removeItem(storageKey);
        }
      }
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(storageKey, JSON.stringify(cart));
    }
  }, [cart, hydrated]);

  const configureCart = useCallback((
    sessionId: string,
    tableCode: string,
    serviceChargeRate: number,
    taxRate: number,
  ) => {
    setCart((current) => {
      if (current.sessionId === sessionId) {
        if (
          current.tableCode === tableCode &&
          current.serviceChargeRate === serviceChargeRate &&
          current.taxRate === taxRate
        ) {
          return current;
        }

        return { ...current, tableCode, serviceChargeRate, taxRate };
      }

      return { sessionId, tableCode, serviceChargeRate, taxRate, items: [] };
    });
  }, []);

  const addItem = useCallback(({ item, quantity, variant, modifiers = [], specialInstructions }: AddCartItemInput) => {
    if (!item.available) {
      return false;
    }

    const lineId = [
      item.id,
      variant?.id ?? "base",
      modifiers.map((modifier) => modifier.id).sort().join("-"),
      specialInstructions?.trim() ?? "",
    ].join(":");

    setCart((current) => {
      const existing = current.items.find((cartItem) => cartItem.lineId === lineId);

      if (existing) {
        return {
          ...current,
          items: current.items.map((cartItem) =>
            cartItem.lineId === lineId
              ? { ...cartItem, quantity: cartItem.quantity + quantity }
              : cartItem,
          ),
        };
      }

      const nextItem: CartItem = {
        lineId,
        itemId: item.id,
        name: item.name,
        unitPrice: item.price,
        quantity,
        imageUrl: item.imageUrl,
        variant,
        modifiers,
        specialInstructions: specialInstructions?.trim() || undefined,
        available: item.available,
      };

      return { ...current, items: [...current.items, nextItem] };
    });

    return true;
  }, []);

  const removeItem = useCallback((lineId: string) => {
    setCart((current) => ({
      ...current,
      items: current.items.filter((item) => item.lineId !== lineId),
    }));
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    if (quantity < 1) {
      setCart((current) => ({
        ...current,
        items: current.items.filter((item) => item.lineId !== lineId),
      }));
      return;
    }

    setCart((current) => ({
      ...current,
      items: current.items.map((item) => (item.lineId === lineId ? { ...item, quantity } : item)),
    }));
  }, []);

  const clearCart = useCallback(() => setCart((current) => ({ ...current, items: [] })), []);

  const totals = useMemo(() => calculateCartTotals(cart), [cart]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      totals,
      hydrated,
      configureCart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [addItem, cart, clearCart, configureCart, hydrated, removeItem, totals, updateQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}

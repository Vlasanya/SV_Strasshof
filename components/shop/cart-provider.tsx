"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  buildLineKey,
  cartItemCount,
  cartSubtotal,
  readCartFromStorage,
  writeCartToStorage,
  clearCartStorage,
} from "@/lib/shop-cart";
import type { CartLineItem, PrintMode } from "@/lib/shop-types";

type AddToCartInput = {
  merchId: number;
  name: string;
  imageUrl: string | null;
  price: number;
  size: string;
  quantity: number;
  printMode: PrintMode;
  printInitials: string | null;
};

type CartContextValue = {
  items: CartLineItem[];
  itemCount: number;
  subtotal: number;
  hydrated: boolean;
  addItem: (input: AddToCartInput) => void;
  updateQuantity: (lineKey: string, quantity: number) => void;
  removeItem: (lineKey: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readCartFromStorage().items);
    setHydrated(true);
  }, []);

  const persist = useCallback((next: CartLineItem[]) => {
    setItems(next);
    writeCartToStorage({ items: next, updatedAt: new Date().toISOString() });
  }, []);

  const addItem = useCallback(
    (input: AddToCartInput) => {
      const lineKey = buildLineKey(
        input.merchId,
        input.size,
        input.printMode,
        input.printInitials,
      );
      const existing = items.find((item) => item.lineKey === lineKey);
      if (existing) {
        persist(
          items.map((item) =>
            item.lineKey === lineKey
              ? { ...item, quantity: item.quantity + input.quantity }
              : item,
          ),
        );
        return;
      }
      persist([
        ...items,
        {
          lineKey,
          merchId: input.merchId,
          name: input.name,
          imageUrl: input.imageUrl,
          price: input.price,
          size: input.size,
          quantity: input.quantity,
          printMode: input.printMode,
          printInitials: input.printInitials,
        },
      ]);
    },
    [items, persist],
  );

  const updateQuantity = useCallback(
    (lineKey: string, quantity: number) => {
      if (quantity < 1) {
        persist(items.filter((item) => item.lineKey !== lineKey));
        return;
      }
      persist(
        items.map((item) =>
          item.lineKey === lineKey ? { ...item, quantity } : item,
        ),
      );
    },
    [items, persist],
  );

  const removeItem = useCallback(
    (lineKey: string) => {
      persist(items.filter((item) => item.lineKey !== lineKey));
    },
    [items, persist],
  );

  const clearCart = useCallback(() => {
    clearCartStorage();
    setItems([]);
  }, []);

  const value = useMemo(
    () => ({
      items,
      itemCount: cartItemCount(items),
      subtotal: cartSubtotal(items),
      hydrated,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, hydrated, addItem, updateQuantity, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

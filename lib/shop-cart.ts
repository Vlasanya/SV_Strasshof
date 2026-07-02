import type { CartLineItem, CartState, PrintMode } from "@/lib/shop-types";

export const CART_STORAGE_KEY = "strasshof-shop-cart-v2";

export const SHOP_CATEGORIES = [
  "Trikots",
  "Shorts",
  "Hosen",
  "Hoodies",
  "Jacken",
  "Mützen",
  "Handschuhe",
  "Rucksäcke",
  "Accessoires",
] as const;

export function buildLineKey(
  merchId: number,
  size: string,
  printMode: PrintMode,
  printInitials: string | null,
): string {
  if (printMode === "initials") {
    return `${merchId}:${size}:initials:${printInitials?.toUpperCase() ?? ""}`;
  }
  return `${merchId}:${size}:none`;
}

export function formatPrintSummary(item: CartLineItem): string {
  if (item.printMode === "initials" && item.printInitials) {
    return `Nur Initialen: ${item.printInitials.toUpperCase()}`;
  }
  return "Kein Aufdruck";
}

export function cartLineTotal(item: CartLineItem): number {
  return item.price * item.quantity;
}

export function cartSubtotal(items: CartLineItem[]): number {
  return items.reduce((sum, item) => sum + cartLineTotal(item), 0);
}

export function cartItemCount(items: CartLineItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function normalizeCartItem(raw: CartLineItem & { printLogos?: unknown }): CartLineItem {
  const printMode: PrintMode =
    raw.printMode === "initials" || raw.printInitials
      ? "initials"
      : "none";
  return {
    lineKey: raw.lineKey,
    merchId: raw.merchId,
    name: raw.name,
    imageUrl: raw.imageUrl,
    price: raw.price,
    size: raw.size,
    quantity: raw.quantity,
    printMode,
    printInitials: raw.printInitials ?? null,
  };
}

export function readCartFromStorage(): CartState {
  if (typeof window === "undefined") {
    return { items: [], updatedAt: new Date().toISOString() };
  }
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      const legacy = window.localStorage.getItem("strasshof-shop-cart-v1");
      if (legacy) {
        const parsed = JSON.parse(legacy) as CartState;
        const items = Array.isArray(parsed.items)
          ? parsed.items.map((item) => normalizeCartItem(item as CartLineItem))
          : [];
        return { items, updatedAt: new Date().toISOString() };
      }
      return { items: [], updatedAt: new Date().toISOString() };
    }
    const parsed = JSON.parse(raw) as CartState;
    if (!Array.isArray(parsed.items)) {
      return { items: [], updatedAt: new Date().toISOString() };
    }
    return {
      ...parsed,
      items: parsed.items.map(normalizeCartItem),
    };
  } catch {
    return { items: [], updatedAt: new Date().toISOString() };
  }
}

export function writeCartToStorage(state: CartState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
}

export function clearCartStorage(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CART_STORAGE_KEY);
  window.localStorage.removeItem("strasshof-shop-cart-v1");
}

export function formatCartForEmail(items: CartLineItem[]): string {
  if (items.length === 0) return "";
  return items
    .map((item, index) => {
      return [
        `${index + 1}. ${item.name}`,
        `   Größe: ${item.size} · Menge: ${item.quantity} · ${item.price.toFixed(2)} €`,
        `   Druck: ${formatPrintSummary(item)}`,
      ].join("\n");
    })
    .join("\n\n");
}

export function formatShopOrderMessage(items: CartLineItem[]): string {
  if (items.length === 0) return "";
  const subtotal = cartSubtotal(items);
  return [
    "Hallo,",
    "",
    "ich möchte folgende Bestellung anfragen:",
    "",
    formatCartForEmail(items),
    "",
    `Gesamt: ${subtotal.toFixed(2)} €`,
    "",
    "Bitte meldet euch bei mir zur Abholung und Bezahlung.",
    "",
    "Vielen Dank!",
  ].join("\n");
}

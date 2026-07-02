"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/shop/cart-provider";
import {
  cartLineTotal,
  formatShopOrderMessage,
  formatPrintSummary,
} from "@/lib/shop-cart";
import { formatEuro } from "@/lib/utils";

export function CartPageClient({ contactEmail }: { contactEmail: string }) {
  const router = useRouter();
  const { items, subtotal, updateQuantity, removeItem, clearCart, hydrated } =
    useCart();

  if (!hydrated) {
    return <p className="text-muted-foreground text-sm">Laden…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
        <h2 className="font-display text-2xl font-bold uppercase text-foreground">
          Dein Warenkorb ist leer
        </h2>
        <p className="text-muted-foreground mt-2 mb-6">
          Stöbere im Shop und füge Artikel hinzu.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-primary hover:brightness-90 text-primary-foreground font-semibold px-6 py-3 rounded-lg text-sm"
        >
          Zum Shop
        </Link>
      </div>
    );
  }

  function handleOrderRequest() {
    if (contactEmail) {
      const body = encodeURIComponent(formatShopOrderMessage(items));
      window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent("Shop-Bestellung ASKÖ Strasshof")}&body=${body}`;
      return;
    }

    router.push("/kontakt?betreff=Shop");
  }

  return (
    <div className="space-y-8">
      <ul className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
        {items.map((item) => (
          <li key={item.lineKey} className="p-4 sm:p-5 flex gap-4">
            <div className="w-20 h-20 rounded-xl bg-muted overflow-hidden shrink-0 flex items-center justify-center">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ShoppingBag className="w-8 h-8 text-muted-foreground/30" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/shop/${item.merchId}`}
                    className="font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    Größe: {item.size}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Druck: {formatPrintSummary(item)}
                  </p>
                </div>
                <p className="font-display text-lg font-bold text-foreground">
                  {formatEuro(cartLineTotal(item))}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <div className="inline-flex items-center rounded-lg border border-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.lineKey, item.quantity - 1)
                    }
                    className="p-2 hover:bg-muted transition-colors"
                    aria-label="Menge verringern"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 text-sm font-semibold min-w-8 text-center">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.lineKey, item.quantity + 1)
                    }
                    className="p-2 hover:bg-muted transition-colors"
                    aria-label="Menge erhöhen"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.lineKey)}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Entfernen
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-border bg-muted/30 p-5">
        <div>
          <p className="text-sm text-muted-foreground">Zwischensumme</p>
          <p className="font-display text-3xl font-bold text-foreground">
            {formatEuro(subtotal)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Abholung im Verein · keine Online-Zahlung
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleOrderRequest}
            className="inline-flex items-center justify-center bg-primary hover:brightness-90 text-primary-foreground font-semibold uppercase tracking-wide px-6 py-3 rounded-lg text-sm transition-all"
          >
            Bestellung anfragen
          </button>
          <button
            type="button"
            onClick={clearCart}
            className="inline-flex items-center justify-center border border-border hover:border-primary text-foreground font-semibold px-5 py-3 rounded-lg text-sm transition-colors"
          >
            Warenkorb leeren
          </button>
        </div>
      </div>
    </div>
  );
}

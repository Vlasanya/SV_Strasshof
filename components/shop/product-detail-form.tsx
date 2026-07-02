"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ShoppingCart, Type } from "lucide-react";
import { useCart } from "@/components/shop/cart-provider";
import { buildLineKey } from "@/lib/shop-cart";
import type { MerchItem } from "@/lib/types";
import type { PrintMode } from "@/lib/shop-types";
import { cn, formatEuro } from "@/lib/utils";

const ONE_SIZE = ["Einheitsgröße"];
const PRINT_MODES: { id: PrintMode; label: string }[] = [
  { id: "none", label: "Ohne Aufdruck" },
  { id: "initials", label: "Nur Initialen" },
];

function sanitizeInitials(value: string): string {
  return value.replace(/[^\p{L}]/gu, "").slice(0, 4);
}

export function ProductDetailForm({ item }: { item: MerchItem }) {
  const { addItem, items } = useCart();

  const sizes =
    item.sizes && item.sizes.length > 0 ? item.sizes : ONE_SIZE;

  const [size, setSize] = useState(sizes[0] ?? "Einheitsgröße");
  const [quantity, setQuantity] = useState(1);
  const [printMode, setPrintMode] = useState<PrintMode>("none");
  const [initials, setInitials] = useState("");
  const [error, setError] = useState<string | null>(null);

  const printInitials =
    printMode === "initials" ? initials.trim().toUpperCase() || null : null;

  const cartLineKey = useMemo(() => {
    if (printMode === "initials" && !printInitials) return null;
    return buildLineKey(item.id, size, printMode, printInitials);
  }, [item.id, size, printMode, printInitials]);

  const cartLine = useMemo(
    () =>
      cartLineKey
        ? items.find((cartItem) => cartItem.lineKey === cartLineKey)
        : undefined,
    [items, cartLineKey],
  );

  const inCart = Boolean(cartLine);

  function selectPrintMode(mode: PrintMode) {
    setPrintMode(mode);
    if (mode !== "initials") setInitials("");
  }

  function handleAdd() {
    if (!item.in_stock) {
      setError("Dieser Artikel ist derzeit nicht verfügbar.");
      return;
    }
    if (!size) {
      setError("Bitte wähle eine Größe.");
      return;
    }
    if (printMode === "initials") {
      const trimmed = initials.trim();
      if (!trimmed) {
        setError("Bitte gib deine Initialen ein.");
        return;
      }
      if (trimmed.length > 4) {
        setError("Maximal 4 Zeichen für Initialen.");
        return;
      }
    }

    addItem({
      merchId: item.id,
      name: item.name,
      imageUrl: item.image_url,
      price: item.price,
      size,
      quantity,
      printMode,
      printInitials,
    });
    setError(null);
  }

  const printSummary =
    printMode === "initials" && initials.trim()
      ? `Nur Initialen: ${initials.trim().toUpperCase()}`
      : printMode === "none"
        ? "Ohne Aufdruck"
        : null;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Größe
        </p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={cn(
                "min-w-12 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors",
                size === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:border-primary",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Menge
        </p>
        <div className="inline-flex items-center rounded-lg border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-2 hover:bg-muted transition-colors"
            aria-label="Menge verringern"
          >
            −
          </button>
          <span className="px-4 py-2 text-sm font-semibold min-w-10 text-center">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="px-3 py-2 hover:bg-muted transition-colors"
            aria-label="Menge erhöhen"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-1">
          Aufdruck
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Optional kannst du deine Initialen auf den Artikel drucken lassen.
        </p>

        <div className="flex flex-wrap gap-2 mb-5">
          {PRINT_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => selectPrintMode(mode.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold border transition-colors",
                printMode === mode.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary",
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {printMode === "initials" ? (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-10 h-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <Type className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Nur deine Initialen
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Es wird ausschließlich dein Kürzel gedruckt — kein Vereinslogo,
                  kein Sponsorendruck, keine Nummer.
                </p>
              </div>
            </div>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Initialen (z. B. MK)
              </span>
              <input
                type="text"
                value={initials}
                onChange={(e) => {
                  setInitials(sanitizeInitials(e.target.value));
                }}
                onCompositionEnd={(e) => {
                  setInitials(
                    sanitizeInitials(
                      (e.target as HTMLInputElement).value,
                    ),
                  );
                }}
                placeholder="MK"
                maxLength={4}
                autoComplete="off"
                spellCheck={false}
                inputMode="text"
                className="mt-2 w-full max-w-[8rem] rounded-lg border border-border bg-input-background px-4 py-2.5 text-lg font-bold uppercase tracking-widest text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {inCart && cartLine ? (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <Check className="w-4 h-4 shrink-0" />
          <span>
            <span className="font-semibold">Im Warenkorb</span>
            {" · "}
            {cartLine.quantity}{" "}
            {cartLine.quantity === 1 ? "Stück" : "Stück"}
            {cartLine.quantity > 1 ? ` (${formatEuro(cartLine.price * cartLine.quantity)})` : ""}
          </span>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!item.in_stock}
          className={cn(
            "inline-flex items-center gap-2 disabled:opacity-50 font-semibold uppercase tracking-wide px-6 py-3 rounded-lg transition-all text-sm",
            inCart
              ? "border-2 border-green-600 bg-green-600 text-white hover:bg-green-700 hover:border-green-700"
              : "bg-primary hover:brightness-90 text-primary-foreground",
          )}
        >
          {inCart ? (
            <Check className="w-4 h-4" aria-hidden />
          ) : (
            <ShoppingCart className="w-4 h-4" aria-hidden />
          )}
          {inCart ? "Im Warenkorb" : "In den Warenkorb"}
        </button>
        {inCart ? (
          <Link
            href="/shop/warenkorb"
            className="inline-flex items-center gap-2 border border-primary text-primary hover:bg-primary/5 font-semibold px-5 py-3 rounded-lg text-sm transition-colors"
          >
            Zum Warenkorb
          </Link>
        ) : null}
        <Link
          href="/shop"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Zurück zum Shop
        </Link>
      </div>

      <p className="text-sm text-muted-foreground border-t border-border pt-4">
        Zwischensumme:{" "}
        <span className="font-semibold text-foreground">
          {formatEuro(item.price * quantity)}
        </span>
        {printSummary ? ` · ${printSummary}` : ""}
      </p>
    </div>
  );
}

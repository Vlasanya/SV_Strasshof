"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/shop/cart-provider";
import { cn } from "@/lib/utils";

export function CartButton({ className }: { className?: string }) {
  const { itemCount, hydrated } = useCart();

  return (
    <Link
      href="/shop/warenkorb"
      className={cn(
        "relative inline-flex items-center justify-center rounded-lg p-2.5 text-on-dark hover:bg-white/10 transition-colors",
        className,
      )}
      aria-label={`Warenkorb${itemCount > 0 ? `, ${itemCount} Artikel` : ""}`}
    >
      <ShoppingCart className="w-5 h-5" />
      {hydrated && itemCount > 0 ? (
        <span className="absolute -top-1 -right-1 min-w-[1.125rem] h-[1.125rem] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </Link>
  );
}

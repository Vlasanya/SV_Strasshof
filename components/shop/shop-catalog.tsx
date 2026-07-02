"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { MerchItem } from "@/lib/types";
import { formatEuro } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function ShopCatalog({ items }: { items: MerchItem[] }) {
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => item.category && set.add(item.category));
    return ["Alle", ...Array.from(set).sort((a, b) => a.localeCompare(b, "de"))];
  }, [items]);

  const [category, setCategory] = useState("Alle");

  const filtered =
    category === "Alle"
      ? items
      : items.filter((item) => item.category === category);

  return (
    <div className="space-y-8">
      {categories.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-semibold border transition-colors",
                cat === category
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <Link
            key={item.id}
            href={`/shop/${item.id}`}
            className="group bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md hover:border-primary/40 transition-all"
          >
            <div className="aspect-square bg-muted overflow-hidden flex items-center justify-center">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                />
              ) : (
                <ShoppingBag className="w-10 h-10 text-muted-foreground/30" />
              )}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  {item.category ? (
                    <span className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      {item.category}
                    </span>
                  ) : null}
                  <h3 className="font-semibold text-foreground leading-snug mt-1.5 group-hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                </div>
                <span
                  className={cn(
                    "text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0",
                    item.in_stock
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500",
                  )}
                >
                  {item.in_stock ? "Verfügbar" : "Ausverkauft"}
                </span>
              </div>
              <p className="font-display text-2xl font-bold text-foreground mt-3">
                {formatEuro(item.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

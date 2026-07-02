import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import { getMerch } from "@/lib/data";
import { EmptyState, PageHeader } from "@/components/site/empty-state";
import { formatEuro } from "@/lib/utils";

export const metadata: Metadata = { title: "Shop" };

export default async function MerchPage() {
  const items = await getMerch();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <PageHeader
        eyebrow="Offizieller Shop"
        title="Shop"
        subtitle="Zeige die Vereinsfarben. Abholung deiner Bestellung im Verein."
      />
      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Der Shop wird vorbereitet"
          description="Bald kannst du offizielle Vereinsprodukte kaufen."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-muted overflow-hidden flex items-center justify-center">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ShoppingBag className="w-10 h-10 text-muted-foreground/30" />
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {item.category && (
                      <span className="inline-block rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                        {item.category}
                      </span>
                    )}
                    <h3 className="font-semibold text-foreground leading-snug mt-1.5">
                      {item.name}
                    </h3>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      item.in_stock
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {item.in_stock ? "Verfügbar" : "Ausverkauft"}
                  </span>
                </div>
                {item.sizes && item.sizes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {item.sizes.map((size) => (
                      <span
                        key={size}
                        className="text-xs font-medium px-2 py-0.5 rounded-md border border-border text-muted-foreground"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                )}
                <p className="font-display text-2xl font-bold text-foreground mt-3">
                  {formatEuro(item.price)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

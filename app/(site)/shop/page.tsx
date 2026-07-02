import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import { ShopCatalog } from "@/components/shop/shop-catalog";
import { EmptyState, PageHeader } from "@/components/site/empty-state";
import { getMerch } from "@/lib/data";

export const metadata: Metadata = {
  title: "Shop",
  description: "Offizielle Vereinsprodukte — Trikots, Trainingsbekleidung und Merch.",
};

export default async function ShopPage() {
  const items = await getMerch();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <PageHeader
        eyebrow="Offizieller Shop"
        title="Shop"
        subtitle="Trikots, Bekleidung und Merch — mit Größenwahl, Druckoptionen und Abholung im Verein."
      />
      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Der Shop wird vorbereitet"
          description="Bald findest du hier offizielle Vereinsprodukte."
        />
      ) : (
        <ShopCatalog items={items} />
      )}
    </div>
  );
}

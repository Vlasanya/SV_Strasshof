import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { ProductDetailForm } from "@/components/shop/product-detail-form";
import { getClubInfo, getMerchById } from "@/lib/data";
import { formatEuro } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await getMerchById(Number(id));
  return { title: item?.name ?? "Produkt" };
}

export default async function ShopProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const merchId = Number(id);
  if (!Number.isFinite(merchId)) notFound();

  const [item, club] = await Promise.all([
    getMerchById(merchId),
    getClubInfo(),
  ]);
  if (!item) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/shop" className="hover:text-primary transition-colors">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{item.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <div className="rounded-2xl border border-border bg-muted overflow-hidden aspect-square flex items-center justify-center">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <ShoppingBag className="w-16 h-16 text-muted-foreground/30" />
          )}
        </div>

        <div>
          {item.category ? (
            <span className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
              {item.category}
            </span>
          ) : null}
          <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-foreground mt-3">
            {item.name}
          </h1>
          <p className="font-display text-3xl font-bold text-foreground mt-3">
            {formatEuro(item.price)}
          </p>
          <p
            className={`text-sm font-semibold mt-2 ${
              item.in_stock ? "text-green-700" : "text-muted-foreground"
            }`}
          >
            {item.in_stock ? "Verfügbar" : "Derzeit ausverkauft"}
          </p>
          {item.description ? (
            <p className="text-muted-foreground leading-relaxed mt-4 whitespace-pre-line">
              {item.description}
            </p>
          ) : (
            <p className="text-muted-foreground leading-relaxed mt-4">
              Offizielles Vereinsprodukt von {club.name}. Wähle Größe, Menge und
              optional deine Initialen — Abholung und Bezahlung erfolgen im Verein.
            </p>
          )}

          <div className="mt-8 border-t border-border pt-8">
            <ProductDetailForm item={item} />
          </div>
        </div>
      </div>
    </div>
  );
}

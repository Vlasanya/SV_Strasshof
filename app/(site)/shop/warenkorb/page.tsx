import type { Metadata } from "next";
import { CartPageClient } from "@/components/shop/cart-page-client";
import { PageHeader } from "@/components/site/empty-state";
import { getClubInfo } from "@/lib/data";

export const metadata: Metadata = {
  title: "Warenkorb",
  description: "Deine Shop-Bestellung beim ASKÖ Strasshof SV.",
};

export default async function WarenkorbPage() {
  const club = await getClubInfo();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <PageHeader
        eyebrow="Shop"
        title="Warenkorb"
        subtitle="Prüfe deine Artikel und sende uns eine Bestellanfrage per E-Mail."
      />
      <CartPageClient contactEmail={club.email ?? ""} />
    </div>
  );
}

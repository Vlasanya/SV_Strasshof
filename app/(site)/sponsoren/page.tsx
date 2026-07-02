import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Handshake } from "lucide-react";
import { getSponsors } from "@/lib/data";
import { EmptyState, PageHeader } from "@/components/site/empty-state";
import { SponsorCard } from "@/components/site/sponsor-card";

export const metadata: Metadata = { title: "Sponsoren" };

export default async function SponsorsPage() {
  const sponsors = await getSponsors({ activeOnly: true });

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <PageHeader
        eyebrow="Danke"
        title="Sponsoren"
        subtitle="Unternehmen und Betriebe aus Strasshof und Umgebung, die unseren Verein unterstützen."
      />
      {sponsors.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="Noch keine Sponsoren"
          description="Wenn Sie den Verein unterstützen möchten, nehmen Sie Kontakt mit uns auf."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {sponsors.map((sponsor) => (
            <SponsorCard key={sponsor.id} sponsor={sponsor} />
          ))}
        </div>
      )}

      <div className="section-dark accent-diagonal mt-12 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
        <div className="relative z-10">
          <h2 className="font-display text-2xl md:text-3xl uppercase tracking-wide">
            Werden Sie Sponsor
          </h2>
          <p className="text-on-dark-muted mt-2 max-w-lg">
            Entdecken Sie unsere Kooperationspakete und Sichtbarkeitsoptionen
            für Ihre Marke.
          </p>
        </div>
        <Link
          href="/sponsoring"
          className="relative z-10 inline-flex items-center gap-2 bg-primary hover:brightness-90 text-primary-foreground font-semibold uppercase tracking-wide px-6 py-3 rounded-lg transition-all text-sm whitespace-nowrap"
        >
          Sponsoring-Dossier ansehen <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

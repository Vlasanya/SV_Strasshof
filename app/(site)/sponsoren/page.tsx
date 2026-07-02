import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Handshake, ExternalLink } from "lucide-react";
import { getSponsors } from "@/lib/data";
import { EmptyState, PageHeader } from "@/components/site/empty-state";

export const metadata: Metadata = { title: "Sponsoren" };

const TIER_LABELS: Record<string, string> = {
  Principal: "Hauptpartner",
  Oficial: "Offizieller Partner",
  Colaborador: "Kooperationspartner",
  Colaboradores: "Kooperationspartner",
};

export default async function SponsorsPage() {
  const sponsors = await getSponsors({ activeOnly: true });

  const tiers = ["Principal", "Oficial", "Colaborador"];
  const grouped = tiers
    .map((tier) => ({
      tier,
      label: TIER_LABELS[tier] ?? tier,
      items: sponsors.filter((s) => (s.tier ?? "Colaborador") === tier),
    }))
    .filter((g) => g.items.length > 0);
  const untiered = sponsors.filter((s) => !tiers.includes(s.tier ?? ""));
  if (untiered.length)
    grouped.push({
      tier: "Colaboradores",
      label: TIER_LABELS.Colaboradores,
      items: untiered,
    });

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <PageHeader
        eyebrow="Danke"
        title="Sponsoren"
        subtitle="Unternehmen und Betriebe, die unser Projekt möglich machen."
      />
      {sponsors.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="Noch keine Sponsoren"
          description="Wenn Sie den Verein unterstützen möchten, nehmen Sie Kontakt mit uns auf."
        />
      ) : (
        <div className="space-y-10">
          {grouped.map((group) => (
            <div key={group.tier}>
              <h2 className="font-display text-xl font-bold uppercase tracking-tight text-foreground mb-4">
                {group.label}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {group.items.map((s) => {
                  const card = (
                    <div className="bg-card rounded-2xl border border-border p-6 h-32 flex items-center justify-center text-center hover:shadow-md transition-shadow">
                      {s.logo_url ? (
                        <img
                          src={s.logo_url}
                          alt={s.name}
                          className="max-h-16 object-contain"
                        />
                      ) : (
                        <span className="font-bold uppercase tracking-wide text-muted-foreground">
                          {s.name}
                        </span>
                      )}
                    </div>
                  );
                  return s.website ? (
                    <a
                      key={s.id}
                      href={s.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative"
                    >
                      {card}
                      <ExternalLink className="w-3.5 h-3.5 absolute top-3 right-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ) : (
                    <div key={s.id}>{card}</div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA to the sponsorship dossier */}
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
          href="/patrocinio"
          className="relative z-10 inline-flex items-center gap-2 bg-primary hover:brightness-90 text-primary-foreground font-semibold uppercase tracking-wide px-6 py-3 rounded-lg transition-all text-sm whitespace-nowrap"
        >
          Sponsoring-Dossier ansehen <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

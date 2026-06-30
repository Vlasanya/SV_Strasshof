import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, ExternalLink } from "lucide-react";
import { CLUB } from "@/lib/config";
import { getClubInfo, getTeams } from "@/lib/data";
import { PageHeader } from "@/components/site/empty-state";

export const metadata: Metadata = { title: "Spiele & Tabellen" };

export default async function SpielePage() {
  const [club, teams] = await Promise.all([getClubInfo(), getTeams()]);
  const base = CLUB.oefbBaseUrl.replace(/\/+$/, "");
  const season = CLUB.oefbSeasonSlug;

  return (
    <section className="section-dark accent-diagonal min-h-[50vh]">
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-8 py-16">
        <PageHeader
          eyebrow={club.name}
          title="Spiele & Tabellen"
          subtitle="Aktuelle Ergebnisse, Spielpläne und Tabellen werden offiziell von fussballoesterreich.at bereitgestellt."
          tone="dark"
        />

        <div className="mt-10 space-y-6">
          <a
            href={`${base}/Mannschaften/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-4 p-5 rounded-xl border border-white/10 bg-surface-dark-2 hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-semibold text-on-dark">
                Alle Mannschaften auf ÖFB
              </span>
            </div>
            <ExternalLink className="w-4 h-4 text-on-dark-muted" />
          </a>

          {teams.length > 0 && (
            <ul className="grid sm:grid-cols-2 gap-3">
              {teams.map((t) => {
                const slug = t.slug;
                return (
                  <li key={t.id}>
                    <a
                      href={`${base}/Mannschaften/${season}/${slug}/Spiele/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:border-primary text-on-dark text-sm"
                    >
                      <span>{t.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                    </a>
                  </li>
                );
              })}
            </ul>
          )}

          <p className="text-sm text-on-dark-muted">
            Daten ©{" "}
            <a
              href="https://www.fussballoesterreich.at/nutzungsbedingungen"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              fussballoesterreich.at
            </a>
            . Anzeige nur über offizielle ÖFB-Seiten.
          </p>
        </div>
      </div>
    </section>
  );
}

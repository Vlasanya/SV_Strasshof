import type { Metadata } from "next";
import { Suspense } from "react";
import { getClubInfo, getTeams } from "@/lib/data";
import { getOefbTeamLogoMap } from "@/lib/oefb-data";
import { PageHeader } from "@/components/site/empty-state";
import { OefbAttribution } from "@/components/site/oefb-attribution";
import { OefbSpielePanel } from "@/components/site/oefb-spiele-panel";
import { SpieleTeamGrid } from "@/components/site/spiele-team-grid";
import { SpieleTeamPicker } from "@/components/site/spiele-team-picker";
import {
  parseTermineTeamFilter,
  parseTermineTeamIds,
} from "@/lib/termine-filters";

export const metadata: Metadata = {
  title: "Spiele & Tabellen",
  description: "ÖFB-Spielpläne und Ergebnisse pro Mannschaft",
};

export default async function SpielePage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string; teams?: string }>;
}) {
  const params = await searchParams;
  const teamFilter = parseTermineTeamFilter(params?.team, params?.teams);
  const teamIds = parseTermineTeamIds(teamFilter);

  const [club, teams] = await Promise.all([getClubInfo(), getTeams()]);
  const teamLogoBySlug = await getOefbTeamLogoMap(teams);

  const selectedTeams =
    teamIds.length > 0
      ? teams.filter((team) => teamIds.includes(team.id))
      : [];

  return (
    <section className="section-dark accent-diagonal min-h-[50vh]">
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-8 py-16">
        <PageHeader
          eyebrow={club.name}
          title="Spiele & Tabellen"
          subtitle="Offizielle Meisterschaftsspiele und Ergebnisse direkt auf der Vereinswebsite — pro Mannschaft."
          tone="dark"
        />

        <div className="mt-10 space-y-8">
          <div className="rounded-xl border border-white/10 bg-surface-dark p-4 sm:p-5">
            <Suspense fallback={<p className="text-sm text-on-dark-muted">Laden…</p>}>
              <SpieleTeamPicker teams={teams} teamFilter={teamFilter} />
            </Suspense>
          </div>

          {selectedTeams.length > 0 ? (
            <div className="space-y-8">
              {selectedTeams.map((team) => (
                <OefbSpielePanel key={team.id} team={team} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-on-dark-muted">
                Wähle eine oder mehrere Mannschaften oben — oder tippe direkt auf
                eine Mannschaft:
              </p>
              <SpieleTeamGrid teams={teams} teamLogoBySlug={teamLogoBySlug} />
            </div>
          )}

          <OefbAttribution />
        </div>
      </div>
    </section>
  );
}

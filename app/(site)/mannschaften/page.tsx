import type { Metadata } from "next";
import { Users } from "lucide-react";
import { getClubInfo, getSiteSettings, getTeams } from "@/lib/data";
import { TeamsGrid } from "@/components/site/teams-grid";
import { EmptyState, PageHeader } from "@/components/site/empty-state";

export const metadata: Metadata = { title: "Mannschaften" };

export default async function MannschaftenPage() {
  const [teams, club, settings] = await Promise.all([
    getTeams(),
    getClubInfo(),
    getSiteSettings(),
  ]);
  const logoUrl = settings["brand_logo_url"] || null;

  return (
    <section className="section-dark accent-diagonal min-h-[60vh]">
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-8 py-16">
        <PageHeader
          eyebrow={club.name}
          title="Unsere Mannschaften"
          subtitle="Alle Teams des Vereins — Kader und Statistiken auf der offiziellen ÖFB-Seite."
          tone="dark"
        />
        {teams.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Noch keine Mannschaften"
            description="Teams können in der Admin-Oberfläche angelegt werden."
          />
        ) : (
          <TeamsGrid teams={teams} logoUrl={logoUrl} />
        )}
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClubEvents, getClubInfo, getTeamBySlug } from "@/lib/data";
import { getOefbTeamLogoUrl } from "@/lib/oefb-data";
import { PageHeader } from "@/components/site/empty-state";
import { TeamEventsSection } from "@/components/site/team-events-section";
import { OefbKaderPanel } from "@/components/site/oefb-kader-panel";
import { OefbSpielePanel } from "@/components/site/oefb-spiele-panel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);
  return {
    title: team?.name ?? "Mannschaft",
    robots: { index: false, follow: true },
  };
}

export default async function MannschaftDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);
  if (!team) notFound();

  const [club, events, teamLogoUrl] = await Promise.all([
    getClubInfo(),
    getClubEvents({
      teamId: team.id,
      includeClubWide: true,
      publishedOnly: true,
      upcomingOnly: true,
      limit: 8,
    }),
    getOefbTeamLogoUrl(team),
  ]);

  return (
    <section className="section-dark accent-diagonal min-h-[50vh]">
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-8 py-16">
        <PageHeader
          eyebrow={club.name}
          title={team.name}
          subtitle={team.category ?? undefined}
          tone="dark"
        />

        {(teamLogoUrl || team.photo_url) && (
          <div className="mt-6 flex flex-wrap items-start gap-6">
            {teamLogoUrl ? (
              <img
                src={teamLogoUrl}
                alt={team.name}
                className="w-28 h-28 rounded-2xl object-cover bg-white/5 border border-white/10"
              />
            ) : null}
            {team.photo_url ? (
              <img
                src={team.photo_url}
                alt={team.name}
                className="w-full max-w-md rounded-2xl object-cover max-h-80"
              />
            ) : null}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2 mt-8">
          <div className="space-y-4 text-on-dark lg:col-span-2">
            {team.coach_name && (
              <p>
                <span className="text-on-dark-muted">Trainer: </span>
                {team.coach_name}
              </p>
            )}
            {team.description && (
              <p className="text-on-dark-muted leading-relaxed whitespace-pre-wrap">
                {team.description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 space-y-8">
          <OefbKaderPanel team={team} />
          <TeamEventsSection events={events} />
          <OefbSpielePanel team={team} />
        </div>
      </div>
    </section>
  );
}

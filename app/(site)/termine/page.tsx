import type { Metadata } from "next";
import { Suspense } from "react";
import { getClubEvents, getClubInfo, getTeams } from "@/lib/data";
import { getOefbCalendarEvents } from "@/lib/oefb-data";
import { mergeCalendarEvents } from "@/lib/oefb-calendar";
import { PageHeader } from "@/components/site/empty-state";
import { PublicEventCalendar } from "@/components/site/event-calendar";
import { OefbSpielePanel } from "@/components/site/oefb-spiele-panel";
import {
  formatWeekIso,
  isTermineClubWideFilter,
  monthRangeIso,
  parseCalendarMonth,
  parseTermineTeamFilter,
  parseTermineTeamIds,
  parseTermineView,
  parseTermineWhenFilter,
  parseWeekStart,
  termineFilterThreshold,
  termineSortAscending,
  weekRangeIso,
} from "@/lib/termine-filters";

export const metadata: Metadata = {
  title: "Termine",
  description: "Trainings, Veranstaltungen und Vereinstermine",
};

export default async function TerminePage({
  searchParams,
}: {
  searchParams: Promise<{
    team?: string;
    teams?: string;
    when?: string;
    view?: string;
    month?: string;
    week?: string;
  }>;
}) {
  const params = await searchParams;
  const teamFilter = parseTermineTeamFilter(params?.team, params?.teams);
  const teamIds = parseTermineTeamIds(teamFilter);
  const clubWideOnly = isTermineClubWideFilter(teamFilter);
  const when = parseTermineWhenFilter(params?.when ?? "upcoming");
  const view = parseTermineView(params?.view);
  const month = parseCalendarMonth(params?.month);
  const weekStart = parseWeekStart(params?.week);
  const weekIso = formatWeekIso(weekStart);

  const teamOpts = {
    teamIds: clubWideOnly || teamIds.length === 0 ? undefined : teamIds,
    clubWideOnly,
    includeClubWide: false,
    publishedOnly: true,
  };

  const dateRange =
    view === "list"
      ? termineFilterThreshold(when)
      : view === "week"
        ? weekRangeIso(weekStart)
        : monthRangeIso(month);

  const oefbRange = view === "list" ? dateRange : undefined;

  const [club, teams] = await Promise.all([getClubInfo(), getTeams()]);

  const [clubEvents, oefbEvents] = await Promise.all([
    view === "list"
      ? getClubEvents({
          ...teamOpts,
          ...termineFilterThreshold(when),
          sortAscending: termineSortAscending(when),
        })
      : view === "week"
        ? getClubEvents({
            ...teamOpts,
            ...weekRangeIso(weekStart),
            sortAscending: true,
          })
        : getClubEvents({
            ...teamOpts,
            ...monthRangeIso(month),
            sortAscending: true,
          }),
    getOefbCalendarEvents(teams, {
      teamIds: clubWideOnly ? undefined : teamIds.length ? teamIds : undefined,
      clubWideOnly,
      range: oefbRange,
    }),
  ]);

  const events = mergeCalendarEvents(
    clubEvents,
    oefbEvents,
    view === "list" ? termineSortAscending(when) : true,
  );

  const selectedTeamsForPanels =
    teamIds.length > 0
      ? teams.filter((team) => teamIds.includes(team.id))
      : [];

  return (
    <section className="section-dark accent-diagonal min-h-[50vh]">
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-8 py-16">
        <PageHeader
          eyebrow={club.name}
          title="Termine"
          subtitle="Vereinstermine (Training, Veranstaltungen) und offizielle ÖFB-Spielpläne pro Mannschaft."
          tone="dark"
        />

        <div className="mt-10">
          <Suspense fallback={<p className="text-on-dark-muted text-sm">Laden…</p>}>
            <PublicEventCalendar
              events={events}
              teams={teams}
              teamFilter={teamFilter}
              whenFilter={when}
              view={view}
              month={month}
              week={weekIso}
              clubName={club.name}
            />
          </Suspense>

          {selectedTeamsForPanels.length > 0 ? (
            <div className="mt-12 space-y-8">
              {selectedTeamsForPanels.map((team) => (
                <OefbSpielePanel key={team.id} team={team} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

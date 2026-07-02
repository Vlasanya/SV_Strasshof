import Link from "next/link";
import { Calendar } from "lucide-react";
import { deleteClubEvent } from "@/app/admin/actions";
import {
  ClubEventMonthGrid,
  ClubEventWeekFieldsGrid,
} from "@/components/admin/club-event-calendar";
import { AdminTermineFilters } from "@/components/admin/termine-filters";
import { DeleteButton } from "@/components/admin/form-ui";
import { ListToolbar } from "@/components/admin/list-chrome";
import { clubFieldLabel } from "@/lib/club-fields";
import { EventTypeBadge } from "@/components/event-type-badge";
import {
  eventScopeLabel,
  formatEventDate,
  formatEventTimeRange,
  isEventUpcoming,
} from "@/lib/event-labels";
import { getClubEvents, getTeams } from "@/lib/data";
import {
  formatWeekIso,
  monthRangeIso,
  parseCalendarMonth,
  parseTermineView,
  parseTermineWhenFilter,
  parseWeekStart,
  termineFilterThreshold,
  termineSortAscending,
  weekRangeIso,
} from "@/lib/termine-filters";

export const dynamic = "force-dynamic";

export default async function AdminTerminePage({
  searchParams,
}: {
  searchParams: Promise<{
    team?: string;
    when?: string;
    view?: string;
    month?: string;
    week?: string;
  }>;
}) {
  const params = await searchParams;
  const teams = await getTeams({ includeHidden: true });

  const teamFilter = params?.team ?? "";
  const when = parseTermineWhenFilter(params?.when);
  const view = parseTermineView(params?.view);
  const month = parseCalendarMonth(params?.month);
  const weekStart = parseWeekStart(params?.week);
  const weekIso = formatWeekIso(weekStart);

  let teamId: number | null | undefined;
  let clubWideOnly = false;
  if (teamFilter === "club") {
    teamId = null;
    clubWideOnly = true;
  } else if (teamFilter) {
    teamId = Number(teamFilter);
    if (!Number.isFinite(teamId)) teamId = undefined;
  }

  const teamOpts = {
    teamId: clubWideOnly ? null : teamId,
    clubWideOnly,
    publishedOnly: false,
  };

  const events =
    view === "list"
      ? await getClubEvents({
          ...teamOpts,
          ...termineFilterThreshold(when),
          sortAscending: termineSortAscending(when),
        })
      : view === "week"
        ? await getClubEvents({
            ...teamOpts,
            ...weekRangeIso(weekStart),
            sortAscending: true,
          })
        : await getClubEvents({
            ...teamOpts,
            ...monthRangeIso(month),
            sortAscending: true,
          });

  return (
    <div>
      <ListToolbar
        count={events.length}
        noun="Termine"
        addHref="/admin/termine/new"
        addLabel="Neu"
      />

      <AdminTermineFilters
        teams={teams}
        teamFilter={teamFilter}
        whenFilter={when}
        view={view}
        month={month}
        week={weekIso}
      />

      {view === "calendar" ? (
        <ClubEventMonthGrid
          events={events}
          month={month}
          teamFilter={teamFilter}
          view={view}
        />
      ) : view === "week" ? (
        <ClubEventWeekFieldsGrid
          events={events}
          weekStartIso={weekIso}
          teamFilter={teamFilter}
          view={view}
          month={month}
        />
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Noch keine Termine in diesem Zeitraum.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Datum</th>
                <th className="px-4 py-3 font-semibold">Titel</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">
                  Platz
                </th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">
                  Bereich
                </th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">
                  Art
                </th>
                <th className="px-4 py-3 font-semibold w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    <div>{formatEventDate(ev.starts_at, ev.all_day)}</div>
                    <div className="text-xs">
                      {formatEventTimeRange(
                        ev.starts_at,
                        ev.ends_at,
                        ev.all_day,
                      )}
                    </div>
                    {!isEventUpcoming(ev.starts_at, ev.ends_at) && (
                      <span className="text-[10px] text-amber-700 font-semibold">
                        vergangen
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/termine/${ev.id}/edit`}
                      className="font-medium hover:text-primary"
                    >
                      {ev.title}
                    </Link>
                    {!ev.published && (
                      <span className="ml-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        Entwurf
                      </span>
                    )}
                    {ev.location && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ev.location}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {clubFieldLabel(ev.field)}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {eventScopeLabel(ev.team?.name)}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <EventTypeBadge type={ev.event_type} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteButton
                      action={deleteClubEvent}
                      id={ev.id}
                      confirmText="Diesen Termin löschen?"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

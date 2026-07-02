"use client";

import { usePathname, useRouter } from "next/navigation";
import { MapPin, ExternalLink } from "lucide-react";
import { CLUB } from "@/lib/config";
import {
  ClubEventMonthGrid,
  ClubEventWeekFieldsGrid,
} from "@/components/club-event-calendar";
import { TermineViewTabs } from "@/components/site/termine-view-tabs";
import { TermineTeamFilter } from "@/components/site/termine-team-filter";
import { EventTypeBadge } from "@/components/event-type-badge";
import { EventTypeLegend } from "@/components/event-type-legend";
import { MeinTurnierplanPanel } from "@/components/site/meinturnierplan-panel";
import { CalendarSubscribePanel } from "@/components/site/calendar-subscribe-panel";
import { clubFieldLabel } from "@/lib/club-fields";
import {
  eventScopeLabel,
  formatEventDate,
  formatEventTimeRange,
} from "@/lib/event-labels";
import {
  buildTermineQuery,
  parseTermineWhenFilter,
  type TermineView,
  type TermineWhenFilter,
} from "@/lib/termine-filters";
import type { ClubEvent, Team } from "@/lib/types";

function groupByMonth(events: ClubEvent[]): Map<string, ClubEvent[]> {
  const groups = new Map<string, ClubEvent[]>();
  for (const ev of events) {
    const d = new Date(ev.starts_at);
    const key = Number.isNaN(d.getTime())
      ? "—"
      : new Intl.DateTimeFormat("de-AT", {
          month: "long",
          year: "numeric",
        }).format(d);
    const list = groups.get(key) ?? [];
    list.push(ev);
    groups.set(key, list);
  }
  return groups;
}

export function PublicEventCalendar({
  events,
  teams,
  teamFilter,
  whenFilter,
  view,
  month,
  week,
  clubName,
}: {
  events: ClubEvent[];
  teams: Team[];
  teamFilter: string;
  whenFilter: TermineWhenFilter;
  view: TermineView;
  month: string;
  week: string;
  clubName: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function go(partial: {
    team?: string;
    when?: TermineWhenFilter;
    view?: TermineView;
    month?: string;
    week?: string;
  }) {
    router.push(
      `${pathname}${buildTermineQuery({
        team: partial.team ?? teamFilter,
        when: partial.when ?? whenFilter,
        view: partial.view ?? view,
        month: partial.month ?? month,
        week: partial.week ?? week,
      })}`,
    );
  }

  const emptyHint =
    whenFilter === "upcoming"
      ? "Es werden nur kommende Termine angezeigt. Liegt der Termin in der Vergangenheit, wähle «Vergangene» oder «Alle»."
      : "Für diese Auswahl sind keine Termine hinterlegt.";

  const groups = groupByMonth(events);

  return (
    <div className="space-y-6">
      <TermineViewTabs
        view={view}
        teamFilter={teamFilter}
        whenFilter={whenFilter}
        month={month}
        week={week}
        tone="dark"
      />

      <div className="rounded-xl border border-white/10 bg-surface-dark p-4 sm:p-5">
        <TermineTeamFilter
          teams={teams}
          value={teamFilter}
          onChange={(team) => go({ team })}
        />

        {view === "list" && (
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-white/10">
            <label
              htmlFor="when-filter"
              className="text-sm font-medium text-on-dark"
            >
              Zeitraum:
            </label>
            <select
              id="when-filter"
              value={whenFilter}
              onChange={(e) =>
                go({ when: parseTermineWhenFilter(e.target.value) })
              }
              className="rounded-lg border border-white/20 bg-surface-dark-2 px-4 py-2.5 text-sm text-on-dark"
            >
              <option value="upcoming">Kommende</option>
              <option value="past">Vergangene</option>
              <option value="all">Alle</option>
            </select>
          </div>
        )}

        {(teamFilter || whenFilter !== "upcoming" || view !== "calendar") && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() =>
                go({ team: "", when: "upcoming", view: "calendar" })
              }
              className="px-3 py-2 text-sm text-on-dark-muted hover:text-on-dark"
            >
              Zurücksetzen
            </button>
          </div>
        )}
      </div>

      <CalendarSubscribePanel
        teams={teams}
        teamFilter={teamFilter}
        clubName={clubName}
      />

      {view === "calendar" ? (
        <>
          <p className="text-sm text-on-dark-muted">
            ÖFB-Meisterschaftsspiele erscheinen als{" "}
            <span className="text-primary font-medium">Spiel</span> (rot).
            Saison {CLUB.oefbSeasonSlug.replace("Saison-", "").replace("-", "/")}
            : September–Juni — im Sommer (Juli/August) meist keine Spiele.
          </p>
          <ClubEventMonthGrid
            events={events}
            month={month}
            teamFilter={teamFilter}
            view={view}
            variant="public"
          />
        </>
      ) : view === "week" ? (
        <ClubEventWeekFieldsGrid
          events={events}
          weekStartIso={week}
          teamFilter={teamFilter}
          view={view}
          month={month}
          variant="public"
        />
      ) : events.length === 0 ? (
        <div className="text-on-dark-muted text-sm space-y-2">
          <p>{emptyHint}</p>
          {whenFilter === "upcoming" && (
            <button
              type="button"
              onClick={() => go({ when: "all" })}
              className="text-primary font-semibold hover:underline"
            >
              Alle Termine anzeigen
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-10">
          {[...groups.entries()].map(([monthLabel, monthEvents]) => (
            <div key={monthLabel}>
              <h2 className="font-display text-lg font-bold text-on-dark mb-4 capitalize">
                {monthLabel}
              </h2>
              <ul className="space-y-3">
                {monthEvents.map((ev) => (
                  <li
                    key={ev.id}
                    className="rounded-xl border border-white/10 bg-surface-dark-2 p-4 sm:p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <EventTypeBadge type={ev.event_type} tone="public" />
                          <span className="text-xs text-on-dark-muted">
                            {eventScopeLabel(ev.team?.name)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-on-dark text-lg mt-1">
                          {ev.title}
                        </h3>
                        <p className="text-sm text-on-dark-muted mt-1">
                          {formatEventDate(ev.starts_at, ev.all_day)}
                          {" · "}
                          {formatEventTimeRange(
                            ev.starts_at,
                            ev.ends_at,
                            ev.all_day,
                          )}
                          {ev.field && (
                            <>
                              {" · "}
                              {clubFieldLabel(ev.field)}
                            </>
                          )}
                        </p>
                        {ev.location && (
                          <p className="text-sm text-on-dark-muted mt-1 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            {ev.location}
                          </p>
                        )}
                        {ev.description && (
                          <p className="text-sm text-on-dark-muted mt-2 whitespace-pre-line">
                            {ev.description}
                          </p>
                        )}
                        {ev.external_url && ev.id < 0 && (
                          <a
                            href={ev.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-2 text-sm font-semibold text-primary hover:underline"
                          >
                            Spielbericht auf ÖFB
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <MeinTurnierplanPanel
                          url={ev.external_url}
                          widget={ev.external_widget}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {view === "list" && events.length > 0 && (
        <EventTypeLegend tone="public" className="pt-2" />
      )}
    </div>
  );
}

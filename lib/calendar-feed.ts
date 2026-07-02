import "server-only";
import { cache } from "react";
import { getClubEvents, getClubInfo, getTeams } from "@/lib/data";
import { getOefbCalendarEvents } from "@/lib/oefb-data";
import { mergeCalendarEvents } from "@/lib/oefb-calendar";
import type { ClubEvent, Team } from "@/lib/types";

export type CalendarFeedScope =
  | { mode: "all" }
  | { mode: "club" }
  | { mode: "team"; slug: string }
  | { mode: "teams"; slugs: string[] };

export function parseCalendarFeedScope(
  team?: string | null,
  teams?: string | null,
): CalendarFeedScope {
  const multi = teams?.trim();
  if (multi) {
    const slugs = multi
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (slugs.length === 1) return { mode: "team", slug: slugs[0]! };
    if (slugs.length > 1) return { mode: "teams", slugs };
  }

  const single = team?.trim().toLowerCase();
  if (!single) return { mode: "all" };
  if (single === "club") return { mode: "club" };
  return { mode: "team", slug: single };
}

function feedDateRange(): { from: string; to: string } {
  const from = new Date();
  from.setDate(from.getDate() - 30);
  const to = new Date();
  to.setMonth(to.getMonth() + 18);
  return { from: from.toISOString(), to: to.toISOString() };
}

function filterEventsByRange(events: ClubEvent[], range: { from: string; to: string }) {
  const fromMs = new Date(range.from).getTime();
  const toMs = new Date(range.to).getTime();
  return events.filter((ev) => {
    const t = new Date(ev.starts_at).getTime();
    return t >= fromMs && t <= toMs;
  });
}

function resolveTeamsForScope(
  scope: CalendarFeedScope,
  teams: Team[],
): {
  teamIds?: number[];
  clubWideOnly: boolean;
  oefbTeamIds?: number[];
  label: string;
} {
  if (scope.mode === "club") {
    return {
      clubWideOnly: true,
      label: "Gesamtverein",
    };
  }

  if (scope.mode === "team") {
    const team = teams.find((t) => t.slug.toLowerCase() === scope.slug);
    if (!team) {
      return { clubWideOnly: false, label: scope.slug };
    }
    return {
      teamIds: [team.id],
      clubWideOnly: false,
      oefbTeamIds: [team.id],
      label: team.name,
    };
  }

  if (scope.mode === "teams") {
    const matched = teams.filter((t) =>
      scope.slugs.includes(t.slug.toLowerCase()),
    );
    const ids = matched.map((t) => t.id);
    return {
      teamIds: ids,
      clubWideOnly: false,
      oefbTeamIds: ids,
      label: matched.map((t) => t.name).join(", "),
    };
  }

  return {
    clubWideOnly: false,
    label: "Alle Mannschaften",
  };
}

export const getCalendarFeedData = cache(
  async (scope: CalendarFeedScope, includeOefb = true) => {
    const [club, teams] = await Promise.all([getClubInfo(), getTeams()]);
    const range = feedDateRange();
    const resolved = resolveTeamsForScope(scope, teams);

    const clubEvents = await getClubEvents({
      teamIds: resolved.teamIds,
      clubWideOnly: resolved.clubWideOnly,
      includeClubWide: scope.mode === "all",
      publishedOnly: true,
      from: range.from,
      to: range.to,
      sortAscending: true,
      limit: 500,
    });

    const oefbEvents =
      includeOefb && scope.mode !== "club"
        ? await getOefbCalendarEvents(teams, {
            teamIds: resolved.oefbTeamIds,
            clubWideOnly: false,
            range,
          })
        : [];

    const events = filterEventsByRange(
      mergeCalendarEvents(clubEvents, oefbEvents, true),
      range,
    );

    const calendarName =
      scope.mode === "all"
        ? `${club.shortName} — Termine`
        : `${club.shortName} — ${resolved.label}`;

    return { events, calendarName, club };
  },
);

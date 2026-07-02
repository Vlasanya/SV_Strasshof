import type { Team } from "@/lib/types";
import { parseTermineTeamIds } from "@/lib/termine-filters";

export type CalendarSubscribeScope =
  | { kind: "all" }
  | { kind: "club" }
  | { kind: "team"; slug: string }
  | { kind: "teams"; slugs: string[] };

export function teamFilterToSubscribeScope(
  teamFilter: string,
  teams: Team[],
): CalendarSubscribeScope {
  if (!teamFilter) return { kind: "all" };
  if (teamFilter === "club") return { kind: "club" };

  const ids = parseTermineTeamIds(teamFilter);
  const slugs = ids
    .map((id) => teams.find((t) => t.id === id)?.slug)
    .filter((s): s is string => Boolean(s));

  if (slugs.length === 0) return { kind: "all" };
  if (slugs.length === 1) return { kind: "team", slug: slugs[0]! };
  return { kind: "teams", slugs };
}

export function calendarFeedQuery(scope: CalendarSubscribeScope): string {
  const params = new URLSearchParams();
  if (scope.kind === "club") {
    params.set("team", "club");
  } else if (scope.kind === "team") {
    params.set("team", scope.slug);
  } else if (scope.kind === "teams") {
    params.set("teams", scope.slugs.join(","));
  }
  const q = params.toString();
  return q ? `?${q}` : "";
}

export function calendarFeedPath(scope: CalendarSubscribeScope): string {
  return `/api/calendar/feed.ics${calendarFeedQuery(scope)}`;
}

export function calendarFeedUrl(
  origin: string,
  scope: CalendarSubscribeScope,
): string {
  const base = origin.replace(/\/+$/, "");
  return `${base}${calendarFeedPath(scope)}`;
}

/**
 * Google Calendar subscribe deep link.
 * Uses webcal:// in cid (URL-encoded), not base64 — base64 often yields
 * «Invalid URL» even when the ICS feed itself is valid.
 * @see https://til.simonwillison.net/ics/google-calendar-ics-subscribe-link
 */
export function googleCalendarSubscribeUrl(httpsFeedUrl: string): string {
  const webcal = webcalSubscribeUrl(httpsFeedUrl);
  return `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`;
}

export function webcalSubscribeUrl(httpsFeedUrl: string): string {
  return httpsFeedUrl.replace(/^https?:\/\//i, "webcal://");
}

export type CalendarProvider = "google" | "apple";

/** Safari → Apple Kalender; Chrome and other browsers → Google Kalender. */
export function detectCalendarProvider(): CalendarProvider {
  if (typeof navigator === "undefined") return "google";
  const ua = navigator.userAgent;
  const isSafari =
    /Safari/i.test(ua) &&
    !/Chrome|Chromium|CriOS|Edg|EdgiOS|OPR|OPiOS|FxiOS/i.test(ua);
  return isSafari ? "apple" : "google";
}

export function calendarSubscribeUrl(
  httpsFeedUrl: string,
  provider: CalendarProvider,
): string {
  return provider === "apple"
    ? webcalSubscribeUrl(httpsFeedUrl)
    : googleCalendarSubscribeUrl(httpsFeedUrl);
}

export function calendarProviderLabel(provider: CalendarProvider): string {
  return provider === "apple" ? "Apple Kalender" : "Google Kalender";
}

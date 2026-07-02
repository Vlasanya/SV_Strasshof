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

export type SubscribePlatform = "ios" | "android" | "other";

export function detectSubscribePlatform(): SubscribePlatform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

import type { ClubEventType } from "@/lib/types";

export const EVENT_TYPES: Record<ClubEventType, string> = {
  training: "Training",
  match: "Spiel",
  gathering: "Veranstaltung",
  meeting: "Besprechung",
  tournament: "Turnier",
  other: "Sonstiges",
};

export const EVENT_TYPE_OPTIONS = (
  Object.entries(EVENT_TYPES) as [ClubEventType, string][]
).map(([value, label]) => ({ value, label }));

const LOCALE = "de-AT";

export function formatEventDate(
  iso: string | null | undefined,
  allDay = false,
): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  if (allDay) {
    return new Intl.DateTimeFormat(LOCALE, {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  }
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatEventTimeRange(
  startsAt: string,
  endsAt: string | null,
  allDay: boolean,
): string {
  if (allDay) return "Ganztägig";
  const start = new Date(startsAt);
  if (Number.isNaN(start.getTime())) return "";
  const timeFmt = new Intl.DateTimeFormat(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
  });
  const startStr = timeFmt.format(start);
  if (!endsAt) return startStr;
  const end = new Date(endsAt);
  if (Number.isNaN(end.getTime())) return startStr;
  return `${startStr} – ${timeFmt.format(end)}`;
}

/** For datetime-local / date input default values. */
export function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseDatetimeLocal(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function eventScopeLabel(teamName: string | null | undefined): string {
  return teamName?.trim() ? teamName : "Gesamtverein";
}

/** Sensible default for new timed events (next full hour, min. 18:00 today). */
export function suggestedEventDatetimeLocal(): string {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  if (d.getHours() < 17) {
    d.setHours(18, 0, 0, 0);
  }
  return toDatetimeLocalValue(d.toISOString());
}

/** Default date for new all-day events (today in Vienna). */
export function suggestedEventDate(): string {
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Vienna",
  });
  return today;
}

export function isEventUpcoming(
  startsAt: string,
  endsAt: string | null,
  now = new Date(),
): boolean {
  if (endsAt) return new Date(endsAt).getTime() >= now.getTime();
  return new Date(startsAt).getTime() >= now.getTime();
}

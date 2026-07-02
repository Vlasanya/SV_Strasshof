import { clubFieldLabel } from "@/lib/club-fields";
import { EVENT_TYPES } from "@/lib/event-labels";
import type { ClubEvent } from "@/lib/types";

const TZ = "Europe/Vienna";
const CRLF = "\r\n";

function icalEscape(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function foldLine(line: string): string {
  const max = 75;
  if (line.length <= max) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, max));
  rest = rest.slice(max);
  while (rest.length > 0) {
    parts.push(` ${rest.slice(0, max - 1)}`);
    rest = rest.slice(max - 1);
  }
  return parts.join(CRLF);
}

function formatUtcStamp(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}
function formatLocalParts(iso: string) {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "00";
  return {
    date: `${get("year")}${get("month")}${get("day")}`,
    dateTime: `${get("year")}${get("month")}${get("day")}T${get("hour")}${get("minute")}${get("second")}`,
  };
}

function defaultEndIso(ev: ClubEvent): string {
  const start = new Date(ev.starts_at);
  const hours = ev.event_type === "match" ? 2 : ev.event_type === "training" ? 1.5 : 2;
  return new Date(start.getTime() + hours * 60 * 60 * 1000).toISOString();
}

function eventUid(ev: ClubEvent, domain: string): string {
  if (ev.id < 0) {
    const slug = ev.team?.slug ?? "oefb";
    const stamp = ev.starts_at.replace(/[-:TZ.]/g, "").slice(0, 15);
    return `oefb-${slug}-${stamp}@${domain}`;
  }
  return `club-event-${ev.id}@${domain}`;
}

function eventLocation(ev: ClubEvent): string | null {
  const parts = [
    ev.field ? clubFieldLabel(ev.field) : null,
    ev.location?.trim() || null,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

function eventDescription(ev: ClubEvent): string {
  const lines = [
    EVENT_TYPES[ev.event_type],
    ev.team?.name ? `Mannschaft: ${ev.team.name}` : "Gesamtverein",
    ev.description?.trim() || null,
    ev.external_url?.trim() || null,
  ].filter(Boolean);
  return lines.join("\n");
}

function veventLines(ev: ClubEvent, domain: string, nowStamp: string): string[] {
  const uid = eventUid(ev, domain);
  const summary = icalEscape(ev.title);
  const description = icalEscape(eventDescription(ev));
  const location = eventLocation(ev);
  const url = ev.external_url?.trim() || "";

  const lines = [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${nowStamp}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `STATUS:CONFIRMED`,
    `LAST-MODIFIED:${nowStamp}`,
  ];

  if (location) lines.push(`LOCATION:${icalEscape(location)}`);
  if (url.startsWith("http")) lines.push(`URL:${url}`);

  if (ev.all_day) {
    const { date } = formatLocalParts(ev.starts_at);
    lines.push(`DTSTART;VALUE=DATE:${date}`);
    const endIso = ev.ends_at ?? ev.starts_at;
    const endDate = new Date(endIso);
    endDate.setDate(endDate.getDate() + 1);
    const endParts = formatLocalParts(endDate.toISOString());
    lines.push(`DTEND;VALUE=DATE:${endParts.date}`);
  } else {
    const start = formatLocalParts(ev.starts_at);
    const endIso = ev.ends_at ?? defaultEndIso(ev);
    const end = formatLocalParts(endIso);
    lines.push(`DTSTART;TZID=${TZ}:${start.dateTime}`);
    lines.push(`DTEND;TZID=${TZ}:${end.dateTime}`);
  }

  lines.push("END:VEVENT");
  return lines;
}

export function buildIcsCalendar(opts: {
  events: ClubEvent[];
  calendarName: string;
  domain: string;
  refreshHours?: number;
}): string {
  const domain =
    opts.domain.replace(/^https?:\/\//i, "").replace(/\/+$/, "") || "strasshof.local";
  const nowStamp = formatUtcStamp(new Date().toISOString());
  const refresh = opts.refreshHours ?? 6;

  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ASKÖ Strasshof SV//Termine//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${icalEscape(opts.calendarName)}`,
    `REFRESH-INTERVAL;VALUE=DURATION:PT${refresh}H`,
    "X-PUBLISHED-TTL:PT6H",
    `BEGIN:VTIMEZONE`,
    `TZID:${TZ}`,
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0200",
    "TZOFFSETTO:+0100",
    "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
    "END:STANDARD",
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:+0100",
    "TZOFFSETTO:+0200",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
    "END:DAYLIGHT",
    "END:VTIMEZONE",
    ...opts.events.flatMap((ev) => veventLines(ev, domain, nowStamp)),
    "END:VCALENDAR",
  ];

  return body.map(foldLine).join(CRLF) + CRLF;
}

import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
} from "date-fns";

export type TermineWhenFilter = "upcoming" | "past" | "all";
export type TermineView = "calendar" | "week" | "list";

export function parseTermineWhenFilter(
  raw?: string | null,
): TermineWhenFilter {
  if (raw === "upcoming" || raw === "past") return raw;
  return "all";
}

export function parseTermineView(raw?: string | null): TermineView {
  if (raw === "week" || raw === "list") return raw;
  return "calendar";
}

export function parseCalendarMonth(raw?: string | null): string {
  if (raw && /^\d{4}-\d{2}$/.test(raw)) return raw;
  return format(new Date(), "yyyy-MM");
}

export function monthRangeIso(month: string): { from: string; to: string } {
  const [y, m] = month.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0, 23, 59, 59, 999);
  return { from: start.toISOString(), to: end.toISOString() };
}

export function weekRangeIso(weekStart: Date): { from: string; to: string } {
  const end = endOfWeek(weekStart, { weekStartsOn: 1 });
  end.setHours(23, 59, 59, 999);
  return { from: weekStart.toISOString(), to: end.toISOString() };
}

export function parseWeekStart(raw?: string | null): Date {
  if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const d = parseISO(raw);
    if (!Number.isNaN(d.getTime())) {
      return startOfWeek(d, { weekStartsOn: 1 });
    }
  }
  return startOfWeek(new Date(), { weekStartsOn: 1 });
}

export function formatWeekIso(weekStart: Date): string {
  return format(weekStart, "yyyy-MM-dd");
}

/** Start of today in Europe/Vienna as ISO string. */
export function viennaStartOfTodayIso(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Vienna",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(now);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);
  const elapsedMs =
    (get("hour") * 3600 + get("minute") * 60 + get("second")) * 1000;
  return new Date(now.getTime() - elapsedMs).toISOString();
}

export function termineFilterThreshold(when: TermineWhenFilter): {
  from?: string;
  before?: string;
} {
  const dayStart = viennaStartOfTodayIso();
  if (when === "upcoming") return { from: dayStart };
  if (when === "past") return { before: dayStart };
  return {};
}

export function termineSortAscending(when: TermineWhenFilter): boolean {
  return when === "upcoming";
}

/** Parse public /termine team filter from query (`team=5`, `teams=5,7`, `team=club`). */
export function parseTermineTeamFilter(
  team?: string | null,
  teams?: string | null,
): string {
  const raw = teams?.trim() || team?.trim() || "";
  if (raw === "club") return "club";
  if (!raw) return "";

  const ids = raw
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((id) => Number.isFinite(id) && id > 0);

  if (ids.length === 0) return "";
  return [...new Set(ids)].join(",");
}

export function parseTermineTeamIds(teamFilter: string): number[] {
  if (!teamFilter || teamFilter === "club") return [];
  return teamFilter
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((id) => Number.isFinite(id) && id > 0);
}

export function isTermineClubWideFilter(teamFilter: string): boolean {
  return teamFilter === "club";
}

function encodeTermineTeamQuery(teamFilter: string): URLSearchParams {
  const params = new URLSearchParams();
  if (!teamFilter) return params;
  if (teamFilter === "club") {
    params.set("team", "club");
    return params;
  }
  const ids = parseTermineTeamIds(teamFilter);
  if (ids.length === 1) {
    params.set("team", String(ids[0]));
  } else if (ids.length > 1) {
    params.set("teams", ids.join(","));
  }
  return params;
}

export function buildTermineQuery(
  opts: {
    team?: string;
    when?: TermineWhenFilter;
    view?: TermineView;
    month?: string;
    week?: string;
  } = {},
): string {
  const params = encodeTermineTeamQuery(opts.team ?? "");
  const view = opts.view ?? "calendar";
  if (view !== "calendar") params.set("view", view);
  if (opts.month) params.set("month", opts.month);
  if (opts.week) params.set("week", opts.week);
  if (view === "list" && opts.when && opts.when !== "all") {
    params.set("when", opts.when);
  }
  const q = params.toString();
  return q ? `?${q}` : "";
}

/** Build `/spiele` query string from team filter (`team=5`, `teams=5,7`). */
export function buildSpieleQuery(teamFilter: string = ""): string {
  const params = encodeTermineTeamQuery(teamFilter);
  const q = params.toString();
  return q ? `?${q}` : "";
}

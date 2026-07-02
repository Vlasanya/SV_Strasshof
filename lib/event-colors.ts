import type { ClubEventType } from "@/lib/types";

export type EventColorTone = "admin" | "public";

/** Tailwind classes for chips, badges and list accents. */
export const EVENT_TYPE_COLORS: Record<
  EventColorTone,
  Record<ClubEventType, string>
> = {
  admin: {
    training: "bg-blue-100 text-blue-800 border-blue-200",
    match: "bg-rose-100 text-rose-900 border-rose-200",
    tournament: "bg-emerald-100 text-emerald-900 border-emerald-200",
    gathering: "bg-violet-100 text-violet-800 border-violet-200",
    meeting: "bg-amber-100 text-amber-900 border-amber-200",
    other: "bg-gray-100 text-gray-700 border-gray-200",
  },
  public: {
    training: "bg-blue-500/25 text-blue-100 border-blue-400/40",
    match: "bg-rose-500/25 text-rose-100 border-rose-400/40",
    tournament: "bg-emerald-500/25 text-emerald-100 border-emerald-400/40",
    gathering: "bg-violet-500/20 text-violet-200 border-violet-400/30",
    meeting: "bg-amber-500/20 text-amber-200 border-amber-400/30",
    other: "bg-white/10 text-on-dark-muted border-white/15",
  },
};

/** Solid dot for legend (tone-aware). */
export const EVENT_TYPE_DOT_COLORS: Record<
  EventColorTone,
  Record<ClubEventType, string>
> = {
  admin: {
    training: "bg-blue-500",
    match: "bg-rose-500",
    tournament: "bg-emerald-500",
    gathering: "bg-violet-500",
    meeting: "bg-amber-500",
    other: "bg-gray-400",
  },
  public: {
    training: "bg-blue-400",
    match: "bg-rose-400",
    tournament: "bg-emerald-400",
    gathering: "bg-violet-400",
    meeting: "bg-amber-400",
    other: "bg-white/40",
  },
};

export const EVENT_LEGEND_ORDER: ClubEventType[] = [
  "training",
  "match",
  "tournament",
  "gathering",
  "meeting",
  "other",
];

export function eventTypeChipClass(
  type: ClubEventType,
  tone: EventColorTone,
): string {
  return EVENT_TYPE_COLORS[tone][type] ?? EVENT_TYPE_COLORS[tone].other;
}

export function eventTypeDotClass(
  type: ClubEventType,
  tone: EventColorTone,
): string {
  return EVENT_TYPE_DOT_COLORS[tone][type] ?? EVENT_TYPE_DOT_COLORS[tone].other;
}

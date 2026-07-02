"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { de } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CALENDAR_FIELD_ROWS, clubFieldLabel } from "@/lib/club-fields";
import { EventTypeLegend } from "@/components/event-type-legend";
import { eventTypeChipClass, type EventColorTone } from "@/lib/event-colors";
import {
  buildTermineQuery,
  formatWeekIso,
  type TermineView,
} from "@/lib/termine-filters";
import { cn } from "@/lib/utils";
import type { ClubEvent } from "@/lib/types";

export type ClubEventCalendarVariant = "admin" | "public";

type CalendarTone = EventColorTone;

const SHELL: Record<
  ClubEventCalendarVariant,
  {
    card: string;
    header: string;
    navBtn: string;
    title: string;
    weekday: string;
    dayCell: string;
    dayCellMuted: string;
    dayNum: string;
    dayNumToday: string;
    more: string;
    tableHead: string;
    rowLabel: string;
    legend: string;
  }
> = {
  admin: {
    card: "rounded-xl border border-border bg-card overflow-hidden",
    header:
      "flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-muted/30",
    navBtn: "p-2 rounded-lg hover:bg-muted",
    title: "font-semibold text-sm capitalize",
    weekday:
      "grid grid-cols-7 border-b border-border text-center text-xs font-semibold text-muted-foreground",
    dayCell:
      "min-h-[88px] border-r border-b border-border p-1.5 last:border-r-0",
    dayCellMuted: "bg-muted/20 text-muted-foreground",
    dayNum: "text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full",
    dayNumToday: "bg-primary text-primary-foreground",
    more: "text-[10px] text-muted-foreground px-1",
    tableHead:
      "bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground",
    rowLabel:
      "px-3 py-2 border-r border-b border-border font-medium text-xs sticky left-0 bg-card",
    legend: "text-xs text-muted-foreground px-4 py-2 border-t border-border",
  },
  public: {
    card: "rounded-xl border border-white/10 bg-surface-dark-2 overflow-hidden",
    header:
      "flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10 bg-surface-dark",
    navBtn: "p-2 rounded-lg hover:bg-white/10 text-on-dark",
    title: "font-semibold text-sm capitalize text-on-dark",
    weekday:
      "grid grid-cols-7 border-b border-white/10 text-center text-xs font-semibold text-on-dark-muted",
    dayCell:
      "min-h-[88px] border-r border-b border-white/10 p-1.5 last:border-r-0",
    dayCellMuted: "bg-surface-dark/50 text-on-dark-muted",
    dayNum: "text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full text-on-dark",
    dayNumToday: "bg-primary text-primary-foreground",
    more: "text-[10px] text-on-dark-muted px-1",
    tableHead:
      "bg-surface-dark text-xs uppercase tracking-wide text-on-dark-muted",
    rowLabel:
      "px-3 py-2 border-r border-b border-white/10 font-medium text-xs sticky left-0 bg-surface-dark-2 text-on-dark",
    legend:
      "text-xs text-on-dark-muted px-4 py-2 border-t border-white/10",
  },
};

function eventTime(ev: ClubEvent): string {
  if (ev.all_day) return "gt.";
  return format(parseISO(ev.starts_at), "HH:mm", { locale: de });
}

function eventSortRank(ev: ClubEvent): number {
  if (ev.event_type === "match") return 0;
  if (ev.event_type === "tournament") return 1;
  return 2;
}

function eventsOnDay(events: ClubEvent[], day: Date): ClubEvent[] {
  return events
    .filter((ev) => isSameDay(parseISO(ev.starts_at), day))
    .sort((a, b) => {
      const rank = eventSortRank(a) - eventSortRank(b);
      if (rank !== 0) return rank;
      return a.starts_at.localeCompare(b.starts_at);
    });
}

function EventChip({
  ev,
  variant,
}: {
  ev: ClubEvent;
  variant: ClubEventCalendarVariant;
}) {
  const color = eventTypeChipClass(ev.event_type, variant as CalendarTone);
  const className = cn(
    "block rounded-md border px-1.5 py-1 text-[11px] leading-tight",
    color,
    variant === "admin" && "hover:opacity-90 transition-opacity",
    variant === "admin" &&
      !ev.published &&
      "opacity-60 ring-1 ring-dashed ring-gray-400",
  );
  const content = (
    <>
      {ev.team?.name && ev.event_type === "match" && (
        <span className="block text-[10px] font-semibold uppercase tracking-wide opacity-90">
          {ev.team.name}
        </span>
      )}
      <span className="font-semibold">{eventTime(ev)}</span>{" "}
      <span className="line-clamp-2">
        {ev.event_type === "match" ? `Spiel · ${ev.title}` : ev.title}
      </span>
      {ev.field && (
        <span className="block text-[10px] opacity-80 mt-0.5">
          {clubFieldLabel(ev.field)}
        </span>
      )}
    </>
  );

  if (variant === "admin") {
    return (
      <Link
        href={`/admin/termine/${ev.id}/edit`}
        className={className}
        title={ev.title}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={className} title={ev.title}>
      {content}
    </div>
  );
}

export function ClubEventMonthGrid({
  events,
  month,
  teamFilter,
  view,
  variant = "admin",
}: {
  events: ClubEvent[];
  month: string;
  teamFilter: string;
  view: TermineView;
  variant?: ClubEventCalendarVariant;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const s = SHELL[variant];
  const [y, m] = month.split("-").map(Number);
  const monthDate = new Date(y, m - 1, 1);
  const gridStart = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  function navigate(nextMonth: string) {
    router.push(
      `${pathname}${buildTermineQuery({
        team: teamFilter,
        view,
        month: nextMonth,
      })}`,
    );
  }

  return (
    <div className={cn(s.card, "overflow-hidden")}>
      <div className={s.header}>
        <button
          type="button"
          onClick={() => navigate(format(addMonths(monthDate, -1), "yyyy-MM"))}
          className={s.navBtn}
          aria-label="Vorheriger Monat"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className={s.title}>
          {format(monthDate, "MMMM yyyy", { locale: de })}
        </h2>
        <button
          type="button"
          onClick={() => navigate(format(addMonths(monthDate, 1), "yyyy-MM"))}
          className={s.navBtn}
          aria-label="Nächster Monat"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className={s.weekday}>
        {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => (
          <div
            key={d}
            className={cn(
              "py-2 border-r last:border-r-0",
              variant === "admin" ? "border-border" : "border-white/10",
            )}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-fr min-h-[480px]">
        {days.map((day) => {
          const dayEvents = eventsOnDay(events, day);
          const inMonth = isSameMonth(day, monthDate);
          const today = isSameDay(day, new Date());
          return (
            <div
              key={day.toISOString()}
              className={cn(s.dayCell, !inMonth && s.dayCellMuted)}
            >
              <div
                className={cn(s.dayNum, today && s.dayNumToday)}
              >
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 6).map((ev) => (
                  <EventChip key={ev.id} ev={ev} variant={variant} />
                ))}
                {dayEvents.length > 6 && (
                  <p className={s.more}>+{dayEvents.length - 6} weitere</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div
        className={cn(
          "px-4 py-3 border-t",
          variant === "admin" ? "border-border" : "border-white/10",
        )}
      >
        <EventTypeLegend tone={variant} />
      </div>
    </div>
  );
}

export function ClubEventWeekFieldsGrid({
  events,
  weekStartIso,
  teamFilter,
  view,
  month,
  variant = "admin",
}: {
  events: ClubEvent[];
  weekStartIso: string;
  teamFilter: string;
  view: TermineView;
  month: string;
  variant?: ClubEventCalendarVariant;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const s = SHELL[variant];
  const weekStart = parseISO(weekStartIso);
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(weekStart, { weekStartsOn: 1 }),
  });

  function navigateWeek(nextWeek: Date) {
    router.push(
      `${pathname}${buildTermineQuery({
        team: teamFilter,
        view,
        month,
        week: formatWeekIso(nextWeek),
      })}`,
    );
  }

  const rows = [
    ...CALENDAR_FIELD_ROWS,
    { value: "__none__", label: "Ohne Platz" },
  ];

  const border = variant === "admin" ? "border-border" : "border-white/10";

  return (
    <div className={cn(s.card, "overflow-x-auto")}>
      <div className={cn(s.header, "min-w-[720px]")}>
        <button
          type="button"
          onClick={() => navigateWeek(addDays(weekStart, -7))}
          className={s.navBtn}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className={s.title}>
          Woche · {format(weekStart, "d. MMM", { locale: de })} –{" "}
          {format(endOfWeek(weekStart, { weekStartsOn: 1 }), "d. MMM yyyy", {
            locale: de,
          })}
        </h2>
        <button
          type="button"
          onClick={() => navigateWeek(addDays(weekStart, 7))}
          className={s.navBtn}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <table className="w-full min-w-[720px] text-sm border-collapse">
        <thead>
          <tr className={s.tableHead}>
            <th
              className={cn(
                "text-left px-3 py-2 border-b border-r w-28 sticky left-0",
                border,
                variant === "admin" ? "bg-muted/30" : "bg-surface-dark",
              )}
            >
              Platz
            </th>
            {weekDays.map((day) => (
              <th
                key={day.toISOString()}
                className={cn(
                  "px-2 py-2 border-b border-r last:border-r-0 min-w-[100px]",
                  border,
                )}
              >
                <div>{format(day, "EEE", { locale: de })}</div>
                <div className="font-normal normal-case">
                  {format(day, "d.MM.", { locale: de })}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.value} className="align-top">
              <td className={s.rowLabel}>{row.label}</td>
              {weekDays.map((day) => {
                const cellEvents = eventsOnDay(events, day).filter((ev) => {
                  if (row.value === "__none__") return !ev.field;
                  return ev.field === row.value;
                });
                return (
                  <td
                    key={`${row.value}-${day.toISOString()}`}
                    className={cn(
                      "px-1.5 py-1.5 border-r border-b last:border-r-0 min-h-[64px]",
                      border,
                    )}
                  >
                    <div className="space-y-1">
                      {cellEvents.map((ev) => (
                        <EventChip key={ev.id} ev={ev} variant={variant} />
                      ))}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div
        className={cn(
          "px-4 py-3 border-t",
          variant === "admin" ? "border-border" : "border-white/10",
        )}
      >
        <EventTypeLegend tone={variant} />
      </div>
    </div>
  );
}

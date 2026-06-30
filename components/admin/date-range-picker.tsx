"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn, formatDateShort } from "@/lib/utils";

export type DateRange = { from: string; to: string };

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fromIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function todayIso(): string {
  return toIso(new Date());
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function compareIso(a: string, b: string): number {
  return a.localeCompare(b);
}

function calendarCells(viewMonth: Date): (Date | null)[] {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const first = new Date(year, month, 1);
  let pad = first.getDay() - 1;
  if (pad < 0) pad = 6;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array(pad).fill(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function rangeLabel(range: DateRange): string {
  if (range.from && range.to) {
    return `${formatDateShort(range.from)} — ${formatDateShort(range.to)}`;
  }
  if (range.from) return `Desde ${formatDateShort(range.from)}`;
  if (range.to) return `Hasta ${formatDateShort(range.to)}`;
  return "Filtrar fechas";
}

export function DateRangePicker({
  value,
  onChange,
  ariaLabel,
  className,
}: {
  value: DateRange;
  onChange: (range: DateRange) => void;
  ariaLabel?: string;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const today = todayIso();
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(
      value.from ? fromIso(value.from) : value.to ? fromIso(value.to) : new Date(),
    ),
  );
  const [awaitingEnd, setAwaitingEnd] = useState(false);
  const [hoverIso, setHoverIso] = useState<string | null>(null);

  const hasFilter = !!(value.from || value.to);
  const currentMonthStart = startOfMonth(new Date());
  const canGoNext = viewMonth < currentMonthStart;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setAwaitingEnd(false);
        setHoverIso(null);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const anchor = value.from ?? value.to;
    if (anchor) setViewMonth(startOfMonth(fromIso(anchor)));
  }, [open, value.from, value.to]);

  const preview = useMemo(() => {
    if (!awaitingEnd || !value.from || !hoverIso) return null;
    const start = compareIso(value.from, hoverIso) <= 0 ? value.from : hoverIso;
    const end = compareIso(value.from, hoverIso) <= 0 ? hoverIso : value.from;
    return { start, end };
  }, [awaitingEnd, value.from, hoverIso]);

  function openPicker() {
    setOpen(true);
    setAwaitingEnd(!!value.from && !value.to);
  }

  function clearRange(e: React.MouseEvent) {
    e.stopPropagation();
    onChange({ from: "", to: "" });
    setAwaitingEnd(false);
    setHoverIso(null);
  }

  function handleDayClick(iso: string) {
    if (iso > today) return;

    if (!awaitingEnd || !value.from) {
      onChange({ from: iso, to: "" });
      setAwaitingEnd(true);
      return;
    }

    const from = compareIso(value.from, iso) <= 0 ? value.from : iso;
    const to = compareIso(value.from, iso) <= 0 ? iso : value.from;
    onChange({ from, to });
    setAwaitingEnd(false);
    setHoverIso(null);
  }

  function dayState(iso: string) {
    const inRange =
      (value.from &&
        value.to &&
        compareIso(iso, value.from) >= 0 &&
        compareIso(iso, value.to) <= 0) ||
      (preview &&
        compareIso(iso, preview.start) >= 0 &&
        compareIso(iso, preview.end) <= 0);

    const isStart =
      iso === value.from ||
      iso === preview?.start ||
      (awaitingEnd && iso === value.from);
    const isEnd =
      iso === value.to ||
      iso === preview?.end ||
      (awaitingEnd && hoverIso === iso && compareIso(hoverIso, value.from) >= 0);

    return { inRange, isStart, isEnd };
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={openPicker}
        aria-label={ariaLabel ?? "Filtrar por rango de fechas"}
        aria-expanded={open}
        className={cn(
          "flex w-full min-w-[8.5rem] items-center gap-1.5 rounded-md border border-border bg-input-background px-2 py-1 text-left text-xs font-normal text-foreground focus:outline-none focus:ring-1 focus:ring-ring",
          !hasFilter && "text-muted-foreground/80",
        )}
      >
        <CalendarDays className="h-3.5 w-3.5 shrink-0 opacity-60" />
        <span className="min-w-0 flex-1 truncate">{rangeLabel(value)}</span>
        {hasFilter && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Quitar filtro de fechas"
            onClick={clearRange}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                clearRange(e as unknown as React.MouseEvent);
              }
            }}
            className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-[17.5rem] rounded-xl border border-border bg-card p-3 shadow-lg">
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Mes anterior"
              onClick={() =>
                setViewMonth(
                  (m) => new Date(m.getFullYear(), m.getMonth() - 1, 1),
                )
              }
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold text-foreground">
              {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </span>
            <button
              type="button"
              aria-label="Mes siguiente"
              disabled={!canGoNext}
              onClick={() =>
                canGoNext &&
                setViewMonth(
                  (m) => new Date(m.getFullYear(), m.getMonth() + 1, 1),
                )
              }
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-0.5">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="py-1 text-center text-[10px] font-semibold uppercase text-muted-foreground"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {calendarCells(viewMonth).map((day, i) => {
              if (!day) {
                return <div key={`empty-${i}`} className="h-8" />;
              }
              const iso = toIso(day);
              const disabled = iso > today;
              const { inRange, isStart, isEnd } = dayState(iso);
              const isToday = iso === today;

              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleDayClick(iso)}
                  onMouseEnter={() => !disabled && setHoverIso(iso)}
                  onMouseLeave={() => setHoverIso(null)}
                  className={cn(
                    "relative h-8 rounded-md text-xs font-medium transition-colors",
                    disabled &&
                      "cursor-not-allowed text-muted-foreground/35",
                    !disabled &&
                      !inRange &&
                      "text-foreground hover:bg-muted",
                    inRange && !disabled && "bg-primary/15 text-foreground",
                    (isStart || isEnd) &&
                      !disabled &&
                      "bg-primary text-white hover:bg-primary",
                    isToday &&
                      !isStart &&
                      !isEnd &&
                      !disabled &&
                      "ring-1 ring-primary/40 ring-inset",
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-[10px] leading-snug text-muted-foreground">
            {awaitingEnd
              ? "Elige la segunda fecha en el mismo calendario."
              : "Elige la primera fecha; el calendario permanece abierto para la segunda."}
          </p>
        </div>
      )}
    </div>
  );
}

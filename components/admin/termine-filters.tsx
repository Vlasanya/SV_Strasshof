"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  buildTermineQuery,
  type TermineView,
  type TermineWhenFilter,
} from "@/lib/termine-filters";
import { cn } from "@/lib/utils";

type TeamOption = { id: number; name: string };

const VIEWS: { id: TermineView; label: string }[] = [
  { id: "calendar", label: "Monat" },
  { id: "week", label: "Woche · Plätze" },
  { id: "list", label: "Liste" },
];

export function AdminTermineFilters({
  teams,
  teamFilter,
  whenFilter,
  view,
  month,
  week,
}: {
  teams: TeamOption[];
  teamFilter: string;
  whenFilter: TermineWhenFilter;
  view: TermineView;
  month: string;
  week: string;
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

  return (
    <div className="space-y-3 my-4">
      <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-muted/50 w-fit">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => go({ view: v.id })}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              view === v.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={teamFilter}
          onChange={(e) => go({ team: e.target.value })}
          className="border rounded-lg px-3 py-2 text-sm min-w-[180px] bg-card"
          aria-label="Bereich"
        >
          <option value="">Alle Bereiche</option>
          <option value="club">Gesamtverein</option>
          {teams.map((t) => (
            <option key={t.id} value={String(t.id)}>
              {t.name}
            </option>
          ))}
        </select>

        {view === "list" && (
          <select
            value={whenFilter}
            onChange={(e) =>
              go({ when: e.target.value as TermineWhenFilter })
            }
            className="border rounded-lg px-3 py-2 text-sm bg-card"
            aria-label="Zeitraum"
          >
            <option value="upcoming">Kommende</option>
            <option value="past">Vergangene</option>
            <option value="all">Alle</option>
          </select>
        )}

        {(teamFilter || whenFilter !== "all" || view !== "calendar") && (
          <button
            type="button"
            onClick={() => go({ team: "", when: "all", view: "calendar" })}
            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Zurücksetzen
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { parseTermineTeamIds } from "@/lib/termine-filters";
import type { Team } from "@/lib/types";
import { cn, compareCategoryByAge } from "@/lib/utils";

export function TermineTeamFilter({
  teams,
  value,
  onChange,
  variant = "full",
}: {
  teams: Team[];
  value: string;
  onChange: (next: string) => void;
  /** `teams-only` hides Gesamtverein (e.g. on /spiele). */
  variant?: "full" | "teams-only";
}) {
  const selectedIds = useMemo(() => new Set(parseTermineTeamIds(value)), [value]);
  const sortedTeams = useMemo(
    () =>
      [...teams].sort((a, b) =>
        compareCategoryByAge(a.category ?? a.name, b.category ?? b.name),
      ),
    [teams],
  );
  const modeAll = !value;
  const modeClub = value === "club";

  function toggleTeam(id: number) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    const ids = [...next].sort((a, b) => a - b);
    onChange(ids.length ? ids.join(",") : "");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-on-dark shrink-0">
          Mannschaften:
        </span>
        <button
          type="button"
          onClick={() => onChange("")}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold border transition-colors",
            modeAll
              ? "bg-primary text-primary-foreground border-primary"
              : "border-white/20 text-on-dark-muted hover:border-primary hover:text-primary",
          )}
        >
          Alle
        </button>
        {variant === "full" ? (
          <button
            type="button"
            onClick={() => onChange("club")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold border transition-colors",
              modeClub
                ? "bg-primary text-primary-foreground border-primary"
                : "border-white/20 text-on-dark-muted hover:border-primary hover:text-primary",
            )}
          >
            Gesamtverein
          </button>
        ) : null}
        {!modeAll && (variant === "full" ? !modeClub : true) && selectedIds.size > 0 ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-on-dark-muted hover:text-on-dark underline"
          >
            Auswahl löschen
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {sortedTeams.map((team) => {
          const active = selectedIds.has(team.id);
          return (
            <button
              key={team.id}
              type="button"
              onClick={() => toggleTeam(team.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors",
                active
                  ? "bg-primary/20 text-primary border-primary/50 ring-1 ring-primary/30"
                  : "border-white/15 text-on-dark-muted hover:border-primary/40 hover:text-on-dark",
              )}
              aria-pressed={active}
            >
              {team.name}
            </button>
          );
        })}
      </div>

      {!modeAll && (variant === "full" ? !modeClub : true) && selectedIds.size > 0 ? (
        <p className="text-xs text-on-dark-muted">
          {selectedIds.size} Mannschaft{selectedIds.size === 1 ? "" : "en"}{" "}
          ausgewählt
          {variant === "full"
            ? " — Termine und ÖFB-Spiele werden kombiniert angezeigt."
            : " — Spielpläne werden unten angezeigt."}
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  buildTermineQuery,
  type TermineView,
  type TermineWhenFilter,
} from "@/lib/termine-filters";
import { cn } from "@/lib/utils";

const VIEWS: { id: TermineView; label: string }[] = [
  { id: "calendar", label: "Monat" },
  { id: "week", label: "Woche · Plätze" },
  { id: "list", label: "Liste" },
];

export function TermineViewTabs({
  view,
  teamFilter,
  whenFilter,
  month,
  week,
  tone = "dark",
}: {
  view: TermineView;
  teamFilter: string;
  whenFilter: TermineWhenFilter;
  month: string;
  week: string;
  tone?: "dark" | "light";
}) {
  const router = useRouter();
  const pathname = usePathname();

  function go(nextView: TermineView) {
    router.push(
      `${pathname}${buildTermineQuery({
        team: teamFilter,
        when: whenFilter,
        view: nextView,
        month,
        week,
      })}`,
    );
  }

  const active =
    tone === "dark"
      ? "bg-surface-dark-2 text-on-dark shadow-sm border border-white/10"
      : "bg-card text-foreground shadow-sm";
  const idle =
    tone === "dark"
      ? "text-on-dark-muted hover:text-on-dark"
      : "text-muted-foreground hover:text-foreground";

  return (
    <div
      className={cn(
        "flex flex-wrap gap-1 p-1 rounded-xl w-fit",
        tone === "dark" ? "bg-surface-dark" : "bg-muted/50",
      )}
    >
      {VIEWS.map((v) => (
        <button
          key={v.id}
          type="button"
          onClick={() => go(v.id)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
            view === v.id ? active : idle,
          )}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Trophy, Users } from "lucide-react";
import type { Team } from "@/lib/types";
import { compareCategoryByAge } from "@/lib/utils";

export function TeamsGrid({
  teams,
  logoUrl,
}: {
  teams: Team[];
  logoUrl?: string | null;
}) {
  const categories = useMemo(() => {
    const set = new Set<string>();
    teams.forEach((t) => t.category && set.add(t.category));
    return ["Alle", ...Array.from(set).sort(compareCategoryByAge)];
  }, [teams]);

  const [selected, setSelected] = useState("Alle");
  const filtered = teams.filter(
    (t) => selected === "Alle" || t.category === selected,
  );

  return (
    <>
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelected(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide border transition-colors ${
                cat === selected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-white/15 text-on-dark-muted hover:border-primary hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {filtered.map((team) => {
          const image = team.photo_url || logoUrl;
          return (
            <Link
              href={`/mannschaften/${team.slug}`}
              key={team.id}
              className="group bg-surface-dark-2 rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 transition-all hover:-translate-y-1 hover:border-primary"
            >
              <div className="aspect-[4/3] sm:aspect-[16/9] bg-white/5 overflow-hidden relative flex items-center justify-center">
                {image ? (
                  <img
                    src={image}
                    alt={team.name}
                    className="w-full h-full object-contain p-3 sm:p-6 group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-on-dark-muted/40" />
                )}
                {team.category && (
                  <span className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 rounded-full bg-primary px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wide text-primary-foreground">
                    {team.category}
                  </span>
                )}
              </div>
              <div className="p-3 sm:p-5">
                <h3 className="font-display text-sm sm:text-xl uppercase text-on-dark tracking-wide group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                  {team.name}
                </h3>
                {team.coach_name && (
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-on-dark-muted mt-1.5 sm:mt-2">
                    <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    <span>Trainer: {team.coach_name}</span>
                  </div>
                )}
                {team.oefb_url && (
                  <p className="hidden sm:flex items-center gap-1 text-xs text-on-dark-muted mt-2">
                    <ExternalLink className="w-3 h-3" />
                    Kader auf ÖFB
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

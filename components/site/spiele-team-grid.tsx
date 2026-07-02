"use client";

import { usePathname, useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import { buildSpieleQuery } from "@/lib/termine-filters";
import type { Team } from "@/lib/types";
import { compareCategoryByAge } from "@/lib/utils";

export function SpieleTeamGrid({
  teams,
  teamLogoBySlug = {},
}: {
  teams: Team[];
  teamLogoBySlug?: Record<string, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const sorted = [...teams].sort((a, b) =>
    compareCategoryByAge(a.category ?? a.name, b.category ?? b.name),
  );

  function selectTeam(id: number) {
    router.push(`${pathname}${buildSpieleQuery(String(id))}`);
  }

  return (
    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {sorted.map((team) => {
        const logo = teamLogoBySlug[team.slug] || team.photo_url;
        return (
          <li key={team.id}>
            <button
              type="button"
              onClick={() => selectTeam(team.id)}
              className="flex w-full items-center gap-3 p-4 rounded-xl border border-white/10 bg-surface-dark-2 text-left hover:border-primary transition-colors"
            >
              {logo ? (
                <img
                  src={logo}
                  alt=""
                  className="w-11 h-11 rounded-lg object-cover bg-white/5 shrink-0"
                  loading="lazy"
                />
              ) : (
                <span className="w-11 h-11 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5" />
                </span>
              )}
              <span className="font-semibold text-on-dark text-sm">{team.name}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

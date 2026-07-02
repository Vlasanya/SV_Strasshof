"use client";

import { usePathname, useRouter } from "next/navigation";
import { TermineTeamFilter } from "@/components/site/termine-team-filter";
import { buildSpieleQuery } from "@/lib/termine-filters";
import type { Team } from "@/lib/types";

export function SpieleTeamPicker({
  teams,
  teamFilter,
}: {
  teams: Team[];
  teamFilter: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function onChange(team: string) {
    router.push(`${pathname}${buildSpieleQuery(team)}`);
  }

  return (
    <TermineTeamFilter
      teams={teams}
      value={teamFilter}
      onChange={onChange}
      variant="teams-only"
    />
  );
}

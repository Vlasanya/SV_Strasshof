import { CLUB } from "@/lib/config";
import { resolveOefbAssetUrl } from "@/lib/oefb";
import type { OefbSpiel } from "@/lib/oefb-types";
import type { ClubEvent, Team } from "@/lib/types";

export type OefbCalendarRange = {
  from?: string;
  to?: string;
  before?: string;
};

export function filterSpieleByRange(
  spiele: OefbSpiel[],
  range: OefbCalendarRange,
): OefbSpiel[] {
  return spiele.filter((spiel) => {
    const time = spiel.datum;
    if (range.from && time < new Date(range.from).getTime()) return false;
    if (range.to && time > new Date(range.to).getTime()) return false;
    if (range.before && time >= new Date(range.before).getTime()) return false;
    return true;
  });
}

function hasScore(spiel: OefbSpiel): boolean {
  return spiel.heimTore !== "-" && spiel.gastTore !== "-";
}

export function oefbSpielToClubEvent(
  spiel: OefbSpiel,
  team: Pick<Team, "id" | "name" | "slug">,
  clubShortName: string,
  syntheticId: number,
): ClubEvent {
  const score = hasScore(spiel)
    ? ` ${spiel.heimTore}:${spiel.gastTore}`
    : "";
  const isHome = spiel.heimName
    .toLowerCase()
    .includes(clubShortName.toLowerCase());
  const isAway = spiel.gastName
    .toLowerCase()
    .includes(clubShortName.toLowerCase());
  const opponent = isHome
    ? spiel.gastName
    : isAway
      ? spiel.heimName
      : `${spiel.heimName} – ${spiel.gastName}`;
  const prefix = isHome ? "H" : isAway ? "A" : "Spiel";
  const title = `${prefix} vs ${opponent}${score}`;

  const descriptionParts = [
    spiel.art,
    spiel.bewerbBezeichnung,
    spiel.abgesagt ? "Abgesagt" : null,
    spiel.live ? "Live" : null,
  ].filter(Boolean);

  const now = new Date().toISOString();

  return {
    id: syntheticId,
    title,
    event_type: "match",
    team_id: team.id,
    team: { name: team.name, slug: team.slug },
    description: descriptionParts.length
      ? descriptionParts.join(" · ")
      : "ÖFB-Meisterschaftsspiel",
    location: spiel.spielort ?? null,
    field: null,
    starts_at: new Date(spiel.datum).toISOString(),
    ends_at: null,
    all_day: false,
    published: true,
    external_url: spiel.spielUrl
      ? resolveOefbAssetUrl(spiel.spielUrl)
      : null,
    external_widget: null,
    created_at: now,
    updated_at: now,
  };
}

export function mergeCalendarEvents(
  clubEvents: ClubEvent[],
  oefbEvents: ClubEvent[],
  sortAscending = true,
): ClubEvent[] {
  const merged = [...clubEvents, ...oefbEvents];
  merged.sort((a, b) => {
    const cmp = a.starts_at.localeCompare(b.starts_at);
    return sortAscending ? cmp : -cmp;
  });
  return merged;
}

export function buildOefbCalendarEvents(
  entries: { team: Pick<Team, "id" | "name" | "slug">; spiele: OefbSpiel[] }[],
  range?: OefbCalendarRange,
): ClubEvent[] {
  const events: ClubEvent[] = [];
  let syntheticId = -1;

  for (const { team, spiele } of entries) {
    const filtered = range ? filterSpieleByRange(spiele, range) : spiele;
    for (const spiel of filtered) {
      events.push(
        oefbSpielToClubEvent(spiel, team, CLUB.shortName, syntheticId--),
      );
    }
  }

  return events;
}

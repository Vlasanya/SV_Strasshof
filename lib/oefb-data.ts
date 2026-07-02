import "server-only";
import { cache } from "react";
import { oefbMannschaftenCatalogUrl } from "@/lib/config";
import {
  fetchOefbKader,
  fetchOefbMannschaftenCatalog,
  fetchOefbSpielplan,
} from "@/lib/oefb-fetch";
import {
  oefbKaderUrlForTeam,
  oefbSpieleCandidateUrls,
  oefbTeamPictureUrl,
  oefbTeamSlug,
} from "@/lib/oefb";
import { resolveOefbUrl } from "@/lib/config";
import type { OefbKaderData, OefbSpielplanData } from "@/lib/oefb-types";
import type { ClubEvent, Team } from "@/lib/types";
import {
  buildOefbCalendarEvents,
  type OefbCalendarRange,
} from "@/lib/oefb-calendar";

type OefbTeamRef = Pick<Team, "slug" | "oefb_url">;

export const getOefbKaderForTeam = cache(
  async (team: OefbTeamRef): Promise<OefbKaderData | null> => {
    const url =
      resolveOefbUrl(team.oefb_url) || oefbKaderUrlForTeam(team);
    return fetchOefbKader(url);
  },
);

export const getOefbSpielplanForTeam = cache(
  async (team: OefbTeamRef): Promise<OefbSpielplanData | null> => {
    const urls = oefbSpieleCandidateUrls(team);
    let lastResult: OefbSpielplanData | null = null;

    for (const url of urls) {
      const data = await fetchOefbSpielplan(url);
      if (!data) continue;
      lastResult = data;
      if (data.spiele.length > 0) return data;
    }

    return lastResult;
  },
);

export const getOefbMannschaftenCatalog = cache(async () => {
  return fetchOefbMannschaftenCatalog(oefbMannschaftenCatalogUrl());
});

function findMannschaftForTeam(
  team: OefbTeamRef,
  catalog: NonNullable<Awaited<ReturnType<typeof getOefbMannschaftenCatalog>>>,
) {
  const slug = oefbTeamSlug(team);
  return catalog.mannschaften.find((entry) => entry.url.includes(`/${slug}/`));
}

export const getOefbTeamLogoUrl = cache(
  async (team: OefbTeamRef): Promise<string | null> => {
    const catalog = await getOefbMannschaftenCatalog();
    if (!catalog) return null;

    const entry = findMannschaftForTeam(team, catalog);
    const pictureId = entry?.pictureId ?? catalog.clubLogoId;
    if (!pictureId) return null;

    return oefbTeamPictureUrl(pictureId, catalog.imagePrefix);
  },
);

export async function getOefbTeamLogoMap(
  teams: OefbTeamRef[],
): Promise<Record<string, string>> {
  const catalog = await getOefbMannschaftenCatalog();
  if (!catalog) return {};

  const map: Record<string, string> = {};
  for (const team of teams) {
    const entry = findMannschaftForTeam(team, catalog);
    const pictureId = entry?.pictureId ?? catalog.clubLogoId;
    if (!pictureId) continue;
    map[team.slug] = oefbTeamPictureUrl(pictureId, catalog.imagePrefix);
  }
  return map;
}

export const getOefbCalendarEvents = cache(
  async (
    teams: Team[],
    opts: {
      teamId?: number | null;
      teamIds?: number[];
      clubWideOnly?: boolean;
      range?: OefbCalendarRange;
    } = {},
  ): Promise<ClubEvent[]> => {
    if (opts.clubWideOnly) return [];

    const targetTeams =
      opts.teamIds && opts.teamIds.length > 0
        ? teams.filter((team) => opts.teamIds!.includes(team.id))
        : typeof opts.teamId === "number"
          ? teams.filter((team) => team.id === opts.teamId)
          : teams;

    const entries = await Promise.all(
      targetTeams.map(async (team) => {
        const spielplan = await getOefbSpielplanForTeam(team);
        return { team, spiele: spielplan?.spiele ?? [] };
      }),
    );

    return buildOefbCalendarEvents(entries, opts.range);
  },
);

import "server-only";
import type {
  OefbKaderData,
  OefbMannschaftenCatalog,
  OefbMannschaft,
  OefbSpielerProfile,
  OefbSpielplanData,
} from "@/lib/oefb-types";
import { cache } from "react";
import {
  buildOefbPlayerProfileUrl,
  extractOefbSpielerPublicUid,
  OEFB_PROFILE_HOST,
} from "@/lib/oefb";

const OEFB_REVALIDATE_SECONDS = 60 * 60;

function findMatchingBracket(
  source: string,
  start: number,
  open: string,
  close: string,
): number {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < source.length; i++) {
    const char = source[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\" && inString) {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (char === open) depth++;
    else if (char === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Extract all JSON arrays assigned to SG.container.appPreloads[...] = [...]. */
export function extractAppPreloadObjects(html: string): unknown[] {
  const objects: unknown[] = [];
  const assignmentPattern = /SG\.container\.appPreloads\['[^']+'\]\s*=\s*\[/g;
  let match: RegExpExecArray | null;

  while ((match = assignmentPattern.exec(html)) !== null) {
    const arrayStart = match.index + match[0].length - 1;
    const arrayEnd = findMatchingBracket(html, arrayStart, "[", "]");
    if (arrayEnd === -1) continue;

    const json = html.slice(arrayStart, arrayEnd + 1);
    try {
      const parsed = JSON.parse(json) as unknown;
      if (Array.isArray(parsed)) objects.push(...parsed);
      else objects.push(parsed);
    } catch {
      // ignore malformed preload blocks
    }
  }

  return objects;
}

export function findPreloadByType<T extends { type?: string }>(
  objects: unknown[],
  type: string,
): T | null {
  for (const item of objects) {
    if (
      item &&
      typeof item === "object" &&
      (item as T).type === type
    ) {
      return item as T;
    }
  }
  return null;
}

export async function fetchOefbHtml(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      next: { revalidate: OEFB_REVALIDATE_SECONDS },
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "StrasshofSV-Website/1.0",
      },
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

export async function fetchOefbPreloads(url: string): Promise<unknown[]> {
  const html = await fetchOefbHtml(url);
  if (!html) return [];
  return extractAppPreloadObjects(html);
}

export async function fetchOefbKader(url: string): Promise<OefbKaderData | null> {
  const objects = await fetchOefbPreloads(url);
  return findPreloadByType<OefbKaderData>(objects, "KADER");
}

export async function fetchOefbSpielplan(
  url: string,
): Promise<OefbSpielplanData | null> {
  const objects = await fetchOefbPreloads(url);
  return findPreloadSpielplan(objects);
}

function findPreloadSpielplan(objects: unknown[]): OefbSpielplanData | null {
  const byType = findPreloadByType<OefbSpielplanData>(
    objects,
    "SPIELPLAN_MANNSCHAFT",
  );
  if (byType) return byType;

  for (const item of objects) {
    if (
      item &&
      typeof item === "object" &&
      "spiele" in item &&
      Array.isArray((item as { spiele: unknown }).spiele)
    ) {
      return item as OefbSpielplanData;
    }
  }

  return null;
}

function extractOefbImagePrefix(html: string): string | null {
  return html.match(/vereine3\/images\/(\d+)_/)?.[1] ?? null;
}

function findPreloadMannschaften(
  objects: unknown[],
): Pick<OefbMannschaftenCatalog, "mannschaften" | "saison"> | null {
  for (const item of objects) {
    if (
      item &&
      typeof item === "object" &&
      "mannschaften" in item &&
      Array.isArray((item as { mannschaften: unknown }).mannschaften)
    ) {
      const data = item as {
        mannschaften: OefbMannschaft[];
        saison?: string;
      };
      return { mannschaften: data.mannschaften, saison: data.saison };
    }
  }
  return null;
}

function findPreloadClubLogoId(objects: unknown[]): string | null {
  for (const item of objects) {
    if (
      item &&
      typeof item === "object" &&
      "logo" in item &&
      "startseiteUrl" in item &&
      typeof (item as { logo: unknown }).logo === "string"
    ) {
      return (item as { logo: string }).logo;
    }
  }
  return null;
}

export async function fetchOefbMannschaftenCatalog(
  url: string,
): Promise<OefbMannschaftenCatalog | null> {
  const html = await fetchOefbHtml(url);
  if (!html) return null;

  const imagePrefix = extractOefbImagePrefix(html);
  if (!imagePrefix) return null;

  const objects = extractAppPreloadObjects(html);
  const mannschaftenData = findPreloadMannschaften(objects);
  if (!mannschaftenData) return null;

  return {
    ...mannschaftenData,
    imagePrefix,
    clubLogoId: findPreloadClubLogoId(objects),
  };
}

function parseOefbProfileUrlFromHtml(html: string): string | null {
  const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
  if (canonical?.includes("/Profile/Spieler/")) return canonical;

  const spielerLink = html.match(/"spielerLink":"([^"]+)"/)?.[1];
  if (spielerLink?.includes("/Profile/Spieler/")) return spielerLink;

  return null;
}

/** Resolve canonical oefb.at profile URL for a squad player. */
export const resolveOefbPlayerProfileUrl = cache(
  async (
    spielerProfilUrl: string | undefined,
    spielerName: string,
  ): Promise<string | null> => {
    const fallback = buildOefbPlayerProfileUrl(spielerProfilUrl, spielerName);
    if (!fallback) return null;

    const publicUid = extractOefbSpielerPublicUid(spielerProfilUrl);
    if (!publicUid) return fallback;

    const html = await fetchOefbHtml(
      `${OEFB_PROFILE_HOST}/bewerbe/Spieler/${publicUid}`,
    );
    if (!html) return fallback;

    return parseOefbProfileUrlFromHtml(html) ?? fallback;
  },
);

function extractOefbPersonImagePrefix(html: string): string | null {
  return html.match(/person\/images\/(\d+)_/)?.[1] ?? null;
}

function oefbPersonPhotoUrl(
  fotoId: string,
  imagePrefix: string,
  size = 400,
): string {
  const dim = `${size}x${size}`;
  return `${OEFB_PROFILE_HOST}/bewerbe/oefb2/person/images/${imagePrefix}_${fotoId}-1,0-${dim}-${dim}.png`;
}

function findPreloadSpielerProfile(
  objects: unknown[],
): Omit<OefbSpielerProfile, "profileUrl" | "photoUrl"> | null {
  for (const item of objects) {
    if (
      item &&
      typeof item === "object" &&
      "vorname" in item &&
      "nachname" in item &&
      "statistiken" in item
    ) {
      return item as Omit<OefbSpielerProfile, "profileUrl" | "photoUrl">;
    }
  }
  return null;
}

export async function fetchOefbSpielerProfile(
  spielerProfilUrl: string | undefined,
  spielerName: string,
): Promise<OefbSpielerProfile | null> {
  const profileUrl = await resolveOefbPlayerProfileUrl(
    spielerProfilUrl,
    spielerName,
  );
  if (!profileUrl) return null;

  const html = await fetchOefbHtml(profileUrl);
  if (!html) return null;

  const profile = findPreloadSpielerProfile(extractAppPreloadObjects(html));
  if (!profile) return null;

  const imagePrefix = profile.foto
    ? extractOefbPersonImagePrefix(html)
    : null;

  return {
    ...profile,
    profileUrl,
    photoUrl:
      profile.foto && imagePrefix
        ? oefbPersonPhotoUrl(profile.foto, imagePrefix)
        : undefined,
  };
}

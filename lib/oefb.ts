import { CLUB, oefbKaderUrl, resolveOefbUrl } from "@/lib/config";
import type { Team } from "@/lib/types";

export const OEFB_HOST = "https://vereine.oefb.at";
export const OEFB_PROFILE_HOST = "https://www.oefb.at";

/** Official ÖFB fixtures page for a team slug (e.g. U14-A). */
export function oefbSpieleUrl(teamSlug: string): string {
  const base = CLUB.oefbBaseUrl.replace(/\/+$/, "");
  const season = CLUB.oefbSeasonSlug;
  return `${base}/Mannschaften/${season}/${teamSlug}/Spiele/`;
}

/** Derive team slug from stored oefb_url or team.slug. */
export function oefbTeamSlug(team: Pick<Team, "slug" | "oefb_url">): string {
  const raw = team.oefb_url?.trim();
  if (raw) {
    const match = raw.match(/\/Mannschaften\/[^/]+\/([^/]+)\//i);
    if (match?.[1]) return match[1];
  }
  return team.slug;
}

export function oefbSpieleUrlForTeam(team: Pick<Team, "slug" | "oefb_url">): string {
  const raw = team.oefb_url?.trim();
  if (raw) {
    const spielePath = raw.replace(/\/Kader\/?$/i, "/Spiele/");
    if (spielePath !== raw) {
      return resolveOefbUrl(spielePath);
    }
  }
  return oefbSpieleUrl(oefbTeamSlug(team));
}

/** Candidate ÖFB fixture page URLs for a team (stored path + derived slug). */
export function oefbSpieleCandidateUrls(
  team: Pick<Team, "slug" | "oefb_url">,
): string[] {
  const urls: string[] = [];
  const push = (url: string | null | undefined) => {
    if (url && !urls.includes(url)) urls.push(url);
  };

  push(oefbSpieleUrlForTeam(team));
  push(oefbSpieleUrl(oefbTeamSlug(team)));

  const raw = team.oefb_url?.trim();
  if (raw) {
    push(resolveOefbUrl(raw.replace(/\/Kader\/?$/i, "/Spiele/")));
  }

  return urls;
}

export function oefbKaderUrlForTeam(team: Pick<Team, "slug" | "oefb_url">): string {
  return oefbKaderUrl(oefbTeamSlug(team));
}

/** Resolve relative ÖFB asset or page paths to absolute URLs. */
export function resolveOefbAssetUrl(pathOrUrl: string | null | undefined): string {
  if (!pathOrUrl?.trim()) return "";
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  return resolveOefbUrl(pathOrUrl);
}

/** Legacy public player id embedded in vereine spielerdetails URLs. */
export function extractOefbSpielerPublicUid(
  spielerProfilUrl: string | undefined,
): string | null {
  if (!spielerProfilUrl) return null;
  const match = spielerProfilUrl.match(/_(\d+)~/);
  return match?.[1] ?? null;
}

/** SEO slug used by oefb.at player profiles, e.g. "Pavlo-Komarov". */
export function oefbPlayerProfileSlug(spielerName: string): string {
  return spielerName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join("-");
}

/** Build a square ÖFB team/club picture URL from a picture id. */
export function oefbTeamPictureUrl(
  pictureId: string,
  imagePrefix: string,
  size = 200,
): string {
  const dim = `${size}x${size}`;
  return `${OEFB_HOST}/vereine3/images/${imagePrefix}_${pictureId}-1,0-${dim}-${dim}.jpg`;
}

/** Build oefb.at profile URL from kader fields (may use public uid until API key resolves canonical id). */
export function buildOefbPlayerProfileUrl(
  spielerProfilUrl: string | undefined,
  spielerName: string,
): string | null {
  const uid = extractOefbSpielerPublicUid(spielerProfilUrl);
  const slug = oefbPlayerProfileSlug(spielerName);
  if (!uid || !slug) return null;
  return `${OEFB_PROFILE_HOST}/Profile/Spieler/${uid}?${slug}`;
}

/** Only allow embed markup from ÖFB widget hosts (admin-pasted). */
export function isAllowedOefbWidgetHtml(html: string): boolean {
  const lower = html.toLowerCase();
  if (!lower.includes("<")) return false;
  const blocked = ["javascript:", "onerror=", "onload=", "<object", "<embed"];
  if (blocked.some((b) => lower.includes(b))) return false;
  return (
    lower.includes("oefb.at") ||
    lower.includes("fussballoesterreich.at") ||
    lower.includes("vereine.oefb.at")
  );
}

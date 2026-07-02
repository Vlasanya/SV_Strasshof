/**
 * Static club config for ASKÖ Strasshof SV.
 * Identity fields (name, contact, socials) are stored in app.site_settings
 * and merged in getClubInfo().
 */
/** Default club crest served from /public (overridable via brand_logo_url in admin). */
export const SITE_LOGO_URL = "/logo-color.png";

export const CLUB = {
  shortName: process.env.NEXT_PUBLIC_CLUB_SHORT_NAME ?? "Strasshof",
  tagline:
    process.env.NEXT_PUBLIC_CLUB_TAGLINE ?? "ASKÖ Strasshof SV — Fußballverein",
  fallbackName:
    process.env.NEXT_PUBLIC_CLUB_NAME ?? "ASKÖ Strasshof SV",
  /** Official ÖFB club homepage (squad, fixtures, tables). */
  oefbBaseUrl:
    process.env.NEXT_PUBLIC_OEFB_CLUB_URL ??
    "https://vereine.oefb.at/AskoeStrasshofSv",
  oefbSeasonSlug:
    process.env.NEXT_PUBLIC_OEFB_SEASON_SLUG ?? "Saison-2025-26",
} as const;

export interface ClubInfo {
  name: string;
  shortName: string;
  tagline: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  crestPath: string | null;
  web: string | null;
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
}

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;
  return "";
}

export const SITE_URL = resolveSiteUrl();

export function newsUrl(slug: string | null | undefined): string {
  if (!SITE_URL || !slug) return "";
  return `${SITE_URL}/news/${slug}`;
}

/** Build ÖFB Kader URL for a team category slug (e.g. U11, KM). */
export function oefbKaderUrl(teamSlug: string): string {
  const base = CLUB.oefbBaseUrl.replace(/\/+$/, "");
  const season = CLUB.oefbSeasonSlug;
  return `${base}/Mannschaften/${season}/${teamSlug}/Kader/`;
}

/** Page used to load the ÖFB season squad list (logos + navigation). */
export function oefbMannschaftenCatalogUrl(): string {
  return oefbKaderUrl("KM");
}

/** Resolve ÖFB path or full URL. */
export function resolveOefbUrl(pathOrUrl: string | null | undefined): string {
  if (!pathOrUrl) return CLUB.oefbBaseUrl.replace(/\/+$/, "");
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  const host = "https://vereine.oefb.at";
  return `${host}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

export const NAV_LINKS = [
  { href: "/", label: "Start" },
  { href: "/mannschaften", label: "Mannschaften" },
  { href: "/termine", label: "Termine" },
  { href: "/beitritt", label: "Mitglied werden" },
  { href: "/spiele", label: "Spiele" },
  { href: "/news", label: "News" },
  { href: "/sponsoren", label: "Sponsoren" },
  { href: "/shop", label: "Shop" },
  { href: "/kontakt", label: "Kontakt" },
] as const;

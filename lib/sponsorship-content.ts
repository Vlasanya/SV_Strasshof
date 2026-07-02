import type { AdAction, SponsorshipPlan } from "@/lib/types";
import type { ClubInfo } from "@/lib/config";

/** Legacy Spanish seed markers from the Fonteta template. */
const LEGACY_MARKERS = [
  "fonteta",
  "fuente de san luis",
  "¿quiénes",
  "quiénes somos",
  "francisco carrasco",
  "udfonteta",
];

function isLegacySpanishText(value: string): boolean {
  const lower = value.toLowerCase();
  return LEGACY_MARKERS.some((marker) => lower.includes(marker));
}

export const GERMAN_SPONSORSHIP_SETTINGS = {
  sponsorship_intro_title: "Wer wir sind",
  sponsorship_intro_body:
    "Der ASKÖ Strasshof SV ist mehr als ein Fußballverein. Wir bieten Kindern und Jugendlichen ein sicheres, sportliches Umfeld in der Region Niederösterreich. Mit zahlreichen Mannschaften und engagierten Familien stehen wir für Fairplay, Teamgeist und Nachwuchsförderung.",
  sponsorship_mission_body:
    "Fußball verstehen wir als Bildung: Werte wie Respekt, Einsatz und Zusammenhalt begleiten unsere Spielerinnen und Spieler auf und neben dem Platz.",
  sponsorship_contact_role: "Sponsoring & Marketing",
} as const;

const PLAN_LOCALIZATION: Record<
  string,
  Pick<SponsorshipPlan, "name" | "period" | "features">
> = {
  Bronce: {
    name: "Bronze",
    period: "Saison",
    features: [
      "2 Beiträge pro Monat.",
      "4 Stories pro Monat mit Erwähnung.",
      "Präsenz im Sponsorenbereich.",
    ],
  },
  Bronze: {
    name: "Bronze",
    period: "Saison",
    features: [
      "2 Beiträge pro Monat.",
      "4 Stories pro Monat mit Erwähnung.",
      "Präsenz im Sponsorenbereich.",
    ],
  },
  Plata: {
    name: "Silber",
    period: "Saison",
    features: [
      "4 Beiträge pro Monat.",
      "8 Stories pro Monat mit Erwähnung.",
      "1 gemeinsames Gewinnspiel pro Monat.",
      "Präsenz im Sponsorenbereich.",
    ],
  },
  Silber: {
    name: "Silber",
    period: "Saison",
    features: [
      "4 Beiträge pro Monat.",
      "8 Stories pro Monat mit Erwähnung.",
      "1 gemeinsames Gewinnspiel pro Monat.",
      "Präsenz im Sponsorenbereich.",
    ],
  },
  Oro: {
    name: "Gold",
    period: "Saison",
    features: [
      "6 Beiträge pro Monat.",
      "12 geteilte Stories.",
      "2 gemeinsame Gewinnspiele pro Monat.",
      "1 Werbevideo mit Spielern.",
      "Hervorgehobene Präsenz im Sponsorenbereich.",
      "Priorität bei Werbeaktionen.",
    ],
  },
  Gold: {
    name: "Gold",
    period: "Saison",
    features: [
      "6 Beiträge pro Monat.",
      "12 geteilte Stories.",
      "2 gemeinsame Gewinnspiele pro Monat.",
      "1 Werbevideo mit Spielern.",
      "Hervorgehobene Präsenz im Sponsorenbereich.",
      "Priorität bei Werbeaktionen.",
    ],
  },
};

const AD_ACTION_LOCALIZATION: Record<
  string,
  Pick<AdAction, "name" | "note">
> = {
  "Publicidad en camiseta": {
    name: "Werbung auf dem Trikot",
    note: "pro Mannschaft",
  },
  "Valla publicitaria": { name: "Werbebande", note: null },
  "Pack 5 stories": { name: "Paket 5 Stories", note: null },
  "Enlace destacado en Instagram": {
    name: "Hervorgehobener Instagram-Link",
    note: null,
  },
  "Exclusividad de sector": { name: "Branchenexklusivität", note: null },
};

export function resolveSponsorshipText(
  settings: Record<string, string>,
  key: keyof typeof GERMAN_SPONSORSHIP_SETTINGS | string,
  fallback = "",
): string {
  const raw = settings[key]?.trim() ?? "";
  const germanDefault =
    GERMAN_SPONSORSHIP_SETTINGS[
      key as keyof typeof GERMAN_SPONSORSHIP_SETTINGS
    ] ?? fallback;

  if (!raw || isLegacySpanishText(raw)) return germanDefault || fallback;
  return raw;
}

export function resolveSponsorshipContact(
  settings: Record<string, string>,
  club: ClubInfo,
) {
  const email = settings.sponsorship_contact_email?.trim();
  const phone = settings.sponsorship_contact_phone?.trim();
  const name = settings.sponsorship_contact_name?.trim();
  const role = resolveSponsorshipText(
    settings,
    "sponsorship_contact_role",
    GERMAN_SPONSORSHIP_SETTINGS.sponsorship_contact_role,
  );

  return {
    name: name && !isLegacySpanishText(name) ? name : "",
    role,
    phone: phone && !phone.includes("690 15 51 90") ? phone : "",
    email:
      email && !isLegacySpanishText(email) ? email : club.email?.trim() ?? "",
  };
}

export function localizeSponsorshipPlan(plan: SponsorshipPlan): SponsorshipPlan {
  const localized = PLAN_LOCALIZATION[plan.name];
  if (!localized) {
    return {
      ...plan,
      period: plan.period === "temporada" ? "Saison" : plan.period,
    };
  }
  return { ...plan, ...localized };
}

export function localizeAdAction(action: AdAction): AdAction {
  const localized = AD_ACTION_LOCALIZATION[action.name];
  if (!localized) return action;
  return { ...action, ...localized };
}

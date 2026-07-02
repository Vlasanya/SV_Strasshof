const MEINTURNIERPLAN_HOSTS = [
  "meinturnierplan.de",
  "www.meinturnierplan.de",
  "tournamentbase.com",
  "www.tournamentbase.com",
];

export function isMeinTurnierplanUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return MEINTURNIERPLAN_HOSTS.some(
      (h) => host === h || host.endsWith(`.${h.replace(/^www\./, "")}`),
    );
  } catch {
    return false;
  }
}

export function normalizeExternalUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    return parsed.toString();
  } catch {
    return null;
  }
}

const BLOCKED_EMBED = [
  "javascript:",
  "onerror=",
  "onload=",
  "<object",
  "<embed",
];

export function isAllowedMeinTurnierplanWidgetHtml(html: string): boolean {
  const lower = html.toLowerCase();
  if (!lower.includes("<")) return false;
  if (BLOCKED_EMBED.some((b) => lower.includes(b))) return false;
  return MEINTURNIERPLAN_HOSTS.some((h) => lower.includes(h));
}

export const MEINTURNIERPLAN_WIDGET_HELP_URL =
  "https://hilfe.meinturnierplan.de/manual/widgets-benutzen/";

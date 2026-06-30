/**
 * Site theme registry.
 *
 * The whole site is driven by CSS design tokens (see `app/globals.css`). Each
 * theme is just a named set of token overrides applied via a `data-theme`
 * attribute on <html>. To change the look "by request", switch `SITE_THEME`
 * (or set NEXT_PUBLIC_SITE_THEME) — no component edits required.
 */

export type ThemeName = "fonteta" | "fonteta-light" | "midnight" | "classic";

export interface ThemeMeta {
  name: ThemeName;
  label: string;
  description: string;
}

export const THEMES: Record<ThemeName, ThemeMeta> = {
  fonteta: {
    name: "fonteta",
    label: "Fonteta",
    description:
      "Modern football-academy identity. Black/white/red (60/30/10), Bebas Neue + Montserrat.",
  },
  "fonteta-light": {
    name: "fonteta-light",
    label: "Fonteta Light",
    description:
      "Light variant of the Fonteta identity: white/grey sections with dark text, same red accent and Bebas Neue + Montserrat.",
  },
  midnight: {
    name: "midnight",
    label: "Midnight",
    description: "Darker, cooler navy-leaning variant of the Fonteta identity.",
  },
  classic: {
    name: "classic",
    label: "Classic",
    description: "The previous lighter look (Barlow Condensed + Outfit).",
  },
};

export const DEFAULT_THEME: ThemeName = "fonteta";

function isThemeName(value: string | undefined): value is ThemeName {
  return !!value && value in THEMES;
}

/**
 * The active theme. Resolved from NEXT_PUBLIC_SITE_THEME, falling back to the
 * default. Exposed as `data-theme` on <html> in the root layout.
 */
export const SITE_THEME: ThemeName = isThemeName(process.env.NEXT_PUBLIC_SITE_THEME)
  ? (process.env.NEXT_PUBLIC_SITE_THEME as ThemeName)
  : DEFAULT_THEME;

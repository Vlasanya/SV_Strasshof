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
    label: "Strasshof",
    description:
      "Club identity: black/white/red, display + body typography.",
  },
  "fonteta-light": {
    name: "fonteta-light",
    label: "Strasshof Hell",
    description:
      "Light variant: white/grey sections with dark text, same red accent.",
  },
  midnight: {
    name: "midnight",
    label: "Midnight",
    description: "Darker, cooler navy-leaning variant.",
  },
  classic: {
    name: "classic",
    label: "Classic",
    description: "Alternative lighter palette.",
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

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an ISO date (yyyy-mm-dd) as a short Spanish date, e.g. "24 may 2026". */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** Format an ISO date (yyyy-mm-dd) as a short day+month, e.g. "31 may". */
export function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
  }).format(d);
}

export function formatEuro(value: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value);
}

/**
 * Privacy-friendly display name for public pages: first name + last-name
 * initial (e.g. "Juan P."). Data minimisation — we avoid publishing players'
 * full surnames. `full` keeps the complete name for admin/internal views.
 */
export function publicPlayerName(p: {
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
}): string {
  const first = p.first_name?.trim();
  const last = p.last_name?.trim();
  if (first) return last ? `${first} ${last.charAt(0)}.` : first;
  // Fallback: ffcv stores "APELLIDOS, NOMBRE" — derive from full_name.
  const full = p.full_name?.trim();
  if (!full) return "Jugador/a";
  const [surnames, given] = full.split(",").map((s) => s.trim());
  if (given) return `${given} ${surnames?.charAt(0) ?? ""}.`.trim();
  return full;
}

const CATEGORY_PALETTE = [
  "bg-yellow-100 text-yellow-800",
  "bg-blue-100 text-blue-800",
  "bg-green-100 text-green-800",
  "bg-purple-100 text-purple-800",
  "bg-orange-100 text-orange-800",
  "bg-rose-100 text-rose-800",
  "bg-red-100 text-red-800",
];

// Youth categories ordered youngest → oldest; anything else (senior/amateur
// leagues like "Tercera FFCV") sorts after them.
const AGE_ORDER = [
  "prebenjamin",
  "benjamin",
  "alevin",
  "infantil",
  "cadete",
  "juvenil",
];

const stripAccents = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function categoryAgeRank(category: string): number {
  const n = stripAccents(category);
  const i = AGE_ORDER.findIndex((kw) => n.includes(kw));
  return i === -1 ? AGE_ORDER.length : i;
}

// Birth-year within a category ("1er. Año" younger than "2º. Año").
function categoryYearRank(category: string): number {
  const m = stripAccents(category).match(/(\d)\s*(?:er|o|º|ª)?\.?\s*ano/);
  return m ? Number(m[1]) : 0;
}

/** Sort category labels youngest → oldest (age group, then birth-year, then name). */
export function compareCategoryByAge(a: string, b: string): number {
  return (
    categoryAgeRank(a) - categoryAgeRank(b) ||
    categoryYearRank(a) - categoryYearRank(b) ||
    a.localeCompare(b, "es")
  );
}

/** Deterministic pastel badge color for a category label. */
export function categoryColor(name: string | null | undefined): string {
  if (!name) return "bg-gray-100 text-gray-700";
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return CATEGORY_PALETTE[Math.abs(hash) % CATEGORY_PALETTE.length];
}

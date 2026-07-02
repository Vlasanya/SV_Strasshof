export const CLUB_FIELDS = [
  { value: "", label: "— kein Platz —" },
  { value: "platz-1", label: "Platz 1" },
  { value: "platz-2", label: "Platz 2" },
  { value: "kunstrasen", label: "Kunstrasen" },
  { value: "halle", label: "Halle" },
  { value: "sonstiges", label: "Sonstiges" },
] as const;

const FIELD_LABELS = Object.fromEntries(
  CLUB_FIELDS.map((f) => [f.value, f.label]),
) as Record<string, string>;

export function clubFieldLabel(value: string | null | undefined): string {
  if (!value?.trim()) return "—";
  return FIELD_LABELS[value] ?? value;
}

export const CALENDAR_FIELD_ROWS = CLUB_FIELDS.filter((f) => f.value !== "");

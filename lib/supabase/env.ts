/** Treat empty or leftover placeholder values (e.g. "YOUR-...") as unset. */
function clean(value: string | undefined): string {
  if (!value) return "";
  const v = value.trim();
  if (!v || /^your[-_]/i.test(v) || v.includes("YOUR-")) return "";
  return v;
}

export const SUPABASE_URL = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);

/** Supports both the legacy anon key and the new publishable key naming. */
export const SUPABASE_ANON_KEY =
  clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  clean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

export function hasSupabaseEnv(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

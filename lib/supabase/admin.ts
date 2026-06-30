import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./env";

/** Treat empty or leftover placeholder values (e.g. "YOUR-...") as unset. */
function clean(value: string | undefined): string {
  if (!value) return "";
  const v = value.trim();
  if (!v || /^your[-_]/i.test(v) || v.includes("YOUR-")) return "";
  return v;
}

const SERVICE_ROLE_KEY = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

export function hasServiceRole(): boolean {
  return Boolean(SUPABASE_URL && SERVICE_ROLE_KEY);
}

/**
 * Supabase client authenticated with the service role key. Bypasses RLS, so it
 * must only ever be used server-side (e.g. cron route handlers that run without
 * a user session). Throws if the key isn't configured.
 */
export function createSupabaseAdminClient() {
  if (!hasServiceRole()) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

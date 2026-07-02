import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Instagram Graph helpers for the "API setup with Instagram Login" flow.
 *
 * Tokens are long-lived (~60 days) and must be refreshed before they expire.
 * To make refresh persistent (env vars are read-only at runtime), the live
 * token + expiry are stored in `app.site_settings` and refreshed there. The env
 * vars `IG_ACCESS_TOKEN` / `IG_BUSINESS_ACCOUNT_ID` act as the initial seed /
 * fallback only.
 */

// Media create/publish edges live under the versioned host; the token refresh
// endpoint lives at the unversioned host.
const IG_HOST = "https://graph.instagram.com";
export const IG_GRAPH = `${IG_HOST}/v21.0`;

// Refresh ~10 days before expiry; long-lived tokens last ~60 days.
const REFRESH_THRESHOLD_MS = 10 * 24 * 60 * 60 * 1000;
const DEFAULT_TTL_SEC = 60 * 24 * 60 * 60; // 60 days

const SETTING_TOKEN = "ig_access_token";
const SETTING_EXPIRES = "ig_token_expires_at";
const SETTING_BUSINESS_ID = "ig_business_account_id";

function clean(value: string | undefined): string {
  if (!value) return "";
  const v = value.trim();
  if (!v || /^your[-_]/i.test(v) || v.includes("YOUR-")) return "";
  return v;
}

// Minimal client shape so this works with both the SSR and service-role clients.
type Db = Pick<SupabaseClient, "schema">;

async function readSettings(
  supabase: Db,
  keys: string[],
): Promise<Record<string, string>> {
  const { data } = await supabase
    .schema("app")
    .from("site_settings")
    .select("key, value")
    .in("key", keys);
  const map: Record<string, string> = {};
  for (const row of (data as { key: string; value: string | null }[]) ?? []) {
    map[row.key] = row.value ?? "";
  }
  return map;
}

export interface IgCredentials {
  token: string;
  businessId: string;
  /** Epoch ms, or null when unknown (e.g. seeded purely from env). */
  expiresAt: number | null;
}

/** Resolve the active token + business id: stored value wins over env. */
export async function getIgCredentials(supabase: Db): Promise<IgCredentials> {
  const s = await readSettings(supabase, [
    SETTING_TOKEN,
    SETTING_EXPIRES,
    SETTING_BUSINESS_ID,
  ]);
  const token = clean(s[SETTING_TOKEN]) || clean(process.env.IG_ACCESS_TOKEN);
  const businessId =
    clean(s[SETTING_BUSINESS_ID]) || clean(process.env.IG_BUSINESS_ACCOUNT_ID);
  const parsed = s[SETTING_EXPIRES] ? Date.parse(s[SETTING_EXPIRES]) : NaN;
  return {
    token,
    businessId,
    expiresAt: Number.isNaN(parsed) ? null : parsed,
  };
}

async function persistToken(
  supabase: Db,
  token: string,
  expiresInSec: number,
): Promise<string> {
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + expiresInSec * 1000).toISOString();
  await supabase
    .schema("app")
    .from("site_settings")
    .upsert(
      [
        { key: SETTING_TOKEN, value: token, updated_at: now },
        { key: SETTING_EXPIRES, value: expiresAt, updated_at: now },
      ],
      { onConflict: "key" },
    );
  return expiresAt;
}

export interface RefreshResult {
  ok: boolean;
  error?: string;
  expiresAt?: string;
}

/**
 * Exchange the current long-lived token for a fresh one and persist it.
 * Requires the current token to be a valid long-lived token at least 24h old.
 */
export async function refreshIgToken(supabase: Db): Promise<RefreshResult> {
  const { token } = await getIgCredentials(supabase);
  if (!token) return { ok: false, error: "Kein Instagram-Token konfiguriert." };

  const url = new URL(`${IG_HOST}/refresh_access_token`);
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", token);

  let json: { access_token?: string; expires_in?: number; error?: { message?: string } };
  try {
    const res = await fetch(url, { method: "GET", cache: "no-store" });
    json = await res.json();
    if (!res.ok || !json.access_token) {
      return { ok: false, error: json?.error?.message ?? "Token konnte nicht erneuert werden." };
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Netzwerkfehler." };
  }

  const expiresAt = await persistToken(
    supabase,
    json.access_token,
    json.expires_in ?? DEFAULT_TTL_SEC,
  );
  return { ok: true, expiresAt };
}

/**
 * Return a usable token, refreshing first if it's close to expiry. Never throws;
 * on refresh failure it falls back to the existing token so a post can still be
 * attempted (and surface a clearer API error if the token is truly dead).
 */
export async function ensureFreshIgToken(supabase: Db): Promise<string> {
  const { token, expiresAt } = await getIgCredentials(supabase);
  if (!token) return "";
  if (expiresAt !== null && expiresAt - Date.now() < REFRESH_THRESHOLD_MS) {
    const r = await refreshIgToken(supabase);
    if (r.ok) return (await getIgCredentials(supabase)).token;
  }
  return token;
}

/** POST to a Graph edge with the token in the body. Throws on API error. */
export async function igPost<T>(
  token: string,
  path: string,
  body: Record<string, string>,
): Promise<T> {
  const res = await fetch(`${IG_GRAPH}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, access_token: token }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message ?? "Instagram API error");
  }
  return json as T;
}

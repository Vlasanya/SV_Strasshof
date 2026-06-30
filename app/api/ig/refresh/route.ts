import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasServiceRole } from "@/lib/supabase/admin";
import { refreshIgToken } from "@/lib/instagram";

export const dynamic = "force-dynamic";

/**
 * Cron endpoint: refreshes the long-lived Instagram token before it expires.
 *
 * Auth: send the cron secret either as `Authorization: Bearer <CRON_SECRET>`
 * (Vercel Cron does this automatically when CRON_SECRET is set) or as
 * `?secret=<CRON_SECRET>`. Runs with the service role so it works without an
 * admin session.
 *
 * Schedule it (e.g. weekly) via vercel.json or any external cron hitting:
 *   GET /api/ig/refresh?secret=YOUR_CRON_SECRET
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) {
    const auth = request.headers.get("authorization") ?? "";
    const url = new URL(request.url);
    const provided =
      auth.replace(/^Bearer\s+/i, "").trim() || url.searchParams.get("secret");
    if (provided !== secret) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!hasServiceRole()) {
    return NextResponse.json(
      { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY no está configurado." },
      { status: 500 },
    );
  }

  const supabase = createSupabaseAdminClient();
  const result = await refreshIgToken(supabase);
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}

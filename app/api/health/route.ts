import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

/**
 * Health check — verifies Supabase connectivity and app schema reads.
 */
export async function GET() {
  const result: Record<string, unknown> = {
    ok: true,
    supabaseEnv: hasSupabaseEnv(),
    timestamp: new Date().toISOString(),
  };

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ ...result, ok: false, error: "missing env" });
  }

  const supabase = await createSupabaseServerClient();

  const teamRes = await supabase.schema("app").from("team").select("id", {
    count: "exact",
    head: true,
  });
  result.appTeam = {
    count: teamRes.count,
    error: teamRes.error?.message ?? null,
  };

  const newsRes = await supabase
    .schema("app")
    .from("news")
    .select("id", { count: "exact", head: true });
  result.appNews = {
    count: newsRes.count,
    error: newsRes.error?.message ?? null,
  };

  const anyError = teamRes.error || newsRes.error;
  return NextResponse.json({
    ...result,
    ok: !anyError,
  });
}

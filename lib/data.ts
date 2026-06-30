import "server-only";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { CLUB, type ClubInfo } from "@/lib/config";
import type {
  AdAction,
  MerchItem,
  NewsArticle,
  SiteSettings,
  Sponsor,
  SponsorshipPlan,
  Team,
} from "@/lib/types";

export const getClubInfo = cache(async (): Promise<ClubInfo> => {
  const fallback: ClubInfo = {
    name: CLUB.fallbackName,
    shortName: CLUB.shortName,
    tagline: CLUB.tagline,
    email: null,
    phone: null,
    address: null,
    crestPath: null,
    web: null,
    instagram: null,
    facebook: null,
    twitter: null,
  };

  try {
    return applyClubOverrides(fallback, await getSiteSettings());
  } catch {
    return fallback;
  }
});

function instagramHandle(value: string): string {
  const m = value.match(/instagram\.com\/([^/?#]+)/i);
  return (m ? m[1] : value).replace(/^@/, "").replace(/\/+$/, "").trim();
}

function applyClubOverrides(base: ClubInfo, settings: SiteSettings): ClubInfo {
  const pick = (key: string): string | null => {
    const v = settings[key];
    return v && v.trim() ? v.trim() : null;
  };
  const ig = pick("club_instagram");
  return {
    ...base,
    name: pick("club_name") ?? base.name,
    email: pick("club_email") ?? base.email,
    phone: pick("club_phone") ?? base.phone,
    address: pick("club_address") ?? base.address,
    crestPath: pick("club_crest_url") ?? base.crestPath,
    web: pick("club_web") ?? base.web,
    instagram: ig ? instagramHandle(ig) : base.instagram,
    facebook: pick("club_facebook") ?? base.facebook,
    twitter: pick("club_twitter") ?? base.twitter,
  };
}

export async function getTeams(
  opts: { includeHidden?: boolean } = {},
): Promise<Team[]> {
  if (!hasSupabaseEnv()) return [];
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .schema("app")
      .from("team")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error || !data) return [];
    const teams = data as Team[];
    return opts.includeHidden ? teams : teams.filter((t) => !t.hidden);
  } catch {
    return [];
  }
}

export async function getTeamBySlug(
  slug: string,
  opts: { includeHidden?: boolean } = {},
): Promise<Team | null> {
  if (!hasSupabaseEnv()) return null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .schema("app")
      .from("team")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    const team = data as Team;
    if (team.hidden && !opts.includeHidden) return null;
    return team;
  } catch {
    return null;
  }
}

export async function getTeamById(
  id: number,
  opts: { includeHidden?: boolean } = {},
): Promise<Team | null> {
  if (!hasSupabaseEnv()) return null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .schema("app")
      .from("team")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    const team = data as Team;
    if (team.hidden && !opts.includeHidden) return null;
    return team;
  } catch {
    return null;
  }
}

export async function getNews(
  opts: {
    publishedOnly?: boolean;
    limit?: number;
    category?: string;
  } = {},
): Promise<NewsArticle[]> {
  if (!hasSupabaseEnv()) return [];
  try {
    const supabase = await createSupabaseServerClient();
    let q = supabase
      .schema("app")
      .from("news")
      .select("*")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (opts.publishedOnly) q = q.eq("published", true);
    if (opts.category) q = q.eq("category", opts.category);
    if (opts.limit) q = q.limit(opts.limit);
    const { data, error } = await q;
    if (error || !data) return [];
    return data as NewsArticle[];
  } catch {
    return [];
  }
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  if (!hasSupabaseEnv()) return null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .schema("app")
      .from("news")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    return data as NewsArticle;
  } catch {
    return null;
  }
}

export async function getNewsById(id: number): Promise<NewsArticle | null> {
  if (!hasSupabaseEnv()) return null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .schema("app")
      .from("news")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return (data as NewsArticle) ?? null;
  } catch {
    return null;
  }
}

export async function getSponsors(
  opts: { activeOnly?: boolean } = {},
): Promise<Sponsor[]> {
  if (!hasSupabaseEnv()) return [];
  try {
    const supabase = await createSupabaseServerClient();
    let q = supabase
      .schema("app")
      .from("sponsor")
      .select("*")
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("name", { ascending: true });
    if (opts.activeOnly) q = q.eq("active", true);
    const { data, error } = await q;
    if (error || !data) return [];
    return data as Sponsor[];
  } catch {
    return [];
  }
}

export async function getSponsorById(id: number): Promise<Sponsor | null> {
  if (!hasSupabaseEnv()) return null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .schema("app")
      .from("sponsor")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return (data as Sponsor) ?? null;
  } catch {
    return null;
  }
}

export async function getMerch(
  opts: { inStockOnly?: boolean } = {},
): Promise<MerchItem[]> {
  if (!hasSupabaseEnv()) return [];
  try {
    const supabase = await createSupabaseServerClient();
    let q = supabase
      .schema("app")
      .from("merch")
      .select("*")
      .order("in_stock", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (opts.inStockOnly) q = q.eq("in_stock", true);
    const { data, error } = await q;
    if (error || !data) return [];
    return data as MerchItem[];
  } catch {
    return [];
  }
}

export async function getMerchById(id: number): Promise<MerchItem | null> {
  if (!hasSupabaseEnv()) return null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .schema("app")
      .from("merch")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return (data as MerchItem) ?? null;
  } catch {
    return null;
  }
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  handled: boolean;
  created_at: string;
}

export async function getContactMessages({
  limit = 20,
  offset = 0,
  subject,
  handled,
  sort = "desc",
}: {
  limit?: number;
  offset?: number;
  subject?: string;
  handled?: boolean;
  sort?: "asc" | "desc";
} = {}): Promise<{ data: ContactMessage[]; count: number }> {
  if (!hasSupabaseEnv()) return { data: [], count: 0 };
  try {
    const supabase = await createSupabaseServerClient();
    let query = supabase
      .schema("app")
      .from("contact_message")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: sort === "asc" })
      .range(offset, offset + limit - 1);
    if (subject) query = query.eq("subject", subject);
    if (typeof handled === "boolean") query = query.eq("handled", handled);
    const { data, error, count } = await query;
    if (error || !data) return { data: [], count: 0 };
    return { data: data as ContactMessage[], count: count ?? 0 };
  } catch {
    return { data: [], count: 0 };
  }
}

export async function getSponsorshipPlans(): Promise<SponsorshipPlan[]> {
  if (!hasSupabaseEnv()) return [];
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .schema("app")
      .from("sponsorship_plan")
      .select("*")
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("price", { ascending: true });
    if (error || !data) return [];
    return data as SponsorshipPlan[];
  } catch {
    return [];
  }
}

export async function getSponsorshipPlanById(
  id: number,
): Promise<SponsorshipPlan | null> {
  if (!hasSupabaseEnv()) return null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .schema("app")
      .from("sponsorship_plan")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return (data as SponsorshipPlan) ?? null;
  } catch {
    return null;
  }
}

export async function getAdActions(): Promise<AdAction[]> {
  if (!hasSupabaseEnv()) return [];
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .schema("app")
      .from("ad_action")
      .select("*")
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("name", { ascending: true });
    if (error || !data) return [];
    return data as AdAction[];
  } catch {
    return [];
  }
}

export async function getAdActionById(id: number): Promise<AdAction | null> {
  if (!hasSupabaseEnv()) return null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .schema("app")
      .from("ad_action")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return (data as AdAction) ?? null;
  } catch {
    return null;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!hasSupabaseEnv()) return {};
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .schema("app")
      .from("site_settings")
      .select("key, value");
    if (error || !data) return {};
    const map: SiteSettings = {};
    for (const row of data) map[row.key] = row.value ?? "";

    const now = new Date();
    const startYear =
      now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
    const currentSeason = `Saison ${startYear}/${String(startYear + 1).slice(-2)}`;

    if (map["hero_eyebrow"] !== currentSeason) {
      await supabase.schema("app").from("site_settings").upsert({
        key: "hero_eyebrow",
        value: currentSeason,
      });
      map["hero_eyebrow"] = currentSeason;
    }
    return map;
  } catch {
    return {};
  }
}

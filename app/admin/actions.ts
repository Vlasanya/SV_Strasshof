"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CLUB, newsUrl } from "@/lib/config";
import { normalizeExternalUrl } from "@/lib/meinturnierplan";
import {
  createAndPublishIgCarousel,
  createAndPublishIgImage,
  deleteIgMedia,
  ensureFreshIgToken,
  getIgCredentials,
  getIgDeleteToken,
  refreshIgToken,
} from "@/lib/instagram";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

async function db() {
  return createSupabaseServerClient();
}

// --- Auth -------------------------------------------------------------------

export async function signOut() {
  const supabase = await db();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// --- News -------------------------------------------------------------------
export async function upsertNews(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = formData.get("id") ? Number(formData.get("id")) : null;

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { ok: false, error: "Der Titel ist erforderlich." };

  const publishInstagram = formData.get("publish_instagram") === "on";
  const slug = String(formData.get("slug") ?? "").trim() || slugify(title);

  const supabase = await db();

  // ----------------------------
  // 1. EXISTING DATA (EDIT SAFE)
  // ----------------------------
  const existing = id
    ? await supabase
        .schema("app")
        .from("news")
        .select("images, cover_image")
        .eq("id", id)
        .single()
    : null;

  // ----------------------------
  // 2. IMAGES
  // ----------------------------
  let images: string[] = [];

  if (existing?.data?.images) {
    images = existing.data.images;
  }

  const rawImages = formData.get("images");

  if (rawImages) {
    try {
      const parsed = JSON.parse(String(rawImages));
      if (Array.isArray(parsed)) {
        images = parsed.map((u) => String(u)).filter(Boolean);
      }
    } catch {
      images = [];
    }
  }

  // ----------------------------
  // 3. COVER IMAGE
  // ----------------------------
  let cover_image: string | null = existing?.data?.cover_image ?? null;

  const coverFile = formData.get("cover_file") as File | null;

  if (coverFile && coverFile.size > 0) {
    const ext = coverFile.name.split(".").pop();
    const fileName = `news/covers/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("news")
      .upload(fileName, coverFile, {
        contentType: coverFile.type,
        upsert: false,
      });

    if (uploadError) {
      return { ok: false, error: uploadError.message };
    }

    const { data } = supabase.storage.from("news").getPublicUrl(fileName);

    cover_image = data.publicUrl;
  }

  // ----------------------------
  // 4. ROW DATA
  // ----------------------------
  const published = true;

  const row = {
    title,
    slug,
    category: String(formData.get("category") ?? "").trim() || null,
    excerpt: String(formData.get("excerpt") ?? "").trim() || null,
    body: String(formData.get("body") ?? "").trim() || null,
    cover_image,
    images,
    published,
    published_at: published ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  // ----------------------------
  // 5. DB SAVE (FIXED - NO DUPLICATE INSERT)
  // ----------------------------
  let insertedId: number = id ?? 0;

  if (id) {
    const { error } = await supabase
      .schema("app")
      .from("news")
      .update(row)
      .eq("id", id);

    if (error) return { ok: false, error: error.message };
  } else {
    const { data, error } = await supabase
      .schema("app")
      .from("news")
      .insert(row)
      .select("id")
      .single();

    if (error) return { ok: false, error: error.message };

    if (!data?.id) {
      return { ok: false, error: "Der Beitrag konnte nicht erstellt werden." };
    }

    insertedId = data.id;
  }

  // ----------------------------
  // 6. INSTAGRAM PUBLISH (OPTIONAL)
  // ----------------------------
  if (publishInstagram) {
    const postResult = await postNewsToInstagram(insertedId);

    if (!postResult.ok) {
      return { ok: false, error: "Gespeichert, aber Instagram-Post fehlgeschlagen." };
    }
  }

  // ----------------------------
  // 7. CACHE + REDIRECT
  // ----------------------------
  revalidatePath("/admin/news");
  revalidatePath("/news");
  redirect("/admin/news");
}

export async function deleteNews(formData: FormData): Promise<ActionResult> {
  const id = Number(formData.get("id"));
  if (!id) return { ok: false, error: "Ungültiger Beitrag." };

  const deleteFromInstagram = formData.get("delete_from_instagram") === "true";
  const supabase = await db();

  const { data: article } = await supabase
    .schema("app")
    .from("news")
    .select("instagram_post_id")
    .eq("id", id)
    .maybeSingle();

  if (deleteFromInstagram && article?.instagram_post_id) {
    try {
      const token = await getIgDeleteToken(supabase);
      if (!token) {
        return {
          ok: false,
          error: "Kein Token zum Löschen auf Instagram konfiguriert.",
        };
      }
      await deleteIgMedia(token, article.instagram_post_id);
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : "Instagram-Löschen fehlgeschlagen.",
      };
    }
  }

  await supabase.schema("app").from("news").delete().eq("id", id);
  revalidatePath("/admin/news");
  revalidatePath("/news");
  return { ok: true };
}

// --- Instagram --------------------------------------------------------------
// Uses the Instagram Login flow (graph.instagram.com). Token + business id are
// resolved/refreshed via @/lib/instagram (stored in site_settings, env seed).

function buildNewsCaption(
  article: {
    title: string;
    excerpt: string | null;
    body: string | null;
    slug: string | null;
    instagram_hashtags?: string | null;
  },
  caption: { mention: string; defaultHashtags: string },
  hashtagsOverride?: string | null,
): string {
  const lines = [article.title.toUpperCase(), ""];
  const text = (article.body ?? article.excerpt ?? "").trim();
  if (text) lines.push(text, "");
  const url = newsUrl(article.slug);
  if (url) lines.push(`📰 Ganzen Beitrag lesen: ${url}`, "");
  const hashtags = (
    hashtagsOverride ??
    article.instagram_hashtags ??
    caption.defaultHashtags
  ).trim();
  lines.push(`${caption.mention}${hashtags ? ` ${hashtags}` : ""}`.trim());
  return lines.join("\n");
}

async function getIgCaptionSettings(
  supabase: Awaited<ReturnType<typeof db>>,
): Promise<{ mention: string; defaultHashtags: string }> {
  const { data } = await supabase
    .schema("app")
    .from("site_settings")
    .select("key, value")
    .in("key", ["ig_mention", "ig_default_hashtags"]);

  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    map[row.key] = row.value ?? "";
  }

  const fallbackHandle = `@${CLUB.shortName.toLowerCase().replace(/\s+/g, "")}`;
  const fallbackTag = CLUB.shortName.replace(/[^a-zA-Z0-9]/g, "");
  const mention = map.ig_mention?.trim() || fallbackHandle;
  const defaultHashtags =
    map.ig_default_hashtags?.trim() ||
    (fallbackTag ? `#${fallbackTag} #fussball` : "#fussball");

  return { mention, defaultHashtags };
}

export async function postNewsToInstagram(
  id: number,
  opts: { hashtags?: string } = {},
): Promise<{ ok: boolean; error?: string; postId?: string }> {
  const supabase = await db();

  const token = await ensureFreshIgToken(supabase);
  const { businessId: igId } = await getIgCredentials(supabase);
  if (!igId || !token) {
    const error =
      "Instagram ist nicht konfiguriert (Token / Konto) unter Einstellungen.";
    await supabase
      .schema("app")
      .from("news")
      .update({
        instagram_error: error,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    return { ok: false, error };
  }

  const { data: article } = await supabase
    .schema("app")
    .from("news")
    .select(
      "title, excerpt, body, cover_image, images, slug, published, instagram_hashtags",
    )
    .eq("id", id)
    .maybeSingle();

  if (!article) return { ok: false, error: "Beitrag nicht gefunden." };

  async function recordIgError(error: string) {
    await supabase
      .schema("app")
      .from("news")
      .update({
        instagram_error: error,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    revalidatePath("/admin/news");
    revalidatePath(`/admin/news/${id}/edit`);
  }

  const images: string[] = (
    (article.images as string[] | null)?.length
      ? (article.images as string[])
      : article.cover_image
        ? [article.cover_image]
        : []
  ).filter(Boolean);

  if (images.length === 0) {
    const error = "Der Beitrag hat keine Bilder zum Veröffentlichen.";
    await recordIgError(error);
    return { ok: false, error };
  }

  if (!article.published) {
    const now = new Date().toISOString();
    const { error: pubErr } = await supabase
      .schema("app")
      .from("news")
      .update({
        published: true,
        published_at: now,
        updated_at: now,
      })
      .eq("id", id);
    if (pubErr) {
      const error = "Beitrag konnte vor Instagram nicht veröffentlicht werden.";
      await recordIgError(error);
      return { ok: false, error };
    }
    article.published = true;
    revalidatePath("/admin/news");
    revalidatePath("/news");
    if (article.slug) revalidatePath(`/news/${article.slug}`);
  }

  const captionSettings = await getIgCaptionSettings(supabase);
  const caption = buildNewsCaption(
    article,
    captionSettings,
    opts.hashtags ?? null,
  );

  try {
    const postId =
      images.length === 1
        ? await createAndPublishIgImage({
            token,
            igUserId: igId,
            imageUrl: images[0],
            caption,
          })
        : await createAndPublishIgCarousel({
            token,
            igUserId: igId,
            imageUrls: images,
            caption,
          });

    await supabase
      .schema("app")
      .from("news")
      .update({
        instagram_posted: true,
        instagram_post_id: postId,
        instagram_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    revalidatePath("/admin/news");
    revalidatePath(`/admin/news/${id}/edit`);

    return { ok: true, postId };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Instagram-Fehler.";
    await recordIgError(error);
    return { ok: false, error };
  }
}

// Save the Instagram long-lived token + business account id into site_settings.
// Saving a token (re)seeds the 60-day expiry so auto-refresh has a baseline.
export async function upsertInstagramSettings(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const token = String(formData.get("ig_access_token") ?? "").trim();
  const businessId = String(
    formData.get("ig_business_account_id") ?? "",
  ).trim();
  const now = new Date().toISOString();

  const rows: { key: string; value: string; updated_at: string }[] = [];
  if (businessId !== "") {
    rows.push({
      key: "ig_business_account_id",
      value: businessId,
      updated_at: now,
    });
  }
  if (token !== "") {
    const expiresAt = new Date(
      Date.now() + 60 * 24 * 60 * 60 * 1000,
    ).toISOString();
    rows.push({ key: "ig_access_token", value: token, updated_at: now });
    rows.push({
      key: "ig_token_expires_at",
      value: expiresAt,
      updated_at: now,
    });
  }

  const mention = String(formData.get("ig_mention") ?? "").trim();
  rows.push({ key: "ig_mention", value: mention, updated_at: now });

  const defaultHashtags = String(
    formData.get("ig_default_hashtags") ?? "",
  ).trim();
  rows.push({
    key: "ig_default_hashtags",
    value: defaultHashtags,
    updated_at: now,
  });

  const deleteToken = String(formData.get("ig_delete_access_token") ?? "").trim();
  if (deleteToken !== "") {
    rows.push({
      key: "ig_delete_access_token",
      value: deleteToken,
      updated_at: now,
    });
  }

  if (rows.length === 0) return { ok: true };

  const supabase = await db();
  const { error } = await supabase
    .schema("app")
    .from("site_settings")
    .upsert(rows, { onConflict: "key" });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/einstellungen");
  return { ok: true };
}

// Toggle the "auto-publish results" automation (cron reads this flag before it
// generates posters / posts to Instagram). Stored in site_settings.
export async function upsertAutomationSettings(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const now = new Date().toISOString();
  const rows = [
    {
      key: "auto_publish_results",
      value: formData.get("auto_publish_results") === "on" ? "true" : "false",
      updated_at: now,
    },
    {
      key: "auto_publish_fixtures",
      value: formData.get("auto_publish_fixtures") === "on" ? "true" : "false",
      updated_at: now,
    },
  ];
  const supabase = await db();
  const { error } = await supabase
    .schema("app")
    .from("site_settings")
    .upsert(rows, { onConflict: "key" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/einstellungen");
  return { ok: true };
}

// Manually refresh the Instagram token now (also exercised by the cron route).
export async function refreshInstagramTokenNow(): Promise<{
  ok: boolean;
  error?: string;
  expiresAt?: string;
}> {
  const supabase = await db();
  const res = await refreshIgToken(supabase);
  if (res.ok) revalidatePath("/admin/einstellungen");
  return res;
}

// --- Sponsors ---------------------------------------------------------------

export async function upsertSponsor(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = formData.get("id") ? Number(formData.get("id")) : null;

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Der Name ist erforderlich." };

  const supabase = await db();

  // -------------------------
  // ✅ 1. HANDLE IMAGE FILE
  // -------------------------
  const file = formData.get("logo_file") as File | null;

  let logo_url = String(formData.get("logo_url") ?? "").trim() || null;

  if (file && file.size > 0) {
    const ext = file.name.split(".").pop();
    const fileName = `sponsors/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("sponsors")
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return { ok: false, error: uploadError.message };
    }

    const { data } = supabase.storage.from("sponsors").getPublicUrl(fileName);

    logo_url = data.publicUrl; // ✅ override manual URL
  }

  // -------------------------
  // 2. BUILD ROW
  // -------------------------
  const row = {
    name,
    tier: String(formData.get("tier") ?? "").trim() || null,
    logo_url,
    website: String(formData.get("website") ?? "").trim() || null,
    maps_url: String(formData.get("maps_url") ?? "").trim() || null,
    active: formData.get("active") === "on",
    sort_order: formData.get("sort_order")
      ? Number(formData.get("sort_order"))
      : null,
  };

  // -------------------------
  // 3. DB SAVE
  // -------------------------
  const q = id
    ? supabase.schema("app").from("sponsor").update(row).eq("id", id)
    : supabase.schema("app").from("sponsor").insert(row);

  const { error } = await q;

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/sponsoren");
  revalidatePath("/sponsoren");
  redirect("/admin/sponsoren");
}

export async function deleteSponsor(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await db();
  await supabase.schema("app").from("sponsor").delete().eq("id", id);
  revalidatePath("/admin/sponsoren");
  revalidatePath("/sponsoren");
}

// --- Merch ------------------------------------------------------------------
export async function upsertMerch(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = formData.get("id") ? Number(formData.get("id")) : null;

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Der Name ist erforderlich." };

  const supabase = await db();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Unauthorized" };
  }

  // -------------------------
  // GET EXISTING IMAGE (EDIT MODE SAFE)
  // -------------------------
  let image_url: string | null = null;

  const existing = id
    ? await supabase
        .schema("app")
        .from("merch")
        .select("image_url")
        .eq("id", id)
        .single()
    : null;

  if (existing?.data?.image_url) {
    image_url = existing.data.image_url;
  }

  // -------------------------
  // HANDLE FILE UPLOAD
  // -------------------------
  const file = formData.get("image_file") as File | null;

  if (file && file.size > 0) {
    const ext = file.name.split(".").pop();
    const fileName = `merch/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("merch")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return { ok: false, error: uploadError.message };
    }

    const { data } = supabase.storage.from("merch").getPublicUrl(fileName);

    image_url = data.publicUrl;
  }

  // -------------------------
  // BUILD ROW
  // -------------------------
  const sizesRaw = String(formData.get("sizes") ?? "").trim();

  const sort_order = Number(formData.get("sort_order") ?? 0);

  const row = {
    name,
    category: String(formData.get("category") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    price: Number(formData.get("price") ?? 0) || 0,
    image_url,
    sort_order, // ✅ ADD THIS
    sizes: sizesRaw
      ? sizesRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : null,
    in_stock: formData.get("in_stock") === "on",
  };

  // -------------------------
  // SAVE
  // -------------------------
  const q = id
    ? supabase.schema("app").from("merch").update(row).eq("id", id)
    : supabase.schema("app").from("merch").insert(row);

  const { error } = await q;

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/shop");
  revalidatePath("/shop");
  revalidatePath("/shop/warenkorb");
  redirect("/admin/shop");
}
export async function deleteMerch(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await db();
  await supabase.schema("app").from("merch").delete().eq("id", id);
  revalidatePath("/admin/shop");
  revalidatePath("/shop");
  revalidatePath("/shop/warenkorb");
}

// --- Teams (app.team) -------------------------------------------------------
export async function upsertTeam(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Name ist erforderlich." };

  const slugRaw = String(formData.get("slug") ?? "").trim();
  const slug = slugRaw ? slugify(slugRaw) : slugify(name);
  if (!slug) return { ok: false, error: "Slug ist erforderlich." };

  const supabase = await db();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Nicht angemeldet." };

  let photo_url: string | null = null;
  if (id) {
    const { data } = await supabase
      .schema("app")
      .from("team")
      .select("photo_url")
      .eq("id", id)
      .maybeSingle();
    photo_url = data?.photo_url ?? null;
  }

  const file = formData.get("photo_file") as File | null;
  if (file && file.size > 0) {
    const ext = file.name.split(".").pop();
    const fileName = `teams/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("branding")
      .upload(fileName, file, { contentType: file.type, upsert: false });
    if (uploadError) return { ok: false, error: uploadError.message };
    photo_url = supabase.storage.from("branding").getPublicUrl(fileName).data
      .publicUrl;
  }

  const row = {
    name,
    slug,
    category: String(formData.get("category") ?? "").trim() || null,
    coach_name: String(formData.get("coach_name") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    oefb_url: String(formData.get("oefb_url") ?? "").trim() || null,
    oefb_widget_spiele:
      String(formData.get("oefb_widget_spiele") ?? "").trim() || null,
    sort_order: Number(formData.get("sort_order") ?? 0) || 0,
    photo_url,
    hidden: formData.get("hidden") === "on",
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { error } = await supabase
      .schema("app")
      .from("team")
      .update(row)
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.schema("app").from("team").insert(row);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/admin/mannschaften");
  revalidatePath("/mannschaften");
  redirect("/admin/mannschaften");
}

export async function deleteTeam(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  const supabase = await db();
  await supabase.schema("app").from("team").delete().eq("id", id);
  revalidatePath("/admin/mannschaften");
  revalidatePath("/mannschaften");
}

// --- Club calendar (trainings / events, not ÖFB) -----------------------------
const CLUB_EVENT_TYPES = new Set([
  "training",
  "match",
  "gathering",
  "meeting",
  "tournament",
  "other",
]);

export async function upsertClubEvent(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { ok: false, error: "Titel ist erforderlich." };

  const eventType = String(formData.get("event_type") ?? "training").trim();
  if (!CLUB_EVENT_TYPES.has(eventType)) {
    return { ok: false, error: "Ungültiger Termintyp." };
  }

  const allDay = formData.get("all_day") === "on";
  const startsRaw = String(
    formData.get(allDay ? "start_date" : "starts_at") ?? "",
  ).trim();
  if (!startsRaw) {
    return { ok: false, error: "Startdatum ist erforderlich." };
  }

  const startsAt = allDay
    ? new Date(`${startsRaw}T00:00:00`).toISOString()
    : new Date(startsRaw).toISOString();
  if (Number.isNaN(new Date(startsAt).getTime())) {
    return { ok: false, error: "Ungültiges Startdatum." };
  }

  let endsAt: string | null = null;
  const endsRaw = String(
    formData.get(allDay ? "end_date" : "ends_at") ?? "",
  ).trim();
  if (endsRaw) {
    endsAt = allDay
      ? new Date(`${endsRaw}T23:59:59`).toISOString()
      : new Date(endsRaw).toISOString();
    if (Number.isNaN(new Date(endsAt).getTime())) {
      return { ok: false, error: "Ungültiges Enddatum." };
    }
    if (new Date(endsAt).getTime() < new Date(startsAt).getTime()) {
      return { ok: false, error: "Ende muss nach dem Start liegen." };
    }
  }

  const teamRaw = String(formData.get("team_id") ?? "").trim();
  const team_id =
    teamRaw === "" || teamRaw === "club" ? null : Number(teamRaw);
  if (teamRaw && teamRaw !== "club" && !Number.isFinite(team_id)) {
    return { ok: false, error: "Ungültige Mannschaft." };
  }

  const row = {
    title,
    event_type: eventType,
    team_id: Number.isFinite(team_id) ? team_id : null,
    description: String(formData.get("description") ?? "").trim() || null,
    location: String(formData.get("location") ?? "").trim() || null,
    field: String(formData.get("field") ?? "").trim() || null,
    external_url:
      normalizeExternalUrl(String(formData.get("external_url") ?? "")) || null,
    external_widget:
      String(formData.get("external_widget") ?? "").trim() || null,
    starts_at: startsAt,
    ends_at: endsAt,
    all_day: allDay,
    published: formData.get("published") === "on",
    updated_at: new Date().toISOString(),
  };

  const supabase = await db();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Nicht angemeldet." };

  if (id) {
    const { error } = await supabase
      .schema("app")
      .from("club_event")
      .update(row)
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.schema("app").from("club_event").insert(row);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/admin/termine");
  revalidatePath("/termine");
  revalidatePath("/mannschaften");
  redirect("/admin/termine");
}

export async function deleteClubEvent(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  const supabase = await db();
  await supabase.schema("app").from("club_event").delete().eq("id", id);
  revalidatePath("/admin/termine");
  revalidatePath("/termine");
  revalidatePath("/mannschaften");
}

// --- Legal / privacy settings -----------------------------------------------
export async function upsertLegalSettings(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const keys = [
    "legal_nif",
    "legal_contact_email",
    "legal_address",
    "legal_updated",
    "privacy_body",
    "legal_body",
  ];
  const rows = keys.map((key) => ({
    key,
    value: String(formData.get(key) ?? "").trim(),
    updated_at: new Date().toISOString(),
  }));

  const supabase = await db();
  const { error } = await supabase
    .schema("app")
    .from("site_settings")
    .upsert(rows, { onConflict: "key" });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/datenschutz");
  revalidatePath("/datenschutz");
  revalidatePath("/impressum");
  return { ok: true };
}

export async function upsertPrivacySettings(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const showPhotos = formData.get("public_show_player_photos") === "on";
  const supabase = await db();
  const { error } = await supabase
    .schema("app")
    .from("site_settings")
    .upsert(
      {
        key: "public_show_player_photos",
        value: showPhotos ? "true" : "false",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/datenschutz");
  revalidatePath("/mannschaften", "layout");
  return { ok: true };
}

// --- Sponsorship: plans -----------------------------------------------------

export async function upsertPlan(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Der Name ist erforderlich." };

  const featuresRaw = String(formData.get("features") ?? "");
  const row: Record<string, unknown> = {
    name,
    price: Number(formData.get("price") ?? 0) || 0,
    period: String(formData.get("period") ?? "").trim() || "Saison",
    features: featuresRaw
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean),
    highlighted: formData.get("highlighted") === "on",
  };
  if (formData.get("sort_order")) {
    row.sort_order = Number(formData.get("sort_order"));
  }

  const supabase = await db();
  const q = id
    ? supabase.schema("app").from("sponsorship_plan").update(row).eq("id", id)
    : supabase.schema("app").from("sponsorship_plan").insert(row);
  const { error } = await q;
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/sponsoring");
  revalidatePath("/sponsoring");
  redirect("/admin/sponsoring");
}

export async function deletePlan(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await db();
  await supabase.schema("app").from("sponsorship_plan").delete().eq("id", id);
  revalidatePath("/admin/sponsoring");
  revalidatePath("/sponsoring");
}

async function reorderSponsorshipItems(
  table: "sponsorship_plan" | "ad_action",
  ids: number[],
): Promise<ActionResult> {
  if (!ids.length) return { ok: true };

  const supabase = await db();
  const results = await Promise.all(
    ids.map((id, index) =>
      supabase
        .schema("app")
        .from(table)
        .update({ sort_order: index + 1 })
        .eq("id", id),
    ),
  );
  const error = results.find((r) => r.error)?.error;
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/sponsoring");
  revalidatePath("/sponsoring");
  return { ok: true };
}

export async function reorderSponsorshipPlans(ids: number[]): Promise<ActionResult> {
  return reorderSponsorshipItems("sponsorship_plan", ids);
}

// --- Sponsorship: individual ad actions -------------------------------------

export async function upsertAdAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Der Name ist erforderlich." };

  const row: Record<string, unknown> = {
    name,
    note: String(formData.get("note") ?? "").trim() || null,
    price: Number(formData.get("price") ?? 0) || 0,
  };
  if (formData.get("sort_order")) {
    row.sort_order = Number(formData.get("sort_order"));
  }

  const supabase = await db();
  const q = id
    ? supabase.schema("app").from("ad_action").update(row).eq("id", id)
    : supabase.schema("app").from("ad_action").insert(row);
  const { error } = await q;
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/sponsoring");
  revalidatePath("/sponsoring");
  redirect("/admin/sponsoring");
}

export async function deleteAdAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await db();
  await supabase.schema("app").from("ad_action").delete().eq("id", id);
  revalidatePath("/admin/sponsoring");
  revalidatePath("/sponsoring");
}

export async function reorderAdActions(ids: number[]): Promise<ActionResult> {
  return reorderSponsorshipItems("ad_action", ids);
}

// --- Sponsorship: editable text + contact (site_settings) -------------------

export async function upsertSponsorshipSettings(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const keys = [
    "sponsorship_intro_title",
    "sponsorship_intro_body",
    "sponsorship_mission_body",
    "sponsorship_contact_name",
    "sponsorship_contact_role",
    "sponsorship_contact_phone",
    "sponsorship_contact_email",
  ];
  const rows = keys.map((key) => ({
    key,
    value: String(formData.get(key) ?? "").trim(),
    updated_at: new Date().toISOString(),
  }));

  const supabase = await db();
  const { error } = await supabase
    .schema("app")
    .from("site_settings")
    .upsert(rows, { onConflict: "key" });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/sponsoring");
  revalidatePath("/sponsoring");
  return { ok: true };
}

// --- Contact messages -------------------------------------------------------

export async function toggleContactHandled(formData: FormData) {
  const id = Number(formData.get("id"));
  const handled = formData.get("handled") === "true";
  const supabase = await db();
  await supabase
    .schema("app")
    .from("contact_message")
    .update({ handled: !handled })
    .eq("id", id);
  revalidatePath("/admin/nachrichten");
}

export async function deleteContact(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await db();
  await supabase.schema("app").from("contact_message").delete().eq("id", id);
  revalidatePath("/admin/nachrichten");
}

// --- Join / membership inquiries --------------------------------------------

export async function toggleJoinHandled(formData: FormData) {
  const id = Number(formData.get("id"));
  const handled = formData.get("handled") === "true";
  const supabase = await db();
  await supabase
    .schema("app")
    .from("join_inquiry")
    .update({ handled: !handled })
    .eq("id", id);
  revalidatePath("/admin/beitritt");
}

export async function deleteJoinInquiry(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await db();
  await supabase.schema("app").from("join_inquiry").delete().eq("id", id);
  revalidatePath("/admin/beitritt");
}

// --- Branding: logo, hero image + text (site_settings) ----------------------
// Images are uploaded to Storage from the browser; only the resulting URLs are
// passed here (avoids the Server Action body size limit). For the image URL
// fields: a string sets it (""=clear); `undefined` leaves the value unchanged.
export interface BrandingSettingsInput {
  hero_eyebrow?: string;
  hero_title?: string;
  hero_title_highlight?: string;
  hero_subtitle?: string;
  hero_cta_primary_label?: string;
  hero_cta_secondary_label?: string;
  brand_logo_url?: string;
  hero_image_url?: string;
  poster_bg_url?: string;
}

export async function upsertBrandingSettings(
  input: BrandingSettingsInput,
): Promise<ActionResult> {
  const now = () => new Date().toISOString();
  const rows: { key: string; value: string; updated_at: string }[] = [];

  const textKeys: (keyof BrandingSettingsInput)[] = [
    "hero_eyebrow",
    "hero_title",
    "hero_title_highlight",
    "hero_subtitle",
    "hero_cta_primary_label",
    "hero_cta_secondary_label",
  ];
  for (const k of textKeys) {
    if (input[k] !== undefined)
      rows.push({ key: k, value: String(input[k]).trim(), updated_at: now() });
  }

  const imageKeys: (keyof BrandingSettingsInput)[] = [
    "brand_logo_url",
    "hero_image_url",
    "poster_bg_url",
  ];
  for (const k of imageKeys) {
    if (input[k] !== undefined)
      rows.push({ key: k, value: String(input[k]), updated_at: now() });
  }

  if (rows.length === 0) return { ok: true };

  const supabase = await db();
  const { error } = await supabase
    .schema("app")
    .from("site_settings")
    .upsert(rows, { onConflict: "key" });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/einstellungen");
  revalidatePath("/", "layout");
  return { ok: true };
}

// --- Club info overrides (site_settings) ------------------------------------
// Club contact overrides (name, email, phone, socials) stored in site_settings.
// the public site. An empty value clears the override (federation data wins).
const CLUB_INFO_KEYS = [
  "club_name",
  "club_address",
  "club_email",
  "club_phone",
  "club_web",
  "club_instagram",
  "club_facebook",
  "club_twitter",
] as const;

export async function upsertClubInfoSettings(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const now = new Date().toISOString();
  const rows = CLUB_INFO_KEYS.map((key) => ({
    key,
    value: String(formData.get(key) ?? "").trim(),
    updated_at: now,
  }));

  const supabase = await db();
  const { error } = await supabase
    .schema("app")
    .from("site_settings")
    .upsert(rows, { onConflict: "key" });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/einstellungen");
  revalidatePath("/", "layout");
  return { ok: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CLUB, newsUrl } from "@/lib/config";
import {
  ensureFreshIgToken,
  getIgCredentials,
  igPost,
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
  if (!title) return { ok: false, error: "El título es obligatorio." };

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
      return { ok: false, error: "No se pudo crear la noticia" };
    }

    insertedId = data.id;
  }

  // ----------------------------
  // 6. INSTAGRAM PUBLISH (OPTIONAL)
  // ----------------------------
  if (publishInstagram) {
    const postResult = await postNewsToInstagram(insertedId);

    if (!postResult.ok) {
      return { ok: false, error: "Guardado pero falló Instagram" };
    }
  }

  // ----------------------------
  // 7. CACHE + REDIRECT
  // ----------------------------
  revalidatePath("/admin/news");
  revalidatePath("/news");
  redirect("/admin/news");
}

export async function deleteNews(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await db();
  await supabase.schema("app").from("news").delete().eq("id", id);
  revalidatePath("/admin/news");
  revalidatePath("/news");
}

// --- Instagram --------------------------------------------------------------
// Uses the Instagram Login flow (graph.instagram.com). Token + business id are
// resolved/refreshed via @/lib/instagram (stored in site_settings, env seed).

function buildNewsCaption(article: {
  title: string;
  excerpt: string | null;
  body: string | null;
  slug: string | null;
}): string {
  const lines = [article.title.toUpperCase(), ""];
  const text = (article.body ?? article.excerpt ?? "").trim();
  if (text) lines.push(text, "");
  const url = newsUrl(article.slug);
  if (url) lines.push(`📰 Ganzen Beitrag lesen: ${url}`, "");
  const handle = `@${CLUB.shortName.toLowerCase().replace(/\s+/g, "")}`;
  const tag = CLUB.shortName.replace(/[^a-zA-Z0-9]/g, "");
  lines.push(`${handle}${tag ? ` #${tag}` : ""} #fussball`);
  return lines.join("\n");
}

// Publish a news article (single image or carousel) to the club's Instagram
// Business account. Images must be public URLs — the posters already live in the
// public Supabase `news` bucket, so this works out of the box.
export async function postNewsToInstagram(
  id: number,
): Promise<{ ok: boolean; error?: string; postId?: string }> {
  const supabase = await db();

  // Refresh the token if it's near expiry, then resolve the active credentials.
  const token = await ensureFreshIgToken(supabase);
  const { businessId: igId } = await getIgCredentials(supabase);
  if (!igId || !token) {
    return {
      ok: false,
      error: "Falta configurar Instagram (token / cuenta) en Ajustes.",
    };
  }

  const { data: article } = await supabase
    .schema("app")
    .from("news")
    .select("title, excerpt, body, cover_image, images, slug, published")
    .eq("id", id)
    .maybeSingle();

  if (!article) return { ok: false, error: "Noticia no encontrada." };

  // Collect public image URLs: gallery first, fall back to the cover.
  const images: string[] = (
    (article.images as string[] | null)?.length
      ? (article.images as string[])
      : article.cover_image
        ? [article.cover_image]
        : []
  ).filter(Boolean);

  if (images.length === 0) {
    return { ok: false, error: "La noticia no tiene imágenes para publicar." };
  }

  const caption = buildNewsCaption(article);

  try {
    let creationId: string;

    if (images.length === 1) {
      const media = await igPost<{ id: string }>(token, `${igId}/media`, {
        image_url: images[0],
        caption,
      });
      creationId = media.id;
    } else {
      // Carousel: a child container per image, then a parent CAROUSEL container.
      const children: string[] = [];
      for (const url of images.slice(0, 10)) {
        const child = await igPost<{ id: string }>(token, `${igId}/media`, {
          image_url: url,
          is_carousel_item: "true",
        });
        children.push(child.id);
      }
      const parent = await igPost<{ id: string }>(token, `${igId}/media`, {
        media_type: "CAROUSEL",
        caption,
        children: children.join(","),
      });
      creationId = parent.id;
    }

    const publishedMedia = await igPost<{ id: string }>(
      token,
      `${igId}/media_publish`,
      { creation_id: creationId },
    );

    // If the article was still a draft, publish it so the link in the IG caption
    // (https://.../news/<slug>) actually resolves instead of 404-ing.
    if (!article.published) {
      await supabase
        .schema("app")
        .from("news")
        .update({
          published: true,
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          instagram_post: true,
        })
        .eq("id", id);
      revalidatePath("/admin/news");
      revalidatePath("/news");
      revalidatePath(`/news/${article.slug}`);
    }

    return { ok: true, postId: publishedMedia.id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error de Instagram.",
    };
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
  if (!name) return { ok: false, error: "El nombre es obligatorio." };
  const type = String(formData.get("type") ?? "").trim();

  if (!type) {
    return { ok: false, error: "El tipo es obligatorio." };
  }

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
    type,
    logo_url,
    website: String(formData.get("website") ?? "").trim() || null,
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
  if (!name) return { ok: false, error: "El nombre es obligatorio." };

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
  redirect("/admin/shop");
}
export async function deleteMerch(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await db();
  await supabase.schema("app").from("merch").delete().eq("id", id);
  revalidatePath("/admin/shop");
  revalidatePath("/shop");
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
  if (!name) return { ok: false, error: "El nombre es obligatorio." };

  const featuresRaw = String(formData.get("features") ?? "");
  const row: Record<string, unknown> = {
    name,
    price: Number(formData.get("price") ?? 0) || 0,
    period: String(formData.get("period") ?? "").trim() || "temporada",
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

  revalidatePath("/admin/patrocinio");
  revalidatePath("/patrocinio");
  redirect("/admin/patrocinio");
}

export async function deletePlan(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await db();
  await supabase.schema("app").from("sponsorship_plan").delete().eq("id", id);
  revalidatePath("/admin/patrocinio");
  revalidatePath("/patrocinio");
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

  revalidatePath("/admin/patrocinio");
  revalidatePath("/patrocinio");
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
  if (!name) return { ok: false, error: "El nombre es obligatorio." };

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

  revalidatePath("/admin/patrocinio");
  revalidatePath("/patrocinio");
  redirect("/admin/patrocinio");
}

export async function deleteAdAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await db();
  await supabase.schema("app").from("ad_action").delete().eq("id", id);
  revalidatePath("/admin/patrocinio");
  revalidatePath("/patrocinio");
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

  revalidatePath("/admin/patrocinio");
  revalidatePath("/patrocinio");
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
// Federation (FFCV) club data can be broken/outdated. These keys override it on
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

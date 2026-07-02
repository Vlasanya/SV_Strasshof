"use server";

import { validateJoinForm } from "@/lib/join-validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export interface JoinState {
  ok: boolean;
  error?: string;
}

export async function submitJoinInquiry(
  _prev: JoinState,
  formData: FormData,
): Promise<JoinState> {
  const fields = {
    birthYear: String(formData.get("birth_year") ?? ""),
    teamId: String(formData.get("team_id") ?? ""),
    teamName: String(formData.get("team_name") ?? ""),
    childName: String(formData.get("child_name") ?? ""),
    contactName: String(formData.get("contact_name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const validationError = validateJoinForm(fields);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      error: "Das Anmeldeformular ist derzeit nicht verfügbar.",
    };
  }

  const teamIdRaw = fields.teamId.trim();
  const teamId =
    teamIdRaw && teamIdRaw !== "unsure" ? Number(teamIdRaw) : null;

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.schema("app").from("join_inquiry").insert({
      birth_year: Number(fields.birthYear),
      team_id: Number.isFinite(teamId) ? teamId : null,
      team_name: fields.teamName.trim(),
      child_name: fields.childName.trim() || null,
      contact_name: fields.contactName.trim(),
      email: fields.email.trim(),
      phone: fields.phone.trim() || null,
      message: fields.message.trim() || null,
    });

    if (error) {
      console.error("[join_inquiry]", error.message, error.code);
      if (error.code === "PGRST205" || error.message?.includes("join_inquiry")) {
        return {
          ok: false,
          error:
            "Das Anmeldeformular ist noch nicht eingerichtet. Bitte den Verein kontaktieren.",
        };
      }
      return {
        ok: false,
        error: "Anfrage konnte nicht gesendet werden. Bitte später erneut versuchen.",
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Anfrage konnte nicht gesendet werden. Bitte später erneut versuchen.",
    };
  }
}

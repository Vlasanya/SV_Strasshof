"use server";

import { validateContactForm } from "@/lib/contact-validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export interface ContactState {
  ok: boolean;
  error?: string;
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const fields = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
  };
  const validationError = validateContactForm(fields);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const name = fields.name.trim();
  const email = fields.email.trim();
  const phone = fields.phone.trim();
  const subject = fields.subject.trim();
  const message = fields.message.trim();

  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      error: "Das Kontaktformular ist derzeit nicht verfügbar.",
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .schema("app")
      .from("contact_message")
      .insert({
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        message,
      });
    if (error) {
      return {
        ok: false,
        error: "Nachricht konnte nicht gesendet werden. Bitte später erneut versuchen.",
      };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Nachricht konnte nicht gesendet werden. Bitte später erneut versuchen.",
    };
  }
}

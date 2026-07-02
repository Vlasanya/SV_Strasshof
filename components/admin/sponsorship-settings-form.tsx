"use client";

import { upsertSponsorshipSettings } from "@/app/admin/actions";
import { AdminForm, TextArea, TextField } from "@/components/admin/form-ui";
import type { SiteSettings } from "@/lib/types";

export function SponsorshipSettingsForm({ settings }: { settings: SiteSettings }) {
  const v = (k: string) => settings[k] ?? "";
  return (
    <AdminForm
      action={upsertSponsorshipSettings}
      submitLabel="Texte speichern"
      successMessage="Texte aktualisiert."
    >
      <TextField
        label="Titel «Über uns»"
        name="sponsorship_intro_title"
        defaultValue={v("sponsorship_intro_title")}
      />
      <TextArea
        label="Text «Über uns»"
        name="sponsorship_intro_body"
        rows={5}
        defaultValue={v("sponsorship_intro_body")}
      />
      <TextArea
        label="Text «Unsere Mission»"
        name="sponsorship_mission_body"
        rows={3}
        defaultValue={v("sponsorship_mission_body")}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label="Kontakt — Name"
          name="sponsorship_contact_name"
          defaultValue={v("sponsorship_contact_name")}
        />
        <TextField
          label="Kontakt — Funktion"
          name="sponsorship_contact_role"
          defaultValue={v("sponsorship_contact_role")}
        />
        <TextField
          label="Kontakt — Telefon"
          name="sponsorship_contact_phone"
          defaultValue={v("sponsorship_contact_phone")}
        />
        <TextField
          label="Kontakt — E-Mail"
          name="sponsorship_contact_email"
          defaultValue={v("sponsorship_contact_email")}
        />
      </div>
    </AdminForm>
  );
}

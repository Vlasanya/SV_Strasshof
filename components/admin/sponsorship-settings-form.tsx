"use client";

import { upsertSponsorshipSettings } from "@/app/admin/actions";
import { AdminForm, TextArea, TextField } from "@/components/admin/form-ui";
import type { SiteSettings } from "@/lib/types";

export function SponsorshipSettingsForm({ settings }: { settings: SiteSettings }) {
  const v = (k: string) => settings[k] ?? "";
  return (
    <AdminForm
      action={upsertSponsorshipSettings}
      submitLabel="Guardar textos"
      successMessage="Textos actualizados."
    >
      <TextField
        label="Título «¿Quiénes somos?»"
        name="sponsorship_intro_title"
        defaultValue={v("sponsorship_intro_title")}
      />
      <TextArea
        label="Texto «¿Quiénes somos?»"
        name="sponsorship_intro_body"
        rows={5}
        defaultValue={v("sponsorship_intro_body")}
      />
      <TextArea
        label="Texto «Nuestra misión»"
        name="sponsorship_mission_body"
        rows={3}
        defaultValue={v("sponsorship_mission_body")}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label="Contacto — nombre"
          name="sponsorship_contact_name"
          defaultValue={v("sponsorship_contact_name")}
        />
        <TextField
          label="Contacto — cargo"
          name="sponsorship_contact_role"
          defaultValue={v("sponsorship_contact_role")}
        />
        <TextField
          label="Contacto — teléfono"
          name="sponsorship_contact_phone"
          defaultValue={v("sponsorship_contact_phone")}
        />
        <TextField
          label="Contacto — email"
          name="sponsorship_contact_email"
          defaultValue={v("sponsorship_contact_email")}
        />
      </div>
    </AdminForm>
  );
}

"use client";

import { upsertLegalSettings } from "@/app/admin/actions";
import { AdminForm, TextArea, TextField } from "@/components/admin/form-ui";
import type { SiteSettings } from "@/lib/types";

export function LegalSettingsForm({ settings }: { settings: SiteSettings }) {
  const v = (k: string) => settings[k] ?? "";
  return (
    <AdminForm
      action={upsertLegalSettings}
      submitLabel="Guardar textos legales"
      successMessage="Textos legales actualizados."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="NIF / CIF del club" name="legal_nif" defaultValue={v("legal_nif")} />
        <TextField
          label="Fecha de última actualización"
          name="legal_updated"
          defaultValue={v("legal_updated")}
          placeholder="p. ej. 12/06/2026"
        />
        <TextField
          label="Email de protección de datos"
          name="legal_contact_email"
          defaultValue={v("legal_contact_email")}
          hint="Si se deja vacío se usa el email del club."
        />
        <TextField
          label="Domicilio (override)"
          name="legal_address"
          defaultValue={v("legal_address")}
          hint="Si se deja vacío se usa la dirección del club."
        />
      </div>

      <TextArea
        label="Política de privacidad — texto completo (opcional)"
        name="privacy_body"
        rows={10}
        defaultValue={v("privacy_body")}
      />
      <p className="text-xs text-muted-foreground -mt-3">
        Si lo dejas vacío se muestra el texto por defecto con los datos del club.
        Si lo rellenas, sustituye por completo el contenido de{" "}
        <code>/datenschutz</code> (se respetan los saltos de línea).
      </p>

      <TextArea
        label="Aviso legal — texto completo (opcional)"
        name="legal_body"
        rows={8}
        defaultValue={v("legal_body")}
      />
      <p className="text-xs text-muted-foreground -mt-3">
        Igual que arriba, para la página <code>/impressum</code>.
      </p>
    </AdminForm>
  );
}

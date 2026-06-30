"use client";

import { upsertPrivacySettings } from "@/app/admin/actions";
import { AdminForm, CheckboxField } from "@/components/admin/form-ui";
import type { SiteSettings } from "@/lib/types";

export function PrivacySettingsForm({ settings }: { settings: SiteSettings }) {
  return (
    <AdminForm
      action={upsertPrivacySettings}
      submitLabel="Guardar"
      successMessage="Ajustes de privacidad actualizados."
    >
      <CheckboxField
        label="Mostrar fotos de jugadores en la web pública"
        name="public_show_player_photos"
        defaultChecked={settings["public_show_player_photos"] !== "false"}
      />
      <p className="text-xs text-muted-foreground -mt-2">
        Si lo desactivas, no se mostrará ninguna foto de jugador en las páginas
        públicas (se usará el dorsal). Recomendado si no dispones de
        consentimiento de imagen, especialmente para menores.
      </p>
    </AdminForm>
  );
}

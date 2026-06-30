"use client";

import { upsertClubInfoSettings } from "@/app/admin/actions";
import { AdminForm, TextField } from "@/components/admin/form-ui";
import type { ClubInfo } from "@/lib/config";
import type { SiteSettings } from "@/lib/types";

/**
 * Overrides for the club data that normally comes from the federation (FFCV),
 * which is sometimes broken/outdated. Leaving a field empty falls back to the
 * federation value. `club` is the currently-resolved info (shown as the
 * placeholder); `settings` holds the raw overrides (prefilled into the inputs).
 */
export function ClubInfoSettingsForm({
  club,
  settings,
}: {
  club: ClubInfo;
  settings: SiteSettings;
}) {
  const v = (k: string) => settings[k] ?? "";
  const ph = (value: string | null, example: string) =>
    value && value.trim() ? `Actual: ${value}` : example;

  return (
    <AdminForm
      action={upsertClubInfoSettings}
      submitLabel="Guardar datos del club"
      successMessage="Datos del club actualizados."
    >
      <TextField
        label="Nombre del club"
        name="club_name"
        defaultValue={v("club_name")}
        placeholder={ph(club.name, "U.D. Fonteta")}
      />
      <TextField
        label="Dirección"
        name="club_address"
        defaultValue={v("club_address")}
        placeholder={ph(club.address, "Calle Palancia, 2 bajo, Valencia")}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label="Email"
          name="club_email"
          type="email"
          defaultValue={v("club_email")}
          placeholder={ph(club.email, "udfonteta@gmail.com")}
        />
        <TextField
          label="Teléfono(s)"
          name="club_phone"
          defaultValue={v("club_phone")}
          placeholder={ph(club.phone, "686496111 - 650418141")}
          hint="Puedes separar varios números con guiones."
        />
      </div>
      <TextField
        label="Instagram"
        name="club_instagram"
        defaultValue={v("club_instagram")}
        placeholder={ph(
          club.instagram ? `@${club.instagram}` : null,
          "udfonteta o https://www.instagram.com/udfonteta/",
        )}
        hint="Pega el usuario o la URL completa; se normaliza automáticamente."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label="Facebook"
          name="club_facebook"
          defaultValue={v("club_facebook")}
          placeholder={ph(club.facebook, "URL o usuario")}
        />
        <TextField
          label="Web"
          name="club_web"
          defaultValue={v("club_web")}
          placeholder={ph(club.web, "https://...")}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Estos datos provienen de la federación (FFCV) y pueden estar
        desactualizados. Lo que escribas aquí tiene prioridad en la web; deja un
        campo vacío para volver al dato de la federación.
      </p>
    </AdminForm>
  );
}

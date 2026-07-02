"use client";

import { upsertClubInfoSettings } from "@/app/admin/actions";
import { AdminForm, TextField } from "@/components/admin/form-ui";
import type { ClubInfo } from "@/lib/config";
import type { SiteSettings } from "@/lib/types";

/**
 * Overrides for club data that may be broken or outdated. Leaving a field empty
 * falls back to the federation value. `club` is the currently-resolved info
 * (shown as placeholder); `settings` holds the raw overrides.
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
    value && value.trim() ? `Aktuell: ${value}` : example;

  return (
    <AdminForm
      action={upsertClubInfoSettings}
      submitLabel="Vereinsdaten speichern"
      successMessage="Vereinsdaten aktualisiert."
    >
      <TextField
        label="Vereinsname"
        name="club_name"
        defaultValue={v("club_name")}
        placeholder={ph(club.name, "SV Strasshof")}
      />
      <TextField
        label="Adresse"
        name="club_address"
        defaultValue={v("club_address")}
        placeholder={ph(club.address, "Hauptstraße 1, 2231 Strasshof")}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label="E-Mail"
          name="club_email"
          type="email"
          defaultValue={v("club_email")}
          placeholder={ph(club.email, "office@verein.at")}
        />
        <TextField
          label="Telefon"
          name="club_phone"
          defaultValue={v("club_phone")}
          placeholder={ph(club.phone, "0664 1234567")}
          hint="Mehrere Nummern mit Bindestrich trennen."
        />
      </div>
      <TextField
        label="Instagram"
        name="club_instagram"
        defaultValue={v("club_instagram")}
        placeholder={ph(
          club.instagram ? `@${club.instagram}` : null,
          "verein oder https://www.instagram.com/verein/",
        )}
        hint="Benutzername oder vollständige URL — wird automatisch normalisiert."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label="Facebook"
          name="club_facebook"
          defaultValue={v("club_facebook")}
          placeholder={ph(club.facebook, "URL oder Benutzername")}
        />
        <TextField
          label="Website"
          name="club_web"
          defaultValue={v("club_web")}
          placeholder={ph(club.web, "https://...")}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Diese Daten können vom Verband veraltet sein. Was du hier einträgst, hat
        auf der Website Vorrang; leer lassen, um wieder den Verbandswert zu
        verwenden.
      </p>
    </AdminForm>
  );
}

"use client";

import { upsertPrivacySettings } from "@/app/admin/actions";
import { AdminForm, CheckboxField } from "@/components/admin/form-ui";
import type { SiteSettings } from "@/lib/types";

export function PrivacySettingsForm({ settings }: { settings: SiteSettings }) {
  return (
    <AdminForm
      action={upsertPrivacySettings}
      submitLabel="Speichern"
      successMessage="Datenschutz-Einstellungen aktualisiert."
    >
      <CheckboxField
        label="Spielerfotos auf der öffentlichen Website anzeigen"
        name="public_show_player_photos"
        defaultChecked={settings["public_show_player_photos"] !== "false"}
      />
      <p className="text-xs text-muted-foreground -mt-2">
        Wenn deaktiviert, werden keine Spielerfotos öffentlich gezeigt.
        Empfohlen, wenn keine Bildrechte vorliegen — besonders bei
        Jugendspielern.
      </p>
    </AdminForm>
  );
}

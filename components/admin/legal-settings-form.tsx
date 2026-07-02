"use client";

import { upsertLegalSettings } from "@/app/admin/actions";
import { AdminForm, TextArea, TextField } from "@/components/admin/form-ui";
import type { SiteSettings } from "@/lib/types";

export function LegalSettingsForm({ settings }: { settings: SiteSettings }) {
  const v = (k: string) => settings[k] ?? "";
  return (
    <AdminForm
      action={upsertLegalSettings}
      submitLabel="Rechtstexte speichern"
      successMessage="Rechtstexte aktualisiert."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="UID / Firmenbuchnummer des Vereins" name="legal_nif" defaultValue={v("legal_nif")} />
        <TextField
          label="Datum der letzten Aktualisierung"
          name="legal_updated"
          defaultValue={v("legal_updated")}
          placeholder="z. B. 12.06.2026"
        />
        <TextField
          label="E-Mail für Datenschutzanfragen"
          name="legal_contact_email"
          defaultValue={v("legal_contact_email")}
          hint="Wenn leer, wird die Vereins-E-Mail verwendet."
        />
        <TextField
          label="Anschrift (Überschreibung)"
          name="legal_address"
          defaultValue={v("legal_address")}
          hint="Wenn leer, wird die Vereinsadresse verwendet."
        />
      </div>

      <TextArea
        label="Datenschutzerklärung — vollständiger Text (optional)"
        name="privacy_body"
        rows={10}
        defaultValue={v("privacy_body")}
      />
      <p className="text-xs text-muted-foreground -mt-3">
        Wenn leer, wird der Standardtext mit den Vereinsdaten angezeigt.
        Wenn ausgefüllt, ersetzt er den Inhalt von{" "}
        <code>/datenschutz</code> vollständig (Zeilenumbrüche bleiben erhalten).
      </p>

      <TextArea
        label="Impressum — vollständiger Text (optional)"
        name="legal_body"
        rows={8}
        defaultValue={v("legal_body")}
      />
      <p className="text-xs text-muted-foreground -mt-3">
        Gleiches gilt für die Seite <code>/impressum</code>.
      </p>
    </AdminForm>
  );
}

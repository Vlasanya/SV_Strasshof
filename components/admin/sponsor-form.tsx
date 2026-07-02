"use client";

import { upsertSponsor } from "@/app/admin/actions";
import {
  AdminForm,
  CheckboxField,
  TextField,
  SelectField,
  ImageUploadField,
} from "@/components/admin/form-ui";
import type { Sponsor } from "@/lib/types";

const TIER_OPTIONS = [
  { label: "Hauptpartner", value: "Principal" },
  { label: "Offizieller Partner", value: "Oficial" },
  { label: "Kooperationspartner", value: "Colaborador" },
];

export function SponsorForm({ sponsor }: { sponsor?: Sponsor }) {
  return (
    <AdminForm action={upsertSponsor} cancelHref="/admin/sponsoren">
      {sponsor && <input type="hidden" name="id" value={sponsor.id} />}

      <TextField
        label="Name"
        name="name"
        required
        defaultValue={sponsor?.name}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField
          label="Stufe"
          name="tier"
          defaultValue={sponsor?.tier ?? "Colaborador"}
          options={TIER_OPTIONS}
        />
        <TextField
          label="Reihenfolge"
          name="sort_order"
          type="number"
          inputMode="numeric"
          defaultValue={sponsor?.sort_order?.toString() ?? ""}
          placeholder="z. B. 10"
        />
      </div>

      <ImageUploadField
        name="logo_file"
        label="Logo"
        preview={sponsor?.logo_url}
        required={!sponsor?.logo_url}
      />

      <TextField
        label="Website"
        name="website"
        defaultValue={sponsor?.website ?? ""}
        placeholder="https://…"
      />

      <TextField
        label="Google Maps"
        name="maps_url"
        defaultValue={sponsor?.maps_url ?? ""}
        placeholder="https://maps.app.goo.gl/…"
      />

      <CheckboxField
        label="Aktiv"
        name="active"
        defaultChecked={sponsor?.active ?? true}
      />
    </AdminForm>
  );
}

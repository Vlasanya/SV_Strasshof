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
        <div className="flex flex-col gap-2">
          <SelectField
            label="Stufe"
            name="tier"
            required
            defaultValue={sponsor?.tier ?? ""}
            options={[
              { label: "Bronze", value: "Bronze" },
              { label: "Silber", value: "Silber" },
              { label: "Gold", value: "Gold" },
            ]}
          />
        </div>

        <div className="flex flex-col gap-2">
          <SelectField
            label="Typ"
            name="type"
            required
            defaultValue={sponsor?.type ?? ""}
            options={[
              { label: "Saisonal", value: "Saisonal" },
              { label: "Einmalig", value: "Einmalig" },
            ]}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <ImageUploadField
          name="logo_file"
          label="Logo"
          preview={sponsor?.logo_url}
          required
        />
      </div>

      <TextField
        label="Website"
        name="website"
        defaultValue={sponsor?.website}
      />

      <CheckboxField
        label="Aktiv"
        name="active"
        defaultChecked={sponsor?.active ?? true}
      />
    </AdminForm>
  );
}

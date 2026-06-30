"use client";

import { upsertSponsor } from "@/app/admin/actions";
import {
  AdminForm,
  CheckboxField,
  TextField,
  SelectField,
  ImageUploadField,
  TextArea,
} from "@/components/admin/form-ui";
import type { Sponsor } from "@/lib/types";

export function SponsorForm({ sponsor }: { sponsor?: Sponsor }) {
  return (
    <AdminForm action={upsertSponsor} cancelHref="/admin/sponsoren">
      {sponsor && <input type="hidden" name="id" value={sponsor.id} />}

      <TextField
        label="Nombre"
        name="name"
        required
        defaultValue={sponsor?.name}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <SelectField
            label="Nivel"
            name="tier"
            required
            defaultValue={sponsor?.tier ?? ""}
            options={[
              { label: "Bronce", value: "Bronce" },
              { label: "Plata", value: "Plata" },
              { label: "Oro", value: "Oro" },
            ]}
          />
        </div>

        <div className="flex flex-col gap-2">
          <SelectField
            label="Tipo"
            name="type"
            required
            defaultValue={sponsor?.type ?? ""}
            options={[
              { label: "Estacional", value: "Estacional" },
              { label: "Único", value: "Único" },
            ]}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <ImageUploadField
          name="logo_file"
          label="Logo URL"
          preview={sponsor?.logo_url}
          required
        />
      </div>

      <TextField
        label="Sitio web"
        name="website"
        defaultValue={sponsor?.website}
      />

      <CheckboxField
        label="Activo"
        name="active"
        defaultChecked={sponsor?.active ?? true}
      />
    </AdminForm>
  );
}

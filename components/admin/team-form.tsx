"use client";

import { useState } from "react";
import { upsertTeam } from "@/app/admin/actions";
import {
  AdminForm,
  CheckboxField,
  TextArea,
  TextField,
} from "@/components/admin/form-ui";
import type { Team } from "@/lib/types";

export function TeamForm({ team }: { team?: Team }) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <AdminForm
      action={upsertTeam}
      cancelHref="/admin/mannschaften"
    >
      {team && <input type="hidden" name="id" value={team.id} />}

      <TextField
        label="Name"
        name="name"
        defaultValue={team?.name}
        required
      />

      <TextField
        label="Slug (URL, z. B. U11)"
        name="slug"
        defaultValue={team?.slug}
        placeholder="U11"
        required
      />

      <TextField
        label="Kategorie"
        name="category"
        defaultValue={team?.category ?? ""}
        placeholder="U11"
      />

      <TextField
        label="Trainer"
        name="coach_name"
        defaultValue={team?.coach_name ?? ""}
      />

      <TextField
        label="ÖFB Kader-URL (optional)"
        name="oefb_url"
        defaultValue={team?.oefb_url ?? ""}
        placeholder="https://vereine.oefb.at/.../Kader/"
      />

      <TextField
        label="Sortierung"
        name="sort_order"
        type="number"
        defaultValue={String(team?.sort_order ?? 0)}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">Teambild</label>
        <input
          type="file"
          name="photo_file"
          accept="image/*"
          className="block w-full text-sm"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setPreview(URL.createObjectURL(file));
          }}
        />
        {preview ? (
          <img
            src={preview}
            className="h-40 w-auto rounded-xl border object-cover"
            alt="Vorschau"
          />
        ) : team?.photo_url ? (
          <img
            src={team.photo_url}
            className="h-40 w-auto rounded-xl border object-cover"
            alt={team.name}
          />
        ) : null}
      </div>

      <TextArea
        label="Beschreibung"
        name="description"
        rows={4}
        defaultValue={team?.description ?? ""}
      />

      <CheckboxField
        label="Auf der öffentlichen Website ausblenden"
        name="hidden"
        defaultChecked={team?.hidden}
      />
    </AdminForm>
  );
}

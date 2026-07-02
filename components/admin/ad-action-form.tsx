"use client";

import { upsertAdAction } from "@/app/admin/actions";
import { AdminForm, TextField } from "@/components/admin/form-ui";
import type { AdAction } from "@/lib/types";

export function AdActionForm({ action }: { action?: AdAction }) {
  return (
    <AdminForm action={upsertAdAction} cancelHref="/admin/sponsoring">
      {action && <input type="hidden" name="id" value={action.id} />}
      <TextField label="Name" name="name" required defaultValue={action?.name} />
      <TextField label="Hinweis" name="note" defaultValue={action?.note} placeholder="z. B. pro Mannschaft" />
      <TextField label="Preis (€)" name="price" type="number" defaultValue={action?.price} />
    </AdminForm>
  );
}

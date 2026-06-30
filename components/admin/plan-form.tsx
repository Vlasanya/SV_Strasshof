"use client";

import { upsertPlan } from "@/app/admin/actions";
import {
  AdminForm,
  CheckboxField,
  TextArea,
  TextField,
} from "@/components/admin/form-ui";
import type { SponsorshipPlan } from "@/lib/types";

export function PlanForm({ plan }: { plan?: SponsorshipPlan }) {
  return (
    <AdminForm action={upsertPlan} cancelHref="/admin/patrocinio">
      {plan && <input type="hidden" name="id" value={plan.id} />}
      <TextField label="Nombre" name="name" required defaultValue={plan?.name} placeholder="Bronce, Plata, Oro..." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Precio (€)" name="price" type="number" defaultValue={plan?.price} />
        <TextField label="Periodo" name="period" defaultValue={plan?.period ?? "temporada"} />
      </div>
      <TextArea
        label="Características"
        name="features"
        rows={6}
        defaultValue={plan?.features?.join("\n")}
      />
      <p className="text-xs text-muted-foreground -mt-3">Una característica por línea.</p>
      <CheckboxField label="Destacado (plan recomendado)" name="highlighted" defaultChecked={plan?.highlighted} />
    </AdminForm>
  );
}

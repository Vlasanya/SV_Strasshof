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
      <TextField label="Name" name="name" required defaultValue={plan?.name} placeholder="Bronze, Silber, Gold…" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Preis (€)" name="price" type="number" defaultValue={plan?.price} />
        <TextField label="Zeitraum" name="period" defaultValue={plan?.period ?? "Saison"} />
      </div>
      <TextArea
        label="Leistungen"
        name="features"
        rows={6}
        defaultValue={plan?.features?.join("\n")}
      />
      <p className="text-xs text-muted-foreground -mt-3">Eine Leistung pro Zeile.</p>
      <CheckboxField label="Hervorgehoben (empfohlenes Paket)" name="highlighted" defaultChecked={plan?.highlighted} />
    </AdminForm>
  );
}

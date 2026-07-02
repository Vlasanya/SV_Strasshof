import { getAdActions, getSiteSettings, getSponsorshipPlans } from "@/lib/data";
import { SponsorshipSettingsForm } from "@/components/admin/sponsorship-settings-form";
import { SponsorshipPlansTable } from "@/components/admin/sponsorship-plans-table";
import { AdActionsTable } from "@/components/admin/ad-actions-table";
import { ListToolbar } from "@/components/admin/list-chrome";

export const dynamic = "force-dynamic";

export default async function AdminSponsorshipPage() {
  const [plans, actions, settings] = await Promise.all([
    getSponsorshipPlans(),
    getAdActions(),
    getSiteSettings(),
  ]);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-4">
          Texte & Kontakt
        </h2>
        <SponsorshipSettingsForm settings={settings} />
      </section>

      <section>
        <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-4">
          Sponsoring-Pakete
        </h2>
        <ListToolbar
          count={plans.length}
          noun="Pakete"
          addHref="/admin/patrocinio/planes/new"
          addLabel="Neues Paket"
        />
        <p className="mt-2 mb-3 text-xs text-muted-foreground">
          Zeilen per Drag & Drop sortieren — die Reihenfolge gilt auf der
          öffentlichen Seite.
        </p>
        <SponsorshipPlansTable
          key={plans.map((p) => p.id).join("-")}
          plans={plans}
        />
      </section>

      <section>
        <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-4">
          Einzelne Werbeaktionen
        </h2>
        <ListToolbar
          count={actions.length}
          noun="Aktionen"
          addHref="/admin/patrocinio/acciones/new"
          addLabel="Neue Aktion"
        />
        <p className="mt-2 mb-3 text-xs text-muted-foreground">
          Zeilen per Drag & Drop sortieren — die Reihenfolge gilt auf der
          öffentlichen Seite.
        </p>
        <AdActionsTable
          key={actions.map((a) => a.id).join("-")}
          actions={actions}
        />
      </section>
    </div>
  );
}

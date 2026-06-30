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
          Textos y contacto
        </h2>
        <SponsorshipSettingsForm settings={settings} />
      </section>

      <section>
        <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-4">
          Planes de colaboración
        </h2>
        <ListToolbar
          count={plans.length}
          noun="planes"
          addHref="/admin/patrocinio/planes/new"
          addLabel="Nuevo plan"
        />
        <p className="mt-2 mb-3 text-xs text-muted-foreground">
          Arrastra las filas para cambiar el orden en la página pública.
        </p>
        <SponsorshipPlansTable
          key={plans.map((p) => p.id).join("-")}
          plans={plans}
        />
      </section>

      <section>
        <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-4">
          Acciones publicitarias individuales
        </h2>
        <ListToolbar
          count={actions.length}
          noun="acciones"
          addHref="/admin/patrocinio/acciones/new"
          addLabel="Nueva acción"
        />
        <p className="mt-2 mb-3 text-xs text-muted-foreground">
          Arrastra las filas para cambiar el orden en la página pública.
        </p>
        <AdActionsTable
          key={actions.map((a) => a.id).join("-")}
          actions={actions}
        />
      </section>
    </div>
  );
}

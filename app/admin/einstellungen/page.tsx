import { getClubInfo, getSiteSettings } from "@/lib/data";
import { getIgCredentials } from "@/lib/instagram";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { BrandingSettingsForm } from "@/components/admin/branding-settings-form";
import { ClubInfoSettingsForm } from "@/components/admin/club-info-settings-form";
import {
  InstagramSettingsForm,
  type InstagramStatus,
} from "@/components/admin/instagram-settings-form";

export const dynamic = "force-dynamic";

async function getInstagramStatus(): Promise<InstagramStatus> {
  if (!hasSupabaseEnv()) {
    return { hasToken: false, businessId: "", expiresAt: null };
  }
  try {
    const supabase = await createSupabaseServerClient();
    const { token, businessId, expiresAt } = await getIgCredentials(supabase);
    return {
      hasToken: Boolean(token),
      businessId,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    };
  } catch {
    return { hasToken: false, businessId: "", expiresAt: null };
  }
}

export default async function AdminSettingsPage() {
  const [settings, club, instagram] = await Promise.all([
    getSiteSettings(),
    getClubInfo(),
    getInstagramStatus(),
  ]);

  return (
    <div className="space-y-12 max-w-2xl">
      <section>
        <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-1">
          Marca e inicio
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Personaliza el logo, la imagen de portada y los textos de la página de
          inicio.
        </p>
        <BrandingSettingsForm settings={settings} />
      </section>

      <section>
        <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-1">
          Datos del club
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Corrige la información de contacto y redes sociales que llega de la
          federación cuando esté mal o desactualizada.
        </p>
        <ClubInfoSettingsForm club={club} settings={settings} />
      </section>

      <section>
        <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-1">
          Instagram
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Club-Account für News-Posts verbinden.
        </p>
        <InstagramSettingsForm status={instagram} />
      </section>
    </div>
  );
}

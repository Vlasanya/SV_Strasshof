import { getSiteSettings } from "@/lib/data";
import { LegalSettingsForm } from "@/components/admin/legal-settings-form";

export const dynamic = "force-dynamic";

export default async function AdminPrivacyPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-8 max-w-2xl">
      <section>
        <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-4">
          Rechtliche Texte
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Impressum und Datenschutzerklärung für die öffentliche Website.
        </p>
        <LegalSettingsForm settings={settings} />
      </section>

      <section className="bg-muted/40 rounded-2xl border border-border p-5 text-sm text-muted-foreground space-y-2">
        <p className="font-semibold text-foreground">Mannschaften & ÖFB</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Kader und Spielpläne werden auf{" "}
            <strong>vereine.oefb.at</strong> geführt — verlinke die passende
            ÖFB-URL pro Mannschaft unter{" "}
            <strong>Mannschaften → Bearbeiten</strong>.
          </li>
          <li>
            Mannschaften können in der Admin-Oberfläche ausgeblendet werden,
            ohne die ÖFB-Daten zu ändern.
          </li>
        </ul>
      </section>
    </div>
  );
}

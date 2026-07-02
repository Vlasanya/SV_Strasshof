import type { Metadata } from "next";
import Link from "next/link";
import { getClubInfo, getSiteSettings } from "@/lib/data";
import { PageHeader } from "@/components/site/empty-state";

export const metadata: Metadata = {
  title: "Impressum",
  robots: { index: false, follow: true },
};

// NOTE (legal): default text is a SCAFFOLD. Club values + optional full-text
// override are managed from Admin → Datenschutz. Review legally (DSGVO) first.

const h2 =
  "font-display text-lg font-bold uppercase tracking-tight text-foreground mb-2";

export default async function LegalNoticePage() {
  const [club, settings] = await Promise.all([getClubInfo(), getSiteSettings()]);
  const name = club.name;
  const email =
    settings.legal_contact_email || club.email || "[TODO: Kontakt-E-Mail]";
  const address =
    settings.legal_address || club.address || "[TODO: Vereinsadresse]";
  const uid = settings.legal_nif || "[TODO: UID des Vereins]";
  const updated = settings.legal_updated;
  const customBody = settings.legal_body?.trim();

  if (customBody) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <PageHeader
          eyebrow="Rechtliches"
          title="Impressum"
          subtitle="Allgemeine Informationen zum Betreiber dieser Website."
        />
        <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
          {customBody}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <PageHeader
        eyebrow="Rechtliches"
        title="Impressum"
        subtitle="Allgemeine Informationen zum Betreiber dieser Website."
      />

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className={h2}>1. Medieninhaber und Herausgeber</h2>
          <p>
            <strong>{name}</strong>
            <br />
            UID: {uid}
            <br />
            Anschrift: {address}
            <br />
            E-Mail: {email}
          </p>
        </section>

        <section>
          <h2 className={h2}>2. Zweck der Website</h2>
          <p>
            Diese Website dient der Information über die sportliche Tätigkeit
            des Vereins: Mannschaften, Spiele, Ergebnisse, News, Sponsoren und
            Shop sowie der Kontaktaufnahme.
          </p>
        </section>

        <section>
          <h2 className={h2}>3. Urheberrecht und Markenrecht</h2>
          <p>
            Inhalte, Marken und Wappen gehören den jeweiligen Rechteinhabern.
            Wettbewerbsdaten stammen aus öffentlichen Quellen des
            Österreichischen Fußball-Bundes (ÖFB). Eine Vervielfältigung ohne
            Genehmigung ist untersagt.
          </p>
        </section>

        <section>
          <h2 className={h2}>4. Haftung</h2>
          <p>
            Der Verein haftet nicht für missbräuchliche Nutzung der Inhalte
            noch für Informationen aus externen Quellen. Wir bemühen uns, die
            Angaben aktuell und fehlerfrei zu halten.
          </p>
        </section>

        <section>
          <h2 className={h2}>5. Datenschutz</h2>
          <p>
            Die Verarbeitung personenbezogener Daten richtet sich nach unserer{" "}
            <Link href="/datenschutz" className="text-primary underline">
              Datenschutzerklärung
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className={h2}>6. Anwendbares Recht</h2>
          <p>
            Dieses Impressum unterliegt österreichischem Recht, insbesondere
            der DSGVO und dem DSG.
            {updated ? ` Letzte Aktualisierung: ${updated}.` : ""}
          </p>
        </section>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { getClubInfo, getSiteSettings } from "@/lib/data";
import { PageHeader } from "@/components/site/empty-state";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  robots: { index: false, follow: true },
};

// NOTE (legal): default text is a SCAFFOLD. Club-provided values (UID, contact,
// dates) and an optional full-text override are managed from Admin → Datenschutz.
// Have the final text reviewed by a data-protection professional before launch.

export default async function PrivacyPage() {
  const [club, settings] = await Promise.all([getClubInfo(), getSiteSettings()]);
  const name = club.name;
  const email =
    settings.legal_contact_email ||
    club.email ||
    "[TODO: Datenschutz-Kontakt-E-Mail]";
  const address =
    settings.legal_address || club.address || "[TODO: Vereinsadresse]";
  const uid = settings.legal_nif || "[TODO: UID des Vereins]";
  const updated = settings.legal_updated || "[TODO: Datum]";
  const customBody = settings.privacy_body?.trim();

  if (customBody) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <PageHeader
          eyebrow="Rechtliches"
          title="Datenschutzerklärung"
          subtitle="Wie wir personenbezogene Daten auf dieser Website verarbeiten."
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
        title="Datenschutzerklärung"
        subtitle="Wie wir personenbezogene Daten auf dieser Website verarbeiten."
      />

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-2">
            1. Verantwortlicher
          </h2>
          <p>
            <strong>{name}</strong> (im Folgenden &laquo;der Verein&raquo;).
            <br />
            UID: {uid}
            <br />
            Anschrift: {address}
            <br />
            Kontakt / Datenschutzanfragen: {email}
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-2">
            2. Welche Daten wir verarbeiten
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Daten von Spielerinnen und Spielern sowie Mannschaften (Name,
              Rückennummer, Kategorie, Team, Bild) in den sportlichen
              Bereichen der Website.
            </li>
            <li>
              Kontaktdaten, die Sie uns freiwillig über das Kontaktformular
              mitteilen (Name, E-Mail, Telefon, Nachricht).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-2">
            3. Zweck und Rechtsgrundlage
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Sportliche Darstellung des Vereins</strong> (Kader,
              Ergebnisse und Aktivitäten): Rechtsgrundlage ist die{" "}
              <strong>Einwilligung</strong> der Spielerinnen und Spieler bzw.
              ihrer Erziehungsberechtigten bei Minderjährigen, die der Verein
              einholt.
            </li>
            <li>
              <strong>Bearbeitung Ihrer Kontaktanfrage</strong>:
              Rechtsgrundlage ist Ihre Einwilligung beim Absenden des
              Formulars.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-2">
            4. Herkunft der Sportdaten
          </h2>
          <p>
            Ein Teil der sportlichen Informationen (Mannschaften, Spiele und
            Kader) stammt aus öffentlichen Quellen des Österreichischen
            Fußball-Bundes (ÖFB), dem der Verein angehört. Der Verein ist für
            die Veröffentlichung dieser Daten auf dieser Website verantwortlich.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-2">
            5. Minderjährige
          </h2>
          <p>
            Die Veröffentlichung von Daten und Bildern Minderjähriger erfolgt
            nur mit vorheriger Einwilligung der Erziehungsberechtigten. Sie
            können diese Einwilligung jederzeit widerrufen, indem Sie uns unter{" "}
            {email} schreiben; wir werden die betreffenden Angaben auf der
            Website entfernen.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-2">
            6. Speicherdauer
          </h2>
          <p>
            Wir speichern die Daten, solange die sportliche Zugehörigkeit
            besteht oder bis Sie die Löschung verlangen. Kontaktnachrichten
            werden so lange aufbewahrt, wie es zur Bearbeitung Ihrer Anfrage
            erforderlich ist. [TODO: Aufbewahrungsfristen mit dem Verein
            abstimmen].
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-2">
            7. Empfänger
          </h2>
          <p>
            Wir geben Ihre Daten nicht an Dritte weiter, sofern keine
            gesetzliche Verpflichtung besteht. Die Website wird bei
            Dienstleistern gehostet, die als Auftragsverarbeiter tätig werden
            (z.&nbsp;B. Hosting-Anbieter und Datenbank).
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-2">
            8. Ihre Rechte
          </h2>
          <p>
            Sie haben das Recht auf Auskunft, Berichtigung, Löschung,
            Einschränkung der Verarbeitung, Widerspruch und
            Datenübertragbarkeit. Wenden Sie sich dazu an {email}. Sie haben
            außerdem das Recht, Beschwerde bei der Österreichischen
            Datenschutzbehörde einzulegen (
            <a
              href="https://www.dsb.gv.at"
              className="text-primary underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.dsb.gv.at
            </a>
            ).
          </p>
        </section>

        <p className="text-xs italic">Letzte Aktualisierung: {updated}.</p>
      </div>
    </div>
  );
}

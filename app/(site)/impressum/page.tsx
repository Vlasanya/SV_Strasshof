import type { Metadata } from "next";
import Link from "next/link";
import { getClubInfo, getSiteSettings } from "@/lib/data";
import { PageHeader } from "@/components/site/empty-state";

export const metadata: Metadata = {
  title: "Aviso legal",
  robots: { index: false, follow: true },
};

// NOTE (legal): default text is a SCAFFOLD. Club values + optional full-text
// override are managed from Admin → Privacidad. Review legally (LSSI-CE) first.

const h2 =
  "font-display text-lg font-bold uppercase tracking-tight text-foreground mb-2";

export default async function LegalNoticePage() {
  const [club, settings] = await Promise.all([getClubInfo(), getSiteSettings()]);
  const name = club.name;
  const email =
    settings.legal_contact_email || club.email || "[TODO: email de contacto]";
  const address =
    settings.legal_address || club.address || "[TODO: domicilio del club]";
  const nif = settings.legal_nif || "[TODO: NIF/CIF del club]";
  const updated = settings.legal_updated;
  const customBody = settings.legal_body?.trim();

  if (customBody) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <PageHeader
          eyebrow="Legal"
          title="Aviso legal"
          subtitle="Información general sobre el titular de este sitio web."
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
        eyebrow="Legal"
        title="Aviso legal"
        subtitle="Información general sobre el titular de este sitio web."
      />

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className={h2}>1. Titular del sitio web</h2>
          <p>
            <strong>{name}</strong>
            <br />
            NIF/CIF: {nif}
            <br />
            Domicilio: {address}
            <br />
            Email: {email}
          </p>
        </section>

        <section>
          <h2 className={h2}>2. Objeto</h2>
          <p>
            Este sitio web tiene por finalidad informar sobre la actividad
            deportiva del Club: equipos, partidos, resultados, noticias,
            patrocinadores y tienda, así como facilitar el contacto.
          </p>
        </section>

        <section>
          <h2 className={h2}>3. Propiedad intelectual e industrial</h2>
          <p>
            Los contenidos, marcas y escudos pertenecen a sus respectivos
            titulares. Los datos de competición proceden de fuentes públicas de
            la FFCV. Queda prohibida su reproducción sin autorización.
          </p>
        </section>

        <section>
          <h2 className={h2}>4. Responsabilidad</h2>
          <p>
            El Club no se hace responsable del uso indebido de los contenidos ni
            de la información procedente de fuentes externas. Se procurará
            mantener la información actualizada y libre de errores.
          </p>
        </section>

        <section>
          <h2 className={h2}>5. Protección de datos</h2>
          <p>
            El tratamiento de datos personales se rige por nuestra{" "}
            <Link href="/datenschutz" className="text-primary underline">
              Política de privacidad
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className={h2}>6. Legislación aplicable</h2>
          <p>
            Este aviso legal se rige por la legislación española (LSSI-CE, RGPD y
            LOPDGDD).
            {updated ? ` Última actualización: ${updated}.` : ""}
          </p>
        </section>
      </div>
    </div>
  );
}

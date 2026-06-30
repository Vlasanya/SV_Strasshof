import type { Metadata } from "next";
import { getClubInfo, getSiteSettings } from "@/lib/data";
import { PageHeader } from "@/components/site/empty-state";

export const metadata: Metadata = {
  title: "Política de privacidad",
  robots: { index: false, follow: true },
};

// NOTE (legal): default text is a SCAFFOLD. Club-provided values (NIF, contact,
// dates) and an optional full-text override are managed from Admin → Privacidad.
// Have the final text reviewed by a data-protection professional before launch.

export default async function PrivacyPage() {
  const [club, settings] = await Promise.all([getClubInfo(), getSiteSettings()]);
  const name = club.name;
  const email =
    settings.legal_contact_email ||
    club.email ||
    "[TODO: email de protección de datos]";
  const address =
    settings.legal_address || club.address || "[TODO: domicilio del club]";
  const nif = settings.legal_nif || "[TODO: NIF/CIF del club]";
  const updated = settings.legal_updated || "[TODO: fecha]";
  const customBody = settings.privacy_body?.trim();

  if (customBody) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <PageHeader
          eyebrow="Legal"
          title="Política de privacidad"
          subtitle="Cómo tratamos los datos personales en esta web."
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
        title="Política de privacidad"
        subtitle="Cómo tratamos los datos personales en esta web."
      />

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-2">1. Responsable del tratamiento</h2>
          <p>
            <strong>{name}</strong> (en adelante, &laquo;el Club&raquo;).
            <br />
            NIF/CIF: {nif}
            <br />
            Domicilio: {address}
            <br />
            Contacto / Delegado de Protección de Datos: {email}
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-2">2. Datos que tratamos</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Datos de jugadores y equipos (nombre, dorsal, categoría, equipo,
              imagen) mostrados en las secciones deportivas.
            </li>
            <li>
              Datos de contacto que nos facilitas voluntariamente a través del
              formulario de contacto (nombre, email, teléfono, mensaje).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-2">3. Finalidad y base jurídica</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Difusión deportiva del Club</strong> (plantillas,
              resultados y actividad): base jurídica el{" "}
              <strong>consentimiento</strong> de los jugadores o de sus padres/
              tutores en el caso de menores, recabado por el Club.
            </li>
            <li>
              <strong>Atender tu solicitud de contacto</strong>: base jurídica
              tu consentimiento al enviar el formulario.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-2">4. Origen de los datos deportivos</h2>
          <p>
            Parte de la información deportiva (equipos, partidos y plantillas)
            procede de las fuentes públicas de la Federación de Fútbol de la
            Comunidad Valenciana (FFCV), de la que el Club es entidad afiliada.
            El Club actúa como responsable de su publicación en esta web.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-2">5. Menores de edad</h2>
          <p>
            La publicación de datos e imágenes de menores se realiza únicamente
            con el consentimiento previo de sus padres o tutores legales. Puedes
            retirar dicho consentimiento en cualquier momento escribiendo a{" "}
            {email}; procederemos a ocultar la información del menor en la web.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-2">6. Conservación</h2>
          <p>
            Conservamos los datos mientras dure la relación deportiva o hasta
            que solicites su supresión. Los mensajes de contacto se conservan el
            tiempo necesario para atender tu solicitud. [TODO: confirmar plazos
            de conservación con el Club].
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-2">7. Destinatarios</h2>
          <p>
            No cedemos tus datos a terceros salvo obligación legal. La web se
            aloja en proveedores que actúan como encargados del tratamiento
            (p. ej. el proveedor de hosting y la base de datos).
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-2">8. Tus derechos</h2>
          <p>
            Puedes ejercer tus derechos de acceso, rectificación, supresión,
            oposición, limitación y portabilidad escribiendo a {email}. También
            tienes derecho a reclamar ante la Agencia Española de Protección de
            Datos (<a href="https://www.aepd.es" className="text-primary underline" target="_blank" rel="noopener noreferrer">www.aepd.es</a>).
          </p>
        </section>

        <p className="text-xs italic">
          Última actualización: {updated}.
        </p>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { getClubInfo } from "@/lib/data";
import { ContactForm } from "@/components/site/contact-form";
import { PageHeader } from "@/components/site/empty-state";
import { ContactPhoneActions } from "@/components/site/contact-phone-actions";

export const metadata: Metadata = { title: "Contacto" };

export default async function ContactPage() {
  const club = await getClubInfo();
  const phones =
    club.phone
      ?.split(/\s*-\s*|\s*,\s*/g)
      .map((p) => p.trim())
      .filter(Boolean) ?? [];
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <PageHeader
        eyebrow="Hablemos"
        title="Contacto"
        subtitle="¿Quieres inscribirte, colaborar o tienes alguna duda? Escríbenos."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 sm:p-8">
          <ContactForm />
        </div>
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">
                  Dirección
                </p>

                {club.address ? (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      club.address,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {club.address}
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>
            </div>
            {club.email && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Email</p>
                  <a
                    href={`mailto:${club.email}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {club.email}
                  </a>
                </div>
              </div>
            )}
            {club.phone && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Teléfono
                  </p>

                  <div className="space-y-1">
                    {phones.map((phone) => {
                      const cleanPhone = phone.replace(/\s+/g, ""); // remove spaces

                      const whatsappNumber = `34${phone.replace(/\D/g, "")}`;

                      return (
                        <div
                          key={cleanPhone}
                          className="flex items-center gap-2"
                        >
                          <ContactPhoneActions
                            phone={cleanPhone}
                            whatsappNumber={whatsappNumber}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground px-1">
            ¿Quieres ejercer tus derechos de protección de datos o solicitar la
            baja de una imagen? Elige el asunto «Protección de datos / baja» o
            consulta nuestra{" "}
            <Link href="/datenschutz" className="text-primary underline">
              política de privacidad
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

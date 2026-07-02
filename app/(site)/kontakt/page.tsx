import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { getClubInfo } from "@/lib/data";
import { ContactForm } from "@/components/site/contact-form";
import { PageHeader } from "@/components/site/empty-state";
import { ContactPhoneActions } from "@/components/site/contact-phone-actions";
import { phoneDisplayList, whatsappWaMeNumber } from "@/lib/phone";

export const metadata: Metadata = { title: "Kontakt" };

export default async function ContactPage() {
  const club = await getClubInfo();
  const phones = phoneDisplayList(club.phone);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <PageHeader
        eyebrow="Kontakt"
        title="Schreib uns"
        subtitle="Anmeldung, Sponsoring oder Fragen — wir melden uns gerne zurück."
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
                <p className="text-sm font-semibold text-foreground">Adresse</p>
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
                  <p className="text-sm font-semibold text-foreground">E-Mail</p>
                  <a
                    href={`mailto:${club.email}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {club.email}
                  </a>
                </div>
              </div>
            )}
            {phones.length > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Telefon
                  </p>
                  <div className="space-y-1">
                    {phones.map((phone) => {
                      const cleanPhone = phone.replace(/\s+/g, "");
                      return (
                        <div
                          key={cleanPhone}
                          className="flex items-center gap-2"
                        >
                          <ContactPhoneActions
                            phone={cleanPhone}
                            whatsappNumber={whatsappWaMeNumber(phone)}
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
        Neu im Verein?{" "}
        <Link href="/beitritt" className="text-primary underline">
          Online anmelden
        </Link>
        {" · "}
        Datenschutzanfragen? Wähle im Formular «Datenschutz» oder lies unsere{" "}
            <Link href="/datenschutz" className="text-primary underline">
              Datenschutzerklärung
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

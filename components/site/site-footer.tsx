import Link from "next/link";
import { Shield } from "lucide-react";
import { NAV_LINKS, type ClubInfo } from "@/lib/config";
import { ContactPhoneActions } from "@/components/site/contact-phone-actions";
import { phoneDisplayList, whatsappWaMeNumber } from "@/lib/phone";

export function SiteFooter({
  club,
  logoUrl,
}: {
  club: ClubInfo;
  logoUrl?: string | null;
}) {
  return (
    <footer className="bg-surface-dark text-on-dark mt-24">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={club.name}
                  className="w-9 h-9 rounded-lg object-contain"
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="text-xl font-display uppercase tracking-wide">
                {club.name}
              </span>
            </div>
            <p className="text-sm text-on-dark-muted leading-relaxed max-w-xs">
              Fußballverein in Niederösterreich. Gemeinschaft, Fairplay und
              Nachwuchsförderung.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-on-dark-muted mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-on-dark/80 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-on-dark-muted mb-4">
              Kontakt
            </h4>
            <address className="not-italic text-sm text-on-dark/80 space-y-1.5">
              {club.address && (
                <p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      club.address,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    {club.address}
                  </a>
                </p>
              )}
              {club.email && (
                <p className="mt-3">
                  <a
                    href={`mailto:${club.email}`}
                    className="hover:text-primary transition-colors"
                  >
                    {club.email}
                  </a>
                </p>
              )}
              {club.phone && (
                <div className="mt-3 space-y-1.5">
                  {phoneDisplayList(club.phone).map((phon) => (
                    <div key={phon} className="flex gap-3">
                      <ContactPhoneActions
                        phone={phon}
                        whatsappNumber={whatsappWaMeNumber(phon)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </address>
          </div>
        </div>
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-on-dark-muted">
          <p>
            © {new Date().getFullYear()} {club.name}. Alle Rechte vorbehalten.
          </p>
          <div className="flex gap-5">
            <Link
              href="/datenschutz"
              className="hover:text-primary transition-colors"
            >
              Datenschutz
            </Link>
            <Link
              href="/impressum"
              className="hover:text-primary transition-colors"
            >
              Impressum
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

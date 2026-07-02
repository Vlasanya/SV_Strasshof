"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV_LINKS, SITE_LOGO_URL, type ClubInfo } from "@/lib/config";
import { kontaktHref } from "@/lib/contact-validation";
import { CartButton } from "@/components/shop/cart-button";
import { cn } from "@/lib/utils";

export function SiteHeader({
  club,
  logoUrl,
}: {
  club: ClubInfo;
  logoUrl?: string | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const crestUrl = logoUrl || SITE_LOGO_URL;

  return (
    <header className="sticky top-0 z-50 bg-surface-dark text-on-dark border-b border-white/10">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 2xl:px-8 h-20 flex items-center justify-between gap-3 2xl:gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 2xl:gap-3 group shrink-0 min-w-0"
          onClick={() => setMenuOpen(false)}
        >
          <img
            src={crestUrl}
            alt={club.name}
            className="h-10 w-10 2xl:h-12 2xl:w-12 object-contain shrink-0"
          />
          <div className="leading-tight min-w-0 hidden sm:block">
            <span className="block text-sm 2xl:text-base font-display tracking-wide text-on-dark uppercase truncate max-w-[7.5rem] xl:max-w-[9rem] 2xl:max-w-none">
              <span className="2xl:hidden">{club.shortName}</span>
              <span className="hidden 2xl:inline">{club.name}</span>
            </span>
            <span className="hidden 2xl:block text-[10px] text-on-dark-muted tracking-[0.2em] uppercase truncate">
              {club.tagline}
            </span>
          </div>
        </Link>

        <nav
          className="hidden xl:flex items-center justify-center gap-0 2xl:gap-0.5 flex-1 min-w-0 px-1"
          aria-label="Hauptnavigation"
        >
          {NAV_LINKS.map((link) => {
            const href =
              link.href === "/kontakt" ? kontaktHref(pathname) : link.href;
            return (
              <Link
                key={link.href}
                href={href}
                data-active={isActive(link.href)}
                className={cn(
                  "nav-underline shrink-0 px-1.5 2xl:px-3 py-2 text-[11px] 2xl:text-[13px] font-semibold uppercase tracking-wide transition-colors",
                  "max-2xl:[&::after]:left-1 max-2xl:[&::after]:right-1",
                  isActive(link.href)
                    ? "text-primary"
                    : "text-on-dark hover:text-primary",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 2xl:gap-2 shrink-0">
          <CartButton className="hidden sm:inline-flex" />
          <Link
            href="/beitritt"
            className="hidden sm:inline-flex items-center rounded-lg bg-primary px-3 2xl:px-5 py-2 2xl:py-2.5 text-[11px] 2xl:text-[13px] font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:brightness-90 whitespace-nowrap"
          >
            <span className="2xl:hidden">Beitreten</span>
            <span className="hidden 2xl:inline">Mitglied werden</span>
          </Link>
          <button
            type="button"
            className="xl:hidden p-2 rounded-lg text-on-dark hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="xl:hidden border-t border-white/10 bg-surface-dark">
          <nav
            className="max-w-[1440px] mx-auto px-4 py-3 flex flex-col gap-1"
            aria-label="Mobile Navigation"
          >
            {NAV_LINKS.map((link) => {
              const href =
                link.href === "/kontakt" ? kontaktHref(pathname) : link.href;
              return (
                <Link
                  key={link.href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "px-4 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wide transition-colors",
                    isActive(link.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-on-dark hover:bg-white/10",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <CartButton className="sm:hidden self-start mx-4 mb-1" />
            <Link
              href="/beitritt"
              onClick={() => setMenuOpen(false)}
              className="mt-2 px-4 py-2.5 rounded-lg bg-primary text-center text-sm font-semibold uppercase tracking-wide text-primary-foreground"
            >
              Mitglied werden
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

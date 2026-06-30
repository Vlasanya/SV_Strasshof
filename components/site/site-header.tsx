"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Shield } from "lucide-react";
import { NAV_LINKS, type ClubInfo } from "@/lib/config";
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

  return (
    <header className="sticky top-0 z-50 bg-surface-dark text-on-dark border-b border-white/10">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-3 group shrink-0"
          onClick={() => setMenuOpen(false)}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={club.name}
              className="w-10 h-10 rounded-lg object-contain"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="leading-tight">
            <span className="block text-base font-display tracking-wide text-on-dark uppercase">
              {club.name}
            </span>
            <span className="block text-[10px] text-on-dark-muted tracking-[0.2em] uppercase">
              {club.tagline}
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-active={isActive(link.href)}
              className={cn(
                "nav-underline px-3 py-2 text-[13px] font-semibold uppercase tracking-wide transition-colors",
                isActive(link.href)
                  ? "text-primary"
                  : "text-on-dark hover:text-primary",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/kontakt"
            className="hidden sm:inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-[13px] font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:brightness-90"
          >
            Inscripción
          </Link>
          <button
            className="lg:hidden p-2 rounded-lg text-on-dark hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menú"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-surface-dark">
          <nav className="max-w-[1280px] mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
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
            ))}
            <Link
              href="/kontakt"
              onClick={() => setMenuOpen(false)}
              className="mt-2 px-4 py-2.5 rounded-lg bg-primary text-center text-sm font-semibold uppercase tracking-wide text-primary-foreground"
            >
              Inscripción
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

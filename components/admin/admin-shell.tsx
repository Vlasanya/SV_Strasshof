"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  LogOut,
  Mail,
  Menu,
  Handshake,
  Newspaper,
  Settings,
  Shield,
  ShoppingBag,
  Star,
  Users,
} from "lucide-react";
import { signOut } from "@/app/admin/actions";
import { ConfirmProvider } from "@/components/admin/confirm";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: BarChart2, exact: true },
  { href: "/admin/news", label: "News", icon: Newspaper },
  { href: "/admin/mannschaften", label: "Mannschaften", icon: Users },
  { href: "/admin/sponsoren", label: "Sponsoren", icon: Star },
  { href: "/admin/patrocinio", label: "Patronat", icon: Handshake },
  { href: "/admin/shop", label: "Shop", icon: ShoppingBag },
  { href: "/admin/nachrichten", label: "Nachrichten", icon: Mail },
  { href: "/admin/einstellungen", label: "Einstellungen", icon: Settings },
  { href: "/admin/datenschutz", label: "Datenschutz", icon: Shield },
];

export function AdminShell({
  email,
  clubName,
  logoUrl,
  children,
}: {
  email: string;
  clubName: string;
  logoUrl?: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const current = NAV.find((n) => isActive(n.href, n.exact));

  return (
    <ConfirmProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-60 bg-sidebar flex flex-col transition-transform duration-300 md:relative md:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="px-5 py-5 border-b border-sidebar-border">
            <div className="flex items-center gap-2.5">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={clubName}
                  className="w-8 h-8 rounded-lg object-contain shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-sidebar-foreground truncate">
                  {clubName}
                </p>
                <p className="text-[10px] text-sidebar-foreground/60 truncate">
                  Admin
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
            {NAV.map(({ href, label, icon: Icon, exact }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive(href, exact)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="p-3 border-t border-sidebar-border">
            <p className="text-[10px] text-sidebar-foreground/50 truncate px-2 mb-2">
              {email}
            </p>
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground rounded-lg hover:bg-sidebar-accent/50"
              >
                <LogOut className="w-4 h-4" />
                Abmelden
              </button>
            </form>
          </div>
        </aside>

        {open && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setOpen(false)}
            aria-label="Menü schließen"
          />
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border flex items-center gap-3 px-4 md:px-6 shrink-0 bg-background">
            <button
              type="button"
              className="md:hidden p-2 -ml-2"
              onClick={() => setOpen(true)}
              aria-label="Menü"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-semibold text-sm truncate">
              {current?.label ?? "Admin"}
            </h1>
            <Link
              href="/"
              className="ml-auto text-xs text-muted-foreground hover:text-foreground"
            >
              Website →
            </Link>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </ConfirmProvider>
  );
}

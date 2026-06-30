import Link from "next/link";
import {
  ChevronRight,
  Mail,
  Newspaper,
  ShoppingBag,
  Star,
  Users,
} from "lucide-react";
import {
  getContactMessages,
  getMerch,
  getNews,
  getSponsors,
  getTeams,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [news, teams, sponsors, merch, messages] = await Promise.all([
    getNews(),
    getTeams({ includeHidden: true }),
    getSponsors(),
    getMerch(),
    getContactMessages(),
  ]);

  const unhandled = messages.data.filter((m) => !m.handled).length;

  const stats = [
    {
      label: "News",
      value: news.length,
      icon: Newspaper,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Mannschaften",
      value: teams.length,
      icon: Users,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Sponsoren",
      value: sponsors.filter((s) => s.active).length,
      icon: Star,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      label: "Shop-Artikel",
      value: merch.length,
      icon: ShoppingBag,
      color: "bg-rose-100 text-rose-600",
    },
    {
      label: "Ungelesene Nachrichten",
      value: unhandled,
      icon: Mail,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  const links = [
    { href: "/admin/news", label: "News", icon: Newspaper },
    { href: "/admin/mannschaften", label: "Mannschaften", icon: Users },
    { href: "/admin/sponsoren", label: "Sponsoren", icon: Star },
    { href: "/admin/shop", label: "Shop", icon: ShoppingBag },
    { href: "/admin/nachrichten", label: "Nachrichten", icon: Mail },
    { href: "/admin/einstellungen", label: "Einstellungen", icon: Star },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-card rounded-2xl border border-border p-5"
            >
              <div
                className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <p className="font-display text-3xl font-bold text-foreground">
                {s.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between p-5 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm text-foreground">
                  {item.label}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

import Link from "next/link";
import { Users } from "lucide-react";
import { getTeams } from "@/lib/data";
import { ListToolbar } from "@/components/admin/list-chrome";

export default async function AdminMannschaftenPage() {
  const teams = await getTeams({ includeHidden: true });

  return (
    <div>
      <ListToolbar
        count={teams.length}
        noun="Mannschaften"
        addHref="/admin/mannschaften/new"
        addLabel="Neu"
      />
      <div className="h-4" />
      {teams.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Noch keine Mannschaften. Lege die erste an oder importiere die Liste
          aus der ÖFB-Seite.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border overflow-hidden bg-card">
          {teams.map((t) => (
            <li key={t.id}>
              <Link
                href={`/admin/mannschaften/${t.id}/edit`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50"
              >
                <Users className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {t.name}
                    {t.hidden && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (ausgeblendet)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.category ?? "—"} · /{t.slug}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

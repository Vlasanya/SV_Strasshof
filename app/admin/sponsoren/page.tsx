import Link from "next/link";
import { Pencil } from "lucide-react";
import { getSponsors } from "@/lib/data";
import { deleteSponsor } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/form-ui";
import {
  ListToolbar,
  StatusBadge,
  tableWrap,
  tdClass,
  thClass,
} from "@/components/admin/list-chrome";

export const dynamic = "force-dynamic";

export default async function AdminSponsorsPage() {
  const sponsors = await getSponsors();

  return (
    <div>
      <ListToolbar
        count={sponsors.length}
        noun="Sponsoren"
        addHref="/admin/sponsoren/new"
        addLabel="Neuer Sponsor"
      />
      <div className="h-4" />
      <div className={tableWrap}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className={thClass}>Unternehmen</th>
              <th className={`${thClass} hidden sm:table-cell`}>Stufe</th>
              <th className={thClass}>Status</th>
              <th className={`${thClass} hidden md:table-cell`}>Links</th>
              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody>
            {sponsors.map((row, i) => (
              <tr
                key={row.id}
                className={`border-b border-border last:border-0 ${i % 2 ? "bg-muted/20" : ""}`}
              >
                <td className={`${tdClass} font-medium text-foreground`}>
                  {row.name}
                </td>
                <td
                  className={`${tdClass} text-muted-foreground hidden sm:table-cell`}
                >
                  {row.tier ?? "—"}
                </td>
                <td className={tdClass}>
                  <StatusBadge
                    active={row.active}
                    onLabel="Aktiv"
                    offLabel="Inaktiv"
                  />
                </td>
                <td className={`${tdClass} text-muted-foreground hidden md:table-cell`}>
                  {[row.website && "Web", row.maps_url && "Maps"]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </td>
                <td className={tdClass}>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/sponsoren/${row.id}/edit`}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                      aria-label="Bearbeiten"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                    <DeleteButton action={deleteSponsor} id={row.id} />
                  </div>
                </td>
              </tr>
            ))}
            {sponsors.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  Noch keine Sponsoren vorhanden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

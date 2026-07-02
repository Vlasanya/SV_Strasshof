import Link from "next/link";
import { Pencil } from "lucide-react";
import { getMerch } from "@/lib/data";
import { deleteMerch } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/form-ui";
import {
  ListToolbar,
  StatusBadge,
  tableWrap,
  tdClass,
  thClass,
} from "@/components/admin/list-chrome";
import { formatEuro } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminMerchPage() {
  const items = await getMerch();

  return (
    <div>
      <ListToolbar
        count={items.length}
        noun="Produkte"
        addHref="/admin/shop/new"
        addLabel="Neues Produkt"
      />
      <div className={tableWrap}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className={thClass}>Produkt</th>
              <th className={`${thClass} hidden sm:table-cell`}>Kategorie</th>
              <th className={thClass}>Preis</th>
              <th className={`${thClass} hidden md:table-cell`}>Größen</th>
              <th className={thClass}>Lager</th>
              <th className={thClass}>Position</th>
              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, i) => (
              <tr
                key={row.id}
                className={`border-b border-border last:border-0 ${i % 2 ? "bg-muted/20" : ""}`}
              >
                <td className={tdClass}>
                  <div className="flex items-center gap-3">
                    {row.image_url && (
                      <img
                        src={row.image_url}
                        alt={row.name}
                        className="w-9 h-9 rounded-lg object-cover bg-muted shrink-0"
                      />
                    )}
                    <span className="font-medium text-foreground truncate max-w-[160px]">
                      {row.name}
                    </span>
                  </div>
                </td>
                <td
                  className={`${tdClass} text-muted-foreground hidden sm:table-cell`}
                >
                  {row.category ?? "—"}
                </td>
                <td className={`${tdClass} font-semibold text-foreground`}>
                  {formatEuro(row.price)}
                </td>
                <td
                  className={`${tdClass} text-muted-foreground hidden md:table-cell`}
                >
                  {row.sizes?.length ? row.sizes.join(", ") : "—"}
                </td>
                <td className={tdClass}>
                  <StatusBadge
                    active={row.in_stock}
                    onLabel="Verfügbar"
                    offLabel="Ausverkauft"
                  />
                </td>
                <td className={tdClass}>{row.sort_order ?? 0}</td>
                <td className={tdClass}>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/shop/${row.id}/edit`}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                      aria-label="Bearbeiten"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                    <DeleteButton action={deleteMerch} id={row.id} />
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  Noch keine Produkte vorhanden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

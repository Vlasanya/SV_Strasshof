"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { reorderAdActions, deleteAdAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/form-ui";
import { SortableAdminTable } from "@/components/admin/sortable-admin-table";
import { tdClass } from "@/components/admin/list-chrome";
import type { AdAction } from "@/lib/types";
import { formatEuro } from "@/lib/utils";

export function AdActionsTable({ actions }: { actions: AdAction[] }) {
  return (
    <SortableAdminTable
      items={actions}
      onReorder={reorderAdActions}
      emptyColSpan={3}
      emptyMessage="Noch keine Aktionen."
      columns={[
        {
          header: "Aktion",
          cellClassName: `${tdClass} font-medium text-foreground`,
          cell: (a) => a.name,
        },
        {
          header: "Hinweis",
          headerClassName: "text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell",
          cellClassName: `${tdClass} text-muted-foreground hidden sm:table-cell`,
          cell: (a) => a.note ?? "—",
        },
        {
          header: "Preis",
          cellClassName: `${tdClass} font-semibold text-foreground whitespace-nowrap`,
          cell: (a) => formatEuro(a.price),
        },
      ]}
      renderActions={(a) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/patrocinio/acciones/${a.id}/edit`}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Bearbeiten"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>
          <DeleteButton action={deleteAdAction} id={a.id} />
        </div>
      )}
    />
  );
}

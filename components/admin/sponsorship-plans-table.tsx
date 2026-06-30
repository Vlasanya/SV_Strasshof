"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import {
  reorderSponsorshipPlans,
  deletePlan,
} from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/form-ui";
import { SortableAdminTable } from "@/components/admin/sortable-admin-table";
import { StatusBadge, tdClass } from "@/components/admin/list-chrome";
import type { SponsorshipPlan } from "@/lib/types";
import { formatEuro } from "@/lib/utils";

export function SponsorshipPlansTable({ plans }: { plans: SponsorshipPlan[] }) {
  return (
    <SortableAdminTable
      items={plans}
      onReorder={reorderSponsorshipPlans}
      emptyColSpan={4}
      emptyMessage="No hay planes todavía."
      columns={[
        {
          header: "Plan",
          cellClassName: `${tdClass} font-medium text-foreground`,
          cell: (p) => p.name,
        },
        {
          header: "Precio",
          cellClassName: `${tdClass} font-semibold text-foreground whitespace-nowrap`,
          cell: (p) => (
            <>
              {formatEuro(p.price)}{" "}
              <span className="text-xs font-normal text-muted-foreground">/{p.period}</span>
            </>
          ),
        },
        {
          header: "Características",
          headerClassName: "text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell",
          cellClassName: `${tdClass} text-muted-foreground hidden sm:table-cell`,
          cell: (p) => `${p.features.length} ítems`,
        },
        {
          header: "Destacado",
          cell: (p) => <StatusBadge active={p.highlighted} onLabel="Sí" offLabel="No" />,
        },
      ]}
      renderActions={(p) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/patrocinio/planes/${p.id}/edit`}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Editar"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>
          <DeleteButton action={deletePlan} id={p.id} />
        </div>
      )}
    />
  );
}

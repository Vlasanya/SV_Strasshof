import Link from "next/link";
import { Plus } from "lucide-react";

export function ListToolbar({
  count,
  noun,
  addHref,
  addLabel,
}: {
  count: number;
  noun: string;
  addHref?: string;
  addLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between ">
      <p className="text-sm text-muted-foreground">
        {count} {noun}
      </p>
      {addHref && (
        <Link
          href={addHref}
          className="inline-flex items-center gap-2 bg-primary hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> {addLabel}
        </Link>
      )}
    </div>
  );
}

export function StatusBadge({
  active,
  onLabel,
  offLabel,
}: {
  active: boolean;
  onLabel: string;
  offLabel: string;
}) {
  return (
    <span
      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
        active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      {active ? onLabel : offLabel}
    </span>
  );
}

export const tableWrap =
  "bg-card rounded-2xl border border-border overflow-hidden overflow-x-auto";
export const thClass =
  "text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide";
export const tdClass = "px-4 py-3";

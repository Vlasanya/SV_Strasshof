"use client";

import { GripVertical } from "lucide-react";
import type { ReactNode } from "react";
import { tableWrap, tdClass, thClass } from "@/components/admin/list-chrome";
import { useSortableList } from "@/components/admin/use-sortable-list";
import type { ActionResult } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

type Column<T> = {
  header: string;
  headerClassName?: string;
  cellClassName?: string;
  cell: (item: T) => ReactNode;
};

export function SortableAdminTable<T extends { id: number }>({
  items,
  onReorder,
  columns,
  renderActions,
  emptyColSpan,
  emptyMessage,
}: {
  items: T[];
  onReorder: (ids: number[]) => Promise<ActionResult>;
  columns: Column<T>[];
  renderActions: (item: T) => ReactNode;
  emptyColSpan: number;
  emptyMessage: string;
}) {
  const {
    items: sorted,
    dragIndex,
    overIndex,
    pending,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  } = useSortableList(items, onReorder);

  const colSpan = emptyColSpan + 2;

  return (
    <div className={cn(tableWrap, pending && "opacity-70 pointer-events-none")}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className={`${thClass} w-10`} aria-label="Orden" />
            {columns.map((col) => (
              <th key={col.header} className={col.headerClassName ?? thClass}>
                {col.header}
              </th>
            ))}
            <th className={thClass} />
          </tr>
        </thead>
        <tbody>
          {sorted.map((item, index) => (
            <tr
              key={item.id}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "border-b border-border last:border-0 transition-colors",
                index % 2 ? "bg-muted/20" : "",
                dragIndex === index && "opacity-40",
                overIndex === index && "bg-primary/10 ring-2 ring-inset ring-primary/30",
              )}
            >
              <td className={`${tdClass} w-10`}>
                <button
                  type="button"
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  className="cursor-grab p-1 text-muted-foreground hover:text-foreground active:cursor-grabbing"
                  aria-label="Arrastrar para reordenar"
                >
                  <GripVertical className="h-4 w-4" />
                </button>
              </td>
              {columns.map((col) => (
                <td key={col.header} className={col.cellClassName ?? tdClass}>
                  {col.cell(item)}
                </td>
              ))}
              <td className={tdClass}>{renderActions(item)}</td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={colSpan} className="px-4 py-10 text-center text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

"use client";

/**
 * Generic, dependency-free admin data table with clickable column sorting and
 * per-column filter inputs. Columns are described declaratively (serializable),
 * so server components can pass a column spec + plain row objects.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { DateRangePicker } from "@/components/admin/date-range-picker";
import { tableWrap, tdClass, thClass } from "@/components/admin/list-chrome";

export interface DataColumn {
  key: string;
  header: string;
  type?: "text" | "number" | "date"; // affects sort + filter parsing (default text)
  align?: "left" | "right"; // default left
  className?: string; // extra th/td classes (e.g. responsive hiding)
  bold?: boolean; // emphasize value
  muted?: boolean; // muted-foreground value
  nowrap?: boolean;
  signed?: boolean; // render +N for positive numbers
  /** Link template, e.g. "/admin/analitica/jugador/{player_id}" ({field} → row value). */
  linkHref?: string;
  sortable?: boolean; // default true
  filterable?: boolean; // default true
  /**
   * Filter control: "select" (dropdown of distinct values) or "text" (search /
   * numeric comparator). Defaults to "text" for number columns and "select" for
   * text columns. Use "text" for high-cardinality text columns (e.g. names).
   */
  filter?: "select" | "text";
}

type Row = Record<string, unknown>;
type SortDir = "asc" | "desc";

function filterMode(col: DataColumn): "select" | "text" {
  return (
    col.filter ??
    (col.type === "number" || col.type === "date" ? "text" : "select")
  );
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function format(col: DataColumn, v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (col.type === "date") return formatDate(String(v));
  if (col.type === "number" && col.signed) {
    const n = num(v);
    return n > 0 ? `+${n}` : String(n);
  }
  return String(v);
}

function matchFilter(col: DataColumn, value: unknown, filter: string): boolean {
  const f = filter.trim();
  if (!f) return true;
  if (col.type === "number") {
    const m = f.match(/^(>=|<=|>|<|=)?\s*(-?\d+(?:\.\d+)?)$/);
    if (m) {
      const op = m[1] || "=";
      const n = Number(m[2]);
      const v = num(value);
      switch (op) {
        case ">":
          return v > n;
        case "<":
          return v < n;
        case ">=":
          return v >= n;
        case "<=":
          return v <= n;
        default:
          return v === n;
      }
    }
  }
  return String(value ?? "")
    .toLowerCase()
    .includes(f.toLowerCase());
}

export function DataTable<T extends object>({
  columns,
  rows: rowsProp,
  rowKey,
  initialSort,
  selectable = false,
  onSelectionChange,
}: {
  columns: DataColumn[];
  rows: readonly T[];
  rowKey?: string[];
  initialSort?: { key: string; dir: SortDir };
  /** Show a leading checkbox column for row selection. Requires rowKey. */
  selectable?: boolean;
  /** Called with the currently-selected rows (in original order). */
  onSelectionChange?: (rows: T[]) => void;
}) {
  // Concrete interfaces lack an index signature; treat rows as keyed records.
  const rows = rowsProp as readonly Row[];
  const [sort, setSort] = useState<{ key: string; dir: SortDir } | null>(
    initialSort ?? null,
  );
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateFilters, setDateFilters] = useState<
    Record<string, { from: string; to: string }>
  >({});
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const stableKey = (row: Row) =>
    (rowKey?.length ? rowKey : Object.keys(row))
      .map((k) => String(row[k] ?? ""))
      .join("-");

  const anyFilterable = columns.some((c) => c.filterable !== false);

  // Distinct values for select-style filter columns.
  const options = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const col of columns) {
      if (col.filterable === false || filterMode(col) !== "select") continue;
      const set = new Set<string>();
      for (const row of rows) {
        const v = row[col.key];
        if (v !== null && v !== undefined && v !== "") set.add(String(v));
      }
      map[col.key] = [...set].sort((a, b) =>
        a.localeCompare(b, "es", { numeric: true }),
      );
    }
    return map;
  }, [columns, rows]);

  const view = useMemo(() => {
    const filtered = rows.filter((row) =>
      columns.every((col) => {
        if (col.filterable === false) return true;
        if (col.type === "date") {
          const r = dateFilters[col.key];
          if (!r || (!r.from && !r.to)) return true;
          const raw = row[col.key];
          if (!raw) return false;
          const d = String(raw).slice(0, 10);
          if (r.from && d < r.from) return false;
          if (r.to && d > r.to) return false;
          return true;
        }
        const f = filters[col.key];
        if (!f) return true;
        if (filterMode(col) === "select")
          return String(row[col.key] ?? "") === f;
        return matchFilter(col, row[col.key], f);
      }),
    );
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      const dir = sort.dir === "asc" ? 1 : -1;
      filtered.sort((a, b) => {
        const av = a[sort.key];
        const bv = b[sort.key];
        if (col?.type === "number") return (num(av) - num(bv)) * dir;
        if (col?.type === "date") {
          const at = av ? Date.parse(String(av)) : 0;
          const bt = bv ? Date.parse(String(bv)) : 0;
          return (at - bt) * dir;
        }
        return (
          String(av ?? "").localeCompare(String(bv ?? ""), "es", {
            numeric: true,
          }) * dir
        );
      });
    }
    return filtered;
  }, [rows, columns, filters, dateFilters, sort]);

  const selectedRows = useMemo(
    () => rows.filter((r) => selected.has(stableKey(r))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, selected],
  );

  const onSelChangeRef = useRef(onSelectionChange);
  onSelChangeRef.current = onSelectionChange;
  useEffect(() => {
    onSelChangeRef.current?.(selectedRows as unknown as T[]);
  }, [selectedRows]);

  const viewKeys = view.map(stableKey);
  const allViewSelected =
    viewKeys.length > 0 && viewKeys.every((k) => selected.has(k));

  function toggleRow(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleAllView() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allViewSelected) viewKeys.forEach((k) => next.delete(k));
      else viewKeys.forEach((k) => next.add(k));
      return next;
    });
  }

  function toggleSort(col: DataColumn) {
    if (col.sortable === false) return;
    setSort((prev) => {
      if (prev?.key === col.key) {
        return { key: col.key, dir: prev.dir === "asc" ? "desc" : "asc" };
      }
      return {
        key: col.key,
        dir: col.type === "number" || col.type === "date" ? "desc" : "asc",
      };
    });
  }

  const keyOf = (row: Row, i: number) =>
    rowKey?.length
      ? rowKey.map((k) => String(row[k] ?? "")).join("-")
      : String(i);

  return (
    <div className={tableWrap}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            {selectable && (
              <th className={cn(thClass, "w-10")}>
                <input
                  type="checkbox"
                  aria-label="Seleccionar todo"
                  checked={allViewSelected}
                  onChange={toggleAllView}
                  className="h-4 w-4 cursor-pointer accent-primary align-middle"
                />
              </th>
            )}
            {columns.map((col) => {
              const active = sort?.key === col.key;
              const alignRight = col.align === "right";
              return (
                <th
                  key={col.key}
                  className={cn(
                    thClass,
                    col.className,
                    alignRight && "text-right",
                  )}
                >
                  {col.sortable === false ? (
                    col.header
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleSort(col)}
                      className={cn(
                        "inline-flex items-center gap-1 hover:text-foreground transition-colors",
                        alignRight && "flex-row-reverse",
                        active && "text-foreground",
                      )}
                    >
                      {col.header}
                      {active ? (
                        sort!.dir === "asc" ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )
                      ) : (
                        <ChevronsUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </button>
                  )}
                </th>
              );
            })}
          </tr>
          {anyFilterable && (
            <tr className="border-b border-border bg-muted/20">
              {selectable && <th className="w-10" />}
              {columns.map((col) => {
                const inputClass =
                  "w-full min-w-16 rounded-md border border-border bg-input-background px-2 py-1 text-xs font-normal text-foreground focus:outline-none focus:ring-1 focus:ring-ring";
                return (
                  <th
                    key={col.key}
                    className={cn("px-4 py-2 align-top", col.className)}
                  >
                    {col.filterable === false ? null : col.type === "date" ? (
                      <DateRangePicker
                        ariaLabel={`${col.header} — rango de fechas`}
                        value={
                          dateFilters[col.key] ?? { from: "", to: "" }
                        }
                        onChange={(range) =>
                          setDateFilters((d) => ({
                            ...d,
                            [col.key]: range,
                          }))
                        }
                      />
                    ) : filterMode(col) === "select" ? (
                      <select
                        value={filters[col.key] ?? ""}
                        onChange={(e) =>
                          setFilters((f) => ({
                            ...f,
                            [col.key]: e.target.value,
                          }))
                        }
                        className={cn(
                          inputClass,
                          !filters[col.key] && "text-muted-foreground/80",
                        )}
                      >
                        <option value="">Todos</option>
                        {options[col.key]?.map((o) => (
                          <option key={o} value={o} className="text-foreground">
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={filters[col.key] ?? ""}
                        onChange={(e) =>
                          setFilters((f) => ({
                            ...f,
                            [col.key]: e.target.value,
                          }))
                        }
                        placeholder={col.type === "number" ? "> 5" : "Filtrar"}
                        className={cn(
                          inputClass,
                          "placeholder:text-muted-foreground/60",
                        )}
                      />
                    )}
                  </th>
                );
              })}
            </tr>
          )}
        </thead>
        <tbody>
          {view.map((row, i) => {
            const rkey = keyOf(row, i);
            const isSel = selectable && selected.has(rkey);
            return (
              <tr
                key={rkey}
                className={cn(
                  "border-b border-border last:border-0",
                  i % 2 && "bg-muted/20",
                  isSel && "bg-primary/5",
                )}
              >
                {selectable && (
                  <td className={cn(tdClass, "w-10")}>
                    <input
                      type="checkbox"
                      aria-label="Seleccionar fila"
                      checked={selected.has(rkey)}
                      onChange={() => toggleRow(rkey)}
                      className="h-4 w-4 cursor-pointer accent-primary align-middle"
                    />
                  </td>
                )}
                {columns.map((col) => {
                  const raw = row[col.key];
                  const text = format(col, raw);
                  const href =
                    col.linkHref && raw != null
                      ? col.linkHref.replace(/\{(\w+)\}/g, (_, k) =>
                          String(row[k] ?? ""),
                        )
                      : null;
                  return (
                    <td
                      key={col.key}
                      className={cn(
                        tdClass,
                        col.className,
                        col.align === "right" && "text-right",
                        col.bold && "font-semibold text-foreground",
                        col.muted && "text-muted-foreground",
                        col.nowrap && "whitespace-nowrap",
                      )}
                    >
                      {href ? (
                        <Link
                          href={href}
                          className="text-primary hover:underline"
                        >
                          {text}
                        </Link>
                      ) : (
                        text
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {view.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-4 py-6 text-center text-muted-foreground"
              >
                Sin resultados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

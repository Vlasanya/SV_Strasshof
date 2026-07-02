"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Share2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { deleteNews, postNewsToInstagram } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/form-ui";
import { useConfirm } from "@/components/admin/confirm";
import { Check } from "lucide-react";
import {
  StatusBadge,
  tableWrap,
  tdClass,
  thClass,
} from "@/components/admin/list-chrome";
import type { NewsArticle } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

type StatusFilter = "all" | "published" | "draft";

function InstagramButton({ id }: { id: number }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const confirm = useConfirm();

  function publish() {
    void (async () => {
      const ok = await confirm({
        title: "Auf Instagram veröffentlichen",
        description: "Diesen Beitrag auf Instagram veröffentlichen?",
        confirmLabel: "Veröffentlichen",
      });
      if (!ok) return;
      start(async () => {
        const res = await postNewsToInstagram(id);
        if (res.ok) {
          setDone(true);
          toast.success("Auf Instagram veröffentlicht");
        } else {
          toast.error(res.error ?? "Veröffentlichen fehlgeschlagen");
        }
      });
    })();
  }

  return (
    <button
      type="button"
      onClick={publish}
      disabled={pending || done}
      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50"
      aria-label="Auf Instagram veröffentlichen"
      title={done ? "Auf Instagram veröffentlicht" : "Auf Instagram veröffentlichen"}
    >
      <Share2 className="w-3.5 h-3.5" />
    </button>
  );
}

function sortDate(a: NewsArticle): number {
  return new Date(a.published_at ?? a.created_at).getTime();
}

export function NewsAdminTable({ news }: { news: NewsArticle[] }) {
  const [filter, setFilter] = useState<StatusFilter>("all");

  const counts = useMemo(
    () => ({
      all: news.length,
      published: news.filter((n) => n.published).length,
      draft: news.filter((n) => !n.published).length,
    }),
    [news],
  );

  const rows = useMemo(() => {
    const filtered = news.filter((n) =>
      filter === "all"
        ? true
        : filter === "published"
          ? n.published
          : !n.published,
    );
    return [...filtered].sort((a, b) => sortDate(b) - sortDate(a)); // newest first
  }, [news, filter]);

  const tabs: { id: StatusFilter; label: string; count: number }[] = [
    { id: "all", label: "Alle", count: counts.all },
    { id: "published", label: "Veröffentlicht", count: counts.published },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFilter(t.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors",
              filter === t.id
                ? "bg-primary text-white"
                : "border border-border bg-white text-foreground hover:bg-muted",
            )}
          >
            {t.label}
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs",
                filter === t.id
                  ? "bg-white/20"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      <div className={tableWrap}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className={thClass}>Titel</th>
              <th className={`${thClass} hidden sm:table-cell`}>Kategorie</th>
              <th className={`${thClass} hidden md:table-cell`}>Datum</th>

              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.id}
                className={`border-b border-border last:border-0 ${i % 2 ? "bg-muted/20" : ""}`}
              >
                <td
                  className={`${tdClass} font-medium text-foreground max-w-xs truncate`}
                >
                  {row.title}
                </td>
                <td
                  className={`${tdClass} text-muted-foreground hidden sm:table-cell`}
                >
                  {row.category ?? "—"}
                </td>
                <td
                  className={`${tdClass} text-muted-foreground hidden md:table-cell`}
                >
                  {formatDate(row.published_at ?? row.created_at)}
                </td>

                <td className={tdClass}>
                  <div className="flex items-center gap-2">
                    {row.instagram_posted && (
                      <Check className="w-3.5 h-3.5 text-green-500 bg-green-100 rounded-full " />
                    )}
                    <InstagramButton id={row.id} />
                    <Link
                      href={`/admin/news/${row.id}/edit`}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                      aria-label="Bearbeiten"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                    <DeleteButton action={deleteNews} id={row.id} />
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  Keine Beiträge in dieser Ansicht.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

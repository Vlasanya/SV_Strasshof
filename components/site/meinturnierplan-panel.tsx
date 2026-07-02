import { ExternalLink, Trophy } from "lucide-react";
import {
  isAllowedMeinTurnierplanWidgetHtml,
  isMeinTurnierplanUrl,
  MEINTURNIERPLAN_WIDGET_HELP_URL,
} from "@/lib/meinturnierplan";
import { ExternalWidgetEmbed } from "@/components/site/external-widget-embed";

export function MeinTurnierplanPanel({
  url,
  widget,
  title,
}: {
  url: string | null | undefined;
  widget: string | null | undefined;
  title?: string;
}) {
  const pageUrl = url?.trim() || null;
  const embed =
    widget && isAllowedMeinTurnierplanWidgetHtml(widget) ? widget : null;

  if (!pageUrl && !embed) return null;

  const isMtp = pageUrl ? isMeinTurnierplanUrl(pageUrl) : true;

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5" />
          {isMtp ? "MeinTurnierplan" : "Externer Spielplan"}
          {title ? ` · ${title}` : ""}
        </p>
        {pageUrl && (
          <a
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            Vollansicht öffnen
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {embed ? (
        <ExternalWidgetEmbed html={embed} />
      ) : pageUrl ? (
        <div className="text-center py-4">
          <p className="text-sm text-on-dark-muted mb-3">
            Live-Spielplan und Tabellen auf MeinTurnierplan.
          </p>
          <a
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold"
          >
            Turnierplan öffnen
            <ExternalLink className="w-4 h-4" />
          </a>
          {isMtp && (
            <p className="text-xs text-on-dark-muted mt-3">
              Widget einbetten:{" "}
              <a
                href={MEINTURNIERPLAN_WIDGET_HELP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Anleitung MeinTurnierplan
              </a>
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

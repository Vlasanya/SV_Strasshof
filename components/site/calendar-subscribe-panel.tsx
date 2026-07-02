"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, ChevronDown, Copy, Smartphone } from "lucide-react";
import { toast } from "sonner";
import {
  calendarFeedUrl,
  calendarProviderLabel,
  calendarSubscribeUrl,
  detectCalendarProvider,
  teamFilterToSubscribeScope,
  type CalendarProvider,
} from "@/lib/calendar-subscribe";
import type { Team } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CalendarSubscribePanel({
  teams,
  teamFilter,
  clubName,
}: {
  teams: Team[];
  teamFilter: string;
  clubName: string;
}) {
  const [origin, setOrigin] = useState("");
  const [provider, setProvider] = useState<CalendarProvider>("google");
  const [manualOpen, setManualOpen] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
    setProvider(detectCalendarProvider());
  }, []);

  const scope = useMemo(
    () => teamFilterToSubscribeScope(teamFilter, teams),
    [teamFilter, teams],
  );

  const feedUrl = origin ? calendarFeedUrl(origin, scope) : "";
  const subscribeUrl = feedUrl ? calendarSubscribeUrl(feedUrl, provider) : "";
  const providerName = calendarProviderLabel(provider);
  const isLocalhost =
    origin.includes("localhost") || origin.includes("127.0.0.1");

  const scopeHint =
    scope.kind === "all"
      ? "Alle Vereinstermine und ÖFB-Spiele"
      : scope.kind === "club"
        ? "Nur Termine für den Gesamtverein"
        : scope.kind === "team"
          ? `Nur ${teams.find((t) => t.slug === scope.slug)?.name ?? scope.slug}`
          : `Ausgewählte Mannschaften (${scope.slugs.length})`;

  async function copyLink() {
    if (!feedUrl) return;
    try {
      await navigator.clipboard.writeText(feedUrl);
      toast.success("Kalender-Link kopiert.");
    } catch {
      toast.error("Link konnte nicht kopiert werden.");
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-surface-dark p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-on-dark">
            <Smartphone className="h-5 w-5 text-primary shrink-0" />
            <h2 className="font-display text-lg font-bold">Kalender aufs Handy</h2>
          </div>
          <p className="mt-1 text-sm text-on-dark-muted">
            Termine automatisch in {providerName} —{" "}
            <span className="text-on-dark">{scopeHint}</span>.
          </p>
        </div>
      </div>

      <div className="mt-4">
        {subscribeUrl ? (
          <a
            href={subscribeUrl}
            {...(provider === "google"
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5",
              "text-sm font-semibold transition-colors",
              "bg-primary text-primary-foreground hover:brightness-90",
            )}
          >
            <CalendarPlus className="h-4 w-4" />
            In {providerName} abonnieren
          </a>
        ) : null}

        {isLocalhost ? (
          <p className="mt-3 text-xs text-on-dark-muted">
            Auf localhost funktioniert Google Kalender nicht — bitte die
            Live-Seite verwenden oder Apple Kalender (Safari) testen.
          </p>
        ) : null}
      </div>

      <div className="mt-4 border-t border-white/10 pt-3">
        <button
          type="button"
          onClick={() => setManualOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 text-left text-sm font-medium text-on-dark-muted hover:text-on-dark"
        >
          Andere App oder manuell einrichten
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 transition-transform",
              manualOpen && "rotate-180",
            )}
          />
        </button>

        {manualOpen ? (
          <div className="mt-3 space-y-3 text-sm text-on-dark-muted">
            <p>
              Link für Google Kalender oder Apple Kalender (Einstellungen → Per
              URL):
            </p>
            {feedUrl ? (
              <p className="text-xs break-all rounded-lg border border-white/10 bg-surface-dark-2 px-3 py-2 text-on-dark">
                {feedUrl}
              </p>
            ) : null}
            <button
              type="button"
              onClick={copyLink}
              disabled={!feedUrl}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline disabled:opacity-50"
            >
              <Copy className="h-4 w-4" />
              Link kopieren
            </button>
            <p className="text-xs">
              Kalender von {clubName} aktualisiert sich alle paar Stunden
              automatisch.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

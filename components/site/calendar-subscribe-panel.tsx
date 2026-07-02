"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import {
  CalendarPlus,
  ChevronDown,
  Copy,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import {
  calendarFeedUrl,
  detectSubscribePlatform,
  googleCalendarSubscribeUrl,
  teamFilterToSubscribeScope,
  webcalSubscribeUrl,
  type SubscribePlatform,
} from "@/lib/calendar-subscribe";
import type { Team } from "@/lib/types";
import { cn } from "@/lib/utils";

function actionButtonClass(primary = false) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
    primary
      ? "bg-primary text-primary-foreground hover:brightness-90"
      : "border border-white/20 text-on-dark hover:border-primary/50 hover:text-primary",
  );
}

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
  const [platform, setPlatform] = useState<SubscribePlatform>("other");
  const [showQr, setShowQr] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
    setPlatform(detectSubscribePlatform());
  }, []);

  const scope = useMemo(
    () => teamFilterToSubscribeScope(teamFilter, teams),
    [teamFilter, teams],
  );

  const feedUrl = origin ? calendarFeedUrl(origin, scope) : "";
  const googleUrl = feedUrl ? googleCalendarSubscribeUrl(feedUrl) : "";
  const appleUrl = feedUrl ? webcalSubscribeUrl(feedUrl) : "";

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
            Termine automatisch in Google Kalender oder Apple Kalender —{" "}
            <span className="text-on-dark">{scopeHint}</span>.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {platform === "ios" && appleUrl ? (
          <a href={appleUrl} className={actionButtonClass(true)}>
            <CalendarPlus className="h-4 w-4" />
            In Apple Kalender öffnen
          </a>
        ) : platform === "android" && googleUrl ? (
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={actionButtonClass(true)}
          >
            <CalendarPlus className="h-4 w-4" />
            In Google Kalender öffnen
          </a>
        ) : null}

        {googleUrl ? (
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={actionButtonClass(platform !== "android")}
          >
            Google Kalender
          </a>
        ) : null}

        {appleUrl ? (
          <a href={appleUrl} className={actionButtonClass(platform !== "ios")}>
            Apple Kalender
          </a>
        ) : null}

        <button
          type="button"
          onClick={copyLink}
          disabled={!feedUrl}
          className={actionButtonClass()}
        >
          <Copy className="h-4 w-4" />
          Link kopieren
        </button>

        <button
          type="button"
          onClick={() => setShowQr((v) => !v)}
          disabled={!feedUrl}
          className={actionButtonClass()}
        >
          QR-Code
        </button>
      </div>

      {showQr && feedUrl ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-lg border border-white/10 bg-white p-4 w-fit mx-auto sm:mx-0">
          <QRCode value={feedUrl} size={160} />
          <p className="text-xs text-muted-foreground text-center max-w-[200px]">
            Mit der Handy-Kamera scannen — Kalender wird abonniert und aktualisiert
            sich automatisch.
          </p>
        </div>
      ) : null}

      {feedUrl ? (
        <p className="mt-3 text-xs text-on-dark-muted break-all">
          {feedUrl}
        </p>
      ) : null}

      <div className="mt-4 border-t border-white/10 pt-3">
        <button
          type="button"
          onClick={() => setManualOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 text-left text-sm font-medium text-on-dark-muted hover:text-on-dark"
        >
          Manuell einrichten
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
              <strong className="text-on-dark">Google (Android):</strong>{" "}
              Kalender-App → Einstellungen → Kalender hinzufügen → Per URL → Link
              einfügen.
            </p>
            <p>
              <strong className="text-on-dark">Apple (iPhone):</strong> Am
              einfachsten oben «Apple Kalender» tippen (Safari). Alternativ:
              Einstellungen → Kalender → Account hinzufügen → Anderer
              CalDAV-Account → Abonnierten Kalender hinzufügen.
            </p>
            <p className="text-xs">
              Kalender von {clubName} aktualisiert sich alle paar Stunden
              automatisch — kein erneutes Herunterladen nötig.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

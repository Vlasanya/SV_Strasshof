import { ExternalLink } from "lucide-react";
import { resolveOefbAssetUrl } from "@/lib/oefb";
import type { OefbSpiel } from "@/lib/oefb-types";
import { cn } from "@/lib/utils";

function formatSpielDatum(ms: number): string {
  return new Intl.DateTimeFormat("de-AT", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

function hasScore(spiel: OefbSpiel): boolean {
  return spiel.heimTore !== "-" && spiel.gastTore !== "-";
}

function SpielRow({ spiel, clubShortName }: { spiel: OefbSpiel; clubShortName: string }) {
  const reportUrl = resolveOefbAssetUrl(spiel.spielUrl);
  const isClubHome = spiel.heimName.toLowerCase().includes(clubShortName.toLowerCase());
  const isClubAway = spiel.gastName.toLowerCase().includes(clubShortName.toLowerCase());

  return (
    <li
      className={cn(
        "rounded-xl border border-white/10 bg-surface-dark p-4",
        spiel.highlight && "border-primary/50 ring-1 ring-primary/30",
        spiel.abgesagt && "opacity-60",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-on-dark-muted">
          <span className="font-medium text-on-dark">
            {formatSpielDatum(spiel.datum)}
          </span>
          <span>·</span>
          <span>{spiel.art}</span>
          {spiel.bewerbBezeichnung ? (
            <>
              <span>·</span>
              <span>{spiel.bewerbBezeichnung}</span>
            </>
          ) : null}
          {spiel.abgesagt ? (
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase">
              Abgesagt
            </span>
          ) : null}
          {spiel.live ? (
            <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] uppercase text-primary">
              Live
            </span>
          ) : null}
        </div>
        {reportUrl ? (
          <a
            href={reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            Bericht
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : null}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex items-center gap-2 min-w-0 justify-end text-right">
          <span
            className={cn(
              "text-sm font-semibold truncate",
              isClubHome ? "text-primary" : "text-on-dark",
            )}
          >
            {spiel.heimName}
          </span>
          {spiel.heimLogo ? (
            <img
              src={resolveOefbAssetUrl(spiel.heimLogo)}
              alt=""
              className="w-8 h-8 rounded object-contain bg-white/5 shrink-0"
              loading="lazy"
            />
          ) : null}
        </div>

        <div className="text-center shrink-0">
          <span className="inline-flex min-w-[4.5rem] items-center justify-center rounded-lg bg-white/5 px-3 py-1.5 text-sm font-bold text-on-dark tabular-nums">
            {hasScore(spiel)
              ? `${spiel.heimTore} : ${spiel.gastTore}`
              : "– : –"}
          </span>
        </div>

        <div className="flex items-center gap-2 min-w-0">
          {spiel.gastLogo ? (
            <img
              src={resolveOefbAssetUrl(spiel.gastLogo)}
              alt=""
              className="w-8 h-8 rounded object-contain bg-white/5 shrink-0"
              loading="lazy"
            />
          ) : null}
          <span
            className={cn(
              "text-sm font-semibold truncate",
              isClubAway ? "text-primary" : "text-on-dark",
            )}
          >
            {spiel.gastName}
          </span>
        </div>
      </div>

      {spiel.spielort ? (
        <p className="mt-2 text-xs text-on-dark-muted truncate">{spiel.spielort}</p>
      ) : null}
    </li>
  );
}

export function OefbSpieleList({
  spiele,
  clubShortName,
  upcomingLimit = 5,
  pastLimit = 5,
}: {
  spiele: OefbSpiel[];
  clubShortName: string;
  upcomingLimit?: number;
  pastLimit?: number;
}) {
  const now = Date.now();
  const sorted = [...spiele].sort((a, b) => a.datum - b.datum);

  const upcoming = sorted
    .filter((s) => s.datum >= now && !s.abgesagt)
    .slice(0, upcomingLimit);

  const past = sorted
    .filter((s) => s.datum < now)
    .reverse()
    .slice(0, pastLimit);

  if (upcoming.length === 0 && past.length === 0) {
    return (
      <p className="text-sm text-on-dark-muted">
        Keine Spiele in der aktuellen Saison gefunden.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {upcoming.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-on-dark-muted mb-3">
            Kommende Spiele
          </h3>
          <ul className="space-y-3">
            {upcoming.map((spiel) => (
              <SpielRow
                key={`${spiel.datum}-${spiel.heimName}-${spiel.gastName}`}
                spiel={spiel}
                clubShortName={clubShortName}
              />
            ))}
          </ul>
        </div>
      ) : null}

      {past.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-on-dark-muted mb-3">
            Vergangene Spiele
          </h3>
          <ul className="space-y-3">
            {past.map((spiel) => (
              <SpielRow
                key={`past-${spiel.datum}-${spiel.heimName}-${spiel.gastName}`}
                spiel={spiel}
                clubShortName={clubShortName}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

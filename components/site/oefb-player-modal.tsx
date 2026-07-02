"use client";

import { useEffect } from "react";
import { ExternalLink, Loader2, User, X } from "lucide-react";
import type { OefbKaderPlayer, OefbSpielerProfile } from "@/lib/oefb-types";

export type OefbKaderPlayerRow = OefbKaderPlayer & {
  photoUrl?: string;
};

function formatBirthYear(ms: number | undefined): string | null {
  if (!ms) return null;
  return new Intl.DateTimeFormat("de-AT", {
    year: "numeric",
    timeZone: "Europe/Vienna",
  }).format(new Date(ms));
}

function formatClubSince(ms: number | undefined): string | null {
  if (!ms) return null;
  return new Intl.DateTimeFormat("de-AT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Vienna",
  }).format(new Date(ms));
}

function currentClubEntry(
  profile: OefbSpielerProfile | null,
): { verein: string; ab?: number } | null {
  if (!profile?.verein) return null;
  const match = profile.vereine?.find((v) => v.verein === profile.verein);
  return match ?? { verein: profile.verein };
}

function StatPill({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface-dark px-3 py-2 text-center">
      <p className="text-lg font-bold text-on-dark tabular-nums">{value}</p>
      <p className="text-[11px] text-on-dark-muted uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}

export function OefbPlayerModal({
  player,
  teamName,
  open,
  onClose,
  profile,
  loading,
  error,
}: {
  player: OefbKaderPlayerRow | null;
  teamName: string;
  open: boolean;
  onClose: () => void;
  profile: OefbSpielerProfile | null;
  loading: boolean;
  error: string | null;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !player) return null;

  const displayName =
    profile?.vorname && profile?.nachname
      ? `${profile.vorname} ${profile.nachname}`
      : player.spielerName;
  const photoUrl = profile?.photoUrl || player.photoUrl;
  const position = profile?.position || player.position;
  const number = profile?.rueckennummer || player.rueckenNummer;
  const birthYear = formatBirthYear(profile?.geburtsdatum);
  const club = currentClubEntry(profile);
  const clubSince = formatClubSince(club?.ab);
  const currentStats = profile?.statistiken?.find(
    (s) => s.bezeichnung === teamName || s.kategorie === teamName,
  );

  return (
    <div
      className="fixed inset-0 z-[210] flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="oefb-player-modal-title"
    >
      <div
        className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-white/10 bg-surface-dark-2 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-surface-dark-2/95 backdrop-blur px-5 py-4">
          <h3
            id="oefb-player-modal-title"
            className="font-display text-lg font-bold text-on-dark truncate"
          >
            {displayName}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="rounded-full p-2 text-on-dark-muted hover:bg-white/10 hover:text-on-dark transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-start gap-4">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt=""
                className="w-24 h-24 rounded-2xl object-cover bg-white/5 shrink-0"
              />
            ) : (
              <span className="w-24 h-24 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <User className="w-10 h-10" />
              </span>
            )}
            <div className="min-w-0 space-y-1">
              {number ? (
                <p className="text-sm text-on-dark-muted">
                  Rückennummer{" "}
                  <span className="font-bold text-primary tabular-nums">
                    {number}
                  </span>
                </p>
              ) : null}
              {position ? (
                <p className="text-sm text-on-dark">
                  <span className="text-on-dark-muted">Position: </span>
                  {position}
                </p>
              ) : null}
              {profile?.nationalitaet ? (
                <p className="text-sm text-on-dark">
                  <span className="text-on-dark-muted">Nationalität: </span>
                  {profile.nationalitaet}
                </p>
              ) : null}
              {birthYear ? (
                <p className="text-sm text-on-dark">
                  <span className="text-on-dark-muted">Jahrgang: </span>
                  {birthYear}
                </p>
              ) : null}
              {club?.verein ? (
                <p className="text-sm text-on-dark">
                  <span className="text-on-dark-muted">Aktueller Verein: </span>
                  {club.verein}
                </p>
              ) : null}
              {clubSince ? (
                <p className="text-sm text-on-dark">
                  <span className="text-on-dark-muted">Beim Verein seit: </span>
                  {clubSince}
                </p>
              ) : null}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-on-dark-muted">
              <Loader2 className="w-4 h-4 animate-spin" />
              Profildaten werden geladen…
            </div>
          ) : null}

          {error ? (
            <p className="text-sm text-on-dark-muted rounded-xl border border-white/10 bg-surface-dark px-4 py-3">
              {error}
            </p>
          ) : null}

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-on-dark-muted mb-3">
              Saison {teamName}
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              <StatPill
                label="Einsätze"
                value={player.einsaetze ?? currentStats?.spiele ?? 0}
              />
              <StatPill
                label="Tore"
                value={player.tore ?? currentStats?.tore ?? 0}
              />
              <StatPill
                label="Gelb"
                value={player.kartenGelb ?? currentStats?.gelbe ?? 0}
              />
              <StatPill
                label="Gelb-Rot"
                value={player.kartenGelbRot ?? currentStats?.gelbrote ?? 0}
              />
              <StatPill
                label="Rot"
                value={player.kartenRot ?? currentStats?.rote ?? 0}
              />
            </div>
          </div>

          {profile?.profileUrl ? (
            <a
              href={profile.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Vollständiges Profil auf oefb.at
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

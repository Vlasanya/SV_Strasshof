"use client";

import { useCallback, useState } from "react";
import { User } from "lucide-react";
import type { OefbSpielerProfile } from "@/lib/oefb-types";
import {
  OefbPlayerModal,
  type OefbKaderPlayerRow,
} from "@/components/site/oefb-player-modal";

export function OefbKaderList({
  players,
  teamName,
}: {
  players: OefbKaderPlayerRow[];
  teamName: string;
}) {
  const [selected, setSelected] = useState<OefbKaderPlayerRow | null>(null);
  const [profile, setProfile] = useState<OefbSpielerProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closeModal = useCallback(() => {
    setSelected(null);
    setProfile(null);
    setError(null);
    setLoading(false);
  }, []);

  const openPlayer = useCallback(async (player: OefbKaderPlayerRow) => {
    setSelected(player);
    setProfile(null);
    setError(null);
    setLoading(true);

    try {
      const params = new URLSearchParams({ name: player.spielerName });
      if (player.spielerProfilUrl) {
        params.set("spielerProfilUrl", player.spielerProfilUrl);
      }
      const response = await fetch(`/api/oefb/spieler?${params}`);
      if (!response.ok) {
        setError(
          "Zusätzliche Profildaten sind derzeit nicht verfügbar. Die Kaderstatistik wird angezeigt.",
        );
        return;
      }
      setProfile((await response.json()) as OefbSpielerProfile);
    } catch {
      setError(
        "Zusätzliche Profildaten konnten nicht geladen werden. Die Kaderstatistik wird angezeigt.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <>
      <ul className="grid gap-2 sm:grid-cols-2">
        {players.map((player) => {
          const photoUrl = player.photoUrl;
          return (
            <li key={`${player.rueckenNummer}-${player.spielerName}`}>
              <button
                type="button"
                onClick={() => openPlayer(player)}
                className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-surface-dark p-3 text-left transition-colors hover:border-primary/40 hover:bg-surface-dark/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="w-9 shrink-0 text-center text-sm font-bold text-primary tabular-nums">
                  {player.rueckenNummer || "·"}
                </span>
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt=""
                    data-no-zoom
                    className="w-11 h-11 rounded-lg object-cover bg-white/5 shrink-0 pointer-events-none"
                    loading="lazy"
                  />
                ) : (
                  <span className="w-11 h-11 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-on-dark truncate">
                    {player.spielerName}
                  </p>
                  {player.position ? (
                    <p className="text-xs text-on-dark-muted">{player.position}</p>
                  ) : null}
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-on-dark-muted">
                    <span title="Einsätze">{player.einsaetze ?? 0} Eins.</span>
                    <span title="Tore">{player.tore ?? 0} Tore</span>
                    {(player.kartenGelb ?? 0) > 0 && (
                      <span title="Gelbe Karten">🟨 {player.kartenGelb}</span>
                    )}
                    {(player.kartenRot ?? 0) > 0 && (
                      <span title="Rote Karten">🟥 {player.kartenRot}</span>
                    )}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <OefbPlayerModal
        player={selected}
        teamName={teamName}
        open={selected !== null}
        onClose={closeModal}
        profile={profile}
        loading={loading}
        error={error}
      />
    </>
  );
}

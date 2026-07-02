import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CLUB } from "@/lib/config";
import { getSiteSettings } from "@/lib/data";
import { getOefbKaderForTeam, getOefbTeamLogoUrl } from "@/lib/oefb-data";
import {
  oefbKaderUrlForTeam,
  resolveOefbAssetUrl,
} from "@/lib/oefb";
import type { Team } from "@/lib/types";
import { OefbAttribution } from "@/components/site/oefb-attribution";
import { OefbKaderList } from "@/components/site/oefb-kader-list";

export async function OefbKaderPanel({
  team,
}: {
  team: Pick<Team, "name" | "slug" | "oefb_url">;
}) {
  const [kader, settings, teamLogoUrl] = await Promise.all([
    getOefbKaderForTeam(team),
    getSiteSettings(),
    getOefbTeamLogoUrl(team),
  ]);

  const showPhotos = settings["public_show_player_photos"] !== "false";
  const kaderUrl = oefbKaderUrlForTeam(team);
  const players = kader?.kader ?? [];

  const playerRows = players.map((player) => ({
    player,
    photoUrl: showPhotos ? resolveOefbAssetUrl(player.spielerFotoUrl) : "",
  }));

  return (
    <section className="rounded-2xl border border-white/10 bg-surface-dark-2 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div className="flex items-start gap-3 min-w-0">
          {teamLogoUrl ? (
            <img
              src={teamLogoUrl}
              alt=""
              className="w-14 h-14 rounded-xl object-cover bg-white/5 shrink-0"
              loading="lazy"
            />
          ) : null}
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold text-on-dark">
              Kader {kader?.bezeichnung ?? team.name}
            </h2>
            <p className="text-sm text-on-dark-muted mt-1">
              Offizielle Mannschaftsliste —{" "}
              {CLUB.oefbSeasonSlug.replace("Saison-", "").replace("-", "/")}
            </p>
          </div>
        </div>
        <a
          href={kaderUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline shrink-0"
        >
          Auf ÖFB öffnen
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {playerRows.length === 0 ? (
        <p className="text-sm text-on-dark-muted">
          Der Kader ist derzeit nicht verfügbar. Bitte später erneut versuchen
          oder direkt auf{" "}
          <a
            href={kaderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            vereine.oefb.at
          </a>{" "}
          nachsehen.
        </p>
      ) : (
        <OefbKaderList
          players={playerRows.map(({ player, photoUrl }) => ({
            ...player,
            photoUrl: photoUrl || undefined,
          }))}
          teamName={kader?.bezeichnung ?? team.name}
        />
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <OefbAttribution />
        <Link
          href="/datenschutz"
          className="text-xs text-on-dark-muted underline hover:text-primary"
        >
          Datenschutz
        </Link>
      </div>
    </section>
  );
}

import { ExternalLink } from "lucide-react";
import { CLUB } from "@/lib/config";
import { getOefbSpielplanForTeam, getOefbTeamLogoUrl } from "@/lib/oefb-data";
import { oefbSpieleUrlForTeam, isAllowedOefbWidgetHtml } from "@/lib/oefb";
import type { Team } from "@/lib/types";
import { ExternalWidgetEmbed } from "@/components/site/external-widget-embed";
import { OefbAttribution } from "@/components/site/oefb-attribution";
import { OefbSpieleList } from "@/components/site/oefb-spiele-list";

export async function OefbSpielePanel({
  team,
  title = "ÖFB-Spielplan",
}: {
  team: Pick<Team, "name" | "slug" | "oefb_url" | "oefb_widget_spiele">;
  title?: string;
}) {
  const spieleUrl = oefbSpieleUrlForTeam(team);
  const [spielplan, teamLogoUrl] = await Promise.all([
    getOefbSpielplanForTeam(team),
    getOefbTeamLogoUrl(team),
  ]);
  const spiele = spielplan?.spiele ?? [];
  const hasSpielplan = spielplan !== null;

  const widget =
    !hasSpielplan &&
    team.oefb_widget_spiele &&
    isAllowedOefbWidgetHtml(team.oefb_widget_spiele)
      ? team.oefb_widget_spiele
      : null;

  return (
    <section className="rounded-2xl border border-white/10 bg-surface-dark-2 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
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
            <h2 className="font-display text-lg font-bold text-on-dark">{title}</h2>
            <p className="text-sm text-on-dark-muted mt-1">
              Offizielle Meisterschaftsspiele für {team.name}
            </p>
          </div>
        </div>
        <a
          href={spieleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline shrink-0"
        >
          Auf vereine.oefb.at öffnen
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {hasSpielplan ? (
        <OefbSpieleList
          spiele={spiele}
          clubShortName={CLUB.shortName}
          upcomingLimit={8}
          pastLimit={10}
        />
      ) : widget ? (
        <ExternalWidgetEmbed html={widget} />
      ) : (
        <div className="rounded-xl border border-dashed border-white/20 p-6 text-center">
          <p className="text-sm text-on-dark-muted">
            Der Spielplan ist derzeit nicht verfügbar. Bitte später erneut
            versuchen oder direkt auf ÖFB nachsehen.
          </p>
          <a
            href={spieleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold"
          >
            Spielplan {team.name} auf ÖFB
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

      <OefbAttribution className="mt-4" />
    </section>
  );
}

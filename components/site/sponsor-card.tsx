import { ExternalLink, MapPin } from "lucide-react";
import type { Sponsor } from "@/lib/types";

export function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  const href = sponsor.maps_url?.trim() || sponsor.website?.trim() || null;
  const usesMaps = Boolean(sponsor.maps_url?.trim());

  const card = (
    <div className="bg-card rounded-2xl border border-border p-6 h-36 flex flex-col items-center justify-center text-center hover:shadow-md hover:border-primary/40 transition-all">
      {sponsor.logo_url ? (
        <img
          src={sponsor.logo_url}
          alt={sponsor.name}
          className="max-h-14 w-full object-contain px-2"
        />
      ) : (
        <span className="font-bold uppercase tracking-wide text-muted-foreground text-sm px-2">
          {sponsor.name}
        </span>
      )}
      {sponsor.logo_url ? (
        <span className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground line-clamp-2">
          {sponsor.name}
        </span>
      ) : null}
    </div>
  );

  if (!href) {
    return <div>{card}</div>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block"
    >
      {card}
      {usesMaps ? (
        <MapPin className="w-3.5 h-3.5 absolute top-3 left-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      ) : null}
      <ExternalLink className="w-3.5 h-3.5 absolute top-3 right-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
}

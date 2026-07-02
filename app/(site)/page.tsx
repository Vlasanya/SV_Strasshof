import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Trophy,
} from "lucide-react";
import {
  getClubInfo,
  getNews,
  getSiteSettings,
  getSponsors,
  getTeams,
} from "@/lib/data";
import { getOefbTeamLogoMap } from "@/lib/oefb-data";
import { SponsorCard } from "@/components/site/sponsor-card";
import { categoryColor, formatDate } from "@/lib/utils";

const HERO_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1764703666646-acc2f7d48857?w=1600&h=900&fit=crop&auto=format";

export default async function HomePage() {
  const teams = await getTeams();
  const [club, settings, news, sponsors, teamLogoBySlug] = await Promise.all([
    getClubInfo(),
    getSiteSettings(),
    getNews({ publishedOnly: true, limit: 3 }),
    getSponsors({ activeOnly: true }),
    getOefbTeamLogoMap(teams),
  ]);

  const heroImage = settings["hero_image_url"] || HERO_FALLBACK_IMAGE;
  const heroEyebrow = settings["hero_eyebrow"] || "Saison 2025/26";
  const heroTitle = settings["hero_title"] || club.name;
  const heroHighlight =
    settings["hero_title_highlight"] || club.shortName || "";
  const heroSubtitle =
    settings["hero_subtitle"] ||
    `${club.tagline}. Werde Teil unserer Fußballfamilie.`;
  const ctaPrimary = settings["hero_cta_primary_label"] || "Kontakt";
  const ctaSecondary = settings["hero_cta_secondary_label"] || "Mannschaften";
  const hasHighlight = !!heroHighlight && heroTitle.includes(heroHighlight);
  const heroTitleBase = hasHighlight
    ? heroTitle.replace(heroHighlight, "").trim()
    : heroTitle;

  return (
    <div>
      <section className="relative h-[80vh] min-h-[520px] flex items-end overflow-hidden bg-surface-dark accent-diagonal">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[var(--hero-overlay)]" />
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-8 pb-16 w-full">
          {heroEyebrow && (
            <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
              <Trophy className="w-3.5 h-3.5" />
              {heroEyebrow}
            </div>
          )}
          <h1 className="font-display text-5xl sm:text-6xl md:text-[72px] text-on-dark uppercase leading-[0.95] tracking-wide mb-5">
            {hasHighlight ? (
              <>
                {heroTitleBase && (
                  <>
                    {heroTitleBase}
                    <br />
                  </>
                )}
                <span className="text-primary">{heroHighlight}</span>
              </>
            ) : (
              heroTitle
            )}
          </h1>
          {heroSubtitle && (
            <p className="text-on-dark/80 text-base sm:text-lg max-w-xl mb-8 leading-relaxed">
              {heroSubtitle}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/beitritt"
              className="inline-flex items-center gap-2 bg-primary hover:brightness-90 text-primary-foreground font-semibold uppercase tracking-wide px-7 py-3.5 rounded-lg transition-all text-sm"
            >
              Mitglied werden <ArrowRight className="w-4 h-4" />
            </Link>
            {ctaPrimary && (
              <Link
                href="/kontakt"
                className="inline-flex items-center gap-2 border border-on-dark/30 hover:border-primary text-on-dark font-semibold uppercase tracking-wide px-7 py-3.5 rounded-lg transition-all text-sm"
              >
                {ctaPrimary}
              </Link>
            )}
            {ctaSecondary && (
              <Link
                href="/mannschaften"
                className="inline-flex items-center gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold uppercase tracking-wide px-7 py-3.5 rounded-lg transition-colors text-sm"
              >
                {ctaSecondary}
              </Link>
            )}
          </div>
        </div>
      </section>

      {news.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground">
              Aktuelle News
            </h2>
            <Link
              href="/news"
              className="text-sm text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all"
            >
              Alle anzeigen <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {news.map((item) => (
              <Link
                href={`/news/${item.slug}`}
                key={item.id}
                className="group bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-video bg-muted overflow-hidden">
                  {item.cover_image && (
                    <img
                      src={item.cover_image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                </div>
                <div className="p-5">
                  {item.category && (
                    <span className="inline-block rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                      {item.category}
                    </span>
                  )}
                  <h3 className="font-semibold text-foreground mt-2 leading-snug text-base line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDate(item.published_at ?? item.created_at)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-muted/40 py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-primary" />
            <div>
              <h2 className="font-display text-xl font-bold uppercase text-foreground">
                Spiele & Tabellen
              </h2>
              <p className="text-sm text-muted-foreground">
                Offizielle Daten auf fussballoesterreich.at
              </p>
            </div>
          </div>
          <Link
            href="/spiele"
            className="text-sm text-primary font-semibold flex items-center gap-1"
          >
            Zur Übersicht <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {teams.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground">
              Unsere Mannschaften
            </h2>
            <Link
              href="/mannschaften"
              className="text-sm text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all"
            >
              Alle <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {teams.slice(0, 6).map((team) => {
              const image =
                teamLogoBySlug[team.slug] ||
                team.photo_url ||
                settings["brand_logo_url"] ||
                null;
              return (
                <Link
                  href={`/mannschaften/${team.slug}`}
                  key={team.id}
                  className="group rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow bg-card"
                >
                  <div className="aspect-[3/2] bg-muted overflow-hidden flex items-center justify-center">
                    {image ? (
                      <img
                        src={image}
                        alt={team.name}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Trophy className="w-8 h-8 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {team.name}
                    </p>
                    {team.category && (
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${categoryColor(
                          team.category,
                        )}`}
                      >
                        {team.category}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {sponsors.length > 0 && (
        <section className="border-t border-border bg-muted/30 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground">
                Unsere Sponsoren
              </h2>
              <Link
                href="/sponsoren"
                className="text-sm text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              >
                Alle anzeigen <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {sponsors.map((sponsor) => (
                <SponsorCard key={sponsor.id} sponsor={sponsor} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-primary rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <h2 className="font-display text-4xl font-extrabold text-white uppercase leading-none mb-3">
              Mitspielen?
            </h2>
            <p className="text-white/80 text-base leading-relaxed max-w-md">
              Kontaktiere uns für Probetraining oder Mitgliedschaft — alle
              Altersklassen willkommen.
            </p>
          </div>
          <Link
            href="/kontakt"
            className="inline-flex items-center gap-2 bg-white text-primary font-bold uppercase tracking-wide px-8 py-4 rounded-lg hover:bg-white/90 transition-colors text-sm shrink-0"
          >
            Kontakt aufnehmen <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

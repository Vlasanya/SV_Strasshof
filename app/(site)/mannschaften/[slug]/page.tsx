import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { CLUB, oefbKaderUrl, resolveOefbUrl } from "@/lib/config";
import { getClubInfo, getTeamBySlug } from "@/lib/data";
import { PageHeader } from "@/components/site/empty-state";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);
  return { title: team?.name ?? "Mannschaft" };
}

export default async function MannschaftDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [team, club] = await Promise.all([getTeamBySlug(slug), getClubInfo()]);
  if (!team) notFound();

  const oefbUrl =
    resolveOefbUrl(team.oefb_url) ||
    oefbKaderUrl(team.slug);

  return (
    <section className="section-dark accent-diagonal min-h-[50vh]">
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-8 py-16">
        <PageHeader
          eyebrow={club.name}
          title={team.name}
          subtitle={team.category ?? undefined}
          tone="dark"
        />

        <div className="grid gap-8 lg:grid-cols-2 mt-8">
          {team.photo_url && (
            <img
              src={team.photo_url}
              alt={team.name}
              className="w-full rounded-2xl object-cover max-h-80"
            />
          )}
          <div className="space-y-4 text-on-dark">
            {team.coach_name && (
              <p>
                <span className="text-on-dark-muted">Trainer: </span>
                {team.coach_name}
              </p>
            )}
            {team.description && (
              <p className="text-on-dark-muted leading-relaxed whitespace-pre-wrap">
                {team.description}
              </p>
            )}
            <a
              href={oefbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold"
            >
              <ExternalLink className="w-4 h-4" />
              Kader auf vereine.oefb.at
            </a>
            <p className="text-xs text-on-dark-muted">
              Spielplan und Tabellen ebenfalls auf der{" "}
              <Link
                href="/spiele"
                className="underline hover:text-primary"
              >
                ÖFB-Seite
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

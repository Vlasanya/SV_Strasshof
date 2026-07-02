import type { Metadata } from "next";
import Link from "next/link";
import { getTeams } from "@/lib/data";
import { JoinWizard } from "@/components/site/join-wizard";
import { PageHeader } from "@/components/site/empty-state";

export const metadata: Metadata = {
  title: "Mitglied werden",
  description:
    "Online-Anmeldung für neue Spielerinnen und Spieler beim ASKÖ Strasshof SV.",
};

export default async function BeitrittPage() {
  const teams = await getTeams();
  const teamOptions = teams.map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
  }));

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <PageHeader
        eyebrow="Willkommen"
        title="Mitglied werden"
        subtitle="In drei Schritten: Geburtsjahr, Mannschaft und Kontaktdaten — wir melden uns bei dir."
      />
      <JoinWizard teams={teamOptions} />
      <p className="text-center text-sm text-muted-foreground mt-8">
        Fragen?{" "}
        <Link href="/kontakt" className="text-primary underline">
          Kontakt aufnehmen
        </Link>
      </p>
    </div>
  );
}

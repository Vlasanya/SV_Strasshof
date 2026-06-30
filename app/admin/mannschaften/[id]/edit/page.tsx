import { notFound } from "next/navigation";
import { getTeamById } from "@/lib/data";
import { TeamForm } from "@/components/admin/team-form";

export default async function EditTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const team = await getTeamById(Number(id), { includeHidden: true });
  if (!team) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold uppercase mb-6">
        {team.name} bearbeiten
      </h1>
      <TeamForm team={team} />
    </div>
  );
}

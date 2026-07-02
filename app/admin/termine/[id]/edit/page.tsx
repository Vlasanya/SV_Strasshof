import { notFound } from "next/navigation";
import { ClubEventForm } from "@/components/admin/club-event-form";
import { getClubEventById, getTeams } from "@/lib/data";

export default async function EditClubEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isFinite(eventId)) notFound();

  const [event, teams] = await Promise.all([
    getClubEventById(eventId),
    getTeams({ includeHidden: true }),
  ]);
  if (!event) notFound();

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Termin bearbeiten</h1>
      <ClubEventForm event={event} teams={teams} />
    </div>
  );
}

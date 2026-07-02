import { ClubEventForm } from "@/components/admin/club-event-form";
import { getTeams } from "@/lib/data";

export default async function NewClubEventPage() {
  const teams = await getTeams({ includeHidden: true });
  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Neuer Termin</h1>
      <ClubEventForm teams={teams} />
    </div>
  );
}

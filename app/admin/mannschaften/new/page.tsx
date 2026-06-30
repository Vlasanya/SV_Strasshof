import { TeamForm } from "@/components/admin/team-form";

export default function NewTeamPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold uppercase mb-6">
        Mannschaft anlegen
      </h1>
      <TeamForm />
    </div>
  );
}

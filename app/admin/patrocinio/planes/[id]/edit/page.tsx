import { notFound } from "next/navigation";
import { PlanForm } from "@/components/admin/plan-form";
import { getSponsorshipPlanById } from "@/lib/data";

export default async function EditPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plan = await getSponsorshipPlanById(Number(id));
  if (!plan) notFound();
  return <PlanForm plan={plan} />;
}

import { notFound } from "next/navigation";
import { AdActionForm } from "@/components/admin/ad-action-form";
import { getAdActionById } from "@/lib/data";

export default async function EditAdActionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const action = await getAdActionById(Number(id));
  if (!action) notFound();
  return <AdActionForm action={action} />;
}

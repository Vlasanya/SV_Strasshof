import { notFound } from "next/navigation";
import { getSponsorById } from "@/lib/data";
import { SponsorForm } from "@/components/admin/sponsor-form";

export const dynamic = "force-dynamic";

export default async function EditSponsorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sponsor = await getSponsorById(Number(id));
  if (!sponsor) notFound();
  return <SponsorForm sponsor={sponsor} />;
}

import { notFound } from "next/navigation";
import { getMerchById } from "@/lib/data";
import { MerchForm } from "@/components/admin/merch-form";

export const dynamic = "force-dynamic";

export default async function EditMerchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getMerchById(Number(id));
  if (!item) notFound();
  return <MerchForm item={item} />;
}

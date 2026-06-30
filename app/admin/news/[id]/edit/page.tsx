import { notFound } from "next/navigation";
import { getNewsById } from "@/lib/data";
import { NewsForm } from "@/components/admin/news-form";

export const dynamic = "force-dynamic";

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getNewsById(Number(id));
  if (!article) notFound();
  return <NewsForm article={article} />;
}

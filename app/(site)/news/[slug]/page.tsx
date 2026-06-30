import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getNewsBySlug } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  return { title: article?.title ?? "Noticia" };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article || !article.published) notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm  transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Todas las noticias
        </Link>

        {article.category && (
          <span className="inline-block rounded-full bg-primary px-2.5 ml-2  py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground">
            {article.category}
          </span>
        )}
      </div>
      <h1 className="font-display text-4xl md:text-5xl uppercase text-foreground tracking-wide mt-3">
        {article.title}
      </h1>
      <p className="text-sm text-muted-foreground mt-3">
        {formatDate(article.published_at ?? article.created_at)}
      </p>

      {article.cover_image && (
        <img
          src={article.cover_image}
          alt={article.title}
          className="w-full rounded-2xl mt-6 aspect-video object-cover bg-muted"
        />
      )}

      {article.excerpt && (
        <p className="text-lg text-muted-foreground mt-6 leading-relaxed">
          {article.excerpt}
        </p>
      )}

      {article.body && (
        <div className="prose prose-neutral max-w-none mt-6 text-foreground leading-relaxed whitespace-pre-line">
          {article.body}
        </div>
      )}

      {article.images && article.images.length > 0 && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {article.images.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`${article.title} — imagen ${i + 1}`}
              className="w-full rounded-2xl border border-border bg-muted"
            />
          ))}
        </div>
      )}
    </article>
  );
}

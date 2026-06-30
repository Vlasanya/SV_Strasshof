import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { getNews } from "@/lib/data";
import { EmptyState, PageHeader } from "@/components/site/empty-state";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Noticias" };

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
  }>;
}) {
  const params = await searchParams;

  const category = params.category;

  const news = await getNews({
    publishedOnly: true,
    category,
  });

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-16">
      <PageHeader eyebrow="Actualidad" title="Noticias" />
      <div className="flex flex-wrap gap-2 mb-8 -mt-6">
        {[
          { label: "Todas", value: "" },
          { label: "Resultados", value: "Resultados" },
          { label: "Club", value: "Club" },
          { label: "Copa", value: "Copa" },
          { label: "Otros", value: "Otros" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.value ? `/news?category=${item.value}` : "/news"}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              category === item.value || (!category && item.value === "")
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-primary"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      {news.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="No hay noticias publicadas"
          description="Vuelve pronto para conocer las novedades del club."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.map((item) => (
            <Link
              href={`/news/${item.slug}`}
              key={item.id}
              className="group bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-video bg-muted overflow-hidden">
                {item.cover_image && (
                  <img
                    src={item.cover_image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>
              <div className="p-5">
                {item.category && (
                  <span className="inline-block rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                    {item.category}
                  </span>
                )}
                <h3 className="font-semibold text-foreground mt-2 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                {item.body && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {item.body}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-3">
                  {formatDate(item.published_at ?? item.created_at)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { getNews } from "@/lib/data";
import { ListToolbar } from "@/components/admin/list-chrome";
import { NewsAdminTable } from "@/components/admin/news-admin-table";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  const news = await getNews();

  return (
    <div>
      <ListToolbar
        count={news.length}
        noun="Beiträge"
        addHref="/admin/news/new"
        addLabel="Neuer Beitrag"
      />
      <NewsAdminTable news={news} />
    </div>
  );
}

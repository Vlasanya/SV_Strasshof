import { Check, Mail } from "lucide-react";
import { getContactMessages } from "@/lib/data";
import { deleteContact, toggleContactHandled } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/form-ui";
import { ListToolbar } from "@/components/admin/list-chrome";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    subject?: string;
    handled?: string;
    sort?: string;
  }>;
}) {
  const limit = 20;

  const params = await searchParams;

  const page = Number(params?.page || 1);
  const offset = (page - 1) * limit;
  const subject = params?.subject || undefined;
  const sort = params?.sort === "asc" ? "asc" : "desc";

  const handled =
    params?.handled === "true"
      ? true
      : params?.handled === "false"
        ? false
        : undefined;

  const { data: messages, count } = await getContactMessages({
    limit,
    offset,
    subject,
    handled,
    sort,
  });
  const totalPages = Math.ceil((count || 0) / limit);
  function getPages(current: number, total: number) {
    const pages: (number | "...")[] = [];

    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);

    if (start > 1) pages.push(1);
    if (start > 2) pages.push("...");

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < total - 1) pages.push("...");
    if (end < total) pages.push(total);

    return pages;
  }
  const pages = getPages(page, totalPages);
  return (
    <div>
      <form className="flex flex-wrap gap-3 mb-4">
        <select
          name="subject"
          defaultValue={subject || ""}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todos los asuntos</option>
          <option value="Inscripción">Inscripción</option>
          <option value="Patrocinio">Patrocinio</option>
          <option value="Protección de datos / baja">
            Protección de datos / baja
          </option>
          <option value="Otro">Otro</option>
        </select>

        <select
          name="handled"
          defaultValue={params?.handled || ""}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todos</option>
          <option value="false">Nuevos</option>
          <option value="true">Gestionados</option>
        </select>
        <select
          name="sort"
          defaultValue={sort}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="desc">Más recientes</option>

          <option value="asc">Más antiguos</option>
        </select>
        <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm">
          Filtrar
        </button>
      </form>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {count === 0
            ? "No hay mensajes"
            : ` ${messages.length} de ${count} mensajes`}
        </p>
      </div>
      {messages.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground mt-4">
          <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay mensajes todavía.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mt-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`bg-card rounded-2xl border p-5 ${
                  m.handled ? "border-border opacity-70" : "border-primary/30"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-foreground">{m.name}</p>
                      {!m.handled && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          Nuevo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <a
                        href={`mailto:${m.email}`}
                        className="hover:text-primary"
                      >
                        {m.email}
                      </a>
                      {m.phone ? ` · ${m.phone}` : ""} ·{" "}
                      {formatDate(m.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <form action={toggleContactHandled}>
                      <input type="hidden" name="id" value={m.id} />
                      <input
                        type="hidden"
                        name="handled"
                        value={String(m.handled)}
                      />
                      <button
                        type="submit"
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-green-600"
                        aria-label="Marcar como gestionado"
                        title={
                          m.handled
                            ? "Marcar como nuevo"
                            : "Marcar como gestionado"
                        }
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </form>
                    <DeleteButton
                      action={deleteContact}
                      id={m.id}
                      confirmText="¿Eliminar este mensaje?"
                    />
                  </div>
                </div>
                {m.subject && (
                  <p className="text-sm font-medium text-foreground mt-3">
                    {m.subject}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                  {m.message}
                </p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {/* First */}
            <a
              href={`?page=1&subject=${subject || ""}&handled=${params?.handled || ""} &sort=${sort} `}
              className="px-2 py-1 text-sm hover:text-primary"
            >
              ««
            </a>

            {/* Prev */}
            <a
              href={`?page=${page - 1}&subject=${subject || ""}&handled=${params?.handled || ""} &sort=${sort} `}
              className={`px-2 py-1 text-sm ${
                page <= 1
                  ? "pointer-events-none opacity-40"
                  : "hover:text-primary"
              }`}
            >
              ‹
            </a>

            {/* Numbers */}
            {pages.map((p, i) =>
              p === "..." ? (
                <span key={i} className="px-2 text-sm text-muted-foreground">
                  ...
                </span>
              ) : (
                <a
                  key={i}
                  href={`?page=${p}&subject=${subject || ""}&handled=${params?.handled || ""} &sort=${sort} `}
                  className={`px-3 py-1 rounded text-sm ${
                    p === page
                      ? "bg-primary text-white"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {p}
                </a>
              ),
            )}

            {/* Next */}
            <a
              href={`?page=${page + 1}&subject=${subject || ""}&handled=${params?.handled || ""} &sort=${sort} `}
              className={`px-2 py-1 text-sm ${
                page >= totalPages
                  ? "pointer-events-none opacity-40"
                  : "hover:text-primary"
              }`}
            >
              ›
            </a>

            {/* Last */}
            <a
              href={`?page=${totalPages}&subject=${subject || ""}&handled=${params?.handled || ""} &sort=${sort} `}
              className="px-2 py-1 text-sm hover:text-primary"
            >
              »»
            </a>
          </div>
        </>
      )}
    </div>
  );
}

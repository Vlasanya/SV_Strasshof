import { Check, CheckCheck, UserPlus } from "lucide-react";
import { getJoinInquiries } from "@/lib/data";
import { deleteJoinInquiry, toggleJoinHandled } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/form-ui";
import { ListToolbar } from "@/components/admin/list-chrome";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminJoinPage({
  searchParams,
}: {
  searchParams: Promise<{ handled?: string }>;
}) {
  const params = await searchParams;
  const handled =
    params?.handled === "true"
      ? true
      : params?.handled === "false"
        ? false
        : undefined;

  const { data: inquiries, count } = await getJoinInquiries({ handled });
  const unhandled = inquiries.filter((i) => !i.handled).length;

  return (
    <div>
      <ListToolbar count={count} noun="Anmeldungen" />
      <form className="flex flex-wrap gap-3 my-4">
        <select
          name="handled"
          defaultValue={params?.handled || ""}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Alle</option>
          <option value="false">Neu ({unhandled})</option>
          <option value="true">Erledigt</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg"
        >
          Filtern
        </button>
      </form>

      {inquiries.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <UserPlus className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Noch keine Anmeldungen.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((row) => (
            <div
              key={row.id}
              className={`bg-card rounded-2xl border p-5 ${
                row.handled
                  ? "border-green-500/60 ring-1 ring-green-500/20"
                  : "border-primary/30"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground">
                      {row.contact_name}
                      {row.child_name ? ` · ${row.child_name}` : ""}
                    </p>
                    {row.handled ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        <CheckCheck className="w-3.5 h-3.5" />
                        Erledigt
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        Neu
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <a
                      href={`mailto:${row.email}`}
                      className="hover:text-primary"
                    >
                      {row.email}
                    </a>
                    {row.phone ? ` · ${row.phone}` : ""} ·{" "}
                    {formatDate(row.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <form action={toggleJoinHandled}>
                    <input type="hidden" name="id" value={row.id} />
                    <input
                      type="hidden"
                      name="handled"
                      value={String(row.handled)}
                    />
                    <button
                      type="submit"
                      className={`p-1.5 rounded-lg hover:bg-muted ${
                        row.handled
                          ? "text-green-600"
                          : "text-muted-foreground hover:text-green-600"
                      }`}
                      title={
                        row.handled
                          ? "Als neu markieren"
                          : "Als erledigt markieren"
                      }
                    >
                      {row.handled ? (
                        <CheckCheck className="w-4 h-4" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </form>
                  <DeleteButton
                    action={deleteJoinInquiry}
                    id={row.id}
                    confirmText="Diese Anmeldung löschen?"
                  />
                </div>
              </div>
              <dl className="mt-3 grid sm:grid-cols-3 gap-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Geburtsjahr</dt>
                  <dd className="font-medium">{row.birth_year}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">Mannschaft</dt>
                  <dd className="font-medium">{row.team_name}</dd>
                </div>
              </dl>
              {row.message && (
                <p className="text-sm text-muted-foreground mt-3 whitespace-pre-line">
                  {row.message}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useTransition } from "react";
import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { postNewsToInstagram, upsertNews } from "@/app/admin/actions";
import {
  AdminForm,
  CheckboxField,
  TextArea,
  TextField,
  SelectField,
  ImageUploadField,
} from "@/components/admin/form-ui";
import { useConfirm } from "@/components/admin/confirm";
import type { NewsArticle } from "@/lib/types";

function InstagramPublishPanel({
  id,
  hasImages,
  published,
}: {
  id: number;
  hasImages: boolean;
  published: boolean;
}) {
  const [pending, start] = useTransition();
  const confirm = useConfirm();

  function publish() {
    void (async () => {
      const ok = await confirm({
        title: "Auf Instagram veröffentlichen",
        description: "Die gespeicherte Version des Beitrags wird veröffentlicht.",
        confirmLabel: "Veröffentlichen",
      });
      if (!ok) return;
      start(async () => {
        const res = await postNewsToInstagram(id);
        if (res.ok) toast.success("Auf Instagram veröffentlicht");
        else toast.error(res.error ?? "Veröffentlichen fehlgeschlagen");
      });
    })();
  }

  return (
    <div className="mt-6 max-w-2xl rounded-2xl border border-border bg-card p-4 flex flex-wrap items-center justify-between gap-3">
      <div className="text-sm">
        <p className="font-medium text-foreground">Instagram</p>
        <p className="text-xs text-muted-foreground">
          {published
            ? "Dieser Beitrag wurde bereits auf Instagram veröffentlicht."
            : hasImages
              ? "Veröffentlicht die gespeicherte Version (Titelbild oder Galerie). Änderungen zuerst speichern."
              : "Titelbild oder Galerie hinzufügen (und speichern), um zu veröffentlichen."}
        </p>
      </div>
      <button
        type="button"
        onClick={publish}
        disabled={pending || !hasImages || published}
        className="inline-flex items-center gap-2 bg-primary hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
      >
        <Share2 className="w-4 h-4" />
        {pending ? "Wird veröffentlicht…" : "Auf Instagram veröffentlichen"}
      </button>
    </div>
  );
}

export function NewsForm({ article }: { article?: NewsArticle }) {
  const [cover, setCover] = useState(article?.cover_image ?? "");
  const [gallery, setGallery] = useState<string[]>(article?.images ?? []);
  const [body, setBody] = useState(article?.body ?? "");

  useEffect(() => {
    const draft = sessionStorage.getItem("ocr-draft-body");
    if (!draft || article?.body) return;
    setBody(draft);
    sessionStorage.removeItem("ocr-draft-body");
  }, [article?.body]);
  const savedHasImages = Boolean(
    article?.cover_image || (article?.images?.length ?? 0) > 0,
  );
  const isEdit = Boolean(article?.id);
  return (
    <>
      <AdminForm
        action={upsertNews}
        cancelHref="/admin/news"
        submitLabel={isEdit ? "Speichern" : "Veröffentlichen"}
      >
        {article && <input type="hidden" name="id" value={article.id} />}
        {/* <input type="hidden" name="images" value={JSON.stringify(gallery)} /> */}
        <TextField
          label="Titel"
          name="title"
          required
          defaultValue={article?.title}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Kategorie"
            name="category"
            required
            defaultValue={article?.category ?? ""}
            options={[
              {
                label: "Ergebnisse",
                value: "Ergebnisse",
              },
              {
                label: "Verein",
                value: "Verein",
              },
              {
                label: "Pokal",
                value: "Pokal",
              },
              {
                label: "Sonstiges",
                value: "Sonstiges",
              },
            ]}
          />
        </div>

        <ImageUploadField
          label="Titelbild"
          name="cover_file"
          preview={cover}
        />
        {gallery.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Galerie ({gallery.length})
            </label>
            <div className="flex flex-wrap gap-3">
              {gallery.map((url, i) => (
                <div
                  key={`${url}-${i}`}
                  className="group relative overflow-hidden rounded-xl border border-border"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Bild ${i + 1}`}
                    className="h-32 w-auto object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/60 px-2 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => setCover(url)}
                      className="text-[11px] font-medium text-white hover:underline"
                    >
                      Titelbild
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setGallery((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      className="text-[11px] font-medium text-red-300 hover:underline"
                    >
                      Entfernen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <TextArea
          label="Inhalt"
          name="body"
          rows={10}
          value={body}
          onChange={setBody}
        />
        <CheckboxField
          label="Auf Instagram veröffentlichen"
          name="publish_instagram"
          defaultChecked={false}
        />
      </AdminForm>
      {article && (
        <InstagramPublishPanel
          id={article.id}
          hasImages={savedHasImages}
          published={article.instagram_posted}
        />
      )}
    </>
  );
}

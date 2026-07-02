"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, FilePlus2 } from "lucide-react";
import { toast } from "sonner";
import { HandwritingOcrPanel } from "@/components/admin/handwriting-ocr-panel";
import { OcrImageGallery } from "@/components/admin/ocr-image-gallery";
import {
  itemsToText,
  revokeOcrPreview,
  type OcrItem,
} from "@/lib/ocr-types";

const fieldClass =
  "w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

export function HandwritingOcrWorkspace() {
  const [items, setItems] = useState<OcrItem[]>([]);
  const [text, setText] = useState("");
  const [appendMode, setAppendMode] = useState(false);

  function handleTranscribed(result: OcrItem, { append }: { append: boolean }) {
    setItems((prev) => {
      if (!append) {
        prev.forEach((item) => revokeOcrPreview(item.preview));
      }
      const next = append ? [...prev, result] : [result];
      setText(itemsToText(next));
      return next;
    });
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const removed = prev.find((item) => item.id === id);
      if (removed) revokeOcrPreview(removed.preview);
      const next = prev.filter((item) => item.id !== id);
      setText(itemsToText(next));
      return next;
    });
  }

  async function copyText() {
    if (!text.trim()) {
      toast.error("Kein Text zum Kopieren.");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Text kopiert.");
    } catch {
      toast.error("Text konnte nicht kopiert werden.");
    }
  }

  function useInNews() {
    if (!text.trim()) {
      toast.error("Bitte zuerst Text transkribieren.");
      return;
    }
    sessionStorage.setItem("ocr-draft-body", text);
    toast.success("Text gespeichert — beim Erstellen einer News einfügen.");
  }

  return (
    <div className="max-w-3xl space-y-6">
      <p className="text-sm text-muted-foreground">
        Lade ein oder mehrere Fotos mit handschriftlichem Text hoch und erhalte
        eine bearbeitbare Transkription. Du kannst sie kopieren oder für eine
        News-Story verwenden.
      </p>

      <HandwritingOcrPanel
        description="Mehrere Bilder auf einmal oder einzeln fotografieren (JPG, PNG, WEBP, HEIC)."
        replaceOnUpload={!appendMode}
        hasExistingItems={items.length > 0}
        onTranscribed={handleTranscribed}
      />

      {items.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">
            Bilder ({items.length})
          </p>
          <OcrImageGallery items={items} onRemove={removeItem} />
        </div>
      )}

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={appendMode}
          onChange={(e) => setAppendMode(e.target.checked)}
          className="rounded border-border"
        />
        Zum bestehenden Text hinzufügen (sonst ersetzt das erste Bild das
        Ergebnis)
      </label>

      <div>
        <label
          htmlFor="ocr-result"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Transkribierter Text
        </label>
        <textarea
          id="ocr-result"
          rows={14}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Der erkannte Text erscheint hier…"
          className={fieldClass}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void copyText()}
          disabled={!text.trim()}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-60"
        >
          <Copy className="w-4 h-4" />
          Kopieren
        </button>
        <button
          type="button"
          onClick={useInNews}
          disabled={!text.trim()}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-60"
        >
          <FilePlus2 className="w-4 h-4" />
          Für News speichern
        </button>
        <Link
          href="/admin/news/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
        >
          Neue News
        </Link>
      </div>
    </div>
  );
}

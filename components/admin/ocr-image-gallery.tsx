"use client";

import { FileImage, X } from "lucide-react";
import type { OcrItem } from "@/lib/ocr-types";

export function OcrImageGallery({
  items,
  onRemove,
}: {
  items: OcrItem[];
  onRemove: (id: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="group relative h-32 w-32 overflow-hidden rounded-xl border border-border bg-card"
        >
          {item.preview.startsWith("heic:") ? (
            <div className="flex h-full flex-col items-center justify-center gap-1 px-2 text-center text-[11px] text-muted-foreground">
              <FileImage className="h-6 w-6 text-primary" />
              <span className="line-clamp-2">{item.fileName}</span>
            </div>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={item.preview}
              alt={item.fileName}
              className="h-full w-full object-cover"
            />
          )}
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="absolute right-1.5 top-1.5 rounded-full bg-black/70 p-1 text-white opacity-0 transition-opacity hover:bg-black group-hover:opacity-100"
            aria-label={`${item.fileName} entfernen`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

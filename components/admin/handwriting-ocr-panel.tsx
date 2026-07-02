"use client";

import { useRef, useState } from "react";
import { Camera, FileImage, Loader2, ScanText } from "lucide-react";
import { toast } from "sonner";
import { CameraCaptureModal } from "@/components/admin/camera-capture-modal";
import type { OcrItem } from "@/lib/ocr-types";

type Props = {
  onTranscribed: (result: OcrItem, options: { append: boolean }) => void;
  disabled?: boolean;
  description?: string;
  replaceOnUpload?: boolean;
  hasExistingItems?: boolean;
};

const MAX_FILES_PER_BATCH = 10;

const MAX_EDGE_PX = 2000;
const JPEG_QUALITY = 0.85;

const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "heic",
  "heif",
]);

function isImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return Boolean(ext && IMAGE_EXTENSIONS.has(ext));
}

function isHeicFile(file: File): boolean {
  const type = file.type.toLowerCase();
  if (type === "image/heic" || type === "image/heif") return true;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext === "heic" || ext === "heif";
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      let dataUrl = String(reader.result);
      if (isHeicFile(file) && !dataUrl.startsWith("data:image/heic") && !dataUrl.startsWith("data:image/heif")) {
        const ext = file.name.split(".").pop()?.toLowerCase();
        const mime = ext === "heif" ? "image/heif" : "image/heic";
        const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
        dataUrl = `data:${mime};base64,${base64}`;
      }
      resolve(dataUrl);
    };
    reader.onerror = () => reject(new Error("Bild konnte nicht gelesen werden."));
    reader.readAsDataURL(file);
  });
}

async function prepareImageForApi(file: File): Promise<string> {
  if (isHeicFile(file)) return fileToDataUrl(file);
  return compressImageForOcr(file);
}

function drawToJpegDataUrl(
  source: CanvasImageSource,
  width: number,
  height: number,
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Bild konnte nicht verarbeitet werden.");
  }
  ctx.drawImage(source, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Bild konnte nicht komprimiert werden."));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Bild konnte nicht gelesen werden."));
        reader.readAsDataURL(blob);
      },
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
}

async function compressWithBitmap(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  try {
    return await drawToJpegDataUrl(bitmap, width, height);
  } finally {
    bitmap.close();
  }
}

async function compressWithImageElement(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () =>
        reject(
          new Error(
            "Bild konnte nicht geöffnet werden. Verwende JPG, PNG, WEBP oder HEIC.",
          ),
        );
      el.src = url;
    });
    const scale = Math.min(1, MAX_EDGE_PX / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));
    return await drawToJpegDataUrl(img, width, height);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function compressImageForOcr(file: File): Promise<string> {
  try {
    return await compressWithBitmap(file);
  } catch {
    return await compressWithImageElement(file);
  }
}

export function HandwritingOcrPanel({
  onTranscribed,
  disabled,
  description = "Lade ein oder mehrere gut beleuchtete Fotos hoch (JPG, PNG, WEBP, HEIC).",
  replaceOnUpload = true,
  hasExistingItems = false,
}: Props) {
  const uploadRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(
    null,
  );
  const [cameraOpen, setCameraOpen] = useState(false);

  function shouldAppend(index: number): boolean {
    if (index > 0) return true;
    return !replaceOnUpload && hasExistingItems;
  }

  function makePreview(file: File): string {
    if (isHeicFile(file)) return `heic:${file.name}`;
    return URL.createObjectURL(file);
  }

  async function transcribeOne(
    file: File,
    requestId: number,
  ): Promise<OcrItem | null> {
    if (!isImageFile(file)) return null;

    const preview = makePreview(file);
    const image = await prepareImageForApi(file);
    if (requestId !== requestIdRef.current) return null;

    const res = await fetch("/api/handwriting-ocr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image }),
    });
    const data = (await res.json()) as { ok: boolean; text?: string; error?: string };

    if (requestId !== requestIdRef.current) return null;

    if (!res.ok || !data.ok || !data.text) {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
      toast.error(
        data.error ?? `Transkription fehlgeschlagen: ${file.name || "Bild"}.`,
      );
      return null;
    }

    return {
      id: crypto.randomUUID(),
      text: data.text,
      preview,
      fileName: file.name || "Bild",
    };
  }

  async function transcribeFiles(files: File[]) {
    const valid = files.filter(isImageFile);
    if (valid.length === 0) {
      toast.error("Bitte JPG-, PNG-, WEBP- oder HEIC-Bilder wählen.");
      return;
    }
    if (valid.length > MAX_FILES_PER_BATCH) {
      toast.error(`Maximal ${MAX_FILES_PER_BATCH} Bilder gleichzeitig.`);
      return;
    }

    const requestId = ++requestIdRef.current;
    setPending(true);
    setProgress({ current: 0, total: valid.length });

    let completed = 0;

    try {
      for (let i = 0; i < valid.length; i++) {
        if (requestId !== requestIdRef.current) return;

        setProgress({ current: i + 1, total: valid.length });
        const result = await transcribeOne(valid[i], requestId);
        if (!result) continue;

        completed++;
        onTranscribed(result, { append: shouldAppend(i) });
      }

      if (requestId !== requestIdRef.current) return;

      if (completed === 0) return;

      toast.success(
        completed === 1
          ? "Text erfolgreich transkribiert."
          : `${completed} Bilder erfolgreich transkribiert.`,
      );
    } catch (e) {
      if (requestId !== requestIdRef.current) return;
      const message =
        e instanceof Error ? e.message : "Verbindungsfehler beim Transkribieren.";
      toast.error(message);
    } finally {
      if (requestId === requestIdRef.current) {
        setPending(false);
        setProgress(null);
      }
    }
  }

  async function transcribe(file: File) {
    await transcribeFiles([file]);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length > 0) void transcribeFiles(files);
  }

  const pendingLabel =
    progress && progress.total > 1
      ? `Transkribiere ${progress.current}/${progress.total}…`
      : "Transkribiere…";

  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground flex items-center gap-2">
            <ScanText className="w-4 h-4 text-primary" />
            Handschrift transkribieren
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-md">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled || pending}
            onClick={() => uploadRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileImage className="w-4 h-4" />
            )}
            {pending ? pendingLabel : "Bilder hochladen"}
          </button>
          <button
            type="button"
            disabled={disabled || pending}
            onClick={() => setCameraOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-60"
          >
            <Camera className="w-4 h-4" />
            Foto aufnehmen
          </button>
        </div>
      </div>

      <input
        ref={uploadRef}
        type="file"
        multiple
        accept="image/*,.jpg,.jpeg,.png,.webp,.heic,.heif"
        className="hidden"
        onChange={onFileChange}
      />

      <CameraCaptureModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(file) => void transcribe(file)}
      />
    </div>
  );
}

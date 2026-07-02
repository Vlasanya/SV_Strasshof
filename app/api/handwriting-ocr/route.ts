import { NextResponse } from "next/server";
import {
  isAllowedOcrImageType,
  isOcrReadyImageType,
  transcribeHandwriting,
} from "@/lib/handwriting-ocr";
import { heicBufferToJpegDataUrl, isHeicImageType } from "@/lib/heic";
import { hasOpenAiKey } from "@/lib/openai";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 25 * 1024 * 1024;

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

function resolveFileMime(file: File): string {
  const type = file.type.toLowerCase();
  if (type && type !== "application/octet-stream") return type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "heic") return "image/heic";
  if (ext === "heif") return "image/heif";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  return "image/jpeg";
}

function bufferToDataUrl(buffer: ArrayBuffer, mime: string): string {
  const base64 = Buffer.from(buffer).toString("base64");
  return `data:${mime};base64,${base64}`;
}

function dataUrlToBuffer(dataUrl: string): Buffer {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  return Buffer.from(base64, "base64");
}

async function prepareImageForOcr(dataUrl: string): Promise<string> {
  const mime = dataUrl.slice("data:".length, dataUrl.indexOf(";"));
  if (isOcrReadyImageType(mime)) return dataUrl;
  if (!isHeicImageType(mime)) {
    throw new Error("Format nicht unterstützt. Verwende JPG, PNG, WEBP oder HEIC.");
  }
  try {
    return await heicBufferToJpegDataUrl(dataUrlToBuffer(dataUrl));
  } catch {
    throw new Error("HEIC-Bild konnte nicht konvertiert werden.");
  }
}

export async function POST(request: Request) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Nicht autorisiert." },
      { status: 401 },
    );
  }

  if (!hasOpenAiKey()) {
    return NextResponse.json(
      { ok: false, error: "OPENAI_API_KEY ist nicht konfiguriert." },
      { status: 500 },
    );
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";
    let imageDataUrl: string | null = null;

    if (contentType.includes("application/json")) {
      const body = (await request.json()) as { image?: string };
      const raw = body.image?.trim();
      if (!raw?.startsWith("data:image/")) {
        return NextResponse.json(
          { ok: false, error: "Ungültiges Bild." },
          { status: 400 },
        );
      }
      const mime = raw.slice("data:".length, raw.indexOf(";"));
      if (!isAllowedOcrImageType(mime)) {
        return NextResponse.json(
          {
            ok: false,
            error: "Format nicht unterstützt. Verwende JPG, PNG, WEBP oder HEIC.",
          },
          { status: 400 },
        );
      }
      const approxBytes = Math.ceil((raw.length - raw.indexOf(",") - 1) * 0.75);
      if (approxBytes > MAX_BYTES) {
        return NextResponse.json(
          { ok: false, error: "Das Bild darf maximal 25 MB groß sein." },
          { status: 400 },
        );
      }
      imageDataUrl = raw;
    } else if (contentType.includes("multipart/form-data")) {
      let form: FormData;
      try {
        form = await request.formData();
      } catch {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Bild konnte nicht gelesen werden. Probiere ein kleineres Foto.",
          },
          { status: 400 },
        );
      }
      const file = form.get("image");
      if (!(file instanceof File) || file.size === 0) {
        return NextResponse.json(
          { ok: false, error: "Bitte ein gültiges Bild hochladen." },
          { status: 400 },
        );
      }
      if (file.size > MAX_BYTES) {
        return NextResponse.json(
          { ok: false, error: "Das Bild darf maximal 25 MB groß sein." },
          { status: 400 },
        );
      }
      const mime = resolveFileMime(file);
      if (!isAllowedOcrImageType(mime)) {
        return NextResponse.json(
          {
            ok: false,
            error: "Format nicht unterstützt. Verwende JPG, PNG, WEBP oder HEIC.",
          },
          { status: 400 },
        );
      }
      imageDataUrl = bufferToDataUrl(await file.arrayBuffer(), mime);
    } else {
      return NextResponse.json(
        { ok: false, error: "Anfrageformat nicht unterstützt." },
        { status: 400 },
      );
    }

    const readyImage = await prepareImageForOcr(imageDataUrl);
    const text = await transcribeHandwriting(readyImage);
    return NextResponse.json({ ok: true, text });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Fehler beim Transkribieren.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

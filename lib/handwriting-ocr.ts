import { getOpenAiClient } from "@/lib/openai";

const OCR_PROMPT = `You are a professional OCR assistant.

Read the handwritten text from the provided image.

Return only the transcribed text.

Preserve:
- paragraphs
- line breaks
- punctuation
- numbered and bulleted lists

Do not add explanations or commentary.

If a word is difficult to read, return the most likely interpretation.`;

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export function isAllowedOcrImageType(mime: string): boolean {
  return ALLOWED_MIME.has(mime.toLowerCase());
}

/** Types accepted before server-side HEIC conversion. */
export function isOcrReadyImageType(mime: string): boolean {
  const m = mime.toLowerCase();
  return (
    m === "image/jpeg" ||
    m === "image/jpg" ||
    m === "image/png" ||
    m === "image/webp"
  );
}

export async function transcribeHandwriting(
  imageDataUrl: string,
): Promise<string> {
  const client = getOpenAiClient();

  const response = await client.responses.create({
    model: "gpt-4.1",
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: OCR_PROMPT },
          {
            type: "input_image",
            image_url: imageDataUrl,
            detail: "high",
          },
        ],
      },
    ],
  });

  const text = response.output_text?.trim();
  if (!text) {
    throw new Error("Der Text konnte nicht aus dem Bild gelesen werden.");
  }
  return text;
}

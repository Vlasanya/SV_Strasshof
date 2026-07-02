import convert from "heic-convert";

export function isHeicImageType(mime: string): boolean {
  const m = mime.toLowerCase();
  return m === "image/heic" || m === "image/heif";
}

export async function heicBufferToJpegDataUrl(buffer: Buffer): Promise<string> {
  const output = await convert({
    buffer,
    format: "JPEG",
    quality: 0.85,
  });
  const jpeg = Buffer.from(output);
  return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
}

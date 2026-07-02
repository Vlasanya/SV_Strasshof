export type OcrItem = {
  id: string;
  text: string;
  preview: string;
  fileName: string;
};

export function revokeOcrPreview(preview: string) {
  if (preview.startsWith("blob:")) {
    URL.revokeObjectURL(preview);
  }
}

export function itemsToText(items: OcrItem[]): string {
  return items.map((item) => item.text).join("\n\n");
}

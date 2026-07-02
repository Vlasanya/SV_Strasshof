import type { Metadata } from "next";
import { HandwritingOcrWorkspace } from "@/components/admin/handwriting-ocr-workspace";

export const metadata: Metadata = { title: "Handschrift transkribieren" };

export default function AdminTranscriptionPage() {
  return <HandwritingOcrWorkspace />;
}

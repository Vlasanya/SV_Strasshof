import { Suspense } from "react";
import { SiteZugangForm } from "@/components/site/site-zugang-form";

export default function SiteZugangPage() {
  return (
    <Suspense
      fallback={
        <section className="section-dark min-h-[70vh] flex items-center justify-center">
          <p className="text-on-dark-muted text-sm">Laden…</p>
        </section>
      }
    >
      <SiteZugangForm />
    </Suspense>
  );
}

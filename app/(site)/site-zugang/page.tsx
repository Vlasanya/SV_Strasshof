import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SiteZugangForm } from "@/components/site/site-zugang-form";
import {
  hasSiteAccessCookie,
  siteAccessCookieName,
} from "@/lib/site-access";

function safeNextPath(raw?: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/";
}

export default async function SiteZugangPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params?.next);
  const cookieStore = await cookies();
  const token = cookieStore.get(siteAccessCookieName())?.value;

  if (hasSiteAccessCookie(token)) {
    redirect(next);
  }

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

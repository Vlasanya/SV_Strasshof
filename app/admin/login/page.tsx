import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";
import { getClubInfo, getSiteSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Acceso administración" };

export default async function LoginPage() {
  const [club, settings] = await Promise.all([
    getClubInfo(),
    getSiteSettings(),
  ]);
  return (
    <Suspense>
      <LoginForm
        clubName={club.name}
        logoUrl={settings["brand_logo_url"] || null}
      />
    </Suspense>
  );
}

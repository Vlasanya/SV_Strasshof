import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { AdminShell } from "@/components/admin/admin-shell";
import { getClubInfo, getSiteSettings } from "@/lib/data";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let email: string | null = null;

  if (hasSupabaseEnv()) {
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      email = user?.email ?? null;
    } catch {
      email = null;
    }
  }

  // Unauthenticated (e.g. the /admin/login page) renders without the chrome.
  if (!email) return <>{children}</>;

  const [club, settings] = await Promise.all([getClubInfo(), getSiteSettings()]);

  return (
    <AdminShell
      email={email}
      clubName={club.name}
      logoUrl={settings["brand_logo_url"] || null}
    >
      {children}
    </AdminShell>
  );
}

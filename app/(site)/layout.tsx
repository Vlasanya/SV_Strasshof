import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ImageLightbox } from "@/components/site/image-lightbox";
import { getClubInfo, getSiteSettings } from "@/lib/data";

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [club, settings] = await Promise.all([getClubInfo(), getSiteSettings()]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader club={club} logoUrl={settings["brand_logo_url"] || null} />
      <main className="flex-1">{children}</main>
      <SiteFooter club={club} logoUrl={settings["brand_logo_url"] || null} />
      <ImageLightbox />
    </div>
  );
}

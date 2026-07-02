import type { Metadata } from "next";
import { Bebas_Neue, Montserrat } from "next/font/google";
import { Toaster } from "sonner";
import { getClubInfo } from "@/lib/data";
import { SITE_THEME } from "@/lib/theme";
import "./globals.css";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display-next",
  display: "swap",
});

const body = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans-next",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const club = await getClubInfo();
  return {
    title: {
      default: `${club.name} — ${club.tagline}`,
      template: `%s · ${club.name}`,
    },
    description: `Offizielle Website von ${club.name}. Mannschaften, Spiele, Ergebnisse, News und mehr.`,
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      data-theme={SITE_THEME}
      className={`${display.variable} ${body.variable}`}
    >
      <body className="antialiased">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { getSettings } from "@/lib/data";
import { settingsToCssVars } from "@/lib/settings";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { default: `${s.league_name} · Inicio`, template: `%s · ${s.league_name}` },
    description: s.tagline,
    openGraph: {
      title: s.league_name,
      description: s.tagline,
      type: "website",
    },
    icons: s.logo_url ? { icon: s.logo_url } : undefined,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const cssVars = settingsToCssVars(settings) as React.CSSProperties;

  return (
    <html lang="es" style={cssVars}>
      <body>
        <div className="flex min-h-dvh flex-col">
          <SiteHeader settings={settings} />
          <main className="flex-1 py-6 sm:py-10">{children}</main>
          <SiteFooter settings={settings} />
        </div>
      </body>
    </html>
  );
}

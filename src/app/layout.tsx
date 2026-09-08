import type { Metadata } from "next";
import "./globals.css";
import { getSettings } from "@/lib/data";
import { settingsToCssVars } from "@/lib/settings";
import { getDict, getLocale } from "@/lib/i18n-server";
import { SiteHeader, type NavItem } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AuthHashRedirect } from "@/components/auth-hash-redirect";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { default: `${s.league_name}`, template: `%s · ${s.league_name}` },
    description: s.tagline,
    openGraph: { title: s.league_name, description: s.tagline, type: "website" },
    icons: s.logo_url ? { icon: s.logo_url } : undefined,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, dict, locale] = await Promise.all([
    getSettings(),
    getDict(),
    getLocale(),
  ]);
  const cssVars = settingsToCssVars(settings) as React.CSSProperties;

  const nav: NavItem[] = [
    { href: "/", label: dict.nav.home },
    { href: "/calendario", label: dict.nav.calendar },
    { href: "/posiciones", label: dict.nav.standings },
    { href: "/pilotos", label: dict.nav.drivers },
    { href: "/escuderias", label: dict.nav.teams },
    { href: "/resultados", label: dict.nav.results },
    { href: "/penalizaciones", label: dict.nav.penalties },
    { href: "/reglamento", label: dict.nav.regulation },
    { href: "/inscripciones", label: dict.nav.registration },
    { href: "/contacto", label: dict.nav.contact },
  ];

  return (
    <html lang={locale} style={cssVars}>
      <body>
        <AuthHashRedirect />
        <div className="flex min-h-dvh flex-col">
          <SiteHeader settings={settings} nav={nav} locale={locale} />
          <main className="flex-1 py-6 sm:py-10">{children}</main>
          <SiteFooter settings={settings} panelLabel={dict.footer.panel} />
        </div>
      </body>
    </html>
  );
}

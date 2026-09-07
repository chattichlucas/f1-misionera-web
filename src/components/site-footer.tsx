import Link from "next/link";
import type { SiteSettings } from "@/lib/types";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const socials: Array<[string, string | null]> = [
    ["Discord", settings.discord_url],
    ["Instagram", settings.instagram_url],
    ["YouTube", settings.youtube_url],
    ["Twitch", settings.twitch_url],
    ["TikTok", settings.tiktok_url],
  ];

  return (
    <footer className="border-t" style={{ borderColor: "var(--line)" }}>
      <div className="shell flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wide">
            {settings.league_name}
          </p>
          <p className="text-sm text-muted">{settings.tagline}</p>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          {socials
            .filter(([, url]) => Boolean(url))
            .map(([label, url]) => (
              <a
                key={label}
                href={url as string}
                target="_blank"
                rel="noopener noreferrer"
                className="chip hover:border-primary"
              >
                {label}
              </a>
            ))}
          {settings.contact_email && (
            <a href={`mailto:${settings.contact_email}`} className="chip hover:border-primary">
              Contacto
            </a>
          )}
        </div>
      </div>
      <div className="shell pb-8 text-xs text-muted">
        © {new Date().getFullYear()} {settings.league_name}. ·{" "}
        <Link href="/admin" className="hover:text-text">
          Panel
        </Link>
      </div>
    </footer>
  );
}

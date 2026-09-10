import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { getSponsors } from "@/lib/data";
import { SponsorStrip } from "@/components/sponsors";
import { SocialIcon } from "@/components/social-icon";

export async function SiteFooter({
  settings,
  panelLabel = "Panel",
}: {
  settings: SiteSettings;
  panelLabel?: string;
}) {
  const sponsors = await getSponsors();

  const socials: Array<[string, string | null]> = [
    ["Discord", settings.discord_url],
    ["Instagram", settings.instagram_url],
    ["YouTube", settings.youtube_url],
    ["Twitch", settings.twitch_url],
    ["TikTok", settings.tiktok_url],
  ];

  return (
    <footer className="border-t" style={{ borderColor: "var(--line)" }}>
      {sponsors.length > 0 && (
        <div className="border-b py-8" style={{ borderColor: "var(--line)" }}>
          <div className="shell">
            <p className="mb-4 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
              Sponsors
            </p>
            <SponsorStrip sponsors={sponsors} />
          </div>
        </div>
      )}
      <div className="shell flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wide">
            {settings.league_name}
          </p>
          <p className="text-sm text-muted">{settings.tagline}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          {socials
            .filter(([, url]) => Boolean(url))
            .map(([label, url]) => (
              <a
                key={label}
                href={url as string}
                target="_blank"
                rel="noopener noreferrer"
                title={label}
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:text-text"
                style={{ border: "1px solid var(--line)" }}
              >
                <SocialIcon network={label} className="h-[18px] w-[18px]" />
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
          {panelLabel}
        </Link>
      </div>
    </footer>
  );
}

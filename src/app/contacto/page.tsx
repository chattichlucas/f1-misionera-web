import { getOrganizers, getSettings } from "@/lib/data";
import { getDict } from "@/lib/i18n-server";
import { PageHero, Panel, EmptyState } from "@/components/ui";
import { SocialIcon } from "@/components/social-icon";

export const revalidate = 60;

export default async function ContactoPage() {
  const [organizers, settings, d] = await Promise.all([
    getOrganizers(),
    getSettings(),
    getDict(),
  ]);

  const socials: Array<[string, string | null]> = [
    ["Discord", settings.discord_url],
    ["Instagram", settings.instagram_url],
    ["YouTube", settings.youtube_url],
    ["Twitch", settings.twitch_url],
    ["TikTok", settings.tiktok_url],
  ];

  return (
    <div className="space-y-6">
      <PageHero eyebrow={settings.league_name} title={d.pages.contactTitle}>
        {d.pages.contactSub}
      </PageHero>

      <section className="shell grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel className="p-5">
          <h2 className="font-bold">{d.pages.contactOrg}</h2>
          {organizers.length === 0 ? (
            <EmptyState>{d.pages.contactEmpty}</EmptyState>
          ) : (
            <ul className="mt-3 divide-y" style={{ borderColor: "var(--line)" }}>
              {organizers.map((o) => (
                <li key={o.id} className="flex items-center gap-3 py-3">
                  {o.photo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={o.photo_url} alt={o.name} className="h-10 w-10 rounded-full object-cover" />
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {o.name}
                      {o.role && <span className="ml-2 text-xs text-muted">{o.role}</span>}
                    </p>
                    <p className="text-sm text-muted">
                      {[
                        o.email,
                        o.discord && `Discord: ${o.discord}`,
                        o.whatsapp && `WhatsApp: ${o.whatsapp}`,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel className="p-5">
          <h2 className="font-bold">{d.pages.contactChannels}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {socials
              .filter(([, u]) => Boolean(u))
              .map(([label, url]) => (
                <a
                  key={label}
                  href={url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chip hover:border-primary"
                >
                  <SocialIcon network={label} className="h-4 w-4" />
                  {label}
                </a>
              ))}
            {settings.contact_email && (
              <a href={`mailto:${settings.contact_email}`} className="chip hover:border-primary">
                {settings.contact_email}
              </a>
            )}
          </div>
        </Panel>
      </section>
    </div>
  );
}

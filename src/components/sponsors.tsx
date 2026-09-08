import type { Sponsor } from "@/lib/types";
import { Panel, PanelTitle } from "@/components/ui";

function Logo({ s }: { s: Sponsor }) {
  const inner = s.logo_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={s.logo_url}
      alt={s.name}
      className="h-10 w-auto max-w-[140px] object-contain opacity-80 transition hover:opacity-100"
    />
  ) : (
    <span className="text-sm font-bold text-muted">{s.name}</span>
  );
  return s.url ? (
    <a href={s.url} target="_blank" rel="noopener noreferrer" title={s.name}>
      {inner}
    </a>
  ) : (
    <span title={s.name}>{inner}</span>
  );
}

/** Tira compacta de logos (footer / home). */
export function SponsorStrip({ sponsors }: { sponsors: Sponsor[] }) {
  if (sponsors.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
      {sponsors.map((s) => (
        <Logo key={s.id} s={s} />
      ))}
    </div>
  );
}

/** Bloque con descripción (home). */
export function SponsorsBlock({ sponsors, title = "Sponsors" }: { sponsors: Sponsor[]; title?: string }) {
  if (sponsors.length === 0) return null;
  const withDesc = sponsors.filter((s) => s.description?.trim());
  return (
    <Panel>
      <PanelTitle title={title} />
      <div className="p-5">
        <SponsorStrip sponsors={sponsors} />
        {withDesc.length > 0 && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {withDesc.map((s) => (
              <div key={s.id} className="rounded-xl p-3" style={{ background: "var(--panel-2)" }}>
                <p className="text-sm font-bold">
                  {s.name}
                  {s.tier && <span className="ml-2 text-xs text-muted">{s.tier}</span>}
                </p>
                <p className="text-sm text-muted">{s.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}

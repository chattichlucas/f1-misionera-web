import { getSettings } from "@/lib/data";
import { getDict } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const [s, d] = await Promise.all([getSettings(), getDict()]);
  return (
    <div className="shell flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="panel max-w-md p-8">
        <p className="eyebrow">{s.league_name}</p>
        <h1 className="mt-2 text-3xl font-extrabold">{d.pages.maintenanceTitle}</h1>
        <p className="mt-3 text-muted">
          {s.maintenance_message?.trim() || d.pages.maintenanceMsg}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm">
          {s.discord_url && (
            <a href={s.discord_url} target="_blank" rel="noopener noreferrer" className="chip hover:border-primary">
              Discord
            </a>
          )}
          {s.instagram_url && (
            <a href={s.instagram_url} target="_blank" rel="noopener noreferrer" className="chip hover:border-primary">
              Instagram
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

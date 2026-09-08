import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSettings } from "@/lib/data";
import { RESOURCE_LIST } from "@/lib/admin/resources";
import {
  getMyPermissions,
  canView,
  canEdit,
  canSeeAnything,
  SUPERADMIN_EMAILS,
} from "@/lib/permissions";
import { signOut } from "../auth-actions";

export const metadata = { title: "Panel" };
export const dynamic = "force-dynamic";

/** Si el email está en SUPERADMIN_EMAILS, lo aseguramos en la tabla (self-heal). */
async function ensureSuperadmin(email: string | null | undefined) {
  if (!email || !SUPERADMIN_EMAILS.includes(email.toLowerCase())) return;
  try {
    const admin = createAdminClient();
    await admin
      .from("superadmins")
      .upsert({ email: email.toLowerCase() }, { onConflict: "email" });
  } catch {
    // sin service_role key: no pasa nada, el modo compat cubre
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!hasSupabaseEnv()) {
    return (
      <div className="shell py-10">
        <div className="panel p-6">
          <h1 className="text-lg font-extrabold">Falta configurar Supabase</h1>
          <p className="mt-2 text-sm text-muted">
            Definí <code>NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en el <code>.env</code> del servidor
            y volvé a desplegar.
          </p>
        </div>
      </div>
    );
  }

  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/admin/login");

  await ensureSuperadmin(user.email);
  const [mp, settings] = await Promise.all([getMyPermissions(), getSettings()]);

  const nav: { href: string; label: string }[] = [{ href: "/admin", label: "Resumen" }];
  if (canView(mp, "inscriptions"))
    nav.push({ href: "/admin/inscripciones", label: "Inscripciones" });
  for (const r of RESOURCE_LIST) {
    if (canView(mp, r.key)) nav.push({ href: `/admin/manage/${r.key}`, label: r.label });
  }
  if (canEdit(mp, "session_results") && settings.recalc_enabled)
    nav.push({ href: "/admin/recalcular", label: "Recalcular carrera" });
  if (canView(mp, "session_results"))
    nav.push({ href: "/admin/importaciones", label: "Importaciones" });
  if (canView(mp, "settings"))
    nav.push({ href: "/admin/ajustes", label: "Ajustes del sitio" });
  if (mp.superadmin) nav.push({ href: "/admin/usuarios", label: "Usuarios y permisos" });
  nav.push({ href: "/admin/cuenta", label: "Mi cuenta" });

  return (
    <div className="shell grid gap-6 py-6 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="panel p-3">
          <p className="px-2 py-1 text-xs text-muted">
            {user.email}
            {mp.superadmin && <span className="ml-1 text-primary">· superadmin</span>}
          </p>
          <nav className="mt-1 flex flex-col">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:bg-[var(--panel-2)] hover:text-text"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <form action={signOut} className="mt-2 border-t pt-2" style={{ borderColor: "var(--line)" }}>
            <button className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-muted hover:text-negative">
              Cerrar sesión
            </button>
          </form>
          <Link href="/" className="mt-1 block px-3 py-2 text-xs text-muted hover:text-text">
            ← Ver el sitio
          </Link>
        </div>
      </aside>
      <div className="min-w-0">
        {canSeeAnything(mp) ? (
          children
        ) : (
          <div className="panel p-6">
            <h1 className="text-lg font-extrabold">Sin permisos asignados</h1>
            <p className="mt-2 text-sm text-muted">
              Tu cuenta no tiene acceso a ningún módulo todavía. Pedile a un superadmin
              que te asigne permisos en <b>Usuarios y permisos</b>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { RESOURCE_LIST } from "@/lib/admin/resources";
import { signOut } from "../auth-actions";

export const metadata = { title: "Panel" };
export const dynamic = "force-dynamic";

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
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en las variables de entorno de
            Vercel y volvé a desplegar.
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

  const nav = [
    { href: "/admin", label: "Resumen" },
    { href: "/admin/inscripciones", label: "Inscripciones" },
    ...RESOURCE_LIST.map((r) => ({ href: `/admin/manage/${r.key}`, label: r.label })),
    { href: "/admin/ajustes", label: "Ajustes del sitio" },
  ];

  return (
    <div className="shell grid gap-6 py-6 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="panel p-3">
          <p className="px-2 py-1 text-xs text-muted">{user.email}</p>
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
      <div className="min-w-0">{children}</div>
    </div>
  );
}

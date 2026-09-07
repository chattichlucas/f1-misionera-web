import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getMyPermissions,
  MODULES,
  SUPERADMIN_EMAILS,
  type Level,
} from "@/lib/permissions";
import { UserPermissions } from "./manager";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const mp = await getMyPermissions();
  if (!mp.superadmin) {
    return (
      <div className="panel p-6">
        <h1 className="text-lg font-extrabold">Usuarios y permisos</h1>
        <p className="mt-2 text-sm text-muted">Solo para superadmins.</p>
      </div>
    );
  }

  // Lista de usuarios (requiere service_role key)
  let users: { id: string; email: string | null }[] = [];
  let listError: string | null = null;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });
    if (error) listError = error.message;
    else users = data.users.map((u) => ({ id: u.id, email: u.email ?? null }));
  } catch (e) {
    listError = e instanceof Error ? e.message : "No se pudo listar usuarios";
  }

  const sb = await createClient();
  const { data: permRows } = await sb.from("user_permissions").select("user_id, module, level");
  const byUser = new Map<string, Record<string, Level>>();
  for (const r of permRows ?? []) {
    const row = r as { user_id: string; module: string; level: Level };
    const m = byUser.get(row.user_id) ?? {};
    m[row.module] = row.level;
    byUser.set(row.user_id, m);
  }

  const superSet = new Set(SUPERADMIN_EMAILS);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Usuarios y permisos</h1>
      <p className="text-sm text-muted">
        Los superadmins (definidos en <code>SUPERADMIN_EMAILS</code>) tienen acceso total.
        Al resto le asignás nivel por módulo: <b>sin acceso</b>, <b>ver</b> o <b>editar</b>.
        Las cuentas se crean en Supabase → Authentication → Users.
      </p>

      {listError && (
        <p className="panel p-4 text-sm font-semibold text-negative">
          {listError} — ¿está seteada <code>SUPABASE_SERVICE_ROLE_KEY</code> en el .env?
        </p>
      )}

      <div className="space-y-3">
        {users.map((u) => {
          const isSuper = u.email ? superSet.has(u.email.toLowerCase()) : false;
          return (
            <div key={u.id} className="panel p-4">
              <div className="flex items-center justify-between">
                <p className="font-bold">{u.email ?? u.id}</p>
                {isSuper && <span className="chip text-primary">superadmin</span>}
              </div>
              {!isSuper && (
                <UserPermissions
                  userId={u.id}
                  modules={MODULES}
                  current={byUser.get(u.id) ?? {}}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { ChangePasswordForm } from "./form";

export const dynamic = "force-dynamic";

export default async function CuentaPage() {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Mi cuenta</h1>
      <p className="text-sm text-muted">
        Sesión: <span className="font-semibold">{user?.email}</span>
      </p>
      <ChangePasswordForm />
    </div>
  );
}

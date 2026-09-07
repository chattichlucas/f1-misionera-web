"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Los mails de Supabase (invitación / recuperación) redirigen a la Site URL
 * con los tokens en el hash: `/#access_token=...&type=invite`.
 * Si eso cae fuera de /admin/password, lo reenviamos ahí conservando el hash.
 */
export function AuthHashRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/admin/password") return;
    const hash = window.location.hash;
    if (!hash) return;
    const looksLikeAuth =
      hash.includes("access_token=") ||
      hash.includes("error_description=") ||
      hash.includes("type=recovery") ||
      hash.includes("type=invite");
    if (looksLikeAuth) {
      router.replace(`/admin/password${hash}`);
    }
  }, [pathname, router]);

  return null;
}

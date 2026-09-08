import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { getMaintenance } from "@/lib/maintenance";

export async function middleware(request: NextRequest) {
  const res = await updateSession(request);
  const path = request.nextUrl.pathname;

  // Mantenimiento: solo afecta al público (no /admin, no /api).
  const isPublic = !path.startsWith("/admin") && !path.startsWith("/api");
  if (isPublic) {
    const m = await getMaintenance();
    const hasSession = request.cookies
      .getAll()
      .some((c) => c.name.includes("auth-token"));

    if (m.on && !hasSession && path !== "/maintenance") {
      const url = request.nextUrl.clone();
      url.pathname = "/maintenance";
      return NextResponse.rewrite(url);
    }
    if (!m.on && path === "/maintenance") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

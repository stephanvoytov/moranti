/* =============================================
   Moranti — Proxy (formerly Middleware)
   - Защищает /admin/* (кроме /admin/login)
   - noindex для админки
   ============================================= */

import { NextResponse, type NextRequest } from "next/server";

const ADMIN_LOGIN = "/admin/login";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Admin page protection ───
  if (pathname.startsWith("/admin") && pathname !== ADMIN_LOGIN) {
    const token = request.cookies.get("admin_session")?.value;
    if (!token) {
      const loginUrl = new URL(ADMIN_LOGIN, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ─── noindex for admin pages ───
  if (pathname.startsWith("/admin")) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

/* =============================================
   Moranti — Proxy (formerly Middleware)
   - Защищает /admin/* (кроме /admin/login)
   - noindex для админки
   ============================================= */

import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";

const ADMIN_LOGIN = "/admin/login";
const COOKIE_NAME = "admin_session";

/** Быстрая проверка сессии без импорта серверных модулей */
function validateSessionCookie(token: string | undefined): boolean {
  if (!token) return false;

  try {
    const parts = token.split(":");
    if (parts.length !== 3) return false;

    const password = process.env.ADMIN_PASSWORD || "admin";
    const salt = process.env.AUTH_SALT || "moranti-admin-salt-v1";
    const key = crypto.pbkdf2Sync(password, salt, 100_000, 32, "sha256");
    const iv = Buffer.from(parts[0], "hex");
    const tag = Buffer.from(parts[1], "hex");
    const data = parts[2];

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    let out = decipher.update(data, "hex", "utf8");
    out += decipher.final("utf8");

    const session = JSON.parse(out);
    return Date.now() <= session.expiresAt;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Admin page protection ───
  if (pathname.startsWith("/admin") && pathname !== ADMIN_LOGIN) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!validateSessionCookie(token)) {
      const loginUrl = new URL(ADMIN_LOGIN, request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(COOKIE_NAME);
      return response;
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

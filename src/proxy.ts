/* =============================================
   Moranti — Proxy (formerly Middleware)
   - Защищает /admin/* (кроме /admin/login)
   - noindex для админки
   - CORS preflight для публичных API
   ============================================= */

import { NextResponse, type NextRequest } from "next/server";
import { validateToken } from "@/lib/admin-auth";

const ADMIN_LOGIN = "/admin/login";
const COOKIE_NAME = "admin_session";

/* ─── CORS allowed origins (mirrors csrf.ts + cors.ts) ─── */

function isOriginAllowed(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  const host = request.headers.get("host") || "";
  const allowedOrigins = [
    process.env.SITE_URL,
    `http://${host}`,
    `https://${host}`,
    "http://localhost:3001",
    "http://localhost:3000",
  ].filter(Boolean);

  if (process.env.VERCEL_URL) {
    allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
  }

  return allowedOrigins.includes(origin);
}

function handleCorsPreflight(request: NextRequest): NextResponse | null {
  if (request.method !== "OPTIONS") return null;
  const { pathname } = request.nextUrl;

  // Только для публичных API
  if (
    !pathname.startsWith("/api/data/") &&
    !pathname.startsWith("/api/prices")
  ) {
    return null;
  }

  if (!isOriginAllowed(request)) {
    return new NextResponse(null, { status: 204 });
  }

  const origin = request.headers.get("origin") || "";
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

/** Проверка сессии через admin-auth (единая логика decrypt). */
function validateSessionCookie(token: string | undefined): boolean {
  if (!token) return false;
  return validateToken(token);
}

/* ─── Proxy handler ─── */

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── CORS preflight для публичных API ───
  const preflight = handleCorsPreflight(request);
  if (preflight) return preflight;

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

  // ─── Build base response ───
  const response = NextResponse.next();

  // ─── noindex for admin pages ───
  if (pathname.startsWith("/admin")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  // ─── CORS for public API routes ───
  if (
    pathname.startsWith("/api/data/") ||
    pathname.startsWith("/api/prices")
  ) {
    if (isOriginAllowed(request)) {
      const origin = request.headers.get("origin") || "";
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS",
      );
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization",
      );
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};

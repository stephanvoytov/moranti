/* =============================================
   Moranti — Proxy (formerly Middleware)
   - CORS preflight + headers for public /api/data/* APIs
   - Admin auth is now handled by Payload (its own /admin auth)
   ============================================= */

import { NextResponse, type NextRequest } from "next/server";

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
  if (!pathname.startsWith("/api/data/")) {
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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── CORS preflight для публичных API ───
  const preflight = handleCorsPreflight(request);
  if (preflight) return preflight;

  // ─── Build base response ───
  const response = NextResponse.next();

  // ─── CORS for public API routes ───
  if (pathname.startsWith("/api/data/")) {
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
  matcher: ["/api/:path*"],
};

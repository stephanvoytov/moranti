/* =============================================
   Moranti — CSRF Protection Helper
   Проверяет Origin/Referer для мутирующих запросов.
   ============================================= */

import { NextRequest, NextResponse } from "next/server";

export function csrfGuard(request: NextRequest | Request): NextResponse | null {
  // GET/HEAD — безопасные методы, не проверяем
  if (request.method === "GET" || request.method === "HEAD") {
    return null;
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // Если нет ни Origin, ни Referer — пропускаем
  if (!origin && !referer) {
    return null;
  }

  const source = origin || referer || "";

  // Проверяем что источник совпадает с хостом запроса
  const host = request.headers.get("host") || "";
  // Разрешаем: host, localhost:любой порт, SITE_URL
  const allowedOrigins = [
    `http://${host}`,
    `https://${host}`,
    process.env.SITE_URL,
    ...(host.includes("localhost")
      ? ["http://localhost:3001", "http://localhost:3000"]
      : []),
  ].filter(Boolean) as string[];

  const allowed = allowedOrigins.some(
    (allowedOrigin) => source.startsWith(allowedOrigin),
  );

  if (!allowed) {
    return NextResponse.json(
      { error: `CSRF: Forbidden origin` },
      { status: 403 },
    );
  }

  return null;
}

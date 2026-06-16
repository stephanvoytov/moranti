/* =============================================
   Moranti — CSRF Protection Helper
   Проверяет Origin/Referer для мутирующих запросов.
   ============================================= */

import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  "http://localhost:3001",
  "http://localhost:3000",
  process.env.SITE_URL,
].filter(Boolean) as string[];

export function csrfGuard(request: NextRequest | Request): NextResponse | null {
  // GET/HEAD — безопасные методы, не проверяем
  if (request.method === "GET" || request.method === "HEAD") {
    return null;
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // Если нет ни Origin, ни Referer — пропускаем
  // (допускаем прямые API-вызовы из админки)
  if (!origin && !referer) {
    return null;
  }

  const source = origin || referer || "";

  // Проверяем, что запрос идёт с разрешённого источника
  const allowed = ALLOWED_ORIGINS.some(
    (allowedOrigin) => source.startsWith(allowedOrigin),
  );

  if (!allowed) {
    return NextResponse.json(
      { error: "CSRF: Forbidden origin" },
      { status: 403 },
    );
  }

  return null;
}

/* =============================================
   Moranti — CORS Helper
   Управление CORS для публичных API-роутов.
   ============================================= */

import { NextResponse } from "next/server";

/** Разрешённые origins — те же что в csrf.ts */
function getAllowedOrigins(): string[] {
  const origins = [
    process.env.SITE_URL,
    "http://localhost:3001",
    "http://localhost:3000",
  ].filter(Boolean) as string[];

  // На Vercel/production добавляем рабочий домен
  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`);
  }

  return origins;
}

/**
 * Проверяет Origin запроса против списка разрешённых.
 * Возвращает разрешённый origin или null.
 */
export function getCorsOrigin(request: Request): string | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;

  const allowed = getAllowedOrigins();
  if (allowed.includes(origin)) return origin;

  // Также разрешаем если origin совпадает с host
  const host = request.headers.get("host");
  if (host && (origin === `http://${host}` || origin === `https://${host}`)) {
    return origin;
  }

  return null;
}

/**
 * Добавляет CORS-заголовки к ответу.
 * Возвращает сам response для chaining.
 */
export function addCorsHeaders(
  response: NextResponse,
  request: Request,
): NextResponse {
  const origin = getCorsOrigin(request);

  if (origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Max-Age", "86400");
  }

  return response;
}

/**
 * Обрабатывает OPTIONS preflight-запрос.
 * Возвращает ответ 204 с CORS-заголовками или null (если не preflight).
 */
export function handleCorsPreflight(
  request: Request,
): NextResponse | null {
  if (request.method !== "OPTIONS") return null;

  const origin = getCorsOrigin(request);
  if (!origin) {
    return new NextResponse(null, { status: 204 });
  }

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

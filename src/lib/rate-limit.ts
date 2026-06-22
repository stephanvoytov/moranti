/* =============================================
   Moranti — In-memory Rate Limiter
   Простой sliding-window rate limiter по IP.
   Не требует Redis/Upstash — подходит для single-admin сайта.
   При перезапуске сервера сбрасывается (приемлемо).
   ============================================= */

import { NextResponse } from "next/server";

interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();

// Очистка просроченных записей раз в 60 секунд
setInterval(() => {
  const now = Date.now();
  for (const [key, win] of store) {
    if (win.resetAt < now) store.delete(key);
  }
}, 60_000);

export interface RateLimitOptions {
  /** Максимум запросов в окне */
  max: number;
  /** Длина окна в миллисекундах */
  windowMs: number;
}

const DEFAULTS: RateLimitOptions = {
  max: 30,
  windowMs: 60_000, // 30 запросов в минуту
};

/**
 * Проверяет rate limit для данного IP.
 * Возвращает { allowed, headers }.
 * Если allowed === false — вызывающий должен вернуть 429.
 */
export function checkRateLimit(
  ip: string,
  opts: Partial<RateLimitOptions> = {},
): { allowed: boolean; remaining: number; resetAt: number } {
  const { max, windowMs } = { ...DEFAULTS, ...opts };
  const now = Date.now();

  let win = store.get(ip);

  // Первый запрос или окно истекло
  if (!win || win.resetAt < now) {
    win = { count: 1, resetAt: now + windowMs };
    store.set(ip, win);
    return { allowed: true, remaining: max - 1, resetAt: win.resetAt };
  }

  // Запрос в текущем окне
  win.count++;
  store.set(ip, win);

  return {
    allowed: win.count <= max,
    remaining: Math.max(0, max - win.count),
    resetAt: win.resetAt,
  };
}

/**
 * Извлекает IP клиента из запроса.
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "127.0.0.1"
  );
}

/**
 * Ответ при превышении rate limit.
 */
export function rateLimitResponse(resetAt: number): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please wait before retrying." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
      },
    },
  );
}

/**
 * Обёртка: проверяет rate limit и возвращает 429 если превышен.
 * Вызывать в начале каждого route-handler'а.
 */
export function enforceRateLimit(
  request: Request,
  opts?: Partial<RateLimitOptions>,
): NextResponse | null {
  const ip = getClientIp(request);
  const result = checkRateLimit(ip, opts);
  if (!result.allowed) {
    return rateLimitResponse(result.resetAt);
  }
  return null;
}

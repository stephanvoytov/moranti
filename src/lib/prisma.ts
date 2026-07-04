import { PrismaClient } from "@prisma/client";
import { logger } from "@/lib/logger";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const MAX_RETRIES = 3;
const BASE_DELAY = 1_000; // ms
const MAX_DELAY = 5_000; // ms
const QUERY_TIMEOUT = 15_000; // ms — Prisma Postgres free tier cold-start 3-6s

/**
 * Throw if promise doesn't settle within `ms` milliseconds.
 * The underlying operation continues but we stop waiting for it.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Query timed out after ${ms}ms`)), ms),
    ),
  ]);
}

/**
 * Retry a Prisma query with exponential backoff when connection fails.
 * Retries: 2 попытки с задержками 500ms → 1000ms.
 * JSON fallback в products.ts / settings.ts перехватывает окончательную ошибку.
 */
export async function prismaQuery<T>(
  fn: () => Promise<T>,
  timeoutMs: number = QUERY_TIMEOUT,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await withTimeout(fn(), timeoutMs);
    } catch (err: unknown) {
      lastError = err;
      const code =
        (err as { code?: string })?.code ??
        (err as { cause?: { code?: string } })?.cause?.code ??
        "";

      const isConnectionError =
        code === "P1001" ||   // Can't reach database server
        code === "P2024" ||   // Connection pool timeout
        code === "P1017" ||   // Server closed connection
        code === "ECONNREFUSED" ||
        code === "ETIMEDOUT" ||
        code === "ENOTFOUND" ||
        (err as Error)?.message?.includes("Can't reach database server") ||
        (err as Error)?.message?.includes("connection pool timeout") ||
        (err as Error)?.message?.includes("Connection refused") ||
        (err as Error)?.message?.includes("timed out after");

      if (!isConnectionError) {
        throw err; // Not a connection issue — throw immediately
      }

      if (attempt < MAX_RETRIES) {
        const delay = Math.min(MAX_DELAY, BASE_DELAY * Math.pow(2, attempt));
        logger.warn("Prisma retry", { attempt: attempt + 1, max: MAX_RETRIES, code, delayMs: delay });
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        logger.error("Prisma retries exhausted", { max: MAX_RETRIES, code });
      }
    }
  }

  throw lastError;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

/**
 * Конвертирует BigInt поля Prisma Product в Number для JSON-сериализации.
 * Нужно перед возвратом из API-роутов, т.к. JSON.stringify не поддерживает BigInt.
 */
export function serializeProduct(p: Record<string, unknown>): Record<string, unknown> {
  if (p.wbArticle != null) p.wbArticle = Number(p.wbArticle);
  if (p.ozonArticle != null) p.ozonArticle = Number(p.ozonArticle);
  return p;
}

/**
 * Конвертирует BigInt поля Prisma Model в Number для JSON-сериализации.
 * Нужно перед возвратом из API-роутов, т.к. JSON.stringify не поддерживает BigInt.
 */
export function serializeModel(m: Record<string, unknown>): Record<string, unknown> {
  if (m.imtId != null) m.imtId = Number(m.imtId);
  return m;
}

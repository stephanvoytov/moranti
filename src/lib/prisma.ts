/**
 * prisma.ts — PrismaClient singleton с driver adapter (Prisma 7).
 *
 * Использует @prisma/adapter-pg для подключения к Postgres.
 * Все read-запросы должны идти через prismaQuery() — ретрай 3× с exponential backoff.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { logger } from "@/lib/logger";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const MAX_RETRIES = 3;
const BASE_DELAY = 1_000; // ms
const MAX_DELAY = 5_000; // ms
const QUERY_TIMEOUT = 15_000; // ms

/* ─── Driver adapter ─── */

function createAdapter() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || "";
  return new PrismaPg({ connectionString: url });
}

/* ─── PrismaClient singleton ─── */

function createPrismaClient() {
  return new PrismaClient({
    adapter: createAdapter(),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/* ─── Таймаут запроса ─── */

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Query timed out after ${ms}ms`)), ms),
    ),
  ]);
}

/* ─── Ретрай с exponential backoff ─── */

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
        throw err;
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

/* ─── Сериализация BigInt для JSON ─── */

export function serializeProduct(p: Record<string, unknown>): Record<string, unknown> {
  if (p.wbArticle != null) p.wbArticle = Number(p.wbArticle);
  if (p.ozonArticle != null) p.ozonArticle = Number(p.ozonArticle);
  return p;
}

export function serializeModel(m: Record<string, unknown>): Record<string, unknown> {
  if (m.imtId != null) m.imtId = Number(m.imtId);
  return m;
}

export default prisma;

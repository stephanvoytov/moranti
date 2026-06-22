import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const MAX_RETRIES = 4;
const BASE_DELAY = 1000; // ms

/**
 * Retry a Prisma query with exponential backoff when connection fails.
 * Neon Free Plan suspends after ~5 min of inactivity; wake-up takes 2-5 s.
 * This wrapper retries with delays of 1 → 2 → 4 → 8 seconds before giving up.
 * On final failure the caller's catch block takes over (→ JSON fallback).
 */
export async function prismaQuery<T>(
  fn: () => Promise<T>,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
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
        (err as Error)?.message?.includes("Connection refused");

      if (!isConnectionError) {
        // Not a connection issue — throw immediately
        throw err;
      }

      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY * Math.pow(2, attempt);
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `[prisma:retry] attempt ${attempt + 1}/${MAX_RETRIES} failed (${code}), retrying in ${delay}ms...`,
          );
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        // Final attempt — log and let caller handle fallback
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `[prisma:retry] all ${MAX_RETRIES} retries exhausted, falling back to JSON`,
          );
        }
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

const TRANSIENT_CODES = new Set(["P1008", "P2024", "P2034"]);
const TRANSIENT_MESSAGE = /sockettimeout|connection terminated|connection reset|connection closed|econnreset|etimedout|econnrefused|server closed the connection unexpectedly/i;

/** Walk Prisma/driver error causes without assuming a particular adapter shape. */
function errorChain(error) {
  const chain = [];
  const seen = new Set();
  let current = error;
  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    chain.push(current);
    current = current.cause;
  }
  return chain;
}

export function isTransientDatabaseError(error) {
  return errorChain(error).some((item) =>
    TRANSIENT_CODES.has(item.code) ||
    TRANSIENT_MESSAGE.test(String(item.message || item))
  );
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Retry only transient PostgreSQL/Prisma failures; never retry validation or constraint errors. */
export async function withDatabaseRetry(operation, {
  attempts = 4,
  baseDelayMs = 750,
  maxDelayMs = 6000,
  label = "database query",
  onRetry,
  sleepFn = sleep,
} = {}) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= attempts || !isTransientDatabaseError(error)) {
        throw error;
      }
      const delayMs = Math.min(baseDelayMs * (2 ** (attempt - 1)), maxDelayMs);
      onRetry?.({ attempt, attempts, delayMs, error, label });
      await sleepFn(delayMs);
    }
  }
}

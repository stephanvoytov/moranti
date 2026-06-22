/* =============================================
   Moranti — Structured Logger
   Лёгкая замена console.log/warn/error.
   Формат: JSON с уровнем, меткой времени, контекстом.
   В production пишет только warn/error.
   ============================================= */

type LogLevel = "info" | "warn" | "error" | "debug";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Минимальный уровень в production — warn, в dev — debug
const currentLevel: number =
  process.env.NODE_ENV === "production" ? LOG_LEVELS.warn : LOG_LEVELS.debug;

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= currentLevel;
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;

  const entry = {
    level,
    message,
    ...(meta && Object.keys(meta).length ? { meta } : {}),
    timestamp: new Date().toISOString(),
  };

  const output = JSON.stringify(entry);

  switch (level) {
    case "error":
      console.error(output);
      break;
    case "warn":
      console.warn(output);
      break;
    default:
      console.log(output);
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => log("debug", message, meta),
  info: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),
};

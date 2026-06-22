/**
 * Серверная обёртка для запуска WB Sync из Next.js API.
 * Запускает sync-wb.mjs (Prisma) через Node.js execSync.
 */

import { execSync } from "child_process";
import path from "path";
import { readFileSync, existsSync } from "fs";

const SCRIPTS_DIR = path.join(process.cwd(), "scripts");
const SYNC_SCRIPT = path.join(SCRIPTS_DIR, "sync-wb.mjs");
const SYNC_LOG_FILE = path.join(process.cwd(), "data", "sync-log.json");

/**
 * Пул подключений Supabase (PgBouncer) не любит долгие batch-операции.
 * Для sync используем прямой URL (без pgBouncer).
 */
function getDirectDbUrl(): string | undefined {
  return process.env.POSTGRES_URL_NON_POOLING
    || process.env.DIRECT_URL
    || process.env.POSTGRES_PRISMA_URL
    || process.env.DATABASE_URL;
}

export interface SyncReport {
  timestamp: string;
  duration: number;
  source?: string;
  added: number;
  updated: number;
  archived: number;
  skipped: number;
  total: number;
  error?: string;
  details?: {
    added: { id: string; name: string }[];
    updated: { id: string; name: string; changes: string[] }[];
    archived: { id: string; name: string }[];
  };
}

/**
 * Запускает синхронизацию с WB через дочерний процесс.
 * Передаёт DIRECT_URL как DATABASE_URL скрипту для обхода PgBouncer.
 */
export function runWbSync(): SyncReport {
  try {
    const result = execSync(`node "${SYNC_SCRIPT}"`, {
      cwd: process.cwd(),
      timeout: 120_000,
      encoding: "utf-8",
      env: {
        ...process.env,
        POSTGRES_PRISMA_URL: getDirectDbUrl(),
        POSTGRES_URL_NON_POOLING: getDirectDbUrl(),
        CI: "true",
      },
    });

    // Последняя строка — JSON с отчётом
    const lines = result.trim().split("\n");
    const lastLine = lines[lines.length - 1];
    return JSON.parse(lastLine);
  } catch (err: any) {
    try {
      const stdout = err.stdout || "";
      const lines = stdout.trim().split("\n");
      const lastLine = lines[lines.length - 1];
      const parsed = JSON.parse(lastLine);
      if (parsed) return parsed;
    } catch {}

    try {
      const stderr = err.stderr || "";
      const match = stderr.match(/\{.*"error".*\}/);
      if (match) return JSON.parse(match[0]);
    } catch {}

    return {
      timestamp: new Date().toISOString(),
      duration: 0,
      added: 0,
      updated: 0,
      archived: 0,
      skipped: 0,
      total: 0,
      error: err.message || "Неизвестная ошибка",
    };
  }
}

/**
 * Возвращает последний отчёт синхронизации.
 */
export function getSyncStatus(): SyncReport | null {
  if (!existsSync(SYNC_LOG_FILE)) return null;
  try {
    const raw = readFileSync(SYNC_LOG_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

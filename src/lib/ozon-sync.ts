/**
 * Серверная обёртка для запуска Ozon Sync из Next.js API.
 * Запускает sync-all.mjs --ozon-only, захватывает полный вывод,
 * сохраняет в историю синхронизации.
 */

import { execSync } from "child_process";
import path from "path";
import { addSyncRun, getLastSyncRun, SyncRunRecord } from "./sync-history";

const SCRIPTS_DIR = path.join(process.cwd(), "scripts");
const SYNC_SCRIPT = path.join(SCRIPTS_DIR, "sync-all.mjs");

function getDirectDbUrl(): string | undefined {
  return process.env.POSTGRES_URL_NON_POOLING
    || process.env.DIRECT_URL
    || process.env.POSTGRES_PRISMA_URL
    || process.env.DATABASE_URL;
}

export type { SyncRunRecord };

/**
 * Запускает синхронизацию с Ozon через sync-all.mjs --ozon-only.
 * Возвращает полную запись запуска с логом.
 */
export function runOzonSync(): SyncRunRecord {
  const startTime = Date.now();
  let stdout = "";
  let stderr = "";

  try {
    const result = execSync(
      `node "${SYNC_SCRIPT}" --ozon-only`,
      {
        cwd: process.cwd(),
        timeout: 300_000,
        encoding: "utf-8",
        env: {
          ...process.env,
          POSTGRES_PRISMA_URL: getDirectDbUrl(),
          POSTGRES_URL_NON_POOLING: getDirectDbUrl(),
          CI: "true",
        },
      }
    );
    stdout = result || "";
  } catch (err: any) {
    stdout = err.stdout || "";
    stderr = err.stderr || "";
  }

  const record = buildRecord(startTime, stdout, stderr);
  addSyncRun(record);
  return record;
}

function buildRecord(startTime: number, stdout: string, stderr: string): SyncRunRecord {
  const duration = Date.now() - startTime;
  const fullLog = [stdout, stderr].filter(Boolean).join("\n").trim();

  let stats = { added: 0, updated: 0, archived: 0, skipped: 0, errors: 0, total: 0 };
  let success = true;
  let error: string | undefined;

  // Парсим JSON-суммари с последней строки stdout
  const lines = stdout.trim().split("\n").filter(Boolean);
  const lastLine = lines[lines.length - 1];
  if (lastLine?.startsWith("{")) {
    try {
      const s = JSON.parse(lastLine);
      stats = {
        added: s.created || 0,
        updated: s.updated || 0,
        archived: s.archived || 0,
        skipped: 0,
        errors: s.errors || 0,
        total: s.total || 0,
      };
    } catch {
      // ignore parse errors
    }
  }

  if (stderr || stdout.includes("ERROR:")) {
    const errLine = stderr || lines.find((l) => l.includes("ERROR:")) || "";
    error = errLine.slice(0, 500);
    success = false;
  }

  return {
    platform: "ozon",
    timestamp: new Date().toISOString(),
    duration,
    success,
    error,
    stats,
    log: fullLog,
  };
}

/**
 * Возвращает последний запуск Ozon или null.
 */
export function getOzonSyncStatus(): SyncRunRecord | null {
  return getLastSyncRun("ozon");
}

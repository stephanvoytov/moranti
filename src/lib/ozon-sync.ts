/**
 * Серверная обёртка для запуска Ozon Sync из Next.js API.
 * Запускает sync-ozon.mjs, захватывает полный вывод,
 * сохраняет в историю синхронизации.
 */

import { execSync } from "child_process";
import path from "path";
import { readFileSync, existsSync } from "fs";
import { addSyncRun, getLastSyncRun, SyncRunRecord } from "./sync-history";

const SCRIPTS_DIR = path.join(process.cwd(), "scripts");
const SYNC_SCRIPT = path.join(SCRIPTS_DIR, "sync-ozon.mjs");
const SYNC_LOG_FILE = path.join(process.cwd(), "data", "ozon-sync-log.json");

function getDirectDbUrl(): string | undefined {
  return process.env.POSTGRES_URL_NON_POOLING
    || process.env.DIRECT_URL
    || process.env.POSTGRES_PRISMA_URL
    || process.env.DATABASE_URL;
}

export type { SyncRunRecord };

/**
 * Запускает синхронизацию с Ozon через sync-ozon.mjs.
 * Возвращает полную запись запуска с логом.
 */
export function runOzonSync(): SyncRunRecord {
  const startTime = Date.now();
  let stdout = "";
  let stderr = "";

  try {
    const result = execSync(
      `node "${SYNC_SCRIPT}" --sync-json`,
      {
        cwd: process.cwd(),
        timeout: 180_000,
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
    const record = buildRecord(startTime, stdout, stderr);
    addSyncRun(record);
    return record;
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
  let details: any = undefined;

  // Парсим лог sync-ozon.mjs
  if (existsSync(SYNC_LOG_FILE)) {
    try {
      const raw = JSON.parse(readFileSync(SYNC_LOG_FILE, "utf-8"));
      const s = raw.stats || {};
      stats = {
        added: 0,
        updated: s.updated || 0,
        archived: 0,
        skipped: 0,
        errors: s.errors || 0,
        total: s.total || 0,
      };
      if (raw.details) {
        details = raw.details;
      }
    } catch {}
  }

  if (stderr && !stdout.includes("SUMMARY")) {
    error = stderr.slice(0, 500);
    success = false;
  }

  return {
    platform: "ozon",
    timestamp: new Date().toISOString(),
    duration,
    success,
    error,
    stats,
    details,
    log: fullLog,
  };
}

/**
 * Возвращает последний запуск Ozon или null.
 */
export function getOzonSyncStatus(): SyncRunRecord | null {
  return getLastSyncRun("ozon");
}

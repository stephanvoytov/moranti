/**
 * Серверная обёртка для запуска WB Sync из Next.js API.
 * Запускает скрипт sync-wb.js в дочернем процессе.
 */

import { execSync } from "child_process";
import path from "path";
import { readFileSync, existsSync } from "fs";

const SCRIPTS_DIR = path.join(process.cwd(), "scripts");
const SYNC_SCRIPT = path.join(SCRIPTS_DIR, "sync-wb.js");
const DATA_DIR = path.join(process.cwd(), "data");
const SYNC_LOG_FILE = path.join(DATA_DIR, "sync-log.json");

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
 * Запускает синхронизацию с WB.
 * Выполняет sync-wb.js через Node.js (дочерний процесс).
 */
export function runWbSync(): SyncReport {
  try {
    const result = execSync(`node "${SYNC_SCRIPT}"`, {
      cwd: process.cwd(),
      timeout: 120_000, // 2 min max
      encoding: "utf-8",
      env: { ...process.env, CI: "true" },
    });

    // Последняя строка — JSON с отчётом
    const lines = result.trim().split("\n");
    const lastLine = lines[lines.length - 1];
    const report = JSON.parse(lastLine);

    return report;
  } catch (err: any) {
    // При ошибке скрипт пишет JSON в stdout и выходит с кодом 1
    // execSync бросает исключение, но stdout сохраняется
    try {
      const stdout = err.stdout || "";
      const lines = stdout.trim().split("\n");
      const lastLine = lines[lines.length - 1];
      const report = JSON.parse(lastLine);
      if (report) return report;
    } catch {}

    // Следующая попытка — stderr
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

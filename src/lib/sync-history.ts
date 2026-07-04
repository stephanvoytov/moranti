/**
 * sync-history.ts — единое хранилище истории синхронизации.
 *
 * Хранит записи в БД (Prisma Postgres). Если таблица SyncRun ещё не создана
 * (миграция не накатана), падает на JSON-файл в /tmp.
 */

import { prisma } from "./prisma";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const MAX_RUNS = 20;

/* ─── Типы ─── */

export interface SyncRunStats {
  added: number;
  updated: number;
  archived: number;
  skipped: number;
  errors: number;
  total: number;
}

export interface SyncRunDetail {
  id: string;
  name: string;
  changes?: string[];
}

export interface SyncRunRecord {
  platform: "wb" | "ozon";
  timestamp: string;
  duration: number;        // ms
  success: boolean;
  error?: string;
  stats: SyncRunStats;
  log: string;             // полный вывод скрипта
}

/* ─── JSON fallback (пока миграция не накатана) ─── */

function tmpDataDir(): string {
  if (process.env.VERCEL === "1") return "/tmp/moranti-data";
  return path.join(process.cwd(), "data");
}

function tmpHistoryFile(): string {
  return path.join(tmpDataDir(), "sync-history.json");
}

function loadJsonFallback(): SyncRunRecord[] {
  const file = tmpHistoryFile();
  if (!existsSync(file)) return [];
  try {
    return JSON.parse(readFileSync(file, "utf-8")).runs || [];
  } catch {
    return [];
  }
}

function saveJsonFallback(runs: SyncRunRecord[]) {
  const dir = tmpDataDir();
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(
    tmpHistoryFile(),
    JSON.stringify({ runs: runs.slice(0, MAX_RUNS) }, null, 2),
    "utf-8",
  );
}

/* ─── Prisma ─── */

/**
 * Prisma error P2021 = "Table not found".
 * Возвращает true, если ошибка связана с отсутствием таблицы.
 */
function isTableNotFound(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code: string }).code === "P2021"
  );
}

async function addToDb(
  record: SyncRunRecord,
): Promise<boolean> {
  try {
    await prisma.syncRun.create({
      data: {
        platform: record.platform,
        timestamp: new Date(record.timestamp),
        duration: record.duration,
        success: record.success,
        error: record.error || null,
        added: record.stats.added,
        updated: record.stats.updated,
        archived: record.stats.archived,
        skipped: record.stats.skipped,
        errors: record.stats.errors,
        log: record.log,
      },
    });
    return true;
  } catch (e) {
    if (isTableNotFound(e)) return false;
    throw e;
  }
}

function rowToRecord(row: {
  id: string;
  platform: string;
  timestamp: Date;
  duration: number;
  success: boolean;
  error: string | null;
  added: number;
  updated: number;
  archived: number;
  skipped: number;
  errors: number;
  log: string;
}): SyncRunRecord {
  const stats: SyncRunStats = {
    added: row.added,
    updated: row.updated,
    archived: row.archived,
    skipped: row.skipped,
    errors: row.errors,
    total: row.added + row.updated + row.archived + row.skipped,
  };
  return {
    platform: row.platform as "wb" | "ozon",
    timestamp: row.timestamp.toISOString(),
    duration: row.duration,
    success: row.success,
    error: row.error || undefined,
    stats,
    log: row.log,
  };
}

async function listFromDb(
  platform: "wb" | "ozon",
): Promise<SyncRunRecord[] | null> {
  try {
    const rows = await prisma.syncRun.findMany({
      where: { platform },
      orderBy: { timestamp: "desc" },
      take: MAX_RUNS,
    });
    return rows.map(rowToRecord);
  } catch (e) {
    if (isTableNotFound(e)) return null;
    throw e;
  }
}

/* ─── Публичное API ─── */

export async function addSyncRun(record: SyncRunRecord) {
  const written = await addToDb(record);
  if (!written) {
    // Таблицы нет — fallback на JSON
    const runs = loadJsonFallback();
    runs.unshift(record);
    saveJsonFallback(runs);
  }
}

export async function getSyncHistory(
  platform: "wb" | "ozon",
): Promise<SyncRunRecord[]> {
  const fromDb = await listFromDb(platform);
  if (fromDb !== null) return fromDb;

  // Fallback на JSON
  return loadJsonFallback().filter((r) => r.platform === platform);
}

export async function getLastSyncRun(
  platform: "wb" | "ozon",
): Promise<SyncRunRecord | null> {
  const fromDb = await listFromDb(platform);
  if (fromDb !== null) return fromDb[0] || null;

  // Fallback на JSON
  const runs = loadJsonFallback().filter((r) => r.platform === platform);
  return runs[0] || null;
}

/* ─── Утилита ─── */

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}мс`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}с`;
  const m = Math.floor(ms / 60_000);
  const s = Math.round((ms % 60_000) / 1000);
  return `${m}м ${s}с`;
}

/**
 * sync-history.ts — единое хранилище истории синхронизации.
 *
 * Хранит записи в БД (Prisma Postgres). Если таблица SyncRun ещё не создана
 * (миграция не накатана), падает на JSON-файл в /tmp.
 */

import { prisma, prismaQuery } from "./prisma";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";
import { logger } from "./logger";

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

/** Флаг: пробовали создать таблицу? */
let tableEnsured = false;

/**
 * Создаёт таблицу SyncRun, если её нет.
 * Выполняется один раз при первом обращении к Prisma для sync-history.
 * Позволяет работать без миграции (на Vercel deploy).
 */
async function ensureTable(): Promise<boolean> {
  if (tableEnsured) return true;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SyncRun" (
        "id" TEXT NOT NULL,
        "platform" TEXT NOT NULL,
        "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "duration" INTEGER NOT NULL,
        "success" BOOLEAN NOT NULL,
        "error" TEXT,
        "added" INTEGER NOT NULL DEFAULT 0,
        "updated" INTEGER NOT NULL DEFAULT 0,
        "archived" INTEGER NOT NULL DEFAULT 0,
        "skipped" INTEGER NOT NULL DEFAULT 0,
        "errors" INTEGER NOT NULL DEFAULT 0,
        "log" TEXT NOT NULL DEFAULT '',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SyncRun_pkey" PRIMARY KEY ("id")
      )
    `);
    // Создаём индекс (если не существовало — создаст, если существовал — игнор)
    try {
      await prisma.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "SyncRun_platform_timestamp_idx" ON "SyncRun"("platform", "timestamp")`,
      );
    } catch { /* ignore — индекс может уже быть */ }
    tableEnsured = true;
    logger.info("SyncRun table ensured");
    return true;
  } catch (e) {
    logger.warn("Cannot create SyncRun table, using JSON fallback", {
      error: (e as Error)?.message,
    });
    return false;
  }
}

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
  if (!(await ensureTable())) return false;
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
  if (!(await ensureTable())) return null;
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

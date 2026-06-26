/**
 * sync-history.ts — единое хранилище истории синхронизации.
 *
 * Хранит массив запусков (runs) с полным логом вывода, статистикой
 * и детализацией по товарам. Общий формат для WB и Ozon.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const HISTORY_FILE = path.join(DATA_DIR, "sync-history.json");
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

export interface SyncRunDetails {
  added?: SyncRunDetail[];
  updated?: SyncRunDetail[];
  archived?: SyncRunDetail[];
}

export interface SyncRunRecord {
  platform: "wb" | "ozon";
  timestamp: string;
  duration: number;        // ms
  success: boolean;
  error?: string;
  stats: SyncRunStats;
  details?: SyncRunDetails;
  log: string;             // полный вывод скрипта
}

export interface SyncHistory {
  runs: SyncRunRecord[];
}

/* ─── Чтение / запись ─── */

function loadHistory(): SyncHistory {
  if (!existsSync(HISTORY_FILE)) return { runs: [] };
  try {
    return JSON.parse(readFileSync(HISTORY_FILE, "utf-8"));
  } catch {
    return { runs: [] };
  }
}

function saveHistory(h: SyncHistory) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(HISTORY_FILE, JSON.stringify(h, null, 2), "utf-8");
}

/* ─── Добавление записи ─── */

export function addSyncRun(record: SyncRunRecord) {
  const h = loadHistory();
  h.runs.unshift(record);
  if (h.runs.length > MAX_RUNS) h.runs.length = MAX_RUNS;
  saveHistory(h);
}

/**
 * Возвращает историю для платформы, последний запуск — первый.
 */
export function getSyncHistory(platform: "wb" | "ozon"): SyncRunRecord[] {
  const h = loadHistory();
  return h.runs.filter((r) => r.platform === platform);
}

/**
 * Возвращает последний запуск для платформы или null.
 */
export function getLastSyncRun(platform: "wb" | "ozon"): SyncRunRecord | null {
  const runs = getSyncHistory(platform);
  return runs.length > 0 ? runs[0] : null;
}

/**
 * Форматирует длительность для отображения.
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}мс`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}с`;
  const m = Math.floor(ms / 60_000);
  const s = Math.round((ms % 60_000) / 1000);
  return `${m}м ${s}с`;
}

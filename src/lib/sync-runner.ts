/**
 * sync-runner.ts — асинхронный запуск sync-all.mjs с прогрессом.
 *
 * Запускает sync-all.mjs в том же процессе через import() вместо child_process,
 * потому что на Vercel node_modules недоступны дочерним процессам на файловой системе.
 *
 * API:
 *   startSync(platform) → runId
 *   getSyncProgress(runId) → SyncProgress | null
 *   getActiveRunId(platform) → string | null
 */

import path from "path";
import { revalidatePath } from "next/cache";
import { invalidateCache } from "@/lib/data-cache";
import { addSyncRun, getLastSyncRun } from "./sync-history";
import type { SyncRunRecord, SyncRunDetail } from "./sync-history";
// Явные импорты для Vercel File Tracer — включает SDK в Lambda
import { WildberriesSDK } from "daytona-wildberries-typescript-sdk";
import { ApiError } from "ozon-seller-sdk";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

[WildberriesSDK, ApiError, PrismaPg, PrismaClient];

const SYNC_SCRIPT = path.join(process.cwd(), "scripts", "sync-all.mjs");

/* ─── Типы прогресса ─── */

export interface SyncProgress {
  runId: string;
  platform: "wb" | "ozon";
  status: "running" | "completed" | "failed";
  phase: string;
  phaseLabel: string;
  current: number;
  total: number;
  log: string;
  error?: string;
  details: { updated: SyncRunDetail[]; added: SyncRunDetail[] };
  startedAt: number;
}

/* ─── In-memory store ─── */

const running = new Map<string, SyncProgress>();
const activePlatformRun = new Map<string, string>();
let runCounter = 0;

function nextRunId(platform: string): string {
  runCounter++;
  const ts = Date.now().toString(36);
  return `${platform}-${ts}-${runCounter}`;
}

/* ─── Фазы и их подписи ─── */

const PHASE_LABELS: Record<string, string> = {
  "wb-cards": "Получение активных карточек WB",
  "wb-trash": "Получение карточек WB в корзине",
  "wb-prices": "Получение цен WB",
  "wb-process": "Обработка товаров WB",
  "ozon-list": "Получение списка товаров Ozon",
  "ozon-info": "Получение информации о товарах Ozon",
  "ozon-attrs": "Получение характеристик Ozon",
  "ozon-ratings": "Получение рейтингов Ozon",
  "ozon-process": "Обработка товаров Ozon",
  "ozon-models": "Синхронизация моделей Ozon",
  "wb-models": "Синхронизация моделей WB",
  "archive": "Архивация удалённых товаров",
  "done": "Завершение",
};

/* ─── Прогресс-парсер ─── */

function parseProgressLine(line: string): Partial<SyncProgress> | null {
  const prefix = "[PROGRESS]";
  const idx = line.indexOf(prefix);
  if (idx === -1) return null;
  try {
    const json = JSON.parse(line.slice(idx + prefix.length).trim());
    const update: Partial<SyncProgress> = {};
    if (json.phase) {
      update.phase = json.phase;
      update.phaseLabel = PHASE_LABELS[json.phase] || json.phase;
    }
    if (json.current !== undefined) update.current = json.current;
    if (json.total !== undefined) update.total = json.total;
    return update;
  } catch {
    return null;
  }
}

function parseDetailLine(line: string): { updated?: SyncRunDetail; added?: SyncRunDetail } | null {
  const prefix = "[DETAIL]";
  const idx = line.indexOf(prefix);
  if (idx === -1) return null;
  try {
    const json = JSON.parse(line.slice(idx + prefix.length).trim());
    if (json.action === "updated" && json.product) {
      return { updated: { id: json.product, name: json.name || "", changes: json.changes || [] } };
    }
    if (json.action === "created" && json.product) {
      return { added: { id: json.product, name: json.name || "" } };
    }
    return null;
  } catch {
    return null;
  }
}

/** Извлечь первую значимую ошибку из лога */
function extractError(log: string): string | undefined {
  // Ищем FATAL: в логе
  for (const line of log.split("\n")) {
    const t = line.trim();
    if (t.startsWith("FATAL:") || t.startsWith("ERROR:")) {
      const clean = t.replace(/^FATAL:\s*/, "").replace(/^ERROR:\s*/, "").slice(0, 300);
      if (!clean.includes("node:internal") && !clean.startsWith("at ")) {
        return clean;
      }
    }
  }

  // MODULE_NOT_FOUND ошибки
  const moduleMatch = log.match(/Cannot find (?:module|package) '([^']+)'/);
  if (moduleMatch) return `Пакет не найден: ${moduleMatch[1]}. Проверьте установку зависимостей.`;

  // Prisma ошибки
  const prismaMatch = log.match(/PrismaClient\w+Error:\s*([^\n]+)/);
  if (prismaMatch) return prismaMatch[1].trim().slice(0, 300);

  // ERR_MODULE_NOT_FOUND
  if (log.includes("ERR_MODULE_NOT_FOUND")) {
    const m = log.match(/Cannot find package '([^']+)'/);
    if (m) return `Пакет не найден: ${m[1]}`;
    return "Ошибка загрузки модуля";
  }

  return undefined;
}

/* ─── Парсинг статистики из вывода ─── */

function parseStats(log: string) {
  const lines = log.split("\n").filter(Boolean);
  const lastLine = lines[lines.length - 1];
  if (lastLine?.startsWith("{")) {
    try {
      const s = JSON.parse(lastLine);
      return {
        added: s.created || 0,
        updated: s.updated || 0,
        archived: s.archived || 0,
        skipped: s.skipped || 0,
        errors: s.errors || 0,
      };
    } catch { /* ignore */ }
  }
  return { added: 0, updated: 0, archived: 0, skipped: 0, errors: 0 };
}

/* ─── Запуск синхронизации ─── */

export function startSync(platform: "wb" | "ozon"): string {
  // Проверка: не запущен ли уже sync для этой платформы
  const active = activePlatformRun.get(platform);
  const STALE_TIMEOUT = 5 * 60 * 1000;
  if (active && running.has(active)) {
    const p = running.get(active)!;
    if (p.status === "running") {
      if (Date.now() - p.startedAt > STALE_TIMEOUT) {
        clearStaleRun(platform);
      } else {
        throw new Error(`Sync already running for ${platform} (runId: ${active})`);
      }
    }
  }

  const runId = nextRunId(platform);

  const progress: SyncProgress = {
    runId,
    platform,
    status: "running",
    phase: "starting",
    phaseLabel: "Запуск…",
    current: 0,
    total: 0,
    log: "",
    details: { updated: [], added: [] },
    startedAt: Date.now(),
  };

  running.set(runId, progress);
  activePlatformRun.set(platform, runId);

  // Запускаем синхронизацию асинхронно (не блокируем ответ API)
  runSync(runId, platform).catch((err) => {
    const p = running.get(runId);
    if (!p) return;
    if (p.status !== "failed") {
      p.status = "failed";
      p.error = err instanceof Error ? err.message.slice(0, 500) : String(err).slice(0, 500);
      p.phase = "done";
      p.phaseLabel = "Ошибка";
      activePlatformRun.delete(platform);
    }
  });

  return runId;
}

/* ─── Внутренний запуск ─── */

async function runSync(runId: string, platform: "wb" | "ozon") {
  const p = running.get(runId);
  if (!p) return;

  // Сохраняем оригинальные функции для восстановления
  const originalConsoleLog = console.log;
  const originalProcessExit = process.exit;

  try {
    // Перехватываем console.log, чтобы парсить [PROGRESS] и [DETAIL] в реальном времени
    console.log = (...args) => {
      const line = args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ");
      p.log += line + "\n";

      const prog = parseProgressLine(line);
      if (prog) Object.assign(p, prog);

      const detail = parseDetailLine(line);
      if (detail) {
        if (detail.updated) p.details.updated.push(detail.updated);
        if (detail.added) p.details.added.push(detail.added);
      }

      // Также пишем в реальный stdout (на случай отладки)
      originalConsoleLog(...args);
    };

    // Блокируем process.exit — он убьёт весь сервер
    (process as NodeJS.EventEmitter).exit = ((code?: number) => {
      const msg = `process.exit(${code}) was called — sync прерван`;
      p.log += msg + "\n";
      throw new Error(msg);
    }) as (code?: number) => never;

    // Динамический импорт sync-all.mjs
    // Используем абсолютный путь — на Vercel файл лежит в /var/task/scripts/sync-all.mjs
    const syncModule = await import(SYNC_SCRIPT);

    if (platform === "wb") {
      await syncModule.runWbSync();
    } else {
      await syncModule.runOzonSync();
    }

    // Успех — парсим статистику
    const stats = parseStats(p.log);
    const success = !p.log.includes("FATAL:") && !p.log.includes("ERROR:");
    const errorMsg = success ? undefined : extractError(p.log);

    await addSyncRun({
      platform,
      timestamp: new Date().toISOString(),
      duration: Date.now() - p.startedAt,
      success,
      error: errorMsg,
      stats: {
        added: stats.added,
        updated: stats.updated,
        archived: stats.archived,
        skipped: stats.skipped || 0,
        errors: stats.errors,
        total: stats.added + stats.updated + stats.archived + (stats.skipped || 0),
      },
      log: p.log,
    });

    p.status = success ? "completed" : "failed";
    p.error = errorMsg;
    p.phase = "done";
    p.phaseLabel = success ? "Завершено" : "Ошибка";
    p.current = p.total;

  } catch (err) {
    if (p.status !== "failed") {
      const msg = err instanceof Error ? err.message : String(err);
      p.log += `\nFATAL: ${msg}\n`;
      p.status = "failed";
      p.error = msg.slice(0, 500);
      p.phase = "done";
      p.phaseLabel = "Ошибка";

      await addSyncRun({
        platform,
        timestamp: new Date().toISOString(),
        duration: Date.now() - p.startedAt,
        success: false,
        error: msg.slice(0, 500),
        stats: { added: 0, updated: 0, archived: 0, skipped: 0, errors: 1, total: 0 },
        log: p.log,
      });
    }
  } finally {
    // Восстанавливаем оригинальные функции
    console.log = originalConsoleLog;
    process.exit = originalProcessExit;
    activePlatformRun.delete(platform);

    // Сброс кэша данных + ISR
    invalidateCache();
    try {
      revalidatePath("/catalog");
      revalidatePath("/");
    } catch {
      // revalidatePath может упасть вне request-контекста
    }
  }
}

/* ─── Очистка зависшего запуска ─── */

function clearStaleRun(platform: "wb" | "ozon") {
  const active = activePlatformRun.get(platform);
  if (active && running.has(active)) {
    running.delete(active);
    activePlatformRun.delete(platform);
  }
}

/* ─── Получение прогресса ─── */

export function getSyncProgress(runId: string): SyncProgress | null {
  return running.get(runId) ?? null;
}

export function getActiveRunId(platform: "wb" | "ozon"): string | null {
  const runId = activePlatformRun.get(platform);
  if (runId && running.has(runId)) return runId;
  return null;
}

export function clearSyncState(platform: "wb" | "ozon") {
  clearStaleRun(platform);
}

/* ─── Re-export для совместимости ─── */

export { getLastSyncRun, SyncRunRecord };

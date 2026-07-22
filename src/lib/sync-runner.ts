/**
 * sync-runner.ts — асинхронный запуск sync-all.mjs с прогрессом.
 *
 * Запускает скрипт через child_process.exec, захватывает вывод
 * построчно, парсит [PROGRESS]-строки и обновляет in-memory состояние.
 *
 * API:
 *   startSync(platform) → runId
 *   getSyncProgress(runId) → SyncProgress | null
 *   getActiveRunId(platform) → string | null
 */

import { exec, ChildProcess } from "child_process";
import path from "path";
import { revalidatePath } from "next/cache";
import { invalidateCache } from "@/lib/data-cache";
import { addSyncRun, getLastSyncRun } from "./sync-history";
import type { SyncRunRecord, SyncRunDetail } from "./sync-history";
// Явные импорты для Vercel File Tracer — включает SDK и Prisma адаптер в Lambda
// (нужны для scripts/sync-all.mjs и scripts/sync-modules/*.mjs в child_process)
import { WildberriesSDK } from "daytona-wildberries-typescript-sdk";
import { ApiError } from "ozon-seller-sdk";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

[WildberriesSDK, ApiError, PrismaPg, PrismaClient];

const SCRIPTS_DIR = path.join(process.cwd(), "scripts");
const SYNC_SCRIPT = path.join(SCRIPTS_DIR, "sync-all.mjs");

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

/* ─── DB URL ─── */

function getDirectDbUrl(): string | undefined {
  return process.env.POSTGRES_URL_NON_POOLING
    || process.env.DIRECT_URL
    || process.env.POSTGRES_PRISMA_URL
    || process.env.DATABASE_URL;
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

/* ─── Очистка зависшего запуска ─── */

function clearStaleRun(platform: "wb" | "ozon") {
  const active = activePlatformRun.get(platform);
  if (active && running.has(active)) {
    running.delete(active);
    activePlatformRun.delete(platform);
  }
}

/** Извлечь первую значимую ошибку из лога */
function extractError(log: string, stderr: string, err: Error | null): string | undefined {
  if (err) {
    const msg = err.message || "";
    // Пропускаем технические node:internal/... строки
    if (msg.includes("ERR_MODULE_NOT_FOUND")) {
      const m = msg.match(/Cannot find package '([^']+)'/);
      return m ? `Пакет не найден: ${m[1]}. Проверьте установку зависимостей.` : `Ошибка модуля: ${msg.slice(0, 200)}`;
    }
    return msg.slice(0, 500);
  }

  // Ищем FATAL: в логе
  for (const line of log.split("\n")) {
    const t = line.trim();
    if (t.startsWith("FATAL:") || t.startsWith("ERROR:")) {
      // Пропускаем технический трейс
      const clean = t.replace(/^FATAL:\s*/, "").replace(/^ERROR:\s*/, "").slice(0, 300);
      if (!clean.includes("node:internal") && !clean.startsWith("at ")) {
        return clean;
      }
    }
  }

  // Prisma ошибки
  const prismaMatch = log.match(/PrismaClient\w+Error:\s*([^\n]+)/);
  if (prismaMatch) return prismaMatch[1].trim().slice(0, 300);

  // ERR_MODULE_NOT_FOUND в логе
  if (log.includes("ERR_MODULE_NOT_FOUND")) {
    const m = log.match(/Cannot find package '([^']+)'/);
    if (m) return `Пакет не найден: ${m[1]}`;
    return "Ошибка загрузки модуля";
  }

  // stderr
  if (stderr) {
    const lines = stderr.split("\n").filter(l => l.trim() && !l.includes("node:internal") && !l.startsWith("at "));
    if (lines.length > 0) return lines[0].slice(0, 300);
  }

  return undefined;
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
  const flag = platform === "wb" ? "--wb-only" : "--ozon-only";

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

  const child = exec(
    `node "${SYNC_SCRIPT}" ${flag}`,
    {
      cwd: process.cwd(),
      timeout: 300_000,
      maxBuffer: 10 * 1024 * 1024,
      env: {
        ...process.env,
        NODE_PATH: process.env.NODE_PATH || path.join(process.cwd(), "node_modules"),
        DATABASE_URL: getDirectDbUrl(),
        POSTGRES_PRISMA_URL: getDirectDbUrl(),
        POSTGRES_URL_NON_POOLING: getDirectDbUrl(),
        CI: "true",
      },
    },
    async (err, stdout, stderr) => {
      const p = running.get(runId);
      if (!p) return;

      p.log += stdout || "";
      if (stderr) p.log += "\n" + stderr;

      // Сохраняем stderr для extractError
      const _stderr = stderr || "";

      // Парсим JSON-суммари с последней строки
      const lines = stdout.trim().split("\n").filter(Boolean);
      const lastLine = lines[lines.length - 1];
      let syncStats = { added: 0, updated: 0, archived: 0, skipped: 0, errors: 0 };

      if (lastLine?.startsWith("{")) {
        try {
          const s = JSON.parse(lastLine);
          syncStats = {
            added: s.created || 0,
            updated: s.updated || 0,
            archived: s.archived || 0,
            skipped: s.skipped || 0,
            errors: s.errors || 0,
          };
        } catch { /* ignore */ }
      }

      const success = !err && !stdout.includes("ERROR:") && !stdout.includes("FATAL:");
      const errorMsg = extractError(p.log, _stderr, err);

      // Сохраняем в историю
      const record: SyncRunRecord = {
        platform,
        timestamp: new Date().toISOString(),
        duration: Date.now() - p.startedAt,
        success,
        error: errorMsg,
        stats: {
          added: syncStats.added,
          updated: syncStats.updated,
          archived: syncStats.archived,
          skipped: syncStats.skipped || 0,
          errors: syncStats.errors,
          total: syncStats.added + syncStats.updated + syncStats.archived + (syncStats.skipped || 0),
        },
        log: p.log,
      };
      await addSyncRun(record);

      // Сброс кэша данных + ISR
      invalidateCache();
      try {
        revalidatePath("/catalog");
        revalidatePath("/");
      } catch {
        // revalidatePath может упасть вне request-контекста
      }

      // Финальный статус
      p.status = success ? "completed" : "failed";
      p.error = errorMsg;
      p.phase = "done";
      p.phaseLabel = success ? "Завершено" : "Ошибка";
      p.current = p.total;

      // Очищаем activePlatformRun
      activePlatformRun.delete(platform);
    },
  );

  // Обработка ошибки запуска (синхронная)
  child.on("error", (execErr) => {
    const p = running.get(runId);
    if (!p) return;
    p.log += `\nОшибка запуска: ${execErr.message}`;
    p.status = "failed";
    p.error = execErr.message.slice(0, 300);
    p.phase = "done";
    p.phaseLabel = "Ошибка";
    activePlatformRun.delete(platform);
  });

  // Построчный разбор stdout
  child.stdout?.on("data", (chunk: string) => {
    const p = running.get(runId);
    if (!p) return;

    p.log += chunk;
    const lines = chunk.split("\n");

    for (const line of lines) {
      const prog = parseProgressLine(line);
      if (prog) {
        Object.assign(p, prog);
        continue;
      }

      const detail = parseDetailLine(line);
      if (detail) {
        if (detail.updated) p.details.updated.push(detail.updated);
        if (detail.added) p.details.added.push(detail.added);
        continue;
      }
    }
  });

  child.stderr?.on("data", (chunk: string) => {
    const p = running.get(runId);
    if (p) p.log += chunk;
  });

  return runId;
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

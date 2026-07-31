/**
 * sync-runner.ts — асинхронный запуск sync-all.mjs с прогрессом.
 *
 * Запускает sync-all.mjs в том же процессе через import() вместо child_process,
 * потому что на Vercel node_modules недоступны дочерним процессам на файловой системе.
 *
 * Бандл синхронизации загружается динамически (import()) только в рантайме,
 * чтобы Turbopack не пытался трассировать его зависимости (http2-wrapper,
 * ozon-seller-sdk) во время сборки.
 *
 * API:
 *   startSync(platform) → runId
 *   getSyncProgress(runId) → SyncProgress | null
 *   getActiveRunId(platform) → string | null
 */

import { revalidatePath } from "next/cache";
import { invalidateCache } from "@/lib/data-cache";
import { addSyncRun, getLastSyncRun } from "./sync-history";
import type { SyncRunRecord, SyncRunDetail } from "./sync-history";

/* ─── Типы прогресса ─── */

export interface SyncProgress {
  runId: string;
  platform: "wb" | "ozon";
  status: "running" | "completed" | "failed";
  phase: string;
  phaseLabel: string;
  current: number;
  total: number;
  /** Лог построчно (join при чтении — O(n), не O(n²) конкатенацией) */
  logLines: string[];
  log: string;
  error?: string;
  details: { updated: SyncRunDetail[]; added: SyncRunDetail[] };
  startedAt: number;
}

/* ─── In-memory store ─── */

const running = new Map<string, SyncProgress>();
const activePlatformRun = new Map<string, string>();
let runCounter = 0;

/** Завершённые запуски старше 1 часа удаляются, чтобы Map не рос бесконечно */
const FINISHED_TTL_MS = 60 * 60 * 1_000;

function cleanupFinishedRuns() {
  const now = Date.now();
  for (const [runId, p] of running) {
    if (p.status !== "running" && now - p.startedAt > FINISHED_TTL_MS) {
      running.delete(runId);
      // Удаляем из active-мапы, если это активный запуск платформы
      if (activePlatformRun.get(p.platform) === runId) activePlatformRun.delete(p.platform);
    }
  }
}

function nextRunId(platform: string): string {
  runCounter++;
  const ts = Date.now().toString(36);
  return `${platform}-${ts}-${runCounter}`;
}

/* ─── Фазы и их подписи ─── */

const PHASE_LABELS: Record<string, string> = {
  "wb-cards": "Получение активных карточек WB",
  "wb-trash": "Получение карточек WB в корзине",
  "wb-cards-v4": "Получение карточек WB (card.wb.ru)",
  "wb-process": "Обработка товаров WB",
  "ozon-list": "Получение списка товаров Ozon",
  "ozon-info": "Получение информации о товарах Ozon",
  "ozon-attrs": "Получение характеристик Ozon",
  "ozon-process": "Обработка товаров Ozon",
  "ozon-prices": "Получение реальных цен Ozon",
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
    logLines: [],
    log: "",
    details: { updated: [], added: [] },
    startedAt: Date.now(),
  };

  running.set(runId, progress);
  activePlatformRun.set(platform, runId);
  cleanupFinishedRuns(); // не даём Map расти бесконечно

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
      p.logLines.push(line); // O(1) на строку; join — только при чтении

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
    const origExit = process.exit;
    ((process as unknown) as Record<string, unknown>).exit = ((code?: number) => {
      const msg = `process.exit(${code}) was called — sync прерван`;
      p.logLines.push(msg);
      throw new Error(msg);
    }) as (code?: number) => never;

    // Динамический импорт бандла — загружается только в рантайме, на Vercel файл
    // включён через outputFileTracingIncludes в next.config.ts.
    // console.log и process.exit перехватываются через глобальные объекты
    // — функции внутри бандла используют их, т.к. это не замыкания, а рантайм-глобалы.
    const { runWbSync: runWb, runOzonSync: runOz } = await import(
      "../../scripts/sync-all.bundle.mjs"
    );
    if (platform === "wb") {
      await runWb();
    } else {
      await runOz();
    }

    // Успех — парсим статистику
    const fullLog = p.logLines.join("\n");
    const stats = parseStats(fullLog);
    const success = !p.logLines.some((l) => l.includes("FATAL:") || l.includes("ERROR:"));
    const errorMsg = success ? undefined : extractError(fullLog);

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
      log: fullLog,
    });

    p.status = success ? "completed" : "failed";
    p.error = errorMsg;
    p.phase = "done";
    p.phaseLabel = success ? "Завершено" : "Ошибка";
    p.current = p.total;

  } catch (err) {
    if (p.status !== "failed") {
      const msg = err instanceof Error ? err.message : String(err);
      p.logLines.push(`\nFATAL: ${msg}\n`);
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
        log: p.logLines.join("\n"),
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
  const p = running.get(runId);
  if (!p) return null;
  // log пересобираем только при чтении (O(n)), в рантайме копим logLines (O(1))
  return { ...p, log: p.logLines.join("\n") };
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

/**
 * ozon-sync.ts — серверная обёртка для Ozon Sync.
 *
 * Асинхронный запуск через sync-runner.ts.
 * Сохраняет историю через sync-history.ts.
 */

import { startSync, getActiveRunId, getSyncProgress, getLastSyncRun } from "./sync-runner";

/**
 * Запускает синхронизацию с Ozon в фоне.
 * Возвращает runId для отслеживания прогресса.
 */
export function runOzonSync(): string {
  return startSync("ozon");
}

/**
 * Возвращает runId активной Ozon синхронизации или null.
 */
export function getActiveOzonRunId(): string | null {
  return getActiveRunId("ozon");
}

/**
 * Возвращает прогресс по runId.
 */
export { getSyncProgress };

/**
 * Возвращает последний завершённый запуск Ozon из истории.
 */
export async function getOzonSyncStatus() {
  return await getLastSyncRun("ozon");
}

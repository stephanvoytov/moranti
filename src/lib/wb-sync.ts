/**
 * wb-sync.ts — серверная обёртка для WB Sync.
 *
 * Асинхронный запуск через sync-runner.ts.
 * Сохраняет историю через sync-history.ts.
 */

import { startSync, getActiveRunId, getSyncProgress, getLastSyncRun, SyncProgress } from "./sync-runner";

export type { SyncProgress };

/**
 * Запускает синхронизацию с WB в фоне.
 * Возвращает runId для отслеживания прогресса.
 */
export function runWbSync(): string {
  return startSync("wb");
}

/**
 * Возвращает runId активной WB синхронизации или null.
 */
export function getActiveWbRunId(): string | null {
  return getActiveRunId("wb");
}

/**
 * Возвращает прогресс по runId или null.
 */
export { getSyncProgress };

/**
 * Возвращает последний завершённый запуск WB из истории.
 */
export async function getWbSyncStatus() {
  return await getLastSyncRun("wb");
}

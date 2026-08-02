/**
 * sync-enabled.ts — гард синхронизации по окружению.
 *
 * БД общая для dev и prod, поэтому синк (WB/Ozon) должен запускаться только
 * из одного окружения, иначе два деплоя будут писать в БД одновременно.
 * В dev-окружении (Preview) задаём SYNC_ENABLED=false — админ-роуты синка
 * вернут 403. Основной синк идёт из GitHub Actions (sync-wb.yml).
 */
export function isSyncEnabled(): boolean {
  return process.env.SYNC_ENABLED !== "false";
}
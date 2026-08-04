"use client";

import { MARKETPLACE_URLS } from "@/lib/marketplaces";
import styles from "./page.module.css";

interface MarketplaceCtasProps {
  /** ID счётчика Яндекс.Метрики (из настроек или env) — пусто = без трекинга */
  ymId?: string | null;
  wbArticle?: number;
  wbStock?: number;
  ozonArticle?: number;
  ozonStock?: number;
}

/** Кнопки «Купить на Wildberries/Ozon» + цели Яндекс.Метрики.
 *  Клик отправляет ym(id, "reachGoal", "buy-wb" | "buy-ozon").
 *  В кабинете Метрики нужно создать цели типа «JavaScript-событие»
 *  с идентификаторами buy-wb и buy-ozon. */
export default function MarketplaceCtas({
  ymId,
  wbArticle,
  wbStock,
  ozonArticle,
  ozonStock,
}: MarketplaceCtasProps) {
  const reachGoal = (goal: "buy-wb" | "buy-ozon") => {
    if (!ymId || typeof window === "undefined") return;
    // window.ym — глобальная функция, определённая сниппетом Метрики в layout
    (
      window as unknown as {
        ym?: (id: string, action: string, goal: string) => void;
      }
    ).ym?.(ymId, "reachGoal", goal);
  };

  return (
    <div className={styles.ctas}>
      {wbArticle && (wbStock ?? 0) > 0 && (
        <a
          href={MARKETPLACE_URLS.wbProduct(wbArticle)}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cta}
          onClick={() => reachGoal("buy-wb")}
        >
          Купить на Wildberries
        </a>
      )}
      {ozonArticle && (ozonStock ?? 0) > 0 && (
        <a
          href={MARKETPLACE_URLS.ozonProduct(ozonArticle)}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cta}
          onClick={() => reachGoal("buy-ozon")}
        >
          Купить на Ozon
        </a>
      )}
    </div>
  );
}

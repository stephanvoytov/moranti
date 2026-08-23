"use client";

import { MARKETPLACE_URLS } from "@/lib/marketplaces";
import { YANDEX_METRIKA_ID } from "@/config/analytics";
import styles from "./page.module.css";

interface MarketplaceCtasProps {
  wbArticle?: number;
  wbStock?: number;
  ozonArticle?: number;
  ozonStock?: number;
  /** Дополнительные CTA в той же секции (например, «В корзину») */
  children?: React.ReactNode;
}

/** Кнопки «Купить на Wildberries/Ozon» + цели Яндекс.Метрики.
 *  Клик отправляет ym(id, "reachGoal", "buy-wb" | "buy-ozon").
 *  ID счётчика — константа YANDEX_METRIKA_ID из src/config/analytics.ts.
 *  В кабинете Метрики нужно создать цели типа «JavaScript-событие»
 *  с идентификаторами buy-wb и buy-ozon. */
export default function MarketplaceCtas({
  wbArticle,
  wbStock,
  ozonArticle,
  ozonStock,
  children,
}: MarketplaceCtasProps) {
  const reachGoal = (goal: "buy-wb" | "buy-ozon") => {
    if (typeof window === "undefined") return;
    // window.ym — глобальная функция, определённая сниппетом Метрики в layout
    (
      window as unknown as {
        ym?: (id: number, action: string, goal: string) => void;
      }
    ).ym?.(YANDEX_METRIKA_ID, "reachGoal", goal);
  };

  return (
    <div className={styles.ctas}>
      {children}
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

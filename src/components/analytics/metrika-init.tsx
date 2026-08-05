"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    ym?: ((...args: unknown[]) => void) & { a?: unknown[]; l?: number };
  }
}

/**
 * Яндекс.Метрика — обезличенный счётчик посещаемости.
 * Вебвизор и карта кликов ОТКЛЮЧЕНЫ: запись действий посетителя не ведётся,
 * данные не позволяют идентифицировать пользователя, поэтому согласие
 * не требуется — обработка на основании законного интереса (п. 5 ч. 1 ст. 6
 * Федерального закона № 152-ФЗ).
 */
export default function MetrikaInit({ id }: { id: number }) {
  useEffect(() => {
    const w = window as Window & { ym?: Window["ym"] };
    if (!w.ym) {
      w.ym = Object.assign(
        (...args: unknown[]) => {
          if (!w.ym) return;
          w.ym.a = w.ym.a || [];
          w.ym.a.push(args);
        },
        { a: undefined as unknown[] | undefined, l: undefined as number | undefined },
      );
      w.ym.l = 1 * Date.now();

      // tag.js грузится динамически — CSP script-src уже разрешает mc.yandex.ru
      const s = document.createElement("script");
      s.async = true;
      s.src = "https://mc.yandex.ru/metrika/tag.js";
      const first = document.getElementsByTagName("script")[0];
      if (first && first.parentNode) first.parentNode.insertBefore(s, first);
    }

    w.ym(id, "init", {
      ssr: true,
      ecommerce: "dataLayer",
      accurateTrackBounce: true,
      trackLinks: true,
    });
  }, [id]);

  return null;
}

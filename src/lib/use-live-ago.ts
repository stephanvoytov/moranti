/**
 * use-live-ago.ts — React хуки для живого автообновляемого времени.
 *
 * useLiveAgo(timestamp) → "только что" → "1 минуту назад" → "5 мин. назад"…
 * useElapsed(startTime)  → "01:23" (секундомер от старта)
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "./format-date";

/**
 * Возвращает относительное время от timestamp, которое само обновляется.
 *
 * - первые 60с: каждые 10с
 * - до 60 мин: каждые 30с
 * - до 24ч: каждые 5 мин
 * - далее: не обновляется (там уже дни)
 */
export function useLiveAgo(timestamp: string | Date | null | undefined): string {
  const ts = timestamp ? (typeof timestamp === "string" ? new Date(timestamp) : timestamp) : null;

  const calc = () => {
    if (!ts) return "";
    return formatDistanceToNow(ts, { addSuffix: true, locale: "ru" });
  };

  const [text, setText] = useState(calc);

  useEffect(() => {
    if (!ts) return;

    // Сразу обновить
    setText(calc());

    // Функция определения интервала обновления
    const diff = Date.now() - ts.getTime();
    let interval: number;
    if (diff < 60_000) {
      interval = 10_000;       // 10с — первые минуты
    } else if (diff < 3_600_000) {
      interval = 30_000;       // 30с — до часа
    } else {
      interval = 300_000;      // 5 мин — больше часа
    }

    const id = setInterval(() => {
      setText(calc());
    }, interval);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timestamp]);

  return text;
}

/**
 * Секундомер: возвращает "MM:SS" от startTime до сейчас.
 * Обновляется каждую секунду.
 */
export function useElapsed(startTime: string | Date | null | undefined): string {
  const st = startTime ? (typeof startTime === "string" ? new Date(startTime) : startTime) : null;

  const calc = () => {
    if (!st) return "--:--";
    const diff = Date.now() - st.getTime();
    if (diff < 0) return "00:00";
    const totalSec = Math.floor(diff / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const [text, setText] = useState(calc);

  useEffect(() => {
    if (!st) return;
    setText(calc());
    const id = setInterval(() => setText(calc()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime]);

  return text;
}

/**
 * usePulse — пульсирующий индикатор (для статуса running).
 * Возвращает true/false, меняется каждые 800ms.
 */
export function usePulse(active: boolean, interval = 800): boolean {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!active) {
      setPulse(false);
      return;
    }
    const id = setInterval(() => setPulse((p) => !p), interval);
    return () => clearInterval(id);
  }, [active, interval]);

  return active && pulse;
}

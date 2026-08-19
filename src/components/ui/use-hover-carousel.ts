"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { blobUrl } from "@/lib/blob";

/** Максимум фото в карточке (как WB): первое — главное, остальные — hover-карусель */
const MAX_HOVER_IMAGES = 4;
/** Каденс смены кадров при наведении */
const HOVER_INTERVAL_MS = 1600;
/** Задержка touch-старта — отличает тап от удержания пальца */
const TOUCH_DELAY_MS = 200;

export interface HoverCarousel {
  /** Активный слой (индекс в layers) */
  hoverIndex: number;
  /** Главное фото загрузилось (или битое) — пора монтировать hover-слои */
  isBaseReady: boolean;
  /** Проксированные URL слоёв: i=0 — главное фото, остальные — hover */
  layers: string[];
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  handleTouchStart: () => void;
  handleTouchEnd: () => void;
  /** Регистрация загруженного фото (src — проксированный URL слоя) */
  registerLoaded: (src: string) => void;
  /** Регистрация битого фото (его пропускаем в карусели) */
  registerFailed: (url: string) => void;
}

/**
 * Hover-карусель фото карточки.
 *
 * Приоритет загрузки: главное фото качается первым; hover-слои монтируются
 * только после его загрузки/ошибки (isBaseReady) и не конкурируют с ним за канал.
 *
 * Кадр переключается только на полностью загруженное фото; битые пропускаются
 * (незагруженный кадр не показывается — вместо него остаётся текущий).
 *
 * Состояние статусов: refs — источник истины (всегда актуальны для замыкания
 * интервала), state-зеркала — триггер ререндера для мгновенного перехода на
 * кадр, загрузившийся во время hover (не ждём следующий тик таймера).
 */
export function useHoverCarousel(rawImages: string[]): HoverCarousel {
  const layers = useMemo(
    () => rawImages.slice(0, MAX_HOVER_IMAGES).map(blobUrl),
    [rawImages]
  );

  const [hoverIndex, setHoverIndex] = useState(0);
  const [isBaseReady, setIsBaseReady] = useState(false);
  const [loadedUrls, setLoadedUrls] = useState<ReadonlySet<string>>(new Set());
  const [failedUrls, setFailedUrls] = useState<ReadonlySet<string>>(new Set());
  const loadedRef = useRef(new Set<string>());
  const failedRef = useRef(new Set<string>());

  const hoverTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoveringRef = useRef(false);
  // Зеркало hoverIndex для замыканий (таймер/эффекты видят актуальный кадр).
  const hoverIndexRef = useRef(0);
  // Когда начался показ текущего кадра — чтобы кадры не «проскакивали».
  const frameStartedAt = useRef(0);

  const registerLoaded = useCallback(
    (src: string) => {
      // Главное фото: по результату (успех ИЛИ ошибка) разрешаем hover-слои
      if (layers[0] && src === layers[0]) setIsBaseReady(true);
      if (loadedRef.current.has(src)) return;
      loadedRef.current.add(src);
      setLoadedUrls(new Set(loadedRef.current));
    },
    [layers]
  );

  const registerFailed = useCallback(
    (url: string) => {
      if (layers[0] && url === layers[0]) setIsBaseReady(true);
      if (failedRef.current.has(url)) return;
      failedRef.current.add(url);
      setFailedUrls(new Set(failedRef.current));
    },
    [layers]
  );

  // Следующий кадр для показа: загруженный (или главный), битые пропускаем,
  // недогруженные — ждём. Читает refs — безопасно из замыкания интервала.
  const nextReadyFrame = useCallback(
    (prev: number): number => {
      if (layers.length < 2) return prev;
      let next = (prev + 1) % layers.length;
      let guard = 0;
      while (guard < layers.length) {
        const url = layers[next];
        if (!url) return prev;
        if (loadedRef.current.has(url)) return next;
        if (!failedRef.current.has(url)) return prev; // ещё грузится — ждём
        next = (next + 1) % layers.length;
        guard++;
      }
      return prev;
    },
    [layers]
  );

  // Единая точка переключения кадра: обновляет state + зеркало + таймстамп показа.
  const goTo = useCallback((next: number) => {
    if (next === hoverIndexRef.current) return;
    hoverIndexRef.current = next;
    frameStartedAt.current = performance.now();
    setHoverIndex(next);
  }, []);

  // Один шаг вперёд (штатный тик таймера или мгновенный переход по загрузке).
  const advanceOnce = useCallback(() => {
    goTo(nextReadyFrame(hoverIndexRef.current));
  }, [goTo, nextReadyFrame]);

  const startCycling = useCallback(() => {
    if (layers.length < 2) return;
    if (hoverTimer.current) clearInterval(hoverTimer.current);
    hoveringRef.current = true;
    // Первый кадр — сразу, если уже загружен; иначе остаёмся на главном
    // (эффект ниже подхватит кадр мгновенно, как только он загрузится).
    const first = layers[1];
    goTo(first && loadedRef.current.has(first) ? 1 : 0);
    hoverTimer.current = setInterval(advanceOnce, HOVER_INTERVAL_MS);
  }, [layers, goTo, advanceOnce]);

  const stopCycling = useCallback(() => {
    hoveringRef.current = false;
    if (hoverTimer.current) {
      clearInterval(hoverTimer.current);
      hoverTimer.current = null;
    }
    goTo(0);
  }, [goTo]);

  const handleTouchStart = useCallback(() => {
    if (layers.length < 2) return;
    // Задержка: быстрый тап (≤ TOUCH_DELAY_MS) не запускает карусель
    touchTimer.current = setTimeout(startCycling, TOUCH_DELAY_MS);
  }, [layers.length, startCycling]);

  const handleTouchEnd = useCallback(() => {
    if (touchTimer.current) {
      clearTimeout(touchTimer.current);
      touchTimer.current = null;
    }
    stopCycling();
  }, [stopCycling]);

  // Кадр, загрузившийся во время hover, показываем сразу — но только если
  // текущий кадр уже показан не меньше интервала. Иначе переключение обрежет
  // его показ («кадры проскакивают» на прогрессивной загрузке); штатный тик
  // таймера всё равно переключит на готовый кадр в свой момент.
  useEffect(() => {
    if (!hoveringRef.current) return;
    if (performance.now() - frameStartedAt.current >= HOVER_INTERVAL_MS) {
      advanceOnce();
    }
  }, [loadedUrls, failedUrls, advanceOnce]);

  // Очистка таймеров при размонтировании (идемпотентно — StrictMode-safe).
  // Загрузки изображений отменять не нужно: удаление <img> из DOM прерывает
  // незавершённые fetch'и силами браузера.
  useEffect(() => {
    return () => {
      hoveringRef.current = false;
      if (hoverTimer.current) clearInterval(hoverTimer.current);
      if (touchTimer.current) clearTimeout(touchTimer.current);
    };
  }, []);

  return {
    hoverIndex,
    isBaseReady,
    layers,
    handleMouseEnter: startCycling,
    handleMouseLeave: stopCycling,
    handleTouchStart,
    handleTouchEnd,
    registerLoaded,
    registerFailed,
  };
}

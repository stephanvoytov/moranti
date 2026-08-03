"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./smart-image.module.css";

interface SmartImageProps {
  src?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  priority?: boolean;
  draggable?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
  /** Доп. обработчик ошибки — для fallback-цепочек (напр. big → c516x688) */
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  /** Вызывается при фактической загрузке src (включая кэш-хиты) — src проксированный */
  onLoad?: (src: string) => void;
  /** Кастомный класс placeholder (родитель должен быть position: relative) */
  placeholderClassName?: string;
}

/**
 * <img> с placeholder'ом: shimmer пока грузится, иконка «нет фото» при ошибке.
 * Рендерит fragment — placeholder позиционируется absolute относительно
 * родителя (у родителя должен быть position: relative).
 *
 * Анти-мерцание:
 * 1. Уже загруженные src запоминаются в модульном кэше — при повторной смене
 *    src (hover-циклы карточек, кеш-хиты) placeholder не показывается.
 * 2. При смене src на ещё не загруженный новый URL — старый кадр остаётся
 *    видимым, а новый скачивается скрытым <img>; по load происходит
 *    мгновенная смена. Белый placeholder не мелькает вообще.
 * 3. Картинка может быть уже в HTTP-кэше браузера и отрисоваться мгновенно —
 *    событие load тогда не сработает; проверяем complete при монтировании.
 */
const loadedCache = new Set<string>();

export default function SmartImage(props: SmartImageProps) {
  return <SmartImageInner {...props} />;
}

function SmartImageInner({
  src,
  alt,
  className,
  style,
  width,
  height,
  priority,
  draggable,
  onMouseDown,
  onError,
  onLoad,
  placeholderClassName,
}: SmartImageProps) {
  // src, который сейчас показан, и загружен ли он (управляет placeholder'ом)
  const [displaySrc, setDisplaySrc] = useState<string | undefined>(src);
  const [displayLoaded, setDisplayLoaded] = useState(() =>
    src ? loadedCache.has(src) : false
  );
  const [failed, setFailed] = useState(false);
  // Новый src, скачиваемый скрытым <img>, пока показывается старый кадр
  const [loadingSrc, setLoadingSrc] = useState<string | null>(null);
  const [prevSrc, setPrevSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

  // Смена src — официальный паттерн «adjust state when prop changes» (без эффектов):
  // из кэша кадр меняется мгновенно; иначе новый src качается скрытым <img>,
  // а старый кадр остаётся видимым. Устаревший pending гасится при src === displaySrc.
  if (src !== prevSrc) {
    setPrevSrc(src);
    if (src) {
      if (src === displaySrc) {
        // hover ушёл до загрузки — отменяем скрытую дозагрузку
        setLoadingSrc(null);
      } else if (loadedCache.has(src)) {
        setDisplaySrc(src);
        setDisplayLoaded(true);
      } else {
        setFailed(false);
        setLoadingSrc(src);
      }
    }
  }

  // Картинка может быть уже в HTTP-кэше браузера и отрисоваться мгновенно —
  // load не сработает (React ещё не навесил обработчик), и placeholder останется
  // поверх фото навсегда. Проверяем complete при монтировании.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      if (src) {
        loadedCache.add(src);
        onLoad?.(src);
      }
      setDisplayLoaded(true);
    }
  }, [src, onLoad]);

  const handleLoad = () => {
    if (src) {
      loadedCache.add(src);
      onLoad?.(src);
    }
    setDisplayLoaded(true);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    onError?.(e);
    setFailed(true);
  };

  // Скрытая дозагрузка завершилась — смена кадра, флеша нет
  const handlePendingLoad = () => {
    if (!loadingSrc) return;
    loadedCache.add(loadingSrc);
    setDisplaySrc(loadingSrc);
    setDisplayLoaded(true);
    setLoadingSrc(null);
    onLoad?.(loadingSrc);
  };

  const handlePendingError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!loadingSrc) return;
    onError?.(e);
    // Есть что показать — остаёмся на старом кадре; иначе иконка «нет фото»
    if (displaySrc === undefined || !displayLoaded) setFailed(true);
    setLoadingSrc(null);
  };

  const placeholderClass = placeholderClassName || styles.placeholder;

  // Нет фото — рендерим пустой фрагмент (как раньше с img без src)
  if (!src && !displaySrc) return null;

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={displaySrc ?? ""}
        ref={imgRef}
        src={displaySrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={style}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        draggable={draggable}
        onMouseDown={onMouseDown}
        onLoad={handleLoad}
        onError={handleError}
      />
      {loadingSrc && loadingSrc !== displaySrc && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          key={loadingSrc}
          src={loadingSrc}
          alt=""
          aria-hidden="true"
          loading="eager"
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            pointerEvents: "none",
          }}
          onLoad={handlePendingLoad}
          onError={handlePendingError}
        />
      )}
      {!displayLoaded && (
        <span
          className={`${placeholderClass} ${failed ? styles.placeholderFailed : ""}`}
          aria-hidden="true"
        >
          {/* Иконка «нет фото» — ТОЛЬКО при ошибке. При загрузке показываем
              чистый слой + shimmer: битая иконка в момент загрузки читалась
              как «фото недоступно», хотя картинка просто грузилась. */}
          {failed && (
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="2" y="2" width="16" height="16" rx="2" />
              <circle cx="7" cy="7" r="2" />
              <path d="M2 14l4-4 3 3 3-4 6 6" />
            </svg>
          )}
        </span>
      )}
    </>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
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
  /** Кастомный класс placeholder (родитель должен быть position: relative) */
  placeholderClassName?: string;
}

/**
 * <img> с placeholder'ом: shimmer пока грузится, иконка «нет фото» при ошибке.
 * Рендерит fragment — placeholder позиционируется absolute относительно
 * родителя (у родителя должен быть position: relative).
 *
 * Анти-мерцание: после первой успешной загрузки placeholder при смене src
 * не показывается — важно для hover-циклов карточек (кеш-хиты).
 */
export default function SmartImage({
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
  placeholderClassName,
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const everLoaded = useRef(false);

  useEffect(() => {
    if (!everLoaded.current) setLoaded(false);
    setFailed(false);
  }, [src]);

  const handleLoad = () => {
    everLoaded.current = true;
    setLoaded(true);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    onError?.(e);
    setFailed(true);
  };

  const placeholderClass = placeholderClassName || styles.placeholder;

  // Нет фото — рендерим пустой фрагмент (как раньше с img без src)
  if (!src) return null;

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={src}
        src={src}
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
      {!loaded && (
        <span
          className={`${placeholderClass} ${failed ? styles.placeholderFailed : ""}`}
          aria-hidden="true"
        >
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="2" y="2" width="16" height="16" rx="2" />
            <circle cx="7" cy="7" r="2" />
            <path d="M2 14l4-4 3 3 3-4 6 6" />
          </svg>
        </span>
      )}
    </>
  );
}

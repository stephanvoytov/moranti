"use client";

import { useState, useCallback, useEffect } from "react";
import SmartImage from "./smart-image";

interface Props {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  draggable?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
}

/**
 * Галерея — сырой <img> с WB CDN, без next/image.
 * URL уже в размере big (900×1200), но если попадётся c516x688 — апгрейдит.
 * Ошибка big → fallback на оригинал → иначе SmartImage покажет «нет фото».
 */
function upgradeUrl(url: string): string {
  return url.replace("/c516x688/", "/big/");
}

export default function GalleryImage({
  src,
  alt,
  width = 600,
  height = 800,
  className,
  style,
  priority,
  draggable,
  onMouseDown,
}: Props) {
  const [currentSrc, setCurrentSrc] = useState(() => upgradeUrl(src));

  useEffect(() => {
    setCurrentSrc(upgradeUrl(src));
  }, [src]);

  // big не загрузился → пробуем оригинальный URL; если и он не загрузился —
  // currentSrc не изменится, и SmartImage перейдёт в состояние «нет фото»
  const onError = useCallback(() => {
    setCurrentSrc((cur) => (cur !== src ? src : cur));
  }, [src]);

  return (
    <SmartImage
      key={src}
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      priority={priority}
      draggable={draggable}
      onMouseDown={onMouseDown}
      onError={onError}
    />
  );
}

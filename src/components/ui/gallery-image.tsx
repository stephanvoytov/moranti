"use client";

import { useState, useCallback, useEffect } from "react";

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
 * Пытается взять максимальный размер из WB CDN.
 * Сначала c1200x1600, потом big, потом оригинал.
 * Использует <img> без next/image — никакого пережатия.
 */
function bestUrl(url: string): string {
  const cdnBase = url.split("/images/")[0];
  if (!cdnBase) return url;
  const match = url.match(/\/images\/[^/]+\/(\d+)\.webp$/);
  if (!match) return url;
  const idx = match[1];
  return `${cdnBase}/images/c1200x1600/${idx}.webp`;
}

function fallbackUrl(url: string): string {
  const cdnBase = url.split("/images/")[0];
  if (!cdnBase) return url;
  const match = url.match(/\/images\/[^/]+\/(\d+)\.webp$/);
  if (!match) return url;
  const idx = match[1];
  return `${cdnBase}/images/big/${idx}.webp`;
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
  const [currentSrc, setCurrentSrc] = useState(() => bestUrl(src));

  // Reset when src changes
  useEffect(() => {
    setCurrentSrc(bestUrl(src));
  }, [src]);

  const onError = useCallback(() => {
    if (currentSrc === bestUrl(src)) {
      // c1200x1600 failed → try big
      setCurrentSrc(fallbackUrl(src));
    } else if (currentSrc !== src) {
      // big failed → try original
      setCurrentSrc(src);
    }
  }, [currentSrc, src]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={src}
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      draggable={draggable}
      onMouseDown={onMouseDown}
      onError={onError}
    />
  );
}

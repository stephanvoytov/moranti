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
 * Пытается загрузить HD-версию (big) картинки с WB CDN.
 * big ~ 900×1200 — как на самом WB.
 * Если big не грузится (404/редирект) — падает на оригинальный URL из БД.
 */
function hdUrl(url: string): string {
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
  const [currentSrc, setCurrentSrc] = useState(() => hdUrl(src));

  // Reset when src changes
  useEffect(() => {
    setCurrentSrc(hdUrl(src));
  }, [src]);

  const onError = useCallback(() => {
    // big failed → fall back to stored URL
    if (currentSrc !== src) setCurrentSrc(src);
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

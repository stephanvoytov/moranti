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
 * Галерея — сырой <img> с WB CDN, без next/image.
 * URL уже в размере big (900×1200), но если попадётся c516x688 — апгрейдит.
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

  const onError = useCallback(() => {
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

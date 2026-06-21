"use client";

import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import { wbImageHd } from "@/lib/wb-image";

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
 * Пытается загрузить HD-версию (big) картинки с WB.
 * Если HD не найдена (404), падает на c516x688.
 * При смене src пересоздаётся (key на Image) — старое фото исчезает сразу.
 */
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
  const hdSrc = wbImageHd(src);
  const [currentSrc, setCurrentSrc] = useState(hdSrc);

  // Reset to HD when src changes
  useEffect(() => {
    setCurrentSrc(hdSrc);
  }, [hdSrc, src]);

  const onError = useCallback(() => {
    if (currentSrc !== src) setCurrentSrc(src);
  }, [currentSrc, src]);

  return (
    <Image
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

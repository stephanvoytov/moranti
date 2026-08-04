"use client";

/**
 * HlsVideo — <video> с поддержкой HLS (m3u8) для всех браузеров.
 *
 * Safari (и iOS) играют HLS нативно; Chrome/Firefox/Edge — через hls.js (MSE).
 * hls.js подгружается лениво (dynamic import ~60KB) и только если нужен.
 *
 * Ошибки fatal не ретраим: если плейлист битый/недоступен — тихо показываем
 * poster (первое фото товара) и останавливаемся.
 */

import { useEffect, useRef } from "react";
import type Hls from "hls.js";

interface HlsVideoProps {
  /** URL HLS-плейлиста (index.m3u8) */
  src: string;
  /** Картинка-постер (обычно первое фото товара) */
  poster?: string;
  /** Начать воспроизведение сразу (требует muted для автоплея в браузерах) */
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function HlsVideo({
  src,
  poster,
  autoPlay = false,
  muted = false,
  loop = false,
  controls = false,
  playsInline = true,
  className,
  style,
}: HlsVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls: Hls | null = null;
    let cancelled = false;

    // Нативный HLS (Safari) — просто src на <video>
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return () => {
        cancelled = true;
        video.removeAttribute("src");
        video.load();
      };
    }

    // Chrome/Firefox/Edge — hls.js (MSE). Грузим лениво, только при первом показе.
    let disposed = false;
    const init = async () => {
      try {
        if (cancelled || disposed) return;
        const { default: Hls } = await import("hls.js");
        if (cancelled || disposed || !Hls.isSupported()) return;

        hls = new Hls({
          // Не ждём полной загрузки плейлиста — стартуем как можно раньше
          startLevel: -1, // auto (выбирает подходящее качество по пропускной способности)
          capLevelToPlayerSize: true,
        });
        hlsRef.current = hls;

        // Fatal-ошибки (битый плейлист, CORS, недоступный сегмент) — тихо останавливаемся
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            hlsRef.current?.destroy();
            hlsRef.current = null;
          }
        });

        hls.loadSource(src);
        hls.attachMedia(video);
        if (autoPlay && muted) {
          video.muted = true;
          video.play().catch(() => {});
        }
      } catch {
        // Ошибка загрузки hls.js — молча пропускаем (остаётся poster)
      }
    };
    void init();

    return () => {
      disposed = true;
      cancelled = true;
      if (hls) {
        hls.destroy();
        hlsRef.current = null;
      }
      video.removeAttribute("src");
      video.load();
    };
  }, [src, autoPlay, muted]);

  return (
    <video
      ref={videoRef}
      className={className}
      style={style}
      poster={poster}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      controls={controls}
      playsInline={playsInline}
      preload="metadata"
      draggable={false}
    />
  );
}

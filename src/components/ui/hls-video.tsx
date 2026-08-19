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

import { useCallback, useEffect, useRef } from "react";
import type Hls from "hls.js";

interface HlsVideoProps {
  /** URL HLS-плейлиста (index.m3u8) */
  src: string;
  /** Картинка-постер (обычно первое фото товара) */
  poster?: string;
  /** Начать воспроизведение (требует muted для автоплея в браузерах) */
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  /** Внешнее управление: true — играть (когда есть первый кадр), false — пауза.
      Элемент при этом остаётся в DOM — повторная активация мгновенная. */
  active?: boolean;
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
  active = true,
  className,
  style,
}: HlsVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  // Первый кадр получен (canplay) — можно запускать воспроизведение.
  const canPlayRef = useRef(false);
  // Актуальный active для замыкания canplay-обработчика (не пересоздавать listener).
  const activeRef = useRef(active);
  activeRef.current = active;

  const startPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video || !autoPlay || !muted) return;
    video.muted = true;
    video.play().catch(() => {});
  }, [autoPlay, muted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls: Hls | null = null;
    let cancelled = false;

    const handleCanPlay = () => {
      canPlayRef.current = true;
      if (activeRef.current) startPlayback();
    };

    // Нативный HLS (Safari) — просто src на <video>
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.addEventListener("canplay", handleCanPlay);
      return () => {
        cancelled = true;
        video.removeEventListener("canplay", handleCanPlay);
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
        video.addEventListener("canplay", handleCanPlay);
      } catch {
        // Ошибка загрузки hls.js — молча пропускаем (остаётся poster)
      }
    };
    void init();

    return () => {
      disposed = true;
      cancelled = true;
      video.removeEventListener("canplay", handleCanPlay);
      if (hls) {
        hls.destroy();
        hlsRef.current = null;
      }
      video.removeAttribute("src");
      video.load();
    };
  }, [src, autoPlay, muted, startPlayback]);

  // Внешнее управление воспроизведением: пауза/возобновление без пересоздания
  // плеера (m3u8 не качается заново при каждом наведении).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) {
      // Первый кадр мог быть получен ещё до монтирования — играем сразу;
      // иначе стартуем по canplay из основного эффекта.
      if (canPlayRef.current) startPlayback();
    } else {
      video.pause();
    }
  }, [active, startPlayback]);

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

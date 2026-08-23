"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Product } from "@/data/products";
import { buildProductAlt } from "@/lib/variant-pages";
import { useHoverCarousel } from "./use-hover-carousel";
import SmartImage from "./smart-image";
import HlsVideo from "./hls-video";
import styles from "./product-card.module.css";

interface ProductImageCarouselProps {
  product: Product;
  /** Главное фото загружать приоритетно (для LCP — первый ряд карточек) */
  priority?: boolean;
  isArchived: boolean;
  isOutOfStock: boolean;
  /** Оверлеи поверх фото (например, кнопка избранного) */
  children?: React.ReactNode;
}

/**
 * Фото-зона карточки: до 4 слоёв (как WB), первое — главное, остальные —
 * hover-карусель (useHoverCarousel). Ховер-слои монтируются только после
 * загрузки главного фото, чтобы не конкурировать с ним за канал, и дальше
 * остаются в DOM (keep-mounted): повторные наведения не перезагружают фото
 * и не показывают placeholder — «моргания» нет.
 *
 * Если у товара есть HLS-видео (WB) — при наведении вместо фото-карусели
 * проигрывается видео (muted autoplay loop). Видео монтируется только после
 * первого наведения (не грузим трафик для всего каталога), затем остаётся
 * в DOM и переключается через play/pause — m3u8 не качается заново. Старт
 * воспроизведения — только по первому кадру (canplay), до этого элемент
 * прозрачен и под ним видно фото.
 */
export default function ProductImageCarousel({
  product,
  priority = false,
  isArchived,
  isOutOfStock,
  children,
}: ProductImageCarouselProps) {
  const alt = buildProductAlt(product);
  // Стабилизируем вход для useHoverCarousel: его useMemo/useCallback
  // завязаны на идентичность массива (иначе пересоздавались бы каждый рендер).
  // Карточка в каталоге ≤ ~260px (DPR 2 → 520px), полноразмер качать незачем:
  //  - WB big (900×1200, 160 КБ) → c516x688 (82 КБ) — тот же CDN, размер ближе
  //  - Ozon оригинал (1290×1720 jpg, 134 КБ) → /_next/image?w=520 (~30-40 КБ) —
  //    у Ozon CDN нет уменьшенных версий (?w= игнорируется), режет оптимизатор
  const rawImages = useMemo(
    () =>
      (product.images?.length ? product.images : [product.image])
        .filter(Boolean)
        .map((u) => {
          if (u.includes("/images/big/")) {
            return u.replace("/images/big/", "/images/c516x688/");
          }
          if (u.includes("ir.ozone.ru")) {
            return `/_next/image?url=${encodeURIComponent(u)}&w=520&q=75`;
          }
          return u;
        }),
    [product.images, product.image]
  );

  const hasVideo = Boolean(product.video);
  // Видео монтируем только после первого наведения (ленивая загрузка hls.js)
  // и дальше держим в DOM: повторные наведения — мгновенный resume без
  // повторной загрузки m3u8.
  const [videoMounted, setVideoMounted] = useState(false);
  // videoActive управляет play/pause и прозрачностью, а не монтированием.
  const [videoActive, setVideoActive] = useState(false);
  // Короткий fade-out при уходе мыши, чтобы видео не «срывалось» резко.
  const [videoExiting, setVideoExiting] = useState(false);
  const videoExitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hover-слои (фото 2–4) монтируем только при первом наведении/тапе и дальше
  // держим в DOM (keep-mounted): после первой загрузки повторные наведения
  // мгновенные, без перезагрузки фото и вспышек placeholder'а.
  const [hoverMounted, setHoverMounted] = useState(false);

  // Предзагружаем модуль hls.js заранее (один раз на страницу, кеш на всех
  // карточках): при наведении остаётся только загрузка m3u8 + сегментов,
  // а не сетевой запрос ~60KB — видео стартует почти сразу.
  useEffect(() => {
    if (!hasVideo) return;
    void import("hls.js").catch(() => {});
  }, [hasVideo]);

  const {
    hoverIndex,
    isBaseReady,
    layers,
    handleMouseEnter,
    handleMouseLeave,
    handleTouchStart: handleHoverTouchStart,
    handleTouchEnd: handleHoverTouchEnd,
    registerLoaded,
    registerFailed,
  } = useHoverCarousel(rawImages);

  const clearVideoExitTimer = () => {
    if (videoExitTimer.current) {
      clearTimeout(videoExitTimer.current);
      videoExitTimer.current = null;
    }
  };

  const handleEnter = () => {
    clearVideoExitTimer();
    setVideoExiting(false);
    if (hasVideo) {
      setVideoMounted(true);
      setVideoActive(true);
      return;
    }
    setHoverMounted(true);
    handleMouseEnter();
  };

  const handleLeave = () => {
    if (hasVideo) {
      setVideoActive(false);
      setVideoExiting(true);
      clearVideoExitTimer();
      // Fade-out завершился — гасим класс; элемент остаётся в DOM.
      videoExitTimer.current = setTimeout(() => {
        setVideoExiting(false);
        videoExitTimer.current = null;
      }, 300);
      return;
    }
    handleMouseLeave();
  };

  const handleTouchStart = () => {
    setHoverMounted(true);
    handleHoverTouchStart();
  };

  const handleTouchEnd = () => {
    handleHoverTouchEnd();
  };

  // Очистка таймера ухода при размонтировании карточки.
  useEffect(() => {
    return () => clearVideoExitTimer();
  }, []);

  return (
    <div
      className={styles.imageWrap}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Link href={`/catalog/${product.slug}`} aria-label={product.name} className={styles.imageLink}>
        {layers.map((url, i) =>
          i === 0 || (isBaseReady && hoverMounted) ? (
            <div
              key={url}
              className={`${styles.imageLayer} ${i === hoverIndex ? styles.imageLayerActive : ""}`}
            >
              <SmartImage
                src={url}
                alt={alt}
                className={styles.image}
                width={516}
                height={688}
                priority={priority && i === 0}
                draggable={false}
                onLoad={registerLoaded}
                onError={() => registerFailed(url)}
              />
            </div>
          ) : null
        )}
        {hasVideo && videoMounted && (
          <HlsVideo
            src={product.video!}
            poster={product.image}
            autoPlay
            muted
            loop
            active={videoActive}
            className={`${styles.videoHover} ${
              videoActive ? styles.videoHoverVisible : ""
            } ${videoExiting ? styles.videoHoverExiting : ""}`}
          />
        )}
      </Link>
      {children}
      {isOutOfStock && !isArchived && (
        <span className={styles.outBadge}>Нет в наличии</span>
      )}
      {isArchived && <span className={styles.outBadge}>Архивирован</span>}
    </div>
  );
}

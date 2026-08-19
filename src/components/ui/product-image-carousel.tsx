"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Product } from "@/data/products";
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
 * загрузки главного фото, чтобы не конкурировать с ним за канал.
 *
 * Если у товара есть HLS-видео (WB) — при наведении вместо фото-карусели
 * проигрывается видео (muted autoplay loop). Видео монтируется только после
 * первого наведения (не грузим трафик для всего каталога), в углу — бейдж.
 */
export default function ProductImageCarousel({
  product,
  priority = false,
  isArchived,
  isOutOfStock,
  children,
}: ProductImageCarouselProps) {
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
  const [videoActive, setVideoActive] = useState(false);
  // Hover-слои (фото 2–4) монтируем только при наведении/тапе, а не после
  // главного фото: иначе каждая карточка качает все 4 фото (12 МБ на каталог).
  const [hoverActive, setHoverActive] = useState(false);

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

  const handleEnter = () => {
    if (hasVideo) {
      setVideoActive(true);
      return;
    }
    setHoverActive(true);
    handleMouseEnter();
  };

  const handleLeave = () => {
    setVideoActive(false);
    setHoverActive(false);
    handleMouseLeave();
  };

  const handleTouchStart = () => {
    setHoverActive(true);
    handleHoverTouchStart();
  };

  const handleTouchEnd = () => {
    setHoverActive(false);
    handleHoverTouchEnd();
  };

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
          i === 0 || (isBaseReady && hoverActive) ? (
            <div
              key={url}
              className={`${styles.imageLayer} ${i === hoverIndex ? styles.imageLayerActive : ""}`}
            >
              <SmartImage
                src={url}
                alt={product.name}
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
        {hasVideo && videoActive && (
          <HlsVideo
            src={product.video!}
            poster={product.image}
            autoPlay
            muted
            loop
            className={styles.videoHover}
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

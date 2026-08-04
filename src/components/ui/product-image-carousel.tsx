"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Product } from "@/data/products";
import { useHoverCarousel } from "./use-hover-carousel";
import SmartImage from "./smart-image";
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
  const rawImages = useMemo(
    () => (product.images?.length ? product.images : [product.image]).filter(Boolean),
    [product.images, product.image]
  );

  const {
    hoverIndex,
    isBaseReady,
    layers,
    handleMouseEnter,
    handleMouseLeave,
    handleTouchStart,
    handleTouchEnd,
    registerLoaded,
    registerFailed,
  } = useHoverCarousel(rawImages);

  return (
    <div
      className={styles.imageWrap}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Link href={`/catalog/${product.slug}`} aria-label={product.name} className={styles.imageLink}>
        {layers.map((url, i) =>
          i === 0 || isBaseReady ? (
            <div
              key={url}
              className={`${styles.imageLayer} ${i === hoverIndex ? styles.imageLayerActive : ""}`}
            >
              <SmartImage
                src={url}
                alt={product.name}
                className={styles.image}
                priority={priority && i === 0}
                draggable={false}
                onLoad={registerLoaded}
                onError={() => registerFailed(url)}
              />
            </div>
          ) : null
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

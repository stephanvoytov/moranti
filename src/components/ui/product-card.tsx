"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Product } from "@/data/products";
import { useFavorites } from "@/lib/favorites-context";
import { useHoverCarousel } from "./use-hover-carousel";
import SmartImage from "./smart-image";
import RatingStars from "./rating-stars";
import styles from "./product-card.module.css";

interface ProductCardProps {
  product: Product;
  /** Загружать изображение приоритетно (для LCP — первый ряд карточек) */
  priority?: boolean;
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={styles.heartIcon}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

/** Инфоблок: название, цена / «нет в наличии», рейтинг */
function ProductInfo({ product, link }: { product: Product; link: string }) {
  const isOutOfStock = product.inStock === false || Boolean(product.archivedAt);
  const showOriginal = (product.originalPrice ?? 0) > product.price;

  return (
    <div className={styles.info}>
      <div className={styles.name}>
        <Link href={link}>{product.name}</Link>
      </div>
      {isOutOfStock ? (
        <div className={styles.priceRow}>
          <span className={styles.outOfStockText}>
            {product.archivedAt ? "Архивирован" : "Нет в наличии"}
          </span>
        </div>
      ) : (
        <div className={styles.priceRow}>
          <span className={styles.currentPrice}>
            {product.price.toLocaleString("ru-RU")} ₽
          </span>
          {showOriginal && (
            <span className={styles.oldPrice}>
              {(product.originalPrice ?? 0).toLocaleString("ru-RU")} ₽
            </span>
          )}
        </div>
      )}
      {product.rating && product.rating >= 4 ? (
        <div className={styles.rating}>
          <RatingStars rating={product.rating} />
          <span className={styles.ratingText}>{product.rating.toFixed(1)}</span>
        </div>
      ) : null}
    </div>
  );
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const slug = product.slug;
  const link = `/catalog/${slug}`;
  const favorite = isFavorite(product.wbArticle);

  // До 4 фото (как WB): первое — главное, остальные — hover-карусель.
  const rawImages = useMemo(() => {
    const images = (product.images?.length ? product.images : [product.image]).filter(Boolean);
    return images;
  }, [product.images, product.image]);

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

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.wbArticle);
  };

  return (
    <article
      className={styles.card}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.imageWrap}>
        <Link href={link} aria-label={product.name} className={styles.imageLink}>
          {/* Фото рендерятся слоями (как WB): активный — opacity 1, остальные — 0.
              Hover-слои монтируются только после загрузки главного фото: оно
              качается первым, hover-фото не отбирают канал у соседних карточек. */}
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
        <button
          className={`${styles.favorite} ${favorite ? styles.favoriteActive : ""}`}
          onClick={handleFavorite}
          aria-label={favorite ? "Убрать из избранного" : "Добавить в избранное"}
        >
          <HeartIcon filled={favorite} />
        </button>
        {product.inStock === false && !product.archivedAt && (
          <span className={styles.outBadge}>Нет в наличии</span>
        )}
        {product.archivedAt && (
          <span className={styles.outBadge}>Архивирован</span>
        )}
      </div>

      <ProductInfo product={product} link={link} />
    </article>
  );
}

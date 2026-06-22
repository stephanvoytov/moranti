"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/data/products";
import { useFavorites } from "@/lib/favorites-context";
import { useLivePrice } from "@/lib/use-live-price";
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

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { livePrice, loading } = useLivePrice(product.wbArticle);
  const slug = `wb-${product.wbArticle}`;
  const link = `/catalog/${slug}`;
  const fav = isFavorite(product.wbArticle);
  const images = product.images?.length ? product.images : [product.image];
  const [hoverIndex, setHoverIndex] = useState(0);
  const hoverTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Use live price when available, fall back to static data
  const displayPrice = livePrice ?? product.price;
  const showOriginal = !loading && !livePrice && product.originalPrice > product.price;

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.wbArticle);
  };

  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startCycling = () => {
    if (images.length < 2) return;
    setHoverIndex(1);
    hoverTimer.current = setInterval(() => {
      setHoverIndex((prev) => (prev + 1) % Math.min(images.length, 4));
    }, 1200);
  };

  const stopCycling = () => {
    if (hoverTimer.current) clearInterval(hoverTimer.current);
    hoverTimer.current = null;
    setHoverIndex(0);
  };

  const handleMouseEnter = startCycling;
  const handleMouseLeave = stopCycling;

  const handleTouchStart = () => {
    if (images.length < 2) return;
    // Short delay — если палец убрали быстро, это был тап, не запускаем
    touchTimer.current = setTimeout(() => {
      startCycling();
    }, 200);
  };

  const handleTouchEnd = () => {
    if (touchTimer.current) {
      clearTimeout(touchTimer.current);
      touchTimer.current = null;
    }
    stopCycling();
  };

  return (
    <article className={styles.card} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className={styles.imageWrap}>
        <Link href={link} aria-label={product.name} className={styles.imageLink}>
          <Image
            src={images[hoverIndex]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className={styles.image}
            loading={priority ? "eager" : "lazy"}
            priority={priority}
            draggable={false}
          />
        </Link>
        <button
          className={`${styles.favorite} ${fav ? styles.favoriteActive : ""}`}
          onClick={handleFavorite}
          aria-label={fav ? "Убрать из избранного" : "Добавить в избранное"}
        >
          <HeartIcon filled={fav} />
        </button>
      </div>

      <div className={styles.info}>
        <div className={styles.name}>
          <Link href={link}>{product.name}</Link>
        </div>
        <div className={styles.priceRow}>
          <span
            className={`${styles.currentPrice} ${!loading && livePrice ? styles.livePrice : ""}`}
          >
            {displayPrice.toLocaleString("ru-RU")} ₽
          </span>
          {showOriginal && (
            <span className={styles.oldPrice}>
              {product.originalPrice.toLocaleString("ru-RU")} ₽
            </span>
          )}
        </div>
        {product.rating ? (
          <div className={styles.rating}>
            <span className={styles.stars}>
              {"★".repeat(Math.round(product.rating))}
              {"☆".repeat(5 - Math.round(product.rating))}
            </span>
            <span className={styles.ratingText}>
              {product.rating.toFixed(1)}
            </span>
          </div>
        ) : null}
      </div>
    </article>
  );
}

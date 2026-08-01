"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { Product } from "@/data/products";
import { useFavorites } from "@/lib/favorites-context";
import SmartImage from "./smart-image";
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
  const slug = product.slug;
  const link = `/catalog/${slug}`;
  const fav = isFavorite(product.wbArticle);
  const images = useMemo(
    () => (product.images?.length ? product.images : [product.image]),
    [product.images, product.image]
  );
  const [hoverIndex, setHoverIndex] = useState(0);
  const hoverTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const cardRef = useRef<HTMLElement>(null);

  // Предзагрузка hover-фото: когда карточка попадает во вьюпорт (чуть заранее),
  // скачиваем images[1..3] в HTTP-кэш браузера. К моменту наведения они уже
  // готовы — карусель сменяет фото мгновенно, без белого placeholder'а.
  useEffect(() => {
    if (images.length < 2) return;
    if (typeof IntersectionObserver === "undefined") return;
    const el = cardRef.current;
    if (!el) return;
    const hoverImages = images.slice(1, Math.min(images.length, 4));
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        for (const url of hoverImages) {
          if (url) new Image().src = url;
        }
        observer.disconnect();
      },
      { rootMargin: "300px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [images]);

  // Цены берутся из данных товара (БД через getProducts())
  const displayPrice = product.price;
  const displayOriginal = product.originalPrice;
  const showOriginal = displayOriginal > displayPrice;

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
    <article ref={cardRef} className={styles.card} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className={styles.imageWrap}>
        <Link href={link} aria-label={product.name} className={styles.imageLink}>
          <SmartImage
            src={images[hoverIndex]}
            alt={product.name}
            className={styles.image}
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
        {product.inStock === false && !product.archivedAt && (
          <span className={styles.outBadge}>Нет в наличии</span>
        )}
        {product.archivedAt && (
          <span className={styles.outBadge}>Архивирован</span>
        )}
      </div>

      <div className={styles.info}>
        <div className={styles.name}>
          <Link href={link}>{product.name}</Link>
        </div>
        {product.inStock === false || product.archivedAt ? (
          <div className={styles.priceRow}>
            <span className={styles.outOfStockText}>
              {product.archivedAt ? "Архивирован" : "Нет в наличии"}
            </span>
          </div>
        ) : (
          <div className={styles.priceRow}>
            <span className={styles.currentPrice}>
              {displayPrice.toLocaleString("ru-RU")} ₽
            </span>
            {showOriginal && (
              <span className={styles.oldPrice}>
                {displayOriginal.toLocaleString("ru-RU")} ₽
              </span>
            )}
          </div>
        )}
        {product.rating && product.rating > 4 ? (
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

"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Product } from "@/data/products";
import { useFavorites } from "@/lib/favorites-context";
import { blobUrl } from "@/lib/blob";
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

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const slug = product.slug;
  const link = `/catalog/${slug}`;
  const fav = isFavorite(product.wbArticle);

  // До 4 фото (как WB): первое — главное, остальные — hover-карусель.
  const hoverImages = useMemo(() => {
    const images = (product.images?.length ? product.images : [product.image]).filter(Boolean);
    return images.slice(0, 4);
  }, [product.images, product.image]);

  const [hoverIndex, setHoverIndex] = useState(0);
  // Главное фото загрузилось (или битое) — только после этого монтируются
  // hover-слои. Приоритет: сначала качается главное фото (LCP-ряд — eager),
  // hover-фото стартуют позже и не конкурируют с ним за канал.
  const [baseReady, setBaseReady] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Фактический статус фото (ключ — проксированный blobUrl):
  // "loaded" — слой отрисовался, "failed" — битое (пропускаем в карусели).
  // Гейт: кадр не показывается, пока не загружен.
  const imageStatus = useRef<Map<string, "loaded" | "failed">>(new Map());
  const markLoaded = useCallback((src: string) => {
    imageStatus.current.set(src, "loaded");
  }, []);
  const markFailed = useCallback((src: string) => {
    imageStatus.current.set(src, "failed");
  }, []);

  // Очистка таймеров при размонтировании
  useEffect(() => {
    return () => {
      if (hoverTimer.current) clearInterval(hoverTimer.current);
      if (touchTimer.current) clearTimeout(touchTimer.current);
    };
  }, []);

  const displayPrice = product.price;
  const displayOriginal = product.originalPrice;
  const showOriginal = displayOriginal > displayPrice;

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.wbArticle);
  };

  // Статус кадра: "loaded" | "failed" | undefined (ещё грузится)
  const statusOf = (index: number) => {
    const url = hoverImages[index] ? blobUrl(hoverImages[index]) : "";
    return url ? imageStatus.current.get(url) : undefined;
  };

  const startCycling = () => {
    if (hoverImages.length < 2) return;
    if (hoverTimer.current) clearInterval(hoverTimer.current);
    // Первый кадр — только если уже загружен; иначе остаёмся на главном:
    // интервал подхватит кадр, как только он будет готов.
    setHoverIndex(statusOf(1) === "loaded" ? 1 : 0);
    hoverTimer.current = setInterval(() => {
      setHoverIndex((prev) => {
        // Пропускаем битые кадры (не загрузятся никогда); на недогруженном
        // остаёмся — кадр меняется только когда фото загрузилось полностью.
        let next = (prev + 1) % hoverImages.length;
        let guard = 0;
        while (statusOf(next) === "failed" && guard < hoverImages.length) {
          next = (next + 1) % hoverImages.length;
          guard++;
        }
        return next === 0 || statusOf(next) === "loaded" ? next : prev;
      });
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
    if (hoverImages.length < 2) return;
    // Задержка: быстрый тап не запускает карусель
    touchTimer.current = setTimeout(startCycling, 200);
  };

  const handleTouchEnd = () => {
    if (touchTimer.current) {
      clearTimeout(touchTimer.current);
      touchTimer.current = null;
    }
    stopCycling();
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
          {hoverImages.map((url, i) =>
            i === 0 || baseReady ? (
              <div
                key={url}
                className={`${styles.imageLayer} ${i === hoverIndex ? styles.imageLayerActive : ""}`}
              >
                <SmartImage
                  src={blobUrl(url)}
                  alt={product.name}
                  className={styles.image}
                  priority={priority && i === 0}
                  draggable={false}
                  onLoad={(src) => {
                    markLoaded(src);
                    if (i === 0) setBaseReady(true);
                  }}
                  onError={() => {
                    markFailed(blobUrl(url));
                    if (i === 0) setBaseReady(true);
                  }}
                />
              </div>
            ) : null
          )}
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
        {product.rating && product.rating >= 4 ? (
          <div className={styles.rating}>
            <RatingStars rating={product.rating} />
            <span className={styles.ratingText}>{product.rating.toFixed(1)}</span>
          </div>
        ) : null}
      </div>
    </article>
  );
}

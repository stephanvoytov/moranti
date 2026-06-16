"use client";

import Link from "next/link";
import { Product } from "@/data/products";
import { useFavorites } from "@/lib/favorites-context";
import { useLivePrice } from "@/lib/use-live-price";
import styles from "./product-card.module.css";

interface ProductCardProps {
  product: Product;
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
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { livePrice, liveOriginal, loading } = useLivePrice(product.wbArticle);
  const slug = `wb-${product.wbArticle}`;
  const link = `/catalog/${slug}`;
  const fav = isFavorite(product.wbArticle);

  // Use live price when available, fall back to static data
  const displayPrice = livePrice ?? product.price;
  const displayOriginal = liveOriginal ?? product.originalPrice;

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.wbArticle);
  };

  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        <Link href={link} aria-label={product.name}>
          <img
            src={product.image}
            alt={product.name}
            className={styles.image}
            loading="lazy"
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
        <h3 className={styles.name}>
          <Link href={link}>{product.name}</Link>
        </h3>
        <p className={styles.description}>{product.description}</p>
        <div className={styles.priceRow}>
          <span
            className={`${styles.currentPrice} ${!loading && livePrice ? styles.livePrice : ""}`}
          >
            {displayPrice.toLocaleString("ru-RU")} ₽
          </span>
          {!loading && !livePrice && (
            <span className={styles.priceStale} title="Цена может быть неактуальна">*</span>
          )}
        </div>
      </div>
    </article>
  );
}

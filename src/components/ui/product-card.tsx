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
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { livePrice, loading } = useLivePrice(product.wbArticle);
  const slug = `wb-${product.wbArticle}`;
  const link = `/catalog/${slug}`;
  const fav = isFavorite(product.wbArticle);

  // Use live price when available, fall back to static data
  const displayPrice = livePrice ?? product.price;
  const showOriginal = !loading && !livePrice && product.originalPrice > product.price;

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
      </div>
    </article>
  );
}

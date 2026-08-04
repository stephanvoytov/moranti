"use client";

import Link from "next/link";
import RatingStars from "./rating-stars";
import styles from "./product-card.module.css";

interface ProductInfoProps {
  link: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  isArchived: boolean;
  isOutOfStock: boolean;
}

/** Инфоблок карточки: название, цена / «нет в наличии», рейтинг.
 *  Не зависит от модели Product — принимает примитивы. */
export default function ProductInfo({
  link,
  name,
  price,
  originalPrice,
  rating,
  isArchived,
  isOutOfStock,
}: ProductInfoProps) {
  const showOriginal = (originalPrice ?? 0) > price;
  const ratingValue = rating ?? 0;

  return (
    <div className={styles.info}>
      <div className={styles.name}>
        <Link href={link}>{name}</Link>
      </div>
      {isOutOfStock ? (
        <div className={styles.priceRow}>
          <span className={styles.outOfStockText}>
            {isArchived ? "Архивирован" : "Нет в наличии"}
          </span>
        </div>
      ) : (
        <div className={styles.priceRow}>
          <span className={styles.currentPrice}>{price.toLocaleString("ru-RU")} ₽</span>
          {showOriginal && (
            <span className={styles.oldPrice}>
              {(originalPrice ?? 0).toLocaleString("ru-RU")} ₽
            </span>
          )}
        </div>
      )}
      {ratingValue >= 4 ? (
        <div className={styles.rating}>
          <RatingStars rating={ratingValue} />
          <span className={styles.ratingText}>{ratingValue.toFixed(1)}</span>
        </div>
      ) : null}
    </div>
  );
}

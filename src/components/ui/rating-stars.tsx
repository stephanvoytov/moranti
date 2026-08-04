"use client";

import styles from "./rating-stars.module.css";

/**
 * Округление рейтинга до звёзд:
 *  4.2–4.6 → 4.5 (полу-звезда), ниже → 4, выше → 5.
 */
export function starsForRating(rating: number): number {
  if (rating >= 4.2 && rating <= 4.6) return 4.5;
  return Math.round(rating);
}

export default function RatingStars({ rating }: { rating: number }) {
  const stars = starsForRating(rating);
  const pct = Math.max(0, Math.min(100, (stars / 5) * 100));

  return (
    <span
      role="img"
      className={styles.stars}
      aria-label={`Рейтинг ${rating.toFixed(1)} из 5`}
    >
      <span className={styles.starsBg} aria-hidden="true">
        ★★★★★
      </span>
      <span
        className={styles.starsFg}
        style={{ width: `${pct}%` }}
        aria-hidden="true"
      >
        ★★★★★
      </span>
    </span>
  );
}

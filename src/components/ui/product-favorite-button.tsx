"use client";

import styles from "./product-card.module.css";

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

interface ProductFavoriteButtonProps {
  isFavorited: boolean;
  onToggle: () => void;
  /** "overlay" — поверх фото (по умолчанию); "square" — квадратная в футере карточки */
  variant?: "overlay" | "square";
}

/** Кнопка «в избранное» */
export default function ProductFavoriteButton({
  isFavorited,
  onToggle,
  variant = "overlay",
}: ProductFavoriteButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle();
  };

  const baseClass =
    variant === "square" ? styles.favoriteSquare : styles.favorite;

  return (
    <button
      className={`${baseClass} ${isFavorited ? styles.favoriteActive : ""}`}
      onClick={handleClick}
      aria-label={isFavorited ? "Убрать из избранного" : "Добавить в избранное"}
    >
      <HeartIcon filled={isFavorited} />
    </button>
  );
}

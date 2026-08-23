"use client";

import { useRouter } from "next/navigation";
import { useFavorites } from "@/lib/favorites-context";
import { useState } from "react";
import styles from "./page.module.css";

export default function GalleryOverlay({
  wbArticle,
  shareUrl,
  shareTitle,
}: {
  wbArticle: number;
  shareUrl: string;
  shareTitle: string;
}) {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(wbArticle);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url: shareUrl });
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // clipboard not available
      }
    }
  };

  return (
    <div className={styles.galleryOverlay}>
      <button
        type="button"
        className={styles.overlayBtn}
        onClick={() => router.back()}
        aria-label="Назад"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div className={styles.overlayRight}>
        <button
          type="button"
          className={`${styles.overlayBtn} ${fav ? styles.overlayBtnFav : ""}`}
          onClick={() => toggleFavorite(wbArticle)}
          aria-label={fav ? "Убрать из избранного" : "Добавить в избранное"}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>

        <button
          type="button"
          className={styles.overlayBtn}
          onClick={handleShare}
          aria-label={copied ? "Ссылка скопирована" : "Поделиться"}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>
      </div>
    </div>
  );
}

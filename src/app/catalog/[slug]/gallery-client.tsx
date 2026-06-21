"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";

interface GalleryClientProps {
  images: string[];
  alt: string;
}

export default function GalleryClient({ images, alt }: GalleryClientProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] || images[0] || "";
  const hasMultiple = images.length > 1;

  const prev = useCallback(() => {
    setActiveIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setActiveIndex((i) => (i < images.length - 1 ? i + 1 : 0));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!hasMultiple) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hasMultiple, prev, next]);

  if (!activeImage) {
    return (
      <div className={styles.imageWrapper}>
        <div className={styles.imagePlaceholder}>Нет фото</div>
      </div>
    );
  }

  return (
    <div className={styles.gallery}>
      {/* Main image with arrows */}
      <div className={styles.imageWrapper}>
        <img
          src={activeImage}
          alt={`${alt} — фото ${activeIndex + 1}`}
          className={styles.image}
          fetchPriority="high"
          draggable={false}
          onMouseDown={(e) => e.preventDefault()}
        />

        {hasMultiple && (
          <>
            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowLeft}`}
              onClick={prev}
              aria-label="Предыдущее фото"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowRight}`}
              onClick={next}
              aria-label="Следующее фото"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Photo counter */}
            <span className={styles.counter}>
              {activeIndex + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {hasMultiple && (
        <div className={styles.thumbs}>
          {images.map((url, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.thumb} ${i === activeIndex ? styles.thumbActive : ""}`}
              onClick={() => setActiveIndex(i)}
              aria-label={`Фото ${i + 1}`}
            >
              <img src={url} alt={`${alt} — фото ${i + 1}`} loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

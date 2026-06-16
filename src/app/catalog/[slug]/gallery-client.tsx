"use client";

import { useState } from "react";
import styles from "./page.module.css";

interface GalleryClientProps {
  images: string[];
  alt: string;
}

export default function GalleryClient({ images, alt }: GalleryClientProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] || images[0] || "";
  const hasMultiple = images.length > 1;

  if (!activeImage) {
    return (
      <div className={styles.imageWrapper}>
        <div className={styles.imagePlaceholder}>Нет фото</div>
      </div>
    );
  }

  return (
    <div className={styles.gallery}>
      {/* Main image */}
      <div className={styles.imageWrapper}>
        <img
          src={activeImage}
          alt={`${alt} — фото ${activeIndex + 1}`}
          className={styles.image}
        />
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

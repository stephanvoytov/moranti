"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import styles from "./page.module.css";

interface GalleryClientProps {
  images: string[];
  alt: string;
}

export default function GalleryClient({ images, alt }: GalleryClientProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null);
  const hasMultiple = images.length > 1;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isDesktop = useRef(false);

  useEffect(() => {
    isDesktop.current = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
  }, []);

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

  // Lightbox keyboard: close on Escape, arrows for nav
  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, prev, next]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [lightboxOpen]);

  // Touch swipe (for main gallery + lightbox)
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const onTouchStart = (e: React.TouchEvent) => {
    if (!hasMultiple || e.touches.length !== 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!hasMultiple || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      e.preventDefault();
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!hasMultiple || e.changedTouches.length !== 1) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx > 0) prev();
      else next();
    }
  };

  // Mouse zoom
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDesktop.current || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }, []);

  const onMouseLeave = useCallback(() => {
    setZoomPos(null);
  }, []);

  const activeImage = images[activeIndex] || images[0] || "";

  if (!activeImage) {
    return (
      <div className={styles.imageWrapper}>
        <div className={styles.imagePlaceholder}>Нет фото</div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.gallery}>
        {/* Thumbnail strip */}
        {hasMultiple && (
          <div className={styles.thumbs}>
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.thumb} ${i === activeIndex ? styles.thumbActive : ""}`}
                onClick={() => setActiveIndex(i)}
                aria-label={`${alt} — фото ${i + 1}`}
              >
                <img
                  src={src}
                  alt=""
                  className={styles.thumbImage}
                  loading={i < 6 ? "eager" : "lazy"}
                  draggable={false}
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div
          ref={wrapperRef}
          className={styles.imageWrapper}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          onClick={() => setLightboxOpen(true)}
        >
          <Image
            src={activeImage}
            alt={`${alt} — фото ${activeIndex + 1}`}
            width={516}
            height={688}
            className={`${styles.image} ${zoomPos ? styles.imageZoomed : ""}`}
            style={zoomPos ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
            priority
            draggable={false}
            onMouseDown={(e) => e.preventDefault()}
          />

          {hasMultiple && (
            <>
              <button
                type="button"
                className={`${styles.arrow} ${styles.arrowLeft}`}
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Предыдущее фото"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                className={`${styles.arrow} ${styles.arrowRight}`}
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Следующее фото"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span className={styles.counter}>
                {activeIndex + 1} / {images.length}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Lightbox overlay */}
      {lightboxOpen && (
        <div className={styles.lightbox} onClick={() => setLightboxOpen(false)}>
          <button
            className={styles.lightboxClose}
            onClick={() => setLightboxOpen(false)}
            aria-label="Закрыть"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {hasMultiple && (
            <>
              <button
                className={`${styles.lightboxArrow} ${styles.lightboxArrowLeft}`}
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Предыдущее фото"
              >
                <svg width="32" height="32" viewBox="0 0 20 20" fill="none">
                  <path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                className={`${styles.lightboxArrow} ${styles.lightboxArrowRight}`}
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Следующее фото"
              >
                <svg width="32" height="32" viewBox="0 0 20 20" fill="none">
                  <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}

          <div
            className={styles.lightboxImageWrap}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <Image
              src={activeImage}
              alt={`${alt} — фото ${activeIndex + 1}`}
              width={516}
              height={688}
              className={styles.lightboxImage}
              priority
              draggable={false}
            />
          </div>

          <span className={styles.lightboxCounter}>
            {activeIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  );
}

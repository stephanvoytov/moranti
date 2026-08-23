"use client";

import { useRef, useState } from "react";
import GalleryImage from "@/components/ui/gallery-image";
import HlsVideo from "@/components/ui/hls-video";
import { blobUrl } from "@/lib/blob";
import styles from "./page.module.css";

export type Slide =
  | { kind: "image"; src: string }
  | { kind: "video"; src: string };

interface GalleryLightboxProps {
  slides: Slide[];
  activeIndex: number;
  alt: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Лайтбокс галереи (модалка): полноэкранный просмотр фото/видео с pinch-to-zoom.
 * Загружается лениво (next/dynamic, ssr:false) — JS нужен только после клика
 * по фото, в начальный бандл страницы товара не попадает.
 */
export default function GalleryLightbox({
  slides,
  activeIndex,
  alt,
  onClose,
  onPrev,
  onNext,
}: GalleryLightboxProps) {
  const hasMultiple = slides.length > 1;
  const activeSlide = slides[activeIndex] ?? slides[0] ?? null;
  const activeImage =
    activeSlide?.kind === "image" ? activeSlide.src : slides[0]?.src ?? "";

  /* ---- Pinch-to-zoom ---- */
  const [pinchTransform, setPinchTransform] = useState("");
  const pinchScale = useRef(1);
  const pinchTranslateX = useRef(0);
  const pinchTranslateY = useRef(0);
  const pinchInitialDist = useRef(0);
  const pinchInitialScale = useRef(1);
  const pinchLastX = useRef(0);
  const pinchLastY = useRef(0);
  const pinchLastTx = useRef(0);
  const pinchLastTy = useRef(0);

  const resetPinch = () => {
    pinchScale.current = 1;
    pinchTranslateX.current = 0;
    pinchTranslateY.current = 0;
    pinchLastTx.current = 0;
    pinchLastTy.current = 0;
    setPinchTransform("");
  };

  const applyPinchTransform = () => {
    const s = pinchScale.current;
    if (s <= 1 && pinchTranslateX.current === 0 && pinchTranslateY.current === 0) {
      setPinchTransform("");
      return;
    }
    const tx = pinchTranslateX.current;
    const ty = pinchTranslateY.current;
    setPinchTransform(`scale(${s}) translate(${tx}px, ${ty}px)`);
  };

  const onLightboxTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchInitialDist.current = Math.hypot(dx, dy);
      pinchInitialScale.current = pinchScale.current;
    } else if (e.touches.length === 1 && pinchScale.current > 1) {
      pinchLastTx.current = pinchTranslateX.current;
      pinchLastTy.current = pinchTranslateY.current;
      pinchLastX.current = e.touches[0].clientX;
      pinchLastY.current = e.touches[0].clientY;
    }
  };

  const onLightboxTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const newScale = Math.max(1, Math.min(5, pinchInitialScale.current * (dist / pinchInitialDist.current)));
      pinchScale.current = newScale;
      applyPinchTransform();
    } else if (e.touches.length === 1 && pinchScale.current > 1) {
      e.preventDefault();
      const dx = e.touches[0].clientX - pinchLastX.current;
      const dy = e.touches[0].clientY - pinchLastY.current;
      pinchTranslateX.current = pinchLastTx.current + dx;
      pinchTranslateY.current = pinchLastTy.current + dy;
      pinchLastX.current = e.touches[0].clientX;
      pinchLastY.current = e.touches[0].clientY;
      applyPinchTransform();
    }
  };

  const onLightboxTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0 && pinchScale.current < 1.3) {
      resetPinch();
    }
    if (e.touches.length < 2) {
      pinchLastTx.current = pinchTranslateX.current;
      pinchLastTy.current = pinchTranslateY.current;
    }
  };

  if (!activeSlide) return null;

  return (
    <div className={styles.lightbox} onClick={onClose}>
      <button className={styles.lightboxClose} onClick={onClose} aria-label="Закрыть">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      </button>
      {hasMultiple && (
        <>
          <button className={`${styles.lightboxArrow} ${styles.lightboxArrowLeft}`} onClick={(e) => { e.stopPropagation(); onPrev(); }} aria-label="Предыдущее фото">
            <svg width="32" height="32" viewBox="0 0 20 20" fill="none"><path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button className={`${styles.lightboxArrow} ${styles.lightboxArrowRight}`} onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label="Следующее фото">
            <svg width="32" height="32" viewBox="0 0 20 20" fill="none"><path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </>
      )}
      <div
        className={styles.lightboxImageWrap}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onLightboxTouchStart}
        onTouchMove={onLightboxTouchMove}
        onTouchEnd={onLightboxTouchEnd}
      >
        {activeSlide.kind === "video" ? (
          <HlsVideo
            src={activeSlide.src}
            poster={activeImage ? blobUrl(activeImage) : undefined}
            autoPlay
            muted
            loop
            controls
            className={styles.lightboxVideo}
          />
        ) : (
          <GalleryImage
            src={blobUrl(activeImage)}
            alt={`${alt} — фото ${activeIndex + 1}`}
            width={600}
            height={800}
            className={`${styles.lightboxImage} ${pinchTransform ? styles.lightboxImagePinched : ""}`}
            style={pinchTransform ? { transform: pinchTransform } : undefined}
            priority
            draggable={false}
          />
        )}
      </div>
      <span className={styles.lightboxCounter}>{activeIndex + 1} / {slides.length}</span>
    </div>
  );
}
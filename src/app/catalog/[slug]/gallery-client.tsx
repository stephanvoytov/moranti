"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import GalleryImage from "@/components/ui/gallery-image";
import styles from "./page.module.css";

interface GalleryClientProps {
  images: string[];
  alt: string;
}

const SWIPE_THRESHOLD = 80;

export default function GalleryClient({ images, alt }: GalleryClientProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null);
  const [pinchTransform, setPinchTransform] = useState("");
  const hasMultiple = images.length > 1;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDesktop = useRef(false);
  const activeIndexRef = useRef(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const wasSwiped = useRef(false);
  const suppressClick = useRef(false);

  // Keep ref in sync
  useEffect(() => { activeIndexRef.current = activeIndex; }, [activeIndex]);

  useEffect(() => {
    isDesktop.current = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
  }, []);

  const getSlideW = () => wrapperRef.current?.clientWidth || 0;

  // Stable nav functions (use ref for current index)
  const prevRef = useRef<() => void>(() => {});
  const nextRef = useRef<() => void>(() => {});

  prevRef.current = () => {
    const idx = activeIndexRef.current;
    goTo(Math.max(0, idx - 1));
  };
  nextRef.current = () => {
    const idx = activeIndexRef.current;
    goTo(Math.min(images.length - 1, idx + 1));
  };

  const goTo = (index: number) => {
    if (!trackRef.current || !getSlideW()) return;
    const w = getSlideW();
    // Set inline transform + restore CSS transition → browser animates
    trackRef.current.style.transition = "";
    trackRef.current.style.transform = `translateX(${-index * w}px)`;
    setActiveIndex(index);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!hasMultiple) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevRef.current();
      else if (e.key === "ArrowRight") nextRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hasMultiple]);

  // Lightbox keyboard
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") prevRef.current();
      if (e.key === "ArrowRight") nextRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [lightboxOpen]);

  // Touch handlers via useRef (stable, no re-attach)
  const touchHandlersRef = useRef<{
    start: (e: TouchEvent) => void;
    move: (e: TouchEvent) => void;
    end: () => void;
  } | null>(null);

  touchHandlersRef.current = {
    start: (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      isDragging.current = true;
      wasSwiped.current = false;
      suppressClick.current = false;
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;

      if (trackRef.current) {
        trackRef.current.style.transition = "none";
      }
    },

    move: (e: TouchEvent) => {
      if (!isDragging.current || e.touches.length !== 1) return;
      const idx = activeIndexRef.current;
      const w = getSlideW();
      if (!w || !trackRef.current) return;

      const dx = e.touches[0].clientX - startX.current;
      const dy = e.touches[0].clientY - startY.current;

      if (!wasSwiped.current && Math.abs(dx) > 10) {
        if (Math.abs(dx) > Math.abs(dy)) wasSwiped.current = true;
      }

      if (wasSwiped.current) {
        e.preventDefault();
        let offset = dx;
        if (idx === 0 && dx > 0) offset = dx * 0.3;
        else if (idx === images.length - 1 && dx < 0) offset = dx * 0.3;
        trackRef.current.style.transform = `translateX(${-idx * w + offset}px)`;
      }
    },

    end: () => {
      if (!isDragging.current) return;
      isDragging.current = false;

      if (trackRef.current && wasSwiped.current) {
        const transform = trackRef.current.style.transform;
        const match = transform.match(/translateX\(([-\d.]+)px\)/);
        if (match) {
          const currentPos = parseFloat(match[1]);
          const idx = activeIndexRef.current;
          const w = getSlideW();
          const expectedBase = -idx * w;
          const dragDist = currentPos - expectedBase;

          if (Math.abs(dragDist) > SWIPE_THRESHOLD) {
            suppressClick.current = true;
            // Restore transition + set target for animation
            trackRef.current.style.transition = "";
            if (dragDist > 0) {
              const newIdx = Math.max(0, idx - 1);
              trackRef.current.style.transform = `translateX(${-newIdx * w}px)`;
              setActiveIndex(newIdx);
            } else {
              const newIdx = Math.min(images.length - 1, idx + 1);
              trackRef.current.style.transform = `translateX(${-newIdx * w}px)`;
              setActiveIndex(newIdx);
            }
          } else {
            // Snap back: restore transition, keep current position (no state change)
            trackRef.current.style.transition = "";
            trackRef.current.style.transform = `translateX(${-idx * w}px)`;
          }
        } else {
          // No transform set, just snap to current
          if (trackRef.current) {
            trackRef.current.style.transition = "";
            trackRef.current.style.transform = "";
          }
        }
      } else if (trackRef.current) {
        trackRef.current.style.transition = "";
        trackRef.current.style.transform = "";
      }
      wasSwiped.current = false;
    }
  };

  // Attach non-passive touch listeners
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || !hasMultiple) return;

    const startFn = (e: TouchEvent) => touchHandlersRef.current?.start(e);
    const moveFn = (e: TouchEvent) => touchHandlersRef.current?.move(e);
    const endFn = () => touchHandlersRef.current?.end();

    el.addEventListener("touchstart", startFn, { passive: true });
    el.addEventListener("touchmove", moveFn, { passive: false });
    el.addEventListener("touchend", endFn, { passive: true });

    return () => {
      el.removeEventListener("touchstart", startFn);
      el.removeEventListener("touchmove", moveFn);
      el.removeEventListener("touchend", endFn);
    };
  }, [hasMultiple]);

  /* ---- Pinch-to-zoom for lightbox ---- */
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

  const applyPinchTransform = (animated = false) => {
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

  const thumbUrl = (url: string) =>
    url.replace(/\/images\/[^/]+\//, "/images/c246x328/");

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
        {hasMultiple && (
          <div className={styles.thumbs}>
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.thumb} ${i === activeIndex ? styles.thumbActive : ""}`}
                onClick={() => goTo(i)}
                aria-label={`${alt} — фото ${i + 1}`}
              >
                <img src={thumbUrl(src)} alt="" className={styles.thumbImage} loading="lazy" draggable={false} />
              </button>
            ))}
          </div>
        )}

        <div
          ref={wrapperRef}
          className={styles.imageWrapper}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          onClick={() => {
            if (suppressClick.current) { suppressClick.current = false; return; }
            setLightboxOpen(true);
          }}
        >
          <div
            ref={trackRef}
            className={styles.track}
            style={{ "--i": activeIndex, "--n": images.length } as React.CSSProperties}
          >
            {images.map((src, i) => (
              <div key={i} className={styles.slide}>
                <GalleryImage
                  src={src}
                  alt={`${alt} — фото ${i + 1}`}
                  width={600}
                  height={800}
                  className={`${styles.image} ${i === activeIndex && zoomPos ? styles.imageZoomed : ""}`}
                  style={i === activeIndex && zoomPos ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
                  priority={i === activeIndex}
                  draggable={false}
                  onMouseDown={(e) => e.preventDefault()}
                />
              </div>
            ))}
          </div>

          {hasMultiple && (
            <>
              <button type="button" className={`${styles.arrow} ${styles.arrowLeft}`} onClick={(e) => { e.stopPropagation(); prevRef.current(); }} aria-label="Предыдущее фото">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button type="button" className={`${styles.arrow} ${styles.arrowRight}`} onClick={(e) => { e.stopPropagation(); nextRef.current(); }} aria-label="Следующее фото">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <span className={styles.counter}>{activeIndex + 1} / {images.length}</span>
            </>
          )}
        </div>

        {hasMultiple && (
          <div className={styles.navPill}>
            <button type="button" className={styles.navPillBtn} onClick={(e) => { e.stopPropagation(); prevRef.current(); }} aria-label="Предыдущее фото" disabled={activeIndex === 0}>‹</button>
            <span className={styles.navPillCounter}>{activeIndex + 1} / {images.length}</span>
            <button type="button" className={styles.navPillBtn} onClick={(e) => { e.stopPropagation(); nextRef.current(); }} aria-label="Следующее фото" disabled={activeIndex === images.length - 1}>›</button>
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div className={styles.lightbox} onClick={() => setLightboxOpen(false)}>
          <button className={styles.lightboxClose} onClick={() => setLightboxOpen(false)} aria-label="Закрыть">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
          {hasMultiple && (
            <>
              <button className={`${styles.lightboxArrow} ${styles.lightboxArrowLeft}`} onClick={(e) => { e.stopPropagation(); prevRef.current(); }} aria-label="Предыдущее фото">
                <svg width="32" height="32" viewBox="0 0 20 20" fill="none"><path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button className={`${styles.lightboxArrow} ${styles.lightboxArrowRight}`} onClick={(e) => { e.stopPropagation(); nextRef.current(); }} aria-label="Следующее фото">
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
            <GalleryImage
              src={activeImage}
              alt={`${alt} — фото ${activeIndex + 1}`}
              width={600}
              height={800}
              className={`${styles.lightboxImage} ${pinchTransform ? styles.lightboxImagePinched : ""}`}
              style={pinchTransform ? { transform: pinchTransform } : undefined}
              priority
              draggable={false}
            />
          </div>
          <span className={styles.lightboxCounter}>{activeIndex + 1} / {images.length}</span>
        </div>
      )}
    </>
  );
}

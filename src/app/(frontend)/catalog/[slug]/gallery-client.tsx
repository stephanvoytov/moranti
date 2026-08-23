"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import GalleryImage from "@/components/ui/gallery-image";
import SmartImage from "@/components/ui/smart-image";
import HlsVideo from "@/components/ui/hls-video";
import { blobUrl } from "@/lib/blob";
import styles from "./page.module.css";
import type { Slide } from "./gallery-lightbox";

// Лайтбокс (модалка) грузится только по клику на фото — не входит в
// начальный бандл страницы товара. ssr:false: лайтбокс изначально закрыт,
// серверная разметка не нужна.
const GalleryLightbox = dynamic(() => import("./gallery-lightbox"), {
  ssr: false,
});

interface GalleryClientProps {
  images: string[];
  /** HLS-видео (WB) — вставляется в галерею вторым слайдом */
  video?: string;
  alt: string;
}

const SWIPE_THRESHOLD = 80;

export default function GalleryClient({ images, video, alt }: GalleryClientProps) {
  const slides = useMemo<Slide[]>(() => {
    const list: Slide[] = images.map((src) => ({ kind: "image", src }));
    if (video) list.splice(1, 0, { kind: "video", src: video });
    return list;
  }, [images, video]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null);
  const hasMultiple = slides.length > 1;
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

  // Stable nav functions (use ref for current index) — refs обновляются в эффекте
  // после каждого рендера (паттерн «latest»): кнопки и клавиатурные обработчики
  // всегда вызывают актуальные замыкания, а правила хуков соблюдены.
  const prevRef = useRef<() => void>(() => {});
  const nextRef = useRef<() => void>(() => {});

  const goTo = (index: number) => {
    if (!trackRef.current || !getSlideW()) return;
    const w = getSlideW();
    // Set inline transform + restore CSS transition → browser animates
    trackRef.current.style.transition = "";
    trackRef.current.style.transform = `translateX(${-index * w}px)`;
    setActiveIndex(index);
  };

  useEffect(() => {
    prevRef.current = () => {
      const idx = activeIndexRef.current;
      goTo(Math.max(0, idx - 1));
    };
    nextRef.current = () => {
      const idx = activeIndexRef.current;
      goTo(Math.min(slides.length - 1, idx + 1));
    };
  });

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

  // Touch handlers via useRef (stable, no re-attach) — обновляются в эффекте
  // после каждого рендера, чтобы замыкания всегда были свежими
  const touchHandlersRef = useRef<{
    start: (e: TouchEvent) => void;
    move: (e: TouchEvent) => void;
    end: () => void;
  } | null>(null);

  useEffect(() => {
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
        else if (idx === slides.length - 1 && dx < 0) offset = dx * 0.3;
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
              const newIdx = Math.min(slides.length - 1, idx + 1);
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
  });

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

  /* ---- Pinch-to-zoom для лайтбокса — перенесён в gallery-lightbox.tsx ---- */

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

  const thumbUrl = (url: string) => {
    if (url.includes("ir.ozone.ru")) {
      // Ozon CDN не режет размеры (?w= игнорируется) — режет оптимизатор
      return `/_next/image?url=${encodeURIComponent(url)}&w=128&q=75`;
    }
    return url.replace(/\/images\/[^/]+\//, "/images/c246x328/");
  };

  const activeSlide = slides[activeIndex] || slides[0] || null;

  if (!activeSlide) {
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
            {slides.map((slide, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.thumb} ${i === activeIndex ? styles.thumbActive : ""}`}
                onClick={() => goTo(i)}
                aria-label={
                  slide.kind === "video"
                    ? `${alt} — видео`
                    : `${alt} — фото ${i + 1}`
                }
              >
                {slide.kind === "video" ? (
                  <span className={styles.thumbVideo}>
                    <span className={styles.thumbVideoIcon}>
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                        <path d="M6 4L16 10L6 16V4Z" fill="currentColor" />
                      </svg>
                    </span>
                    <SmartImage
                      src={blobUrl(thumbUrl(images[0]))}
                      alt=""
                      className={styles.thumbImage}
                      width={246}
                      height={328}
                      draggable={false}
                    />
                  </span>
                ) : (
                  <SmartImage
                    src={blobUrl(thumbUrl(slide.src))}
                    alt=""
                    className={styles.thumbImage}
                    width={246}
                    height={328}
                    draggable={false}
                  />
                )}
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
            style={{ "--i": activeIndex, "--n": slides.length } as React.CSSProperties}
          >
            {slides.map((slide, i) => (
              <div key={slide.kind === "video" ? `video:${slide.src}` : slide.src} className={styles.slide}>
                {slide.kind === "image" ? (
                  <GalleryImage
                    src={blobUrl(slide.src)}
                    alt={`${alt} — фото ${i + 1}`}
                    width={600}
                    height={800}
                    className={`${styles.image} ${i === activeIndex && zoomPos ? styles.imageZoomed : ""}`}
                    style={i === activeIndex && zoomPos ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
                    priority={i === activeIndex}
                    draggable={false}
                    onMouseDown={(e) => e.preventDefault()}
                  />
                ) : i === activeIndex ? (
                  <HlsVideo
                    src={slide.src}
                    poster={images[0] ? blobUrl(images[0]) : undefined}
                    autoPlay
                    muted
                    loop
                    className={styles.videoSlide}
                  />
                ) : (
                  <div className={styles.videoSlidePlaceholder} />
                )}
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
              <span className={styles.counter}>{activeIndex + 1} / {slides.length}</span>
            </>
          )}
        </div>

        {hasMultiple && (
          <div className={styles.navPill}>
            <button type="button" className={styles.navPillBtn} onClick={(e) => { e.stopPropagation(); prevRef.current(); }} aria-label="Предыдущее фото" disabled={activeIndex === 0}>‹</button>
            <span className={styles.navPillCounter}>{activeIndex + 1} / {slides.length}</span>
            <button type="button" className={styles.navPillBtn} onClick={(e) => { e.stopPropagation(); nextRef.current(); }} aria-label="Следующее фото" disabled={activeIndex === slides.length - 1}>›</button>
          </div>
        )}
      </div>

      {lightboxOpen && (
        <GalleryLightbox
          slides={slides}
          activeIndex={activeIndex}
          alt={alt}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => prevRef.current()}
          onNext={() => nextRef.current()}
        />
      )}
    </>
  );
}

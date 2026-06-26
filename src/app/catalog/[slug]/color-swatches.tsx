"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { swatchUrl, cdnImageUrl } from "@/lib/product-images";
import styles from "./page.module.css";

interface SwatchProduct {
  slug: string;
  wbArticle: number;
  colorName?: string;
  name: string;
  composition?: string;
  price: number;
  originalPrice: number;
  currency: string;
  inStock?: boolean;
}

interface ColorSwatchesProps {
  current: SwatchProduct;
  siblings: SwatchProduct[];
}

/** human-читаемая подпись цвета (как в colorLabel) */
function label(p: SwatchProduct, siblings: SwatchProduct[]): string {
  const name = p.colorName || "";
  const sameColor = siblings.filter((s) => s.colorName === p.colorName);
  if (sameColor.length <= 1) return name;
  const getMaterial = (x: SwatchProduct) =>
    (x.composition || "").toLowerCase().includes("замша") ? "замша" : "кожа";
  const materials = [...new Set(sameColor.map(getMaterial))];
  if (materials.length > 1) return `${name}. ${getMaterial(p)}`;
  return (p.name || "").toLowerCase().includes("мини") ? `${name} мини` : name;
}

/** Подпись цвета (для показа на странице) */
function colorDisplay(p: SwatchProduct, siblings: SwatchProduct[]): string {
  return label(p, siblings);
}

export default function ColorSwatches({ current, siblings }: ColorSwatchesProps) {
  const all = useMemo(() => [current, ...siblings], [current, siblings]);
  const [preview, setPreview] = useState<{
    article: number;
    price: number;
    x: number;
    y: number;
  } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showPreview = useCallback((article: number, e: React.MouseEvent) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const p = all.find((x) => x.wbArticle === article);
    if (!p) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    // Centre tooltip over swatch, but keep ~100px from viewport edges
    const PR_HALF = 100;
    const cx = rect.left + rect.width / 2;
    const clampedX = Math.max(PR_HALF, Math.min(cx, window.innerWidth - PR_HALF));
    setPreview({
      article,
      price: p.price,
      x: clampedX,
      y: rect.top,
    });
  }, [all]);

  const hidePreview = useCallback(() => {
    timeoutRef.current = setTimeout(() => setPreview(null), 80);
  }, []);

  const keepPreview = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div className={styles.colors}>
      <div className={styles.colorsLabel}>
        Цвет: {colorDisplay(current, siblings)}
      </div>
      <div className={styles.colorsList}>
        {/* Current product swatch */}
        <div
          className={styles.swatchWrap}
          onMouseEnter={(e) => showPreview(current.wbArticle, e)}
          onMouseLeave={hidePreview}
        >
          <Link
            href={`/catalog/${current.slug}`}
            className={`${styles.swatch} ${styles.swatchActive}`}
            title={label(current, siblings)}
          >
            <img
              src={swatchUrl(current.wbArticle)}
              alt={label(current, siblings)}
              className={styles.swatchImage}
              loading="lazy"
            />
          </Link>
        </div>

        {/* Sibling swatches */}
        {siblings.map((s) => {
          const isOutOfStock = s.inStock === false;
          return (
            <div
              key={s.slug}
              className={`${styles.swatchWrap} ${isOutOfStock ? styles.swatchWrapOos : ""}`}
              onMouseEnter={(e) => showPreview(s.wbArticle, e)}
              onMouseLeave={hidePreview}
            >
              <Link
                href={`/catalog/${s.slug}`}
                className={styles.swatch}
                title={label(s, siblings)}
              >
                <img
                  src={swatchUrl(s.wbArticle)}
                  alt={label(s, siblings)}
                  className={`${styles.swatchImage} ${isOutOfStock ? styles.swatchImageOos : ""}`}
                  loading="lazy"
                />
              </Link>
              {isOutOfStock && (
                <span className={styles.swatchOosLabel}>нет</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Hover preview tooltip */}
      {preview && (
        <div
          className={styles.swatchPreview}
          style={{
            left: preview.x,
            top: preview.y,
          }}
          onMouseEnter={keepPreview}
          onMouseLeave={hidePreview}
        >
          <img
            src={cdnImageUrl(preview.article, 1, "c246x328")}
            alt=""
            className={styles.swatchPreviewImage}
            loading="lazy"
          />
          <div className={styles.swatchPreviewPrice}>
            {preview.price?.toLocaleString("ru-RU")} ₽
          </div>
        </div>
      )}
    </div>
  );
}

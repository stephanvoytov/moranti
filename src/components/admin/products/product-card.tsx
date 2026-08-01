"use client";

import Link from "next/link";
import UpdatedBadge from "@/components/admin/updated-badge";
import ProductThumb, { type ProductThumbItem } from "@/components/admin/products/product-thumb";
import { resolveColor } from "@/lib/color-map";
import { formatPrice } from "@/lib/format";
import { MARKETPLACE_URLS } from "@/lib/marketplaces";
import styles from "./product-card.module.css";

export interface ProductCardItem extends ProductThumbItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  sku?: string;
  colorName?: string;
  updatedAt?: string;
}

interface ProductCardProps {
  item: ProductCardItem;
  /** Карточка в режиме перетаскивания (канбан) */
  draggable?: boolean;
  /** Визуальная подсветка «этот элемент сейчас тащим» */
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
}

/**
 * Единый вид товара-варианта: фото (WB/Ozon со свопом при наведении),
 * название, SKU, цена, цвет, артикулы с остатками.
 * Используется в канбане и в просмотре модели.
 */
export default function ProductCard({
  item,
  draggable,
  isDragging,
  onDragStart,
  onDragEnd,
}: ProductCardProps) {
  const isArchived = !!item.archivedAt;

  const cardClass = [
    styles.card,
    isArchived ? styles.cardArchived : "",
    isDragging ? styles.cardDrag : "",
    draggable ? styles.cardDraggable : "",
  ].filter(Boolean).join(" ");

  return (
    <div
      className={cardClass}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <ProductThumb item={item} href={`/admin/products/${item.slug}`} />

      {/* Info — каждая на своей строке */}
      <div className={styles.cardInfo}>
        <div className={styles.cardNameRow}>
          <Link href={`/admin/products/${item.slug}`} className={styles.cardName}>
            {item.name || "—"}
          </Link>
          <Link
            href={`/catalog/${item.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={styles.cardViewLink}
            title="Открыть на витрине"
          >
            ↗
          </Link>
          {isArchived && <span className={styles.cardArchivedBadge}>A</span>}
        </div>
        {item.sku && <div className={styles.cardSku}>SKU: {item.sku}</div>}
        <div className={styles.cardPrice}>{formatPrice(item.price)}</div>
        {item.colorName && (
          <div className={styles.cardColor}>
            <span className={styles.cardColorDot} style={{ background: resolveColor(item.colorName) }} />
            {item.colorName}
          </div>
        )}
        {item.updatedAt && <UpdatedBadge iso={item.updatedAt} className={styles.cardUpdated} />}
        <div className={styles.cardArticles}>
          {item.wbArticle && (
            <a href={MARKETPLACE_URLS.wbProduct(item.wbArticle)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className={`${styles.cardArt} ${isArchived ? styles.cardArtArchived : ""} ${item.wbStock != null && item.wbStock <= 0 ? styles.cardArtOos : ""}`}>
              WB{item.wbStock != null && item.wbStock > 0 ? ' ' + item.wbStock + ' шт' : ''}
            </a>
          )}
          {item.ozonArticle && (
            <a href={MARKETPLACE_URLS.ozonProduct(item.ozonArticle)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className={`${styles.cardArt} ${styles.cardArtOzon} ${isArchived ? styles.cardArtArchived : ""} ${item.ozonStock != null && item.ozonStock <= 0 ? styles.cardArtOos : ""}`}>
              Ozon{item.ozonStock != null && item.ozonStock > 0 ? ' ' + item.ozonStock + ' шт' : ''}
            </a>
          )}
        </div>
      </div>

      {/* Drag handle */}
      {draggable && (
        <span className={styles.cardDragHandle} aria-label="Перетащить">⠿</span>
      )}
    </div>
  );
}

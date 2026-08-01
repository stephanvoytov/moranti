"use client";

import Link from "next/link";
import SmartImage from "@/components/ui/smart-image";
import { MARKETPLACE_FAVICONS } from "@/lib/marketplaces";
import styles from "./product-thumb.module.css";

export interface ProductThumbItem {
  image?: string | null;
  ozonImage?: string | null;
  wbArticle?: number | null;
  ozonArticle?: number | null;
  wbStock?: number | null;
  ozonStock?: number | null;
  archivedAt?: string | null;
}

interface ProductThumbProps {
  item: ProductThumbItem;
  /** Если задан — превью оборачивается в Link (канбан) */
  href?: string;
  /** Клик по фото (лайтбокс в списке и т.п.) */
  onClick?: () => void;
}

/**
 * Превью товара: большая основная картинка (WB) + маленькая
 * дополнительная (Ozon) в углу; при наведении меняются местами.
 * Единый вид для канбана и списка.
 */
export default function ProductThumb({ item, href, onClick }: ProductThumbProps) {
  const isArchived = !!item.archivedAt;
  const mainImage = item.image || item.ozonImage;
  const canSwap = !!(item.ozonImage && item.wbArticle);
  const mainOos = item.wbStock != null && item.wbStock <= 0;
  const ozonOos = item.ozonStock != null && item.ozonStock <= 0;

  const badge = item.wbArticle
    ? { src: MARKETPLACE_FAVICONS.wb, alt: "WB" }
    : item.ozonArticle
      ? { src: MARKETPLACE_FAVICONS.ozon, alt: "Ozon" }
      : null;

  const inner = (
    <div className={`${styles.thumbWrapper} ${canSwap ? styles.swap : ""}`}>
      {mainImage ? (
        <>
          <div className={`${styles.imgSlot} ${styles.imgSlotSingle} ${styles.imgSlotWb} ${mainOos ? styles.slotOos : ""}`}>
            <SmartImage src={mainImage} alt="" className={styles.imgSlotInner} draggable={false} />
            {badge && <img src={badge.src} alt={badge.alt} className={styles.slotBadge} />}
            {mainOos && <div className={styles.slotOosOverlay}>НЕТ</div>}
          </div>
          {canSwap && (
            <div className={`${styles.imgSlot} ${styles.imgSlotOzon} ${ozonOos ? styles.slotOos : ""}`}>
              <SmartImage src={item.ozonImage!} alt="" className={styles.imgSlotInner} draggable={false} />
              <img src={MARKETPLACE_FAVICONS.ozon} alt="Ozon" className={styles.slotBadge} />
              {ozonOos && <div className={styles.slotOosOverlay}>НЕТ</div>}
            </div>
          )}
        </>
      ) : (
        <div className={styles.placeholder} />
      )}
      {isArchived && (
        <>
          <div className={styles.archiveCorner} title="В архиве" />
          <div className={styles.archiveOverlay}>АРХИВ</div>
        </>
      )}
    </div>
  );

  const className = `${styles.thumb} ${isArchived ? styles.archived : ""}`;

  if (href) {
    return (
      <Link href={href} className={className} onClick={(e) => e.stopPropagation()}>
        {inner}
      </Link>
    );
  }

  return (
    <div className={className} onClick={onClick} role={onClick ? "button" : undefined} title={onClick ? "Увеличить" : undefined}>
      {inner}
    </div>
  );
}

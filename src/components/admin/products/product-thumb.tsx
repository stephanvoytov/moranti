"use client";

import Link from "next/link";
import Image from "next/image";
import SmartImage from "@/components/ui/smart-image";
import { blobUrl } from "@/lib/blob";
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
 * Превью товара: большая основная картинка + маленькая дополнительная
 * в углу; при наведении меняются местами.
 *
 * Главная картинка: WB-фото, но если WB нет в наличии (или товар только
 * на Ozon) и есть Ozon-фото — главной становится картинка с Ozon,
 * а WB уходит в угол с оверлеем «НЕТ». Единый вид для канбана и списка.
 */
export default function ProductThumb({ item, href, onClick }: ProductThumbProps) {
  const isArchived = !!item.archivedAt;
  const hasWb = !!item.wbArticle;
  // WB-слот только если товар реально на WB (для Ozon-only image == ozonImage)
  const wbImg = hasWb ? item.image || null : null;
  const ozonImg = item.ozonImage || null;
  const both = !!(wbImg && ozonImg);
  const wbOos = item.wbStock != null && item.wbStock <= 0;
  const ozonOos = item.ozonStock != null && item.ozonStock <= 0;
  // WB нет в наличии — Ozon-фото главное (при двух слотах)
  const ozonMain = both && (item.wbStock ?? 0) <= 0;

  const wrapper = both
    ? ozonMain ? styles.ozonMain : styles.swap
    : "";

  const inner = (
    <div className={`${styles.thumbWrapper} ${wrapper}`}>
      {both ? (
        <>
          <div className={`${styles.imgSlot} ${styles.imgSlotWb} ${wbOos ? styles.slotOos : ""}`}>
            <SmartImage src={blobUrl(wbImg!)} alt="" className={styles.imgSlotInner} draggable={false} />
            <Image src={MARKETPLACE_FAVICONS.wb} alt="WB" width={24} height={24} className={styles.slotBadge} />
            {wbOos && <div className={styles.slotOosOverlay}>НЕТ</div>}
          </div>
          <div className={`${styles.imgSlot} ${styles.imgSlotOzon} ${ozonOos ? styles.slotOos : ""}`}>
            <SmartImage src={blobUrl(ozonImg!)} alt="" className={styles.imgSlotInner} draggable={false} />
            <Image src={MARKETPLACE_FAVICONS.ozon} alt="Ozon" width={24} height={24} className={styles.slotBadge} />
            {ozonOos && <div className={styles.slotOosOverlay}>НЕТ</div>}
          </div>
        </>
      ) : wbImg ? (
        <div className={`${styles.imgSlot} ${styles.imgSlotSingle} ${wbOos ? styles.slotOos : ""}`}>
          <SmartImage src={blobUrl(wbImg)} alt="" className={styles.imgSlotInner} draggable={false} />
          <Image src={MARKETPLACE_FAVICONS.wb} alt="WB" width={24} height={24} className={styles.slotBadge} />
          {wbOos && <div className={styles.slotOosOverlay}>НЕТ</div>}
        </div>
      ) : ozonImg ? (
        <div className={`${styles.imgSlot} ${styles.imgSlotSingle} ${ozonOos ? styles.slotOos : ""}`}>
          <SmartImage src={blobUrl(ozonImg)} alt="" className={styles.imgSlotInner} draggable={false} />
          <Image src={MARKETPLACE_FAVICONS.ozon} alt="Ozon" width={24} height={24} className={styles.slotBadge} />
          {ozonOos && <div className={styles.slotOosOverlay}>НЕТ</div>}
        </div>
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

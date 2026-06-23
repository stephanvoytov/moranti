"use client";

import { useLivePrice } from "@/lib/use-live-price";
import styles from "./page.module.css";

interface PriceClientProps {
  wbArticle: number;
  staticPrice: number;
  staticOriginal: number;
  currency: string;
}

export default function PriceClient({
  wbArticle,
  staticPrice,
  staticOriginal,
  currency,
}: PriceClientProps) {
  const { livePrice, liveOriginal } = useLivePrice(wbArticle);

  const displayPrice = livePrice ?? staticPrice;
  const displayOriginal = liveOriginal ?? staticOriginal;

  const discount =
    displayOriginal > displayPrice
      ? Math.round((1 - displayPrice / displayOriginal) * 100)
      : 0;

  return (
    <div className={styles.priceRow}>
      <span className={styles.price}>
        {displayPrice.toLocaleString("ru-RU")} {currency}
      </span>
      {displayOriginal > displayPrice && (
        <>
          <span className={styles.oldPrice}>
            {displayOriginal.toLocaleString("ru-RU")} {currency}
          </span>
          <span className={styles.discountBadge}>−{discount}%</span>
        </>
      )}
    </div>
  );
}

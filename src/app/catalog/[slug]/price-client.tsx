import styles from "./page.module.css";

interface PriceClientProps {
  staticPrice: number;
  staticOriginal: number;
  currency: string;
}

export default function PriceClient({
  staticPrice,
  staticOriginal,
  currency,
}: PriceClientProps) {
  const displayPrice = staticPrice;
  const displayOriginal = staticOriginal;

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

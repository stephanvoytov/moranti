/* =============================================
   MarketplaceStats — карточка статистики площадки
   (в наличии / без остатка / всего)
   ============================================= */

import styles from "./marketplace-stats.module.css";

interface MarketplaceStatsProps {
  platform: "wb" | "ozon";
  inStock: number;
  noStock: number;
  total: number;
  totalLabel?: string;
}

const PLATFORMS = {
  wb: { icon: "WB", title: "Wildberries" },
  ozon: { icon: "OZ", title: "Ozon" },
} as const;

export default function MarketplaceStats({
  platform,
  inStock,
  noStock,
  total,
  totalLabel = "всего на площадке",
}: MarketplaceStatsProps) {
  const p = PLATFORMS[platform];
  return (
    <div className={styles.mpCard}>
      <div className={styles.mpHeader}>
        <span className={`${styles.mpIcon} ${platform === "ozon" ? styles.mpIconOzon : ""}`}>
          {p.icon}
        </span>
        <span className={styles.mpTitle}>{p.title}</span>
      </div>
      <div className={styles.mpStats}>
        <div className={styles.mpStat}>
          <span className={styles.mpStatValue}>{inStock}</span>
          <span className={styles.mpStatLabel}>в наличии</span>
        </div>
        <div className={styles.mpDivider} />
        <div className={styles.mpStat}>
          <span className={styles.mpStatValue}>{noStock}</span>
          <span className={styles.mpStatLabel}>без остатка</span>
        </div>
        <div className={styles.mpDivider} />
        <div className={styles.mpStat}>
          <span className={styles.mpStatValue}>{total}</span>
          <span className={styles.mpStatLabel}>{totalLabel}</span>
        </div>
      </div>
    </div>
  );
}

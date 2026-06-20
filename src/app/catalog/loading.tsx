/* =============================================
   Catalog loading skeleton
   ============================================= */

import styles from "./page.module.css";

export default function CatalogLoading() {
  return (
    <section className={styles.catalog}>
      <div className={styles.header}>
        <span className={styles.label}>Каталог</span>
        <h1 className={styles.title}>Наши сумки</h1>
      </div>

      {/* Filter pills skeleton */}
      <div className={styles.filterRow}>
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            style={{
              height: 32,
              width: i === 0 ? 48 : 80 + Math.random() * 60,
              borderRadius: 0,
              background: "var(--card-bg)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        ))}
      </div>

      {/* Product grid skeleton */}
      <div className={styles.productGrid}>
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                aspectRatio: "3 / 4",
                width: "100%",
                borderRadius: 0,
                background: "var(--card-bg)",
                animation: "pulse 1.5s ease-in-out infinite",
                animationDelay: `${i * 0.05}s`,
              }}
            />
            <div style={{ padding: "12px 0 0" }}>
              <div
                style={{
                  height: 14,
                  width: "70%",
                  margin: "0 0 8px",
                  borderRadius: 0,
                  background: "var(--card-bg)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
              <div
                style={{
                  height: 16,
                  width: "40%",
                  borderRadius: 0,
                  background: "var(--card-bg)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </section>
  );
}

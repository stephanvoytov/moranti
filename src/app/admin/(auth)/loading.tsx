/* =============================================
   Admin — loading skeleton
   ============================================= */

import styles from "./layout.module.css";

export default function AdminLoading() {
  return (
    <div className={styles.adminLayout}>
      {/* Sidebar skeleton */}
      <aside style={{
        width: 220,
        minHeight: "100vh",
        background: "var(--card-bg)",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}>
        <div
          style={{
            height: 24,
            width: "60%",
            borderRadius: 4,
            background: "#ddd",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            style={{
              height: 16,
              width: 80 + Math.random() * 60,
              borderRadius: 4,
              background: "#ddd",
              animation: "pulse 1.5s ease-in-out infinite",
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </aside>

      {/* Content skeleton */}
      <main style={{
        flex: 1,
        padding: 32,
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}>
        <div
          style={{
            height: 28,
            width: 200,
            borderRadius: 4,
            background: "var(--card-bg)",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
        <div
          style={{
            height: 16,
            width: "40%",
            borderRadius: 4,
            background: "var(--card-bg)",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
        <div
          style={{
            height: 200,
            width: "100%",
            borderRadius: 4,
            background: "var(--card-bg)",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

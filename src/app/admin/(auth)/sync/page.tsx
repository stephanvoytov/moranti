"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./sync.module.css";
import { formatDistanceToNow } from "@/lib/format-date";

/* ─── Types (mirror of sync-history.ts) ─── */

interface SyncRunStats {
  added: number;
  updated: number;
  archived: number;
  skipped: number;
  errors: number;
  total: number;
}

interface SyncRunDetail {
  id: string;
  name: string;
  changes?: string[];
}

interface SyncRunRecord {
  platform: "wb" | "ozon";
  timestamp: string;
  duration: number;
  success: boolean;
  error?: string;
  stats: SyncRunStats;
  details?: { added?: SyncRunDetail[]; updated?: SyncRunDetail[]; archived?: SyncRunDetail[] };
  log: string;
}

/* ─── Platform config ─── */

const PLATFORM = {
  wb: {
    title: "Wildberries",
    desc: "Content API + Pricing API + Stocks API + Analytics API",
    badge: "Official API",
    badgeClass: styles.badgeWb,
    btnClass: "",
    apiPath: "/api/admin/sync",
    accent: "var(--dark)",
  },
  ozon: {
    title: "Ozon",
    desc: "Seller API v3/v4 — товары, цены, атрибуты, рейтинг",
    badge: "Seller API",
    badgeClass: styles.badgeOzon,
    btnClass: styles.btnOzon,
    apiPath: "/api/admin/sync/ozon",
    accent: "#7c3aed",
  },
};

/* ─── Helpers ─── */

function ago(ts: string) {
  try {
    return formatDistanceToNow(new Date(ts), { addSuffix: true, locale: "ru" });
  } catch {
    const d = new Date(ts);
    return d.toLocaleString("ru-RU");
  }
}

function fmtDur(ms: number) {
  if (ms < 1000) return `${ms}мс`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}с`;
  const m = Math.floor(ms / 60_000);
  const s = Math.round((ms % 60_000) / 1000);
  return `${m}м ${s}с`;
}

function fmtDate(ts: string) {
  try {
    return new Date(ts).toLocaleString("ru-RU");
  } catch {
    return ts;
  }
}

/* ─── Component ─── */

export default function AdminSyncPage() {
  const router = useRouter();
  const [wbHistory, setWbHistory] = useState<SyncRunRecord[]>([]);
  const [ozonHistory, setOzonHistory] = useState<SyncRunRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sync state per platform
  const [syncing, setSyncing] = useState<{ wb: boolean; ozon: boolean }>({ wb: false, ozon: false });
  const [lastResult, setLastResult] = useState<{ wb?: SyncRunRecord; ozon?: SyncRunRecord }>({});

  // Expandable sections per platform
  const [expandedLog, setExpandedLog] = useState<"wb" | "ozon" | null>(null);
  const [expandedHistory, setExpandedHistory] = useState<"wb" | "ozon" | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<"wb" | "ozon" | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/sync-status");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setWbHistory(data.wb || []);
      setOzonHistory(data.ozon || []);
    } catch {
      setError("Не удалось загрузить историю");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  async function handleSync(platform: "wb" | "ozon") {
    setError("");
    setSyncing((s) => ({ ...s, [platform]: true }));
    setExpandedLog(null);
    setExpandedHistory(null);
    setExpandedDetails(null);

    try {
      const res = await fetch(PLATFORM[platform].apiPath, { method: "POST" });
      const data: SyncRunRecord = await res.json();

      if (res.ok) {
        setLastResult((r) => ({ ...r, [platform]: data }));
        // Refresh history
        loadHistory();
      } else {
        setError((data as any).error || `Ошибка синхронизации ${PLATFORM[platform].title}`);
      }
    } catch {
      setError("Ошибка соединения");
    } finally {
      setSyncing((s) => ({ ...s, [platform]: false }));
    }
  }

  const wbLast = lastResult.wb || wbHistory[0] || null;
  const ozonLast = lastResult.ozon || ozonHistory[0] || null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>Синхронизация</h1>
            <p className={styles.subtitle}>
              Автоматическое обновление товаров из Wildberries и Ozon
            </p>
          </div>
          <button className={styles.refreshBtn} onClick={loadHistory} title="Обновить статус">
            ↻
          </button>
        </div>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.platforms}>
        {/* ——— WB ——— */}
        <PlatformCard
          platform="wb"
          config={PLATFORM.wb}
          lastRun={wbLast}
          syncing={syncing.wb}
          disabled={syncing.wb || syncing.ozon}
          onSync={() => handleSync("wb")}
          expandedLog={expandedLog === "wb"}
          expandedHistory={expandedHistory === "wb"}
          expandedDetails={expandedDetails === "wb"}
          onToggleLog={() => setExpandedLog(expandedLog === "wb" ? null : "wb")}
          onToggleHistory={() => setExpandedHistory(expandedHistory === "wb" ? null : "wb")}
          onToggleDetails={() => setExpandedDetails(expandedDetails === "wb" ? null : "wb")}
          history={wbHistory}
        />

        {/* ——— Ozon ——— */}
        <PlatformCard
          platform="ozon"
          config={PLATFORM.ozon}
          lastRun={ozonLast}
          syncing={syncing.ozon}
          disabled={syncing.wb || syncing.ozon}
          onSync={() => handleSync("ozon")}
          expandedLog={expandedLog === "ozon"}
          expandedHistory={expandedHistory === "ozon"}
          expandedDetails={expandedDetails === "ozon"}
          onToggleLog={() => setExpandedLog(expandedLog === "ozon" ? null : "ozon")}
          onToggleHistory={() => setExpandedHistory(expandedHistory === "ozon" ? null : "ozon")}
          onToggleDetails={() => setExpandedDetails(expandedDetails === "ozon" ? null : "ozon")}
          history={ozonHistory}
        />
      </div>
    </div>
  );
}

/* ─── Platform Card ─── */

function PlatformCard({
  platform,
  config,
  lastRun,
  syncing,
  disabled,
  onSync,
  expandedLog,
  expandedHistory,
  expandedDetails,
  onToggleLog,
  onToggleHistory,
  onToggleDetails,
  history,
}: {
  platform: "wb" | "ozon";
  config: (typeof PLATFORM)["wb"];
  lastRun: SyncRunRecord | null;
  syncing: boolean;
  disabled: boolean;
  onSync: () => void;
  expandedLog: boolean;
  expandedHistory: boolean;
  expandedDetails: boolean;
  onToggleLog: () => void;
  onToggleHistory: () => void;
  onToggleDetails: () => void;
  history: SyncRunRecord[];
}) {
  return (
    <section className={styles.card} style={{ borderTopColor: config.accent }}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderLeft}>
          <h2 className={styles.cardTitle}>{config.title}</h2>
          <p className={styles.cardDesc}>{config.desc}</p>
        </div>
        <span className={`${styles.badge} ${config.badgeClass}`}>{config.badge}</span>
      </div>

      {/* Status */}
      {lastRun && (
        <div className={styles.statusRow}>
          <span className={lastRun.success ? styles.statusOk : styles.statusFail}>
            {lastRun.success ? "✓" : "✗"}
          </span>
          <span className={styles.statusText}>
            {lastRun.success
              ? `Успешно · ${ago(lastRun.timestamp)} · за ${fmtDur(lastRun.duration)}`
              : `Ошибка · ${ago(lastRun.timestamp)}`
            }
          </span>
        </div>
      )}

      {!lastRun && !syncing && (
        <div className={styles.neverRun}>Синхронизация ещё не запускалась</div>
      )}

      {/* Stats */}
      {lastRun && lastRun.success && (
        <div className={styles.statsGrid}>
          <StatCard value={lastRun.stats.added} label="Добавлено" />
          <StatCard value={lastRun.stats.updated} label="Обновлено" />
          <StatCard value={lastRun.stats.archived} label="Архивировано" />
          <StatCard value={lastRun.stats.total} label="Обработано" />
          {lastRun.stats.errors > 0 && (
            <StatCard value={lastRun.stats.errors} label="Ошибок" accent />
          )}
        </div>
      )}

      {/* Error message */}
      {lastRun && !lastRun.success && lastRun.error && (
        <div className={styles.errorMsg}>{lastRun.error}</div>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={`${styles.syncBtn} ${config.btnClass}`}
          onClick={onSync}
          disabled={disabled}
        >
          {syncing ? (
            <><span className={styles.btnSpinner} /> Синхронизация...</>
          ) : (
            `Запустить синхронизацию`
          )}
        </button>
      </div>

      {syncing && (
        <div className={styles.progress}>
          <div className={styles.spinner} />
          <span>Загрузка данных с {config.title}...</span>
        </div>
      )}

      {/* ─── Collapsible: Details (changes per product) ─── */}
      {lastRun?.details && (lastRun.details.updated?.length || lastRun.details.added?.length) && (
        <div className={styles.collapsible}>
          <button className={styles.collapseToggle} onClick={onToggleDetails}>
            <span className={styles.collapseArrow}>{expandedDetails ? "▼" : "▶"}</span>
            Подробности по товарам
            {lastRun.details.updated && (
              <span className={styles.collapseCount}>+{lastRun.details.updated.length}</span>
            )}
          </button>

          {expandedDetails && (
            <div className={styles.collapseContent}>
              {lastRun.details.updated && lastRun.details.updated.length > 0 && (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Название</th>
                      <th>Изменения</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lastRun.details.updated.map((item) => (
                      <tr key={item.id}>
                        <td className={styles.cellId}>{item.id}</td>
                        <td>{item.name}</td>
                        <td className={styles.cellChanges}>
                          {item.changes?.map((ch) => (
                            <span key={ch} className={styles.changeTag}>{ch}</span>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {lastRun.details.added && lastRun.details.added.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <strong className={styles.sectionLabel}>Добавленные товары:</strong>
                  <ul className={styles.simpleList}>
                    {lastRun.details.added.map((item) => (
                      <li key={item.id}>{item.id} — {item.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── Collapsible: Log ─── */}
      {lastRun?.log && (
        <div className={styles.collapsible}>
          <button className={styles.collapseToggle} onClick={onToggleLog}>
            <span className={styles.collapseArrow}>{expandedLog ? "▼" : "▶"}</span>
            Лог синхронизации
            <span className={styles.collapseCount}>
              {(lastRun.log.match(/\n/g) || []).length + 1} строк
            </span>
          </button>

          {expandedLog && (
            <pre className={styles.logViewer}><code>{lastRun.log}</code></pre>
          )}
        </div>
      )}

      {/* ─── Collapsible: History ─── */}
      {history.length > 0 && (
        <div className={styles.collapsible}>
          <button className={styles.collapseToggle} onClick={onToggleHistory}>
            <span className={styles.collapseArrow}>{expandedHistory ? "▼" : "▶"}</span>
            История запусков
            <span className={styles.collapseCount}>всего {history.length}</span>
          </button>

          {expandedHistory && (
            <div className={styles.historyList}>
              {history.map((run, i) => (
                <div key={run.timestamp + i} className={styles.historyItem}>
                  <div className={styles.historyLeft}>
                    <span className={run.success ? styles.historyDotOk : styles.historyDotFail} />
                    <span className={styles.historyDate}>{fmtDate(run.timestamp)}</span>
                  </div>
                  <div className={styles.historyRight}>
                    <span className={styles.historyStat}>
                      +{run.stats.added} / ~{run.stats.updated} / -{run.stats.archived}
                    </span>
                    <span className={styles.historyDur}>{fmtDur(run.duration)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/* ─── Stat Card ─── */

function StatCard({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <div className={`${styles.statCard} ${accent ? styles.statCardAccent : ""}`}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

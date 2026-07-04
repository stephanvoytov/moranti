"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./sync.module.css";
import { formatDistanceToNow } from "@/lib/format-date";

/* ─── Types ─── */

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

interface SyncProgress {
  runId: string;
  platform: "wb" | "ozon";
  status: "running" | "completed" | "failed";
  phase: string;
  current: number;
  total: number;
  startedAt: string;
  log?: string;
  error?: string;
}

/* ─── Phase labels ─── */

const PHASE_LABELS: Record<string, string> = {
  "wb-prices": "Цены WB",
  "wb-cards": "Карточки WB",
  "wb-process": "Обработка товаров WB",
  "ozon-list": "Список товаров Ozon",
  "ozon-info": "Информация Ozon",
  "ozon-attrs": "Атрибуты Ozon",
  "ozon-ratings": "Рейтинги Ozon",
  "ozon-process": "Обработка товаров Ozon",
  "ozon-models": "Модели Ozon",
  "wb-models": "Модели WB",
  archive: "Архивация",
  done: "Завершение",
};

/* ─── Platform config ─── */

const PLATFORM = {
  wb: {
    title: "Wildberries",
    desc: "Public Search API + Content API",
    badge: "WB API",
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

function phaseLabel(phase: string): string {
  return PHASE_LABELS[phase] || phase;
}

/* ─── Component ─── */

export default function AdminSyncPage() {
  const router = useRouter();
  const [wbHistory, setWbHistory] = useState<SyncRunRecord[]>([]);
  const [ozonHistory, setOzonHistory] = useState<SyncRunRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Progress per platform
  const [progress, setProgress] = useState<{ wb: SyncProgress | null; ozon: SyncProgress | null }>({
    wb: null,
    ozon: null,
  });
  const pollingRef = useRef<{ wb?: ReturnType<typeof setInterval>; ozon?: ReturnType<typeof setInterval> }>({});

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

  // Check for active runs on mount
  useEffect(() => {
    loadHistory();
    checkActiveRun("wb");
    checkActiveRun("ozon");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadHistory]);

  async function checkActiveRun(platform: "wb" | "ozon") {
    try {
      const res = await fetch(`/api/admin/sync/progress?platform=${platform}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.status === "running") {
        setProgress((p) => ({ ...p, [platform]: data }));
        startPolling(platform, data.runId);
      }
    } catch {
      // ignore
    }
  }

  function startPolling(platform: "wb" | "ozon", runId: string) {
    // Clear existing polling
    if (pollingRef.current[platform]) {
      clearInterval(pollingRef.current[platform]!);
    }
    pollingRef.current[platform] = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/sync/progress?runId=${runId}`);
        if (!res.ok) {
          stopPolling(platform);
          return;
        }
        const data: SyncProgress = await res.json();

        if (data.status === "running") {
          setProgress((p) => ({ ...p, [platform]: data }));
        } else {
          // Complete or failed
          stopPolling(platform);
          setProgress((p) => ({ ...p, [platform]: data }));
          // Refresh history after a short delay to let the DB update
          setTimeout(() => {
            loadHistory();
            setProgress((p) => ({ ...p, [platform]: null }));
          }, 500);
        }
      } catch {
        stopPolling(platform);
      }
    }, 1500);
  }

  function stopPolling(platform: "wb" | "ozon") {
    if (pollingRef.current[platform]) {
      clearInterval(pollingRef.current[platform]!);
      delete pollingRef.current[platform];
    }
  }

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current.wb) clearInterval(pollingRef.current.wb);
      if (pollingRef.current.ozon) clearInterval(pollingRef.current.ozon);
    };
  }, []);

  async function handleSync(platform: "wb" | "ozon") {
    setError("");

    try {
      const res = await fetch(PLATFORM[platform].apiPath, { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        // Start polling for progress
        const initial: SyncProgress = {
          runId: data.runId,
          platform,
          status: "running",
          phase: "starting",
          current: 0,
          total: 1,
          startedAt: new Date().toISOString(),
        };
        setProgress((p) => ({ ...p, [platform]: initial }));
        startPolling(platform, data.runId);
      } else {
        setError(data.error || `Ошибка синхронизации ${PLATFORM[platform].title}`);
      }
    } catch {
      setError("Ошибка соединения");
    }
  }

  const wbLast = wbHistory[0] || null;
  const ozonLast = ozonHistory[0] || null;

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
          progress={progress.wb}
          disabled={!!progress.wb || !!progress.ozon}
          onSync={() => handleSync("wb")}
          history={wbHistory}
        />

        {/* ——— Ozon ——— */}
        <PlatformCard
          platform="ozon"
          config={PLATFORM.ozon}
          lastRun={ozonLast}
          progress={progress.ozon}
          disabled={!!progress.wb || !!progress.ozon}
          onSync={() => handleSync("ozon")}
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
  progress,
  disabled,
  onSync,
  history,
}: {
  platform: "wb" | "ozon";
  config: (typeof PLATFORM)["wb"];
  lastRun: SyncRunRecord | null;
  progress: SyncProgress | null;
  disabled: boolean;
  onSync: () => void;
  history: SyncRunRecord[];
}) {
  const isRunning = progress?.status === "running";

  // Expand state per card
  const [expandedLog, setExpandedLog] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState(false);

  // Auto-collapse when starting a new run
  useEffect(() => {
    if (isRunning) {
      setExpandedLog(false);
      setExpandedHistory(false);
      setExpandedDetails(false);
    }
  }, [isRunning]);

  // Determine progress percent
  const progressPct =
    progress && progress.total > 0 ? Math.min(100, Math.round((progress.current / progress.total) * 100)) : 0;

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
      {lastRun && !isRunning && (
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

      {!lastRun && !isRunning && (
        <div className={styles.neverRun}>Синхронизация ещё не запускалась</div>
      )}

      {/* Stats (only when not running and last run was successful) */}
      {lastRun && lastRun.success && !isRunning && (
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
      {lastRun && !lastRun.success && lastRun.error && !isRunning && (
        <div className={styles.errorMsg}>{lastRun.error}</div>
      )}

      {/* ─── Progress Bar ─── */}
      {isRunning && progress && (
        <div className={styles.progressSection}>
          <div className={styles.progressLabel}>
            <span className={styles.progressPhase}>{phaseLabel(progress.phase)}</span>
            <span className={styles.progressCount}>
              {progress.current}/{progress.total}
            </span>
          </div>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressBar}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className={styles.progressLog}>
            {progress.log && (
              <pre className={styles.progressLogPre}><code>{progress.log}</code></pre>
            )}
          </div>
        </div>
      )}

      {/* Error from current run */}
      {progress?.status === "failed" && progress.error && (
        <div className={styles.errorMsg}>{progress.error}</div>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={`${styles.syncBtn} ${config.btnClass}`}
          onClick={onSync}
          disabled={disabled}
        >
          {isRunning ? (
            <><span className={styles.btnSpinner} /> Синхронизация...</>
          ) : (
            `Запустить синхронизацию`
          )}
        </button>
      </div>

      {/* ─── Details (changes per product) ─── */}
      {lastRun?.details && !isRunning && (lastRun.details.updated?.length || lastRun.details.added?.length) && (
        <div className={styles.collapsible}>
          <button className={styles.collapseToggle} onClick={() => setExpandedDetails(!expandedDetails)}>
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

      {/* ─── Log ─── */}
      {lastRun?.log && !isRunning && (
        <div className={styles.collapsible}>
          <button className={styles.collapseToggle} onClick={() => setExpandedLog(!expandedLog)}>
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

      {/* ─── History ─── */}
      {history.length > 0 && !isRunning && (
        <div className={styles.collapsible}>
          <button className={styles.collapseToggle} onClick={() => setExpandedHistory(!expandedHistory)}>
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

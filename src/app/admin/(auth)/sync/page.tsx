"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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

/* ─── Log Event Types ─── */

type LogEventType = "phase" | "updated" | "created" | "error" | "warn" | "info" | "summary";

interface LogEvent {
  type: LogEventType;
  text: string;
  raw?: string;                // исходная строка
  product?: string;            // mor-001
  productName?: string;        // Название товара
  changes?: string[];          // ["price", "rating"]
  phase?: string;              // wb-cards
  current?: number;
  total?: number;
}

/* ─── Парсинг сырого лога в структурированные события ─── */

const PHASE_NAMES: Record<string, string> = {
  "wb-cards": "Карточки WB",
  "wb-trash": "Корзина WB",
  "wb-prices": "Цены WB",
  "wb-process": "Обработка WB",
  "ozon-list": "Список Ozon",
  "ozon-info": "Информация Ozon",
  "ozon-attrs": "Атрибуты Ozon",
  "ozon-ratings": "Рейтинги Ozon",
  "ozon-process": "Обработка Ozon",
  "ozon-models": "Модели Ozon",
  "wb-models": "Модели WB",
  "archive": "Архивация",
  "done": "Готово",
};

const CHANGE_LABELS: Record<string, string> = {
  "price": "цена",
  "originalPrice": "цена без скидки",
  "rating": "рейтинг",
  "reviewsCount": "отзывы",
  "images": "фото",
  "image": "главное фото",
  "composition": "состав",
  "colorName": "цвет",
  "name": "название",
  "category": "категория",
  "salesCount": "продажи",
  "wbPrice": "цена WB",
  "wbOriginalPrice": "цена WB без скидки",
  "ozonPrice": "цена Ozon",
  "ozonOriginalPrice": "цена Ozon без скидки",
  "photoCount": "количество фото",
  "inStock": "наличие",
  "description": "описание",
  "characteristics": "характеристики",
};

function formatChangeLabel(key: string): string {
  return CHANGE_LABELS[key] || key;
}

function parseLogToEvents(log: string): LogEvent[] {
  if (!log) return [];
  const lines = log.split("\n");
  const events: LogEvent[] = [];
  let lastPhase: string | undefined;
  let phaseAdded = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // [PROGRESS] — смена фазы
    const progMatch = trimmed.match(/\[PROGRESS\]\s*(\{.*\})/);
    if (progMatch) {
      try {
        const data = JSON.parse(progMatch[1]);
        if (data.phase && data.phase !== lastPhase) {
          lastPhase = data.phase;
          phaseAdded = false;
        }
        if (data.phase === lastPhase && !phaseAdded) {
          phaseAdded = true;
          events.push({
            type: "phase",
            text: PHASE_NAMES[data.phase] || data.phase,
            phase: data.phase,
            current: data.current ?? 0,
            total: data.total ?? 0,
            raw: trimmed,
          });
        }
        continue;
      } catch { /* not json */ }
    }

    // [DETAIL] updated — обновление товара
    const detailMatch = trimmed.match(/\[DETAIL\]\s*(\{.*\})/);
    if (detailMatch) {
      try {
        const data = JSON.parse(detailMatch[1]);
        if (data.action === "updated" && data.product) {
          events.push({
            type: "updated",
            text: `${data.name || data.product}`,
            product: data.product,
            productName: data.name || "",
            changes: data.changes || [],
            raw: trimmed,
          });
          continue;
        }
        if (data.action === "created" && data.product) {
          events.push({
            type: "created",
            text: `${data.name || data.product}`,
            product: data.product,
            productName: data.name || "",
            raw: trimmed,
          });
          continue;
        }
      } catch { /* not json */ }
    }

    // ERROR — ошибка
    if (/ERROR:/i.test(trimmed)) {
      events.push({
        type: "error",
        text: trimmed.replace(/^\[?\d{2}:\d{2}:\d{2}\]?\s*/, ""),
        raw: trimmed,
      });
      continue;
    }

    // WARN — предупреждение
    if (/WARN:/i.test(trimmed)) {
      events.push({
        type: "warn",
        text: trimmed.replace(/^\[?\d{2}:\d{2}:\d{2}\]?\s*/, ""),
        raw: trimmed,
      });
      continue;
    }

    // JSON-суммари (финальные статы)
    if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.created !== undefined || parsed.updated !== undefined) {
          events.push({
            type: "summary",
            text: trimmed,
            raw: trimmed,
          });
          continue;
        }
      } catch { /* not json */ }
    }

    // Обычная информационная строка (пропускаем слишком длинные технические строки)
    if (
      trimmed.length < 200 &&
      !trimmed.startsWith("[") &&
      !trimmed.includes("node:") &&
      !trimmed.startsWith("at ")
    ) {
      events.push({
        type: "info",
        text: trimmed,
        raw: trimmed,
      });
    }
  }

  return events;
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
        } else if (data.status === "failed") {
          stopPolling(platform);
          setProgress((p) => ({ ...p, [platform]: data }));
          // При ошибке логи остаются на экране, история грузится в фоне
          setTimeout(() => loadHistory(), 500);
        } else {
          // completed — очищаем прогресс, показываем историю
          stopPolling(platform);
          setProgress((p) => ({ ...p, [platform]: null }));
          setTimeout(() => loadHistory(), 500);
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
          disabled={progress.wb?.status === "running" || progress.ozon?.status === "running"}
          onSync={() => handleSync("wb")}
          history={wbHistory}
        />

        {/* ——— Ozon ——— */}
        <PlatformCard
          platform="ozon"
          config={PLATFORM.ozon}
          lastRun={ozonLast}
          progress={progress.ozon}
          disabled={progress.wb?.status === "running" || progress.ozon?.status === "running"}
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
  const [expandedHistory, setExpandedHistory] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState(false);

  // Auto-collapse when starting a new run
  useEffect(() => {
    if (isRunning) {
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

      {/* Log from last run (collapsible) */}
      {lastRun && lastRun.log && !isRunning && !progress && (
        <LogFeed log={lastRun.log} />
      )}

      {/* Error message */}
      {lastRun && !lastRun.success && lastRun.error && !isRunning && !progress && (
        <div className={styles.errorMsg}>{lastRun.error}</div>
      )}

      {/* ─── Progress / Log Section ─── */}
      {progress && (isRunning || progress.status === "failed") && (
        <div className={styles.progressSection}>
          {/* Progress bar (only during running) */}
          {isRunning && (
            <>
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
            </>
          )}

          {/* Error banner (only when failed) */}
          {progress.status === "failed" && progress.error && (
            <div className={styles.errorMsg}>{progress.error}</div>
          )}

          {/* Живой лог — сырой вывод, автоскролл ↓ */}
          <LiveLog log={progress.log || ""} />
        </div>
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
          ) : progress?.status === "failed" ? (
            "↻ Повторить"
          ) : (
            "Запустить синхронизацию"
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

/* ─── Live Log — сырой вывод с автоскроллом ─── */

function LiveLog({ log, className }: { log: string; className?: string }) {
  const ref = useRef<HTMLPreElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Автоскролл к последним строкам при добавлении новых строк
  useEffect(() => {
    if (autoScroll && ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [log, autoScroll]);

  // Ручной скролл вверх отключает автоскролл
  const handleScroll = useCallback(() => {
    if (!ref.current) return;
    const el = ref.current;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    setAutoScroll(isAtBottom);
  }, []);

  // Считаем строки для компактного заголовка
  const lineCount = useMemo(() => log.split("\n").filter(Boolean).length, [log]);

  return (
    <div className={styles.liveLog}>
      <div className={styles.liveLogHeader}>
        <span className={styles.liveLogCount}>{lineCount} строк</span>
        {!autoScroll && (
          <button className={styles.liveLogScrollBtn} onClick={() => {
            ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
            setAutoScroll(true);
          }}>
            ↓ К последним
          </button>
        )}
      </div>
      <pre
        ref={ref}
        className={`${styles.liveLogPre} ${className || ""}`}
        onScroll={handleScroll}
      >
        <code>{log || "Ожидание вывода…"}</code>
      </pre>
    </div>
  );
}

/* ─── Log Feed — структурированная лента событий ─── */

type LogFilter = "all" | "changes" | "errors" | "progress";

function LogFeed({ log }: { log: string }) {
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState<LogFilter>("all");
  const [showRaw, setShowRaw] = useState(false);

  const events = useMemo(() => parseLogToEvents(log), [log]);

  const filtered = useMemo(() => {
    switch (filter) {
      case "changes":
        return events.filter((e) => e.type === "updated" || e.type === "created");
      case "errors":
        return events.filter((e) => e.type === "error" || e.type === "warn");
      case "progress":
        return events.filter((e) => e.type === "phase" || e.type === "summary");
      default:
        return events;
    }
  }, [events, filter]);

  const counts = useMemo(() => {
    const c = { updated: 0, created: 0, errors: 0, warns: 0, phases: 0 };
    for (const e of events) {
      if (e.type === "updated") c.updated++;
      else if (e.type === "created") c.created++;
      else if (e.type === "error") c.errors++;
      else if (e.type === "warn") c.warns++;
      else if (e.type === "phase") c.phases++;
    }
    return c;
  }, [events]);

  const filterOptions: { key: LogFilter; label: string; count?: number }[] = [
    { key: "all", label: "Всё" },
    { key: "changes", label: "Изменения", count: counts.updated + counts.created },
    { key: "errors", label: "Ошибки", count: counts.errors + counts.warns },
    { key: "progress", label: "Прогресс", count: counts.phases },
  ];

  return (
    <div className={styles.logFeed}>
      {/* Toggle */}
      <button
        className={styles.logFeedToggle}
        onClick={() => setExpanded(!expanded)}
      >
        <span className={styles.collapseArrow}>{expanded ? "▼" : "▶"}</span>
        Лог синхронизации
        <span className={styles.collapseCount}>
          {events.length} соб.
        </span>
      </button>

      {expanded && (
        <div className={styles.logFeedBody}>
          {/* Filter bar */}
          <div className={styles.logFilterBar}>
            {filterOptions.map((opt) => (
              <button
                key={opt.key}
                className={`${styles.logFilterBtn} ${filter === opt.key ? styles.logFilterBtnActive : ""}`}
                onClick={() => setFilter(opt.key)}
              >
                {opt.label}
                {opt.count !== undefined && opt.count > 0 && (
                  <span className={styles.logFilterCount}>{opt.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Event list */}
          <div className={styles.logEventList}>
            {filtered.length === 0 && (
              <div className={styles.logEmpty}>Нет событий этого типа</div>
            )}
            {filtered.map((event, i) => (
              <LogEventRow key={i} event={event} />
            ))}
          </div>

          {/* Toggle raw log */}
          <div className={styles.logRawToggle}>
            <button
              className={styles.logRawBtn}
              onClick={() => setShowRaw(!showRaw)}
            >
              {showRaw ? "▲ Скрыть технический лог" : "▼ Показать технический лог"}
            </button>
            {showRaw && (
              <pre className={styles.logRawViewer}><code>{log}</code></pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Log Event Row ─── */

function LogEventRow({ event }: { event: LogEvent }) {
  const [expanded, setExpanded] = useState(false);

  const typeClass = styles[`logEvent_${event.type}`] || "";

  const icon = {
    phase: "⟳",
    updated: "✓",
    created: "+",
    error: "✗",
    warn: "⚠",
    info: "·",
    summary: "Σ",
  }[event.type];

  const timeStr = (() => {
    if (event.raw) {
      const m = event.raw.match(/^\[?(\d{2}:\d{2}:\d{2})\]?/);
      if (m) return m[1];
    }
    return "";
  })();

  return (
    <div className={`${styles.logEvent} ${typeClass}`}>
      <div className={styles.logEventMain}>
        <span className={styles.logEventIcon}>{icon}</span>
        {timeStr && <span className={styles.logEventTime}>{timeStr}</span>}
        <span className={styles.logEventText}>
          {event.type === "updated" && event.productName && (
            <><span className={styles.logEventProduct}>{event.product}</span> «{event.productName}»</>
          )}
          {event.type === "created" && event.productName && (
            <><span className={styles.logEventProduct}>{event.product}</span> «{event.productName}»</>
          )}
          {event.type === "phase" && (
            <><strong>{event.text}</strong>{event.current !== undefined && event.total ? ` · ${event.current}/${event.total}` : ""}</>
          )}
          {event.type === "error" && (
            <span className={styles.logEventErrorText}>{event.text}</span>
          )}
          {event.type === "warn" && (
            <span>{event.text}</span>
          )}
          {event.type === "summary" && (
            <span>Итог: {(() => {
              try {
                const s = JSON.parse(event.text);
                const parts: string[] = [];
                if (s.created) parts.push(`+${s.created} создано`);
                if (s.updated) parts.push(`~${s.updated} обновлено`);
                if (s.archived) parts.push(`-${s.archived} архивировано`);
                if (s.errors) parts.push(`✗ ${s.errors} ошибок`);
                if (s.skipped) parts.push(`— ${s.skipped} пропущено`);
                return parts.join(", ") || "нет изменений";
              } catch { return event.text; }
            })()}</span>
          )}
          {event.type === "info" && (
            <span>{event.text}</span>
          )}
        </span>

        {/* Expand toggle for updated items with changes */}
        {event.type === "updated" && event.changes && event.changes.length > 0 && (
          <button
            className={styles.logEventExpand}
            onClick={() => setExpanded(!expanded)}
            title="Подробнее"
          >
            {expanded ? "−" : "+"}
          </button>
        )}
      </div>

      {/* Expanded changes */}
      {expanded && event.type === "updated" && event.changes && event.changes.length > 0 && (
        <div className={styles.logEventChanges}>
          {event.changes.map((ch) => (
            <span key={ch} className={styles.logChangeTag}>{formatChangeLabel(ch)}</span>
          ))}
        </div>
      )}
    </div>
  );
}

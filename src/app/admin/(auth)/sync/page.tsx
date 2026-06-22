"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./sync.module.css";

interface SyncReport {
  timestamp: string;
  duration: number;
  source?: string;
  added: number;
  updated: number;
  archived: number;
  skipped: number;
  total: number;
  error?: string;
  neverRun?: boolean;
  details?: {
    added: { id: string; name: string }[];
    updated: { id: string; name: string; changes: string[] }[];
    archived: { id: string; name: string }[];
  };
}

export default function AdminSyncPage() {
  const router = useRouter();
  const [status, setStatus] = useState<SyncReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncReport | null>(null);
  const [error, setError] = useState("");

  // Load last sync status
  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/sync-status");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setStatus(data);
    } catch {
      setError("Не удалось загрузить статус");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Run sync
  async function handleSync() {
    setError("");
    setResult(null);
    setSyncing(true);

    try {
      const res = await fetch("/api/admin/sync", { method: "POST" });
      const data: SyncReport = await res.json();

      if (res.ok) {
        setResult(data);
        setStatus(data);
      } else {
        setError(data.error || "Ошибка синхронизации");
      }
    } catch {
      setError("Ошибка соединения");
    } finally {
      setSyncing(false);
    }
  }

  function formatDate(ts: string) {
    try {
      return new Date(ts).toLocaleString("ru-RU");
    } catch {
      return ts;
    }
  }

  const displayReport = result || status;

  const sourceLabel = (s: string | undefined) => {
    if (s === "content-api") return "Content API";
    if (s === "card-api") return "card.wb.ru";
    return "";
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Синхронизация с WB</h1>
        <p className={styles.subtitle}>
          Автоматическое обновление товаров из Wildberries
        </p>
      </header>

      {/* ——— Actions ——— */}
      <div className={styles.actions}>
        <button
          className={styles.syncBtn}
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing ? "Синхронизация..." : "Запустить синхронизацию"}
        </button>
      </div>

      {syncing && (
        <div className={styles.progress}>
          <div className={styles.spinner} />
          <span>Загрузка данных с WB...</span>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {/* ——— Result ——— */}
      {result && !result.error && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Результат</h2>
          <div className={styles.resultGrid}>
            <div className={styles.resultCard}>
              <span className={styles.resultValue}>{result.added}</span>
              <span className={styles.resultLabel}>Добавлено</span>
            </div>
            <div className={styles.resultCard}>
              <span className={styles.resultValue}>{result.updated}</span>
              <span className={styles.resultLabel}>Обновлено</span>
            </div>
            <div className={styles.resultCard}>
              <span className={styles.resultValue}>{result.archived}</span>
              <span className={styles.resultLabel}>Архивировано</span>
            </div>
            <div className={styles.resultCard}>
              <span className={styles.resultValue}>{result.total}</span>
              <span className={styles.resultLabel}>Всего в каталоге</span>
            </div>
          </div>
          <p className={styles.duration}>
            За {Math.round(result.duration / 1000)}с
            {result.source && (
              <> · Источник: <strong>{sourceLabel(result.source)}</strong></>
            )}
          </p>
        </section>
      )}

      {result?.error && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Ошибка</h2>
          <p className={styles.errorMsg}>{result.error}</p>
        </section>
      )}

      {/* ——— Details ——— */}
      {result?.details && (
        <>
          {result.details.added.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                Добавленные товары ({result.details.added.length})
              </h2>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Название</th>
                  </tr>
                </thead>
                <tbody>
                  {result.details.added.map((item) => (
                    <tr key={item.id}>
                      <td className={styles.cellId}>{item.id}</td>
                      <td>{item.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {result.details.updated.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                Обновлённые товары ({result.details.updated.length})
              </h2>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Название</th>
                    <th>Что изменено</th>
                  </tr>
                </thead>
                <tbody>
                  {result.details.updated.map((item) => (
                    <tr key={item.id}>
                      <td className={styles.cellId}>{item.id}</td>
                      <td>{item.name}</td>
                      <td>{item.changes.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {result.details.archived.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                Архивированные товары ({result.details.archived.length})
              </h2>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Название</th>
                  </tr>
                </thead>
                <tbody>
                  {result.details.archived.map((item) => (
                    <tr key={item.id}>
                      <td className={styles.cellId}>{item.id}</td>
                      <td>{item.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </>
      )}

      {/* ——— Last sync info ——— */}
      {displayReport && !result && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {displayReport.neverRun
              ? "Синхронизация ещё не запускалась"
              : `Последняя синхронизация: ${formatDate(displayReport.timestamp)}`}
          </h2>

          {!displayReport.neverRun && (
            <>
              <div className={styles.resultGrid}>
                <div className={styles.resultCard}>
                  <span className={styles.resultValue}>{displayReport.added}</span>
                  <span className={styles.resultLabel}>Добавлено</span>
                </div>
                <div className={styles.resultCard}>
                  <span className={styles.resultValue}>{displayReport.updated}</span>
                  <span className={styles.resultLabel}>Обновлено</span>
                </div>
                <div className={styles.resultCard}>
                  <span className={styles.resultValue}>{displayReport.archived}</span>
                  <span className={styles.resultLabel}>Архивировано</span>
                </div>
                <div className={styles.resultCard}>
                  <span className={styles.resultValue}>{displayReport.total}</span>
                  <span className={styles.resultLabel}>Всего</span>
                </div>
              </div>
              <p className={styles.duration}>
                За {Math.round(displayReport.duration / 1000)}с
              </p>
            </>
          )}
        </section>
      )}
    </div>
  );
}

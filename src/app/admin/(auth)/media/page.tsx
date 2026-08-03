"use client";

import { useCallback, useEffect, useState } from "react";
import { compressImage } from "@/lib/image-compress";
import { blobUrl } from "@/lib/blob";
import styles from "./media.module.css";

interface MediaItem {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
}

interface MediaUsage {
  where: string;
  slug?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<MediaItem | null>(null);

  const load = useCallback(async (query = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/media?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Не удалось загрузить список");
      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount — легитимный паттерн: загрузка списка при монтировании.
  // Первый setState (setLoading) здесь синхронный по определению; React 19
  // автоматически батчит повторные рендеры, каскада нет.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      // Сжимаем в браузере (WebP, max 1600px) — фото с камеры грузятся в разы быстрее
      const compressed = await compressImage(file);
      const body = new FormData();
      body.append("file", compressed);
      const res = await fetch("/api/admin/media", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Загрузка не удалась");
      await load(q);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(item: MediaItem) {
    setError("");
    try {
      const res = await fetch(`/api/admin/media/delete?url=${encodeURIComponent(item.url)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          const usages: MediaUsage[] = data.usages || [];
          setError(
            `Файл используется: ${usages.map((u) => u.where).join(", ")}. Сначала замените его в этих местах.`,
          );
        } else {
          throw new Error(data.error || "Не удалось удалить файл");
        }
        return;
      }
      setItems((prev) => prev.filter((i) => i.url !== item.url));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setConfirmDelete(null);
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setError("Не удалось скопировать URL");
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Медиа</h1>
        <p className={styles.subtitle}>
          Все загруженные изображения. Используйте их в настройках и карточках товаров.
        </p>
      </header>

      <div className={styles.toolbar}>
        <input
          className={styles.search}
          type="search"
          placeholder="Поиск по имени файла..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") load(q);
          }}
        />
        <label className={styles.uploadBtn}>
          {uploading ? "Загрузка..." : "Загрузить"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={handleUpload}
            hidden
          />
        </label>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <p className={styles.empty}>Загрузка...</p>
      ) : items.length === 0 ? (
        <p className={styles.empty}>
          {q ? "Ничего не найдено" : "Пока пусто. Загрузите первое изображение."}
        </p>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item.url} className={styles.card}>
              <img
                src={blobUrl(item.url)}
                alt={item.pathname}
                className={styles.thumb}
                loading="lazy"
              />
              <div className={styles.cardInfo}>
                <span className={styles.name} title={item.pathname}>
                  {item.pathname.split("/").pop()}
                </span>
                <span className={styles.meta}>
                  {formatSize(item.size)} · {formatDate(item.uploadedAt)}
                </span>
              </div>
              <div className={styles.cardActions}>
                <button
                  className={styles.copyBtn}
                  onClick={() => copyUrl(item.url)}
                >
                  {copied === item.url ? "Скопировано ✓" : "Копировать URL"}
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => setConfirmDelete(item)}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <div className={styles.modal}>
          <div className={styles.modalBox}>
            <h3 className={styles.modalTitle}>Удалить файл?</h3>
            <p className={styles.modalName}>{confirmDelete.pathname.split("/").pop()}</p>
            <p className={styles.modalHint}>
              Если файл используется на сайте, удаление будет отклонено.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setConfirmDelete(null)}
              >
                Отмена
              </button>
              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(confirmDelete)}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
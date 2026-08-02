"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./media-picker.module.css";

interface MediaItem {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
}

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

/**
 * Модалка-выборщик изображений из медиа-хранилища.
 * Показывает сетку, поиск и загрузку; клик по картинке → onSelect(url).
 * Используется в настройках (hero, категории) и редакторе товара.
 */
export default function MediaPicker({ open, onClose, onSelect }: MediaPickerProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

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

  // Сброс поиска + загрузка при открытии модалки — легитимный паттерн:
  // setQ("") синхронный по определению, React 19 батчит рендеры, каскада нет.
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQ("");
      load();
    }
  }, [open, load]);

  if (!open) return null;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
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

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.box} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h3 className={styles.title}>Выбрать изображение</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </header>

        <div className={styles.toolbar}>
          <input
            className={styles.search}
            type="search"
            placeholder="Поиск..."
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

        <div className={styles.body}>
          {loading ? (
            <p className={styles.empty}>Загрузка...</p>
          ) : items.length === 0 ? (
            <p className={styles.empty}>
              {q ? "Ничего не найдено" : "Пока пусто. Загрузите изображение."}
            </p>
          ) : (
            <div className={styles.grid}>
              {items.map((item) => (
                <button
                  key={item.url}
                  className={styles.item}
                  onClick={() => onSelect(item.url)}
                  title={item.pathname}
                >
                  <img src={item.url} alt={item.pathname} loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
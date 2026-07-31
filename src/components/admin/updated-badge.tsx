"use client";

import { useState } from "react";
import styles from "./updated-badge.module.css";

function pluralRu(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

/** «только что» / «5 минут назад» / «3 часа назад» / «2 дня назад», иначе «31.07.2026» */
export function formatUpdatedAt(iso: string, nowMs: number): string {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return iso;

  const diff = nowMs - d;
  if (diff < 60_000) return "только что";
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} ${pluralRu(mins, "минуту", "минуты", "минут")} назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ${pluralRu(hours, "час", "часа", "часов")} назад`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${pluralRu(days, "день", "дня", "дней")} назад`;
  return new Date(d).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/**
 * Плашка «обновлён N назад» — когда товар последний раз менялся
 * (любой записью: синхронизация, ручная правка, статус).
 * Свежие (< 24 ч) — зелёные, старые — нейтральные. Тултип — полная дата и время.
 */
export default function UpdatedBadge({ iso, className }: { iso?: string | null; className?: string }) {
  // Снимок «сейчас» на момент монтирования — без Date.now() в рендере
  const [nowMs] = useState(() => Date.now());

  if (!iso) return <span className={styles.muted}>—</span>;

  const fresh = nowMs - new Date(iso).getTime() < 24 * 3600 * 1000;

  return (
    <span
      className={`${styles.updatedBadge} ${fresh ? styles.updatedBadgeRecent : ""}${className ? ` ${className}` : ""}`}
      title={new Date(iso).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}
    >
      {formatUpdatedAt(iso, nowMs)}
    </span>
  );
}

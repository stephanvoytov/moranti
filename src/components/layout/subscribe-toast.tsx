"use client";

import { useEffect, useState } from "react";
import styles from "./subscribe-toast.module.css";

/* Параметры, которыми API редиректит после клика по ссылке из письма:
   /api/subscribe/confirm → /?subscribed=1
   /api/subscribe/unsubscribe → /?unsubscribed=1 */
const AUTO_HIDE_MS = 7000;

type Kind = "subscribed" | "unsubscribed";

const TEXTS: Record<Kind, { title: string; text: string }> = {
  subscribed: {
    title: "Подписка подтверждена",
    text: "Первое письмо с новинками придёт на вашу почту.",
  },
  unsubscribed: {
    title: "Вы отписались от рассылки",
    text: "Больше не будем присылать письма на этот адрес.",
  },
};

export default function SubscribeToast() {
  const [kind, setKind] = useState<Kind | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let next: Kind | null = null;
    if (params.get("subscribed") === "1") next = "subscribed";
    else if (params.get("unsubscribed") === "1") next = "unsubscribed";
    if (!next) return;

    /* Чистим URL сразу: перезагрузка и шаринг ссылки не должны повторять тост.
       Сам показ — на следующем тике (правило react-hooks против синхронного
       setState в теле эффекта). */
    window.history.replaceState(window.history.state ?? null, "", window.location.pathname);

    const showT = setTimeout(() => setKind(next), 0);
    const hideT = setTimeout(() => setKind(null), AUTO_HIDE_MS);
    return () => {
      clearTimeout(showT);
      clearTimeout(hideT);
    };
  }, []);

  if (!kind) return null;

  const t = TEXTS[kind];

  return (
    <aside className={styles.toast} role="status">
      <span className={styles.icon} aria-hidden="true">
        {kind === "subscribed" ? (
          <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
            <path d="M1 5.5L5 9.5L13 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </span>
      <div>
        <p className={styles.title}>{t.title}</p>
        <p className={styles.text}>{t.text}</p>
      </div>
      <button className={styles.close} onClick={() => setKind(null)} aria-label="Закрыть">
        ×
      </button>
    </aside>
  );
}

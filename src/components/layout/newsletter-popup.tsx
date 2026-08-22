"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./newsletter-popup.module.css";

const DONE_KEY = "moranti_nl_popup_done";
const DELAY_MS = 20000;

type Status = "idle" | "sending" | "success" | "error";

export default function NewsletterPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DONE_KEY)) return;

    const timer = setTimeout(trigger, DELAY_MS);

    function trigger() {
      if (triggeredRef.current) return;
      if (localStorage.getItem(DONE_KEY)) return;
      triggeredRef.current = true;
      clearTimeout(timer);
      document.removeEventListener("mouseout", onExit);
      setOpen(true);
    }

    // Exit-intent: курсор ушёл за верхний край окна (в адресную строку/закрытие)
    function onExit(e: MouseEvent) {
      if (e.clientY <= 0 && !e.relatedTarget) trigger();
    }

    document.addEventListener("mouseout", onExit);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseout", onExit);
    };
  }, [pathname]);

  function dismiss() {
    localStorage.setItem(DONE_KEY, "1");
    setOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Не удалось подписаться.");
        return;
      }
      setStatus("success");
      setMessage("Спасибо! Проверьте почту и подтвердите подписку.");
      localStorage.setItem(DONE_KEY, "1");
      setTimeout(() => setOpen(false), 2500);
    } catch {
      setStatus("error");
      setMessage("Ошибка сети. Попробуйте позже.");
    }
  }

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={dismiss} role="presentation">
      <div
        className={styles.card}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nl-popup-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.close} onClick={dismiss} aria-label="Закрыть">
          ×
        </button>
        <h2 id="nl-popup-title" className={styles.title}>
          Подпишитесь на новинки
        </h2>
        <p className={styles.text}>
          Новые коллекции, скидки, акции и промокоды — пришлём на почту.
        </p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="email"
            required
            placeholder="ваш@email.ru"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email для подписки"
          />
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className={styles.honeypot}
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
          <button
            className={styles.submit}
            type="submit"
            disabled={status === "sending"}
          >
            {status === "sending" ? "…" : "Подписаться"}
          </button>
        </form>
        {status === "success" && <p className={styles.success}>{message}</p>}
        {status === "error" && <p className={styles.error}>{message}</p>}
      </div>
    </div>
  );
}

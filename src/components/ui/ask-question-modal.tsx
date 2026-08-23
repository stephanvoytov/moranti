"use client";

import { useEffect, useState } from "react";
import { SUPPORT_EMAIL } from "@/config/legal";
import styles from "./ask-question-modal.module.css";

interface AskQuestionModalProps {
  open: boolean;
  onClose: () => void;
  /** Slug товара — подставляется автоматически со страницы товара */
  productSlug?: string;
  productName?: string;
  /** Предзаполненный текст вопроса (страница товара) */
  initialQuestion?: string;
}

type Status = "idle" | "sending" | "success" | "error";

export default function AskQuestionModal({
  open,
  onClose,
  productSlug,
  productName,
  initialQuestion = "",
}: AskQuestionModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState(initialQuestion);
  const [website, setWebsite] = useState(""); // honeypot
  const [subscribe, setSubscribe] = useState(false); // галка рассылки
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  // Закрытие по Escape + блокировка скролла
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Сброс формы при открытии — паттерн «adjust state when prop changes»
  // (без useEffect: setState в эффекте даёт каскадные рендеры)
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setStatus("idle");
      setError("");
      setQuestion(initialQuestion);
      setSubscribe(false);
    }
  }

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, question, productSlug, website, subscribe }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Не удалось отправить вопрос");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз.");
      setStatus("error");
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Задать вопрос"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.close}
          aria-label="Закрыть"
          onClick={onClose}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {status === "success" ? (
          <div className={styles.success}>
            <h3 className={styles.title}>Вопрос отправлен</h3>
            <p className={styles.successText}>
              Ответим вам на почту <b>{email}</b> в ближайшее время.
            </p>
            <button type="button" className={styles.submit} onClick={onClose}>
              Хорошо
            </button>
          </div>
        ) : (
          <>
            <h3 className={styles.title}>Задать вопрос</h3>
            {productName && (
              <p className={styles.productName}>{productName}</p>
            )}
            <p className={styles.directEmail}>
              Или напишите напрямую:{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            </p>
            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Honeypot — скрытое поле для ботов */}
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className={styles.honeypot}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <label className={styles.label}>
                Ваше имя (необязательно)
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                  placeholder="Как к вам обращаться"
                  autoComplete="name"
                />
              </label>

              <label className={styles.label}>
                Ваш email
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>

              <label className={styles.label}>
                Вопрос
                <textarea
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={5}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className={styles.textarea}
                  placeholder="Напишите ваш вопрос — ответим на почту"
                />
              </label>

              {status === "error" && (
                <p className={styles.error}>{error}</p>
              )}

              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={subscribe}
                  onChange={(e) => setSubscribe(e.target.checked)}
                />
                <span>Подписаться на рассылку: новые коллекции, скидки, акции и промокоды</span>
              </label>

              <button
                type="submit"
                disabled={status === "sending"}
                className={styles.submit}
              >
                {status === "sending" ? "Отправляем…" : "Отправить вопрос"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

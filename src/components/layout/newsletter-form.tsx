"use client";

import { useState } from "react";
import styles from "./newsletter-form.module.css";

type Status = "idle" | "sending" | "success" | "error";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

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
      setEmail("");
      setWebsite("");
    } catch {
      setStatus("error");
      setMessage("Ошибка сети. Попробуйте позже.");
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.label} htmlFor="newsletter-email">
        Подписка на новинки
      </label>
      <p className={styles.hint}>
        Пишем о новых коллекциях, скидках и акциях. Нажимая «Подписаться», вы
        соглашаетесь на рассылку.
      </p>
      <div className={styles.row}>
        <input
          id="newsletter-email"
          className={styles.input}
          type="email"
          required
          placeholder="ваш@email.ru"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email для подписки"
        />
        <button
          className={styles.submit}
          type="submit"
          disabled={status === "sending"}
        >
          {status === "sending" ? "…" : "Подписаться"}
        </button>
      </div>
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
      {status === "success" && <p className={styles.success}>{message}</p>}
      {status === "error" && <p className={styles.error}>{message}</p>}
    </form>
  );
}

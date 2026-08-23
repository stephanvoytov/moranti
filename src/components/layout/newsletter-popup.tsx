"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useFavorites } from "@/lib/favorites-context";
import { useCart } from "@/lib/cart-context";
import styles from "./newsletter-popup.module.css";

/* Навсегда скрыть (подписка или «Больше не показывать») */
const DONE_KEY = "moranti_nl_popup_done";
/* ✕/Escape → спрятать на 15 дней (timestamp) */
const SNOOZE_KEY = "moranti_nl_popup_snooze";
const SNOOZE_MS = 15 * 24 * 60 * 60 * 1000;
/* Кап: не больше одного показа за сессию, даже без закрытия */
const SHOWN_KEY = "moranti_nl_popup_shown";
/* Просмотренные страницы за сессию — сигнал вовлечённости */
const PAGES_KEY = "moranti_nl_pages";
/* Exit-intent уже использован в этой сессии */
const EXIT_KEY = "moranti_nl_popup_exit";

const BLOCKED_PREFIXES = ["/admin", "/cart", "/checkout"];
const TICK_MS = 5000;

/* Пороги вовлечённости для триггеров */
const PAGES_NEEDED = 3;
const PAGES_MIN_TIME_S = 45;
const IDLE_TIME_S = 60;
const CART_TIME_S = 30;
const EXIT_MIN_PAGES = 2;
const EXIT_MIN_TIME_S = 30;

type Status = "idle" | "sending" | "success" | "error";

function lsGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function lsSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function ssGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function ssSet(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {}
}

function suppressed(): boolean {
  if (lsGet(DONE_KEY)) return true;
  const snoozedUntil = Number(lsGet(SNOOZE_KEY));
  return Number.isFinite(snoozedUntil) && snoozedUntil > Date.now();
}

function viewedPages(): number {
  return Number(ssGet(PAGES_KEY)) || 0;
}

export default function NewsletterPopup() {
  const pathname = usePathname();
  const { count: favCount } = useFavorites();
  const { count: cartCount } = useCart();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const startedAtRef = useRef(0);
  const lastPathRef = useRef<string | null>(null);
  const armedRef = useRef(false);
  const exitUsedRef = useRef(false);
  const savedRef = useRef(0);
  const blockedRef = useRef(false);
  const openStateRef = useRef(false);

  useEffect(() => {
    savedRef.current = favCount + cartCount;
  }, [favCount, cartCount]);

  useEffect(() => {
    openStateRef.current = open;
  }, [open]);

  /* Счётчик страниц за сессию; на критичных маршрутах карточка не работает */
  useEffect(() => {
    if (!pathname) return;
    blockedRef.current = BLOCKED_PREFIXES.some((p) => pathname.startsWith(p));
    if (!blockedRef.current && lastPathRef.current !== pathname) {
      lastPathRef.current = pathname;
      ssSet(PAGES_KEY, String(viewedPages() + 1));
    }
    if (blockedRef.current) setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname.startsWith("/admin")) return;
    if (suppressed()) return;
    if (ssGet(SHOWN_KEY)) return;

    startedAtRef.current = Date.now();
    armedRef.current = false;
    exitUsedRef.current = Boolean(ssGet(EXIT_KEY));

    function elapsedS(): number {
      return (Date.now() - startedAtRef.current) / 1000;
    }

    function fire() {
      if (armedRef.current) return;
      armedRef.current = true;
      ssSet(SHOWN_KEY, "1");
      cleanup();
      setOpen(true);
    }

    function canShow(): boolean {
      return !armedRef.current && !suppressed() && !blockedRef.current && !openStateRef.current;
    }

    function evaluate() {
      if (!canShow()) return;
      const pages = viewedPages();
      const t = elapsedS();

      if (pages >= PAGES_NEEDED && t >= PAGES_MIN_TIME_S) return fire();
      if (t >= IDLE_TIME_S) return fire();
      if (savedRef.current >= 1 && t >= CART_TIME_S) return fire();
    }

    /* Exit-intent: только десктоп, только с вовлечённостью, один раз за сессию */
    function onExit(e: MouseEvent) {
      if (!canShow() || exitUsedRef.current) return;
      if (e.clientY > 0 || e.relatedTarget) return;
      if (!window.matchMedia("(pointer: fine)").matches) return;
      if (viewedPages() < EXIT_MIN_PAGES || elapsedS() < EXIT_MIN_TIME_S) return;
      exitUsedRef.current = true;
      ssSet(EXIT_KEY, "1");
      fire();
    }

    evaluate();
    const tick = setInterval(evaluate, TICK_MS);
    document.addEventListener("mouseout", onExit);

    function cleanup() {
      clearInterval(tick);
      document.removeEventListener("mouseout", onExit);
    }

    return cleanup;
  }, []);

  /* Escape закрывает открытую карточку (со снупсом на 15 дней) */
  useEffect(() => {
    if (!open) return;
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        lsSet(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open]);

  function dismiss() {
    lsSet(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
    setOpen(false);
  }

  function dismissForever() {
    lsSet(DONE_KEY, "1");
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
      setMessage(
        "Спасибо! Письмо для подтверждения отправлено — проверьте почту. " +
          "Если письма нет во «Входящих», посмотрите папку «Спам».",
      );
      lsSet(DONE_KEY, "1");
      setTimeout(() => setOpen(false), 2500);
    } catch {
      setStatus("error");
      setMessage("Ошибка сети. Попробуйте позже.");
    }
  }

  if (!open) return null;

  return (
    <aside className={styles.card} aria-label="Подписка на новинки">
      <button className={styles.close} onClick={dismiss} aria-label="Закрыть">
        ×
      </button>
      <h2 className={styles.title}>Подпишитесь на новинки</h2>
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
        <div className={styles.actions}>
          <button
            className={styles.submit}
            type="submit"
            disabled={status === "sending"}
          >
            {status === "sending" ? "…" : "Подписаться"}
          </button>
          <button
            type="button"
            className={styles.never}
            onClick={dismissForever}
          >
            Больше не показывать
          </button>
        </div>
      </form>
      {status === "success" && <p className={styles.success}>{message}</p>}
      {status === "error" && <p className={styles.error}>{message}</p>}
    </aside>
  );
}

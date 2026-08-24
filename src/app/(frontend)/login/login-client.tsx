"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import styles from "../auth.module.css";

export default function LoginClient() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [magicBusy, setMagicBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNote("");
    setBusy(true);
    try {
      await login(email, password);
      router.push("/account");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function magicLogin() {
    setError("");
    setNote("");
    if (!email) {
      setError("Введите email, чтобы получить ссылку для входа");
      return;
    }
    setMagicBusy(true);
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Не удалось отправить ссылку");
        return;
      }
      setNote("Ссылка для входа отправлена на почту.");
    } catch {
      setError("Сетевая ошибка");
    } finally {
      setMagicBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <h1 className={styles.title}>Вход</h1>
        <p className={styles.sub}>Войдите в личный кабинет Moranti</p>

        <form className={styles.form} onSubmit={submit}>
          <Field
            label="Email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@mail.ru"
            autoComplete="email"
          />
          <Field
            label="Пароль"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            autoComplete="current-password"
          />

          {error && <p className={styles.formError}>{error}</p>}
          {note && <p className={styles.formNote}>{note}</p>}

          <Button type="submit" variant="primary" fullWidth disabled={busy}>
            {busy ? "Входим…" : "Войти"}
          </Button>
        </form>

        <div className={styles.divider}>или</div>
        <Button
          variant="outline"
          fullWidth
          onClick={magicLogin}
          disabled={magicBusy}
        >
          {magicBusy ? "Отправляем…" : "Войти по ссылке (без пароля)"}
        </Button>

        <p className={styles.links}>
          Нет аккаунта? <Link href="/register">Зарегистрироваться</Link>
        </p>
      </section>
    </div>
  );
}

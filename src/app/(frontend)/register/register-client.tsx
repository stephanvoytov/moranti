"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import styles from "../auth.module.css";

export default function RegisterClient() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register({ email, password, firstName, phone });
      router.push("/account");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <h1 className={styles.title}>Регистрация</h1>
        <p className={styles.sub}>Создайте аккаунт в Moranti</p>

        <form className={styles.form} onSubmit={submit}>
          <Field
            label="Имя"
            name="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Как к вам обращаться"
            autoComplete="given-name"
          />
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
            label="Телефон"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+7 ..."
            autoComplete="tel"
          />
          <Field
            label="Пароль"
            name="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="минимум 6 символов"
            autoComplete="new-password"
          />

          {error && <p className={styles.formError}>{error}</p>}

          <Button type="submit" variant="primary" fullWidth disabled={busy}>
            {busy ? "Регистрируем…" : "Зарегистрироваться"}
          </Button>
        </form>

        <p className={styles.links}>
          Уже есть аккаунт? <Link href="/login">Войти</Link>
        </p>
      </section>
    </div>
  );
}

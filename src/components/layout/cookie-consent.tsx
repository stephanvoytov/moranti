"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./cookie-consent.module.css";

const STORAGE_KEY = "cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- чтение localStorage после гидратации
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      /* localStorage недоступен — баннер не показываем */
    }
  }, []);

  if (!visible) return null;

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  return (
    <div className={styles.bar} role="dialog" aria-label="Использование файлов cookie">
      <p className={styles.text}>
        Мы используем cookie для работы сайта и статистики посещаемости.
        Продолжая пользоваться сайтом, вы соглашаетесь с этим.{" "}
        <Link href="/privacy" className={styles.link}>
          Подробнее
        </Link>
      </p>
      <button type="button" className={styles.btn} onClick={accept}>
        Хорошо
      </button>
    </div>
  );
}

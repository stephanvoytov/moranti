"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

/**
 * Минимальный клиентский компонент — кнопка входа в админку.
 * Использует localStorage, поэтому только на клиенте.
 */
export default function HomeClient() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem("moranti_admin") === "1");
  }, []);

  if (!isAdmin) return null;

  return (
    <Link href="/admin/" className={styles.adminFab} title="Панель управления">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    </Link>
  );
}

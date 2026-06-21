"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useFavorites } from "@/lib/favorites-context";
import styles from "./header.module.css";

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { count } = useFavorites();

  // Не показывать хедер на страницах админки
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          Moranti
        </Link>

        <nav
          className={`${styles.nav}${menuOpen ? " " + styles.open : ""}`}
          id="mainNav"
        >
          <Link href="/catalog?sort=new" onClick={() => setMenuOpen(false)}>
            Новинки
          </Link>
          <Link href="/catalog" onClick={() => setMenuOpen(false)}>
            Каталог
          </Link>
          <a href="https://www.wildberries.ru/brands/moranti" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>
            Wildberries
          </a>
          <a href="https://www.ozon.ru/seller/moranti/?miniapp=seller_4205030" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>
            Ozon
          </a>
        </nav>

        <div
          className={`${styles.navBackdrop}${menuOpen ? " " + styles.open : ""}`}
          onClick={() => setMenuOpen(false)}
        />

        <div className={styles.actions}>
          <Link href="/favorites" className={styles.favWrap} aria-label="Избранное">
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {count > 0 && <span className={styles.favBadge}>{count}</span>}
          </Link>

          <button
            className={styles.menuToggle}
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menuOpen}
            aria-controls="mainNav"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
              <line x1="1" y1="2" x2="21" y2="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="1" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="1" y1="16" x2="21" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>
    </>
  );
}

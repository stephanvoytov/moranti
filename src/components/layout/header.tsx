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

  // Не показывать главный хедер на страницах админки
  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className={styles.header}>
      {/* ——— Top Bar ——— */}
      <div className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <span>О бренде</span>
          <span>Магазин</span>
          <span>Контакты</span>
        </div>

        <a href="/" className={styles.logo}>
          Moranti
        </a>

        <div className={styles.topbarRight}>
          <div className={styles.search}>
            <input type="text" placeholder="Поиск" readOnly />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
          <Link href="/favorites" className={styles.favLink} aria-label="Избранное">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            {count > 0 && <span className={styles.favBadge}>{count}</span>}
          </Link>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        </div>
      </div>

      {/* ——— Navigation Bar ——— */}
      <nav className={styles.nav}>
        <button
          className={styles.burger}
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>
          )}
        </button>

        <ul className={styles.navLinks}>
          <li><a href="/">Главная</a></li>
          <li><a href="/#catalog">Каталог</a></li>
          <li><a href="https://www.instagram.com/_utrends/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
          <li><a href="https://www.wildberries.ru/brands/moranti" target="_blank" rel="noopener noreferrer">Wildberries</a></li>
          <li><a href="https://www.ozon.ru/seller/moranti/?miniapp=seller_4205030" target="_blank" rel="noopener noreferrer">Ozon</a></li>
        </ul>
      </nav>

      {/* ——— Mobile Menu Panel ——— */}
      <div className={`${styles.mobileMenu}${menuOpen ? ' ' + styles.mobileMenuOpen : ''}`}>
        <ul className={styles.mobileLinks}>
            <li><a href="/" onClick={() => setMenuOpen(false)}>Главная</a></li>
            <li><a href="/#catalog" onClick={() => setMenuOpen(false)}>Каталог</a></li>
            <li><a href="/favorites" onClick={() => setMenuOpen(false)}>Избранное{count > 0 ? ` (${count})` : ''}</a></li>
          <li><a href="https://www.instagram.com/_utrends/" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>Instagram</a></li>
          <li><a href="https://www.wildberries.ru/brands/moranti" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>Wildberries</a></li>
          <li><a href="https://www.ozon.ru/seller/moranti/?miniapp=seller_4205030" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>Ozon</a></li>
        </ul>
      </div>
    </header>
  );
}

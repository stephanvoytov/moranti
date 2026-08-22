"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useFavorites } from "@/lib/favorites-context";
import { useCart } from "@/lib/cart-context";
import { MARKETPLACE_URLS } from "@/lib/marketplaces";
import { seoConfig } from "@/config/seo";
import styles from "./header.module.css";

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const { count } = useFavorites();
  const { count: cartCount } = useCart();

  // Закрывает меню и сворачивает аккордеон «Каталог»
  const closeMenu = () => {
    setMenuOpen(false);
    setCatalogOpen(false);
  };

  // Закрывать меню при навигации назад/вперёд (popstate). Клики по ссылкам
  // закрывают меню через closeMenu() в onClick — эффект на pathname не нужен.
  useEffect(() => {
    const onPopState = () => {
      setMenuOpen(false);
      setCatalogOpen(false);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Блокировать скролл страницы, пока мобильное меню открыто
  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [menuOpen]);

  // Закрытие мобильного меню по Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // Не показывать хедер на страницах админки
  if (pathname?.startsWith("/admin")) return null;

  const categories = Object.entries(seoConfig.categories);

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
          <Link href="/" onClick={() => setMenuOpen(false)}>
            Главная
          </Link>
          <Link href="/new" onClick={() => setMenuOpen(false)}>
            Новинки
          </Link>
          <div
            className={styles.catalogItem}
            onMouseEnter={() => {
              // На мобиле hover недоступен — аккордеоном управляет только клик.
              // Без этой проверки mouseenter при тапе/клике конфликтует с onClick
              // и аккордеон не раскрывается.
              if (!window.matchMedia("(max-width: 768px)").matches) {
                setCatalogOpen(true);
              }
            }}
            onMouseLeave={() => {
              if (!window.matchMedia("(max-width: 768px)").matches) {
                setCatalogOpen(false);
              }
            }}
          >
            <div className={styles.catalogTop}>
              <Link
                href="/catalog"
                className={catalogOpen ? styles.catalogLinkOpen : undefined}
                onClick={() => setMenuOpen(false)}
              >
                Каталог
              </Link>
              <button
                type="button"
                className={`${styles.catalogToggle}${catalogOpen ? " " + styles.catalogToggleOpen : ""}`}
                aria-label={catalogOpen ? "Скрыть список моделей" : "Показать список моделей"}
                aria-expanded={catalogOpen}
                onClick={() => setCatalogOpen((v) => !v)}
              >
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div
              className={`${styles.dropdown}${catalogOpen ? " " + styles.dropdownOpen : ""}`}
            >
              <div className={styles.dropdownInner}>
                {categories.map(([slug, cat]) => (
                  <Link
                    key={slug}
                    href={`/catalog/${slug}`}
                    onClick={() => {
                      setMenuOpen(false);
                      setCatalogOpen(false);
                    }}
                  >
                    {cat.name}
                  </Link>
                ))}
                {/* Маркетплейсы — в конце списка, с разделителем */}
                <span className={styles.dropdownDivider} />
                <a
                  href={MARKETPLACE_URLS.wbSeller}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setMenuOpen(false);
                    setCatalogOpen(false);
                  }}
                >
                  Wildberries
                </a>
                <a
                  href={MARKETPLACE_URLS.ozonSeller}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setMenuOpen(false);
                    setCatalogOpen(false);
                  }}
                >
                  Ozon
                </a>
              </div>
            </div>
          </div>
          <Link href="/about" onClick={() => setMenuOpen(false)}>
            О бренде
          </Link>
          <Link href="/contacts" onClick={() => setMenuOpen(false)}>
            Контакты
          </Link>
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

          <Link href="/cart" className={styles.favWrap} aria-label="Корзина">
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6h15l-1.5 9h-12L6 6z" />
              <path d="M6 6L5 3H2" />
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="17" cy="20" r="1.5" />
            </svg>
            {cartCount > 0 && <span className={styles.favBadge}>{cartCount}</span>}
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

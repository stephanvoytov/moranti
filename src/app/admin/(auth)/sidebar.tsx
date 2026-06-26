"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import styles from "./sidebar.module.css";

const NAV_ITEMS = [
  { href: "/admin", label: "Дашборд", icon: "▦" },
  { href: "/admin/models", label: "Модели", icon: "◪" },
  { href: "/admin/products", label: "Товары (варианты)", icon: "☰" },
  { href: "/admin/sync", label: "Синхронизация", icon: "↻" },
  { href: "/admin/settings", label: "Настройки", icon: "⚙" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(true);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <>
      {/* Mobile burger */}
      <button
        className={styles.burger}
        onClick={() => setCollapsed((c) => !c)}
        aria-label="Toggle menu"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 12h18" /><path d="M3 6h18" /><path d="M3 18h18" />
        </svg>
      </button>

      {/* Overlay */}
      {!collapsed && (
        <div className={styles.overlay} onClick={() => setCollapsed(true)} />
      )}

      <aside
        className={`${styles.sidebar} ${!collapsed ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.brand}>
          <Link href="/admin" onClick={() => setCollapsed(true)}>
            Moranti
          </Link>
          <span className={styles.brandLabel}>Admin</span>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navActive : ""}`}
                onClick={() => setCollapsed(true)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.footer}>
          <Link href="/" className={styles.siteLink} target="_blank">
            ← На сайт
          </Link>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </aside>
    </>
  );
}

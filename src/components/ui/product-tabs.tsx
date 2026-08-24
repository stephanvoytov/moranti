"use client";

/* =============================================
   Moranti — Product Tabs
   ============================================= */

import { useState, useEffect, useId, type ReactNode } from "react";
import styles from "./product-tabs.module.css";

interface Tab {
  label: string;
  content: ReactNode;
}

interface Props {
  tabs: Tab[];
}

export default function ProductTabs({ tabs }: Props) {
  const [active, setActive] = useState(0);
  const id = useId();

  // Якорь #otzyvy (клик по рейтингу) — открываем вкладку отзывов:
  // и при загрузке страницы с хешем, и при клике по ссылке после загрузки
  useEffect(() => {
    const applyHash = () => {
      if (window.location.hash !== "#otzyvy") return;
      const idx = tabs.findIndex((t) => /отзыв/i.test(t.label));
      if (idx >= 0) setActive(idx);
    };
    const timer = setTimeout(applyHash, 0);
    window.addEventListener("hashchange", applyHash);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("hashchange", applyHash);
    };
  }, [tabs]);

  if (tabs.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      <nav className={styles.nav} role="tablist">
        {tabs.map((tab, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === active}
            aria-controls={`${id}-panel-${i}`}
            className={`${styles.tab} ${i === active ? styles.tabActive : ""}`}
            onClick={() => setActive(i)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {tabs.map((tab, i) => (
        <div
          key={i}
          id={`${id}-panel-${i}`}
          role="tabpanel"
          className={`${styles.panel} ${i === active ? styles.panelActive : ""}`}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}

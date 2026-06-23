"use client";

/* =============================================
   Moranti — Product Tabs
   ============================================= */

import { useState, useId, type ReactNode } from "react";
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

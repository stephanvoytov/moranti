"use client";

import { useState, useEffect } from "react";
import styles from "./scroll-to-top.module.css";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      className={`${styles.btn} ${visible ? styles.visible : ""}`}
      onClick={scrollToTop}
      aria-label="Наверх"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}

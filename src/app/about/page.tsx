import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "О бренде",
  description:
    "Moranti — бренд сумок из натуральной кожи с акцентом на спокойную элегантность, функциональность и вневременной стиль.",
  openGraph: {
    title: "О бренде — Moranti",
    description:
      "Бренд сумок с акцентом на натуральные материалы, функциональность и вневременной дизайн.",
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <>
      {/* ——— Hero ——— */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={`container ${styles.heroInner}`}>
          <span className={styles.heroLabel}>О бренде</span>
          <h1 className={styles.heroTitle}>Moranti</h1>
          <p className={styles.heroDesc}>
            Сумки, которые сочетают эстетику, удобство
            и качество натуральных материалов.
          </p>
        </div>
      </section>

      {/* ——— О бренде + фото ——— */}
      <section className={styles.section}>
        <div className={`container ${styles.split}`}>
          <div className={styles.splitImage}>
            <div className={styles.imagePlaceholder} />
          </div>
          <div className={styles.splitText}>
            <span className={styles.label}>О бренде</span>
            <h2 className={styles.title}>Эстетика, которую удобно носить</h2>
            <p className={styles.text}>
              Moranti — бренд женских сумок из натуральной итальянской кожи
              для тех, кто выбирает спокойную элегантность, функциональность
              и бескомпромиссное качество. Мы создаем аксессуары, которые легко
              вписываются в повседневный ритм и при этом сохраняют выразительный,
              аккуратный внешний вид.
            </p>
            <p className={styles.text}>
              Каждая модель продумана так, чтобы быть удобной, универсальной
              и долговечной — из натуральной итальянской кожи и замши, с продуманными
              отделениями и функциональной конструкцией.
            </p>
          </div>
        </div>
      </section>

      {/* ——— Философия ——— */}
      <section className={styles.philosophy}>
        <div className={styles.philosophyBg} />
        <div className={`container ${styles.philosophyInner}`}>
          <span className={styles.label}>Философия</span>
          <h2 className={styles.title}>Осознанный выбор</h2>
          <p className={styles.text}>
            Философия Moranti строится вокруг идеи осознанного выбора.
            Мы верим, что сумка должна быть не только красивой, но и
            действительно удобной, надежной и уместной в любой ситуации.
          </p>
          <p className={styles.text}>
            Поэтому в основе бренда — натуральные материалы, лаконичный дизайн
            и внимание к деталям, которые делают вещь по-настоящему ценной.
          </p>
        </div>
      </section>

      {/* ——— Ценности ——— */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.label}>Ценности</span>
            <h2 className={styles.title}>Почему выбирают Moranti</h2>
          </div>
          <div className={styles.valuesGrid}>
            <div className={styles.valueItem}>
              <div className={styles.valueIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <h3 className={styles.valueTitle}>Натуральная итальянская кожа</h3>
              <p className={styles.valueDesc}>
                Мы используем натуральную кожу и замшу итальянского производства —
                материал, который сохраняет свою выразительность и становится
                только лучше со временем.
              </p>
            </div>
            <div className={styles.valueItem}>
              <div className={styles.valueIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/></svg>
              </div>
              <h3 className={styles.valueTitle}>Функциональность</h3>
              <p className={styles.valueDesc}>
                Каждая сумка Moranti создана для ежедневного использования
                и удобной организации пространства.
              </p>
            </div>
            <div className={styles.valueItem}>
              <div className={styles.valueIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h3 className={styles.valueTitle}>Вневременной стиль</h3>
              <p className={styles.valueDesc}>
                Наши модели не подчиняются мимолетным трендам и остаются
                актуальными надолго.
              </p>
            </div>
            <div className={styles.valueItem}>
              <div className={styles.valueIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </div>
              <h3 className={styles.valueTitle}>Внимание к деталям</h3>
              <p className={styles.valueDesc}>
                Мы продумываем форму, конструкцию и посадку каждой сумки,
                чтобы она была эстетичной и комфортной.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Галерея ——— */}
      <section className={styles.gallery}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.label}>Материалы</span>
            <h2 className={styles.title}>Натуральная кожа и замша</h2>
          </div>
          <div className={styles.galleryGrid}>
            <div className={styles.galleryItemLarge}>
              <div className={styles.imagePlaceholder} />
            </div>
            <div className={styles.galleryItem}>
              <div className={styles.imagePlaceholder} />
            </div>
            <div className={styles.galleryItem}>
              <div className={styles.imagePlaceholder} />
            </div>
          </div>
        </div>
      </section>

      {/* ——— CTA ——— */}
      <section className={styles.ctaSection}>
        <div className={`container ${styles.ctaInner}`}>
          <h2 className={styles.ctaTitle}>Выберите свою Moranti</h2>
          <p className={styles.ctaDesc}>
            Сумка, которая подчеркивает стиль и делает каждый день удобнее.
          </p>
          <a href="/catalog" className={styles.ctaBtn}>
            Перейти в каталог
          </a>
        </div>
      </section>
    </>
  );
}

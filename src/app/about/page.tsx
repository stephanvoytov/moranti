import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "О бренде",
  description:
    "Moranti — премиальный бренд женских сумок из натуральной кожи.",
  openGraph: {
    title: "О бренде — Moranti",
    description:
      "Бренд женских сумок из натуральной кожи.",
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
            Премиальный бренд женских сумок из натуральной кожи.
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
            <h2 className={styles.title}>Сумки из натуральной кожи</h2>
            <p className={styles.text}>
              Moranti — женские сумки из натуральной кожи. Минималистичные формы,
              ручная работа, никаких кричащих логотипов.
            </p>
            <p className={styles.text}>
              Сайт-каталог с админ-панелью, ссылками на маркетплейсы,
              системой избранного, галереей и SEO.
            </p>
          </div>
        </div>
      </section>

      {/* ——— Категории ——— */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.label}>Категории</span>
            <h2 className={styles.title}>Модельный ряд</h2>
          </div>
          <div className={styles.categoriesGrid}>
            <div className={styles.categoryItem}>
              <h3 className={styles.categoryTitle}>Shoulder</h3>
              <p className={styles.categoryDesc}>Сумки через плечо. 25 моделей.</p>
            </div>
            <div className={styles.categoryItem}>
              <h3 className={styles.categoryTitle}>Tote</h3>
              <p className={styles.categoryDesc}>Просторные сумки. 12 моделей.</p>
            </div>
            <div className={styles.categoryItem}>
              <h3 className={styles.categoryTitle}>Маленькие</h3>
              <p className={styles.categoryDesc}>Компактные и вечерние. 6 моделей.</p>
            </div>
            <div className={styles.categoryItem}>
              <h3 className={styles.categoryTitle}>Вечерние</h3>
              <p className={styles.categoryDesc}>Элегантные вечерние модели. 5 моделей.</p>
            </div>
            <div className={styles.categoryItem}>
              <h3 className={styles.categoryTitle}>Рюкзаки</h3>
              <p className={styles.categoryDesc}>Практичные кожаные рюкзаки. 4 модели.</p>
            </div>
            <div className={styles.categoryItem}>
              <h3 className={styles.categoryTitle}>Багет</h3>
              <p className={styles.categoryDesc}>Актуальные сумки-багет. 3 модели.</p>
            </div>
            <div className={styles.categoryItem}>
              <h3 className={styles.categoryTitle}>Седло</h3>
              <p className={styles.categoryDesc}>Сумки формы «седло». 1 модель.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ——— CTA ——— */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Каталог Moranti</h2>
          <div className={styles.ctaRule} />
          <p className={styles.ctaDesc}>
            56 моделей из натуральной кожи. Wildberries, Ozon.
          </p>
          <a href="/catalog" className={styles.ctaBtn}>
            Открыть каталог
          </a>
        </div>
      </section>
    </>
  );
}

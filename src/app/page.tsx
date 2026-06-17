"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Hero from "@/components/sections/hero";
import ProductCard from "@/components/ui/product-card";
import { useProducts } from "@/lib/use-products";
import styles from "./page.module.css";

interface HeroSettings {
  title: string;
  tagline: string;
  subtitle: string;
  image: string;
}

const defaultHero: HeroSettings = {
  title: "Moranti",
  tagline: "Сумки, которые сочетают эстетику, удобство и качество натуральных материалов.",
  subtitle: "Натуральная кожа итальянского производства. Минималистичные формы, ручная работа.",
  image: "",
};

export default function Home() {
  const { products, categories } = useProducts();
  const [hero, setHero] = useState<HeroSettings>(defaultHero);
  const [featuredIds, setFeaturedIds] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem("moranti_admin") === "1");
  }, []);

  useEffect(() => {
    fetch("/api/data/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.hero) setHero(data.hero);
        if (Array.isArray(data.featuredIds)) setFeaturedIds(data.featuredIds);
      })
      .catch(() => {});
  }, []);

  const featured =
    featuredIds.length > 0
      ? products.filter((p) => featuredIds.includes(p.id))
      : products.slice(0, 6);

  return (
    <>
      {/* ——— Hero ——— */}
      <Hero settings={hero} />

      {/* ——— Коллекции ——— */}
      <section className={styles.collections}>
        <div className={`container ${styles.sectionHeader}`}>
          <span className={styles.sectionLabel}>Коллекции</span>
          <h2 className={styles.sectionTitle}>Категории</h2>
        </div>
        <div className={`container ${styles.collectionsGrid}`}>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/catalog?category=${cat.slug}`}
              className={styles.collectionCard}
            >
              <span className={styles.collectionName}>{cat.name}</span>
              <span className={styles.collectionCount}>
                {cat.count}{" "}
                {cat.count === 1
                  ? "модель"
                  : cat.count < 5
                    ? "модели"
                    : "моделей"}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ——— Популярные модели ——— */}
      <section className={styles.featured}>
        <div className={`container ${styles.sectionHeader}`}>
          <span className={styles.sectionLabel}>Коллекция</span>
          <h2 className={styles.sectionTitle}>Популярные модели</h2>
        </div>
        {featured.length > 0 && (
          <div className={`container ${styles.featuredGrid}`}>
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ——— CTA ——— */}
      <section className={styles.ctaSection}>
        <div className={`container ${styles.ctaInner}`}>
          <h2 className={styles.ctaTitle}>Выберите свою Moranti</h2>
          <p className={styles.ctaDesc}>
            Сумка, которая подчеркивает стиль и делает каждый день удобнее.
          </p>
          <Link href="/catalog" className={styles.ctaBtnLarge}>
            Перейти в каталог
          </Link>
        </div>
      </section>

      {/* ——— Кнопка на админку (только для админа) ——— */}
      {isAdmin && (
        <Link href="/admin/" className={styles.adminFab} title="Панель управления">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </Link>
      )}
    </>
  );
}

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
  tagline: "Сумки из итальянской кожи. Сдержанная элегантность.",
  subtitle: "Тихая роскошь",
  image: "",
};

/* ——— Подбираем фото для каждой категории (первый товар в категории) ——— */
function getCategoryImage(products: any[], slug: string): string {
  const found = products.find((p) => p.category === slug);
  return found?.image || found?.images?.[0] || "";
}

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
      : products.slice(0, 4);

  return (
    <>
      {/* ——— Hero ——— */}
      <Hero settings={hero} />

      {/* ——— Коллекции ——— */}
      <section className={`${styles.section} ${styles.collections}`}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Наши коллекции</h2>
          <p className={styles.sectionSubtitle}>
            Сумка на каждый день, вечерний выход или деловая встреча — форма
            найдётся для любого сценария.
          </p>
          <div className={styles.collectionsGrid}>
            {categories.map((cat) => {
              const img = getCategoryImage(products, cat.slug);
              return (
                <Link
                  key={cat.slug}
                  href={`/catalog?category=${cat.slug}`}
                  className={styles.collectionCard}
                >
                  {img ? (
                    <img
                      src={img}
                      alt={cat.name}
                      className={styles.collectionImg}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.collectionImgFallback} />
                  )}
                  <div className={styles.collectionOverlay}>
                    <span className={styles.collectionName}>{cat.name}</span>
                    <span className={styles.collectionCount}>
                      {cat.count} {cat.count === 1 ? "модель" : cat.count < 5 ? "модели" : "моделей"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ——— Популярные модели ——— */}
      {featured.length > 0 && (
        <section className={`${styles.section} ${styles.featured}`}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Популярные модели</h2>
            <p className={styles.sectionSubtitle}>
              Модели, которые выбирают чаще всего. Каждая — из натуральной
              итальянской кожи.
            </p>
            <div className={styles.featuredGrid}>
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ——— CTA ——— */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Сумки из натуральной кожи</h2>
          <div className={styles.ctaRule} />
          <p className={styles.ctaDesc}>
            {products.length || "..."} моделей. Доставка по всей России.
          </p>
          <Link href="/catalog" className={styles.ctaBtn}>
            Открыть каталог
          </Link>
        </div>
      </section>

      {/* ——— Кнопка на админку ——— */}
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

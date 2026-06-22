import { readSettings } from "@/lib/settings";
import { getProducts, getCategories } from "@/data/products";
import Link from "next/link";
import Hero from "@/components/sections/hero";
import ProductCard from "@/components/ui/product-card";
import HomeClient from "./home-client";
import styles from "./page.module.css";

/* ——— Фото категории: приоритет у настроек, fallback на первый товар ——— */
function getCategoryImage(
  products: Awaited<ReturnType<typeof getProducts>>,
  slug: string,
  overrides: Record<string, string>,
): string {
  if (overrides[slug]) return overrides[slug];
  const found = products.find((p) => p.category === slug);
  return found?.image || found?.images?.[0] || "";
}

export default async function Home() {
  const [products, categories, settings] = await Promise.all([
    getProducts(),
    getCategories(),
    readSettings(),
  ]);

  const hero = settings.hero;
  const featuredIds = settings.featuredIds ?? [];
  const categoryImages = settings.categoryImages ?? {};

  const featured =
    featuredIds.length > 0
      ? products.filter((p) => featuredIds.includes(p.id))
      : products.slice(0, 4);

  return (
    <>
      {/* ——— Hero (серверный, с реальной картинкой сразу) ——— */}
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
              const img = getCategoryImage(products, cat.slug, categoryImages);
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
            {products.length} моделей. Доставка по всей России.
          </p>
          <Link href="/catalog" className={styles.ctaBtn}>
            Открыть каталог
          </Link>
        </div>
      </section>

      {/* ——— Кнопка на админку (клиентский компонент) ——— */}
      <HomeClient />
    </>
  );
}

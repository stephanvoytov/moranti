import { readSettings } from "@/lib/settings";
import { getProducts, getCategories } from "@/data/products";
import { blobUrl } from "@/lib/blob";
import { buildItemListJsonLd } from "@/lib/seo-jsonld";
import Link from "next/link";
import Hero from "@/components/sections/hero";
import BrandSeo from "@/components/sections/brand-seo";
import ProductCard from "@/components/ui/product-card";
import SmartImage from "@/components/ui/smart-image";
import HomeClient from "./home-client";
import styles from "./page.module.css";

/* ——— ISR: главная пересобирается каждые 60с ——— 
   Настройки (hero, категории) меняются из админки; без ISR страница
   статична и не видит изменений до следующего деплоя. revalidatePath("/")
   из API-роутов даёт мгновенную инвалидацию, а 60с — страховка. */
export const revalidate = 60;

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

  // «Популярные модели»: ручной выбор из админки (featuredIds) — приоритет;
  // если он пуст — топ по количеству отзывов (как сортировка «По популярности» в каталоге).
  // Максимум 8 карточек.
  const featured =
    featuredIds.length > 0
      ? products.filter((p) => featuredIds.includes(p.id)).slice(0, 8)
      : [...products]
          .sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0))
          .slice(0, 8);

  const siteUrl = process.env.SITE_URL || "http://localhost:3001";

  return (
    <>
      {/* ItemList JSON-LD: популярные модели (если есть) */}
      {featured.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildItemListJsonLd(featured, siteUrl)),
          }}
        />
      )}

      {/* ——— Hero (серверный, с реальной картинкой сразу) ——— */}
      <Hero settings={hero} />

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
              {featured.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i === 0} />
              ))}
            </div>
            <div className={styles.featuredActions}>
              <Link href="/catalog" className={styles.featuredBtn}>
                Смотреть ещё
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ——— Коллекции ——— */}
      <section className={`${styles.section} ${styles.collections}`}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Наши коллекции</h2>
          <p className={styles.sectionSubtitle}>
            Сумка на каждый день, вечерний выход или деловая встреча — форма
            найдётся для любого сценария.
          </p>
          <div className={styles.collectionsGrid}>
            {categories.filter((cat) => cat.count > 0).map((cat) => {
              const img = getCategoryImage(products, cat.slug, categoryImages);
              // Карточка коллекции ~315×420 — полноразмер (Ozon 3024×4032,
              // 1,2 МБ!) не нужен: Ozon режем оптимизатором (w=520), WB big → c516x688
              const optimized = img
                ? img.includes("ir.ozone.ru")
                  ? `/_next/image?url=${encodeURIComponent(img)}&w=520&q=75`
                  : img.replace("/images/big/", "/images/c516x688/")
                : "";
              return (
                <Link
                  key={cat.slug}
                  href={`/catalog/${cat.slug}`}
                  className={styles.collectionCard}
                >
                  {optimized ? (
                    <SmartImage
                      src={blobUrl(optimized)}
                      alt={cat.name}
                      className={styles.collectionImg}
                      width={315}
                      height={420}
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

      {/* ——— SEO-текст (компактный, перед футером) ——— */}
      <BrandSeo />

      {/* ——— Кнопка на админку (клиентский компонент) ——— */}
      <HomeClient />
    </>
  );
}

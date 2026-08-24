import Link from "next/link";
import Hero from "@/components/sections/hero";
import ProductCard from "@/components/ui/product-card";
import SmartImage from "@/components/ui/smart-image";
import { blobUrl } from "@/lib/blob";
import type { Product } from "@/data/products";
import styles from "./page.module.css";

const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;

interface HomeBlockImage {
  url?: string;
}
export interface HomeBlock {
  blockType?: string;
  limit?: number;
  source?: string;
  manualProducts?: (string | { id?: string })[];
  image?: HomeBlockImage;
  imageUrl?: string;
  imageMobile?: HomeBlockImage;
  imageMobileUrl?: string;
  title?: string;
  tagline?: string;
  subtitle?: string;
  buttonLabel?: string;
  buttonHref?: string;
  [k: string]: unknown;
}

/** Какие товары показывать в блоке «Товары» */
export function resolveProducts(block: HomeBlock, products: Product[]): Product[] {
  const limit =
    typeof block?.limit === "number" && block.limit > 0 ? block.limit : 8;

  if (block?.source === "manual" && Array.isArray(block.manualProducts)) {
    const ids = block.manualProducts
      .map((p: string | { id?: string }) => (typeof p === "string" ? p : p?.id))
      .filter(Boolean);
    return products.filter((p) => ids.includes(p.id)).slice(0, limit);
  }

  if (block?.source === "new") {
    const now = Date.now();
    return [...products]
      .filter(
        (p) =>
          p.wbCreatedAt &&
          now - new Date(p.wbCreatedAt).getTime() <= THREE_MONTHS_MS,
      )
      .sort(
        (a, b) =>
          new Date(b.wbCreatedAt!).getTime() -
          new Date(a.wbCreatedAt!).getTime(),
      )
      .slice(0, limit);
  }

  // popular (по умолчанию) — топ по популярности
  return [...products]
    .sort((a, b) => {
      const sa = (a.reviewsCount || 0) + (a.rating || 0) * 10;
      const sb = (b.reviewsCount || 0) + (b.rating || 0) * 10;
      return sb - sa;
    })
    .slice(0, limit);
}

export interface CategoryView {
  slug: string;
  name: string;
  count: number;
  image: string;
}

/** Герой главной (полноэкранный, с фото) — переиспользует <Hero> */
export function HomeHero({ block }: { block: HomeBlock }) {
  const image = block?.image?.url || block?.imageUrl || "";
  const imageMobile =
    block?.imageMobile?.url || block?.imageMobileUrl || image;
  return (
    <Hero
      settings={{
        title: block?.title || "",
        tagline: block?.tagline || "",
        subtitle: block?.subtitle || "",
        image,
        imageMobile,
      }}
      buttonLabel={block?.buttonLabel || "Смотреть коллекцию"}
      buttonHref={block?.buttonHref || "/catalog"}
    />
  );
}

/** Секция товаров (Новинки / Популярные / Ручной выбор) */
export function HomeProducts({
  block,
  products,
}: {
  block: HomeBlock;
  products: Product[];
}) {
  const items = resolveProducts(block, products);
  if (!items.length) return null;
  return (
    <section className={`${styles.section} ${styles.featured}`}>
      <div className="container">
        <h2 className={styles.sectionTitle}>{block?.title}</h2>
        {block?.subtitle && (
          <p className={styles.sectionSubtitle}>{block.subtitle}</p>
        )}
        <div className={styles.featuredGrid}>
          {items.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i === 0} />
          ))}
        </div>
        <div className={styles.featuredActions}>
          <Link
            href={block?.source === "new" ? "/new" : "/catalog"}
            className={styles.featuredBtn}
          >
            {block?.source === "new" ? "Смотреть все" : "Смотреть ещё"}
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Секция категорий (карточки коллекций) */
export function HomeCategories({
  block,
  categories,
}: {
  block: HomeBlock;
  categories: CategoryView[];
}) {
  const cats = (categories || []).filter((c) => c.count > 0);
  if (!cats.length) return null;
  return (
    <section className={`${styles.section} ${styles.collections}`}>
      <div className="container">
        <h2 className={styles.sectionTitle}>{block?.title}</h2>
        {block?.subtitle && (
          <p className={styles.sectionSubtitle}>{block.subtitle}</p>
        )}
        <div className={styles.collectionsGrid}>
          {cats.map((cat) => {
            const raw = cat.image || "";
            const optimized = raw
              ? raw.includes("ir.ozone.ru")
                ? `/_next/image?url=${encodeURIComponent(raw)}&w=520&q=75`
                : raw.replace("/images/big/", "/images/c516x688/")
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
                    {cat.count}{" "}
                    {cat.count === 1
                      ? "модель"
                      : cat.count < 5
                        ? "модели"
                        : "моделей"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

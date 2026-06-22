import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getProducts, getProduct } from "@/data/products";
import { resolveColor } from "@/lib/color-map";
import PriceClient from "./price-client";
import GalleryClient from "./gallery-client";
import ShareButton from "./share-button";
import RecentlyViewedTracker from "./recently-viewed-tracker";
import FavoriteButton from "./favorite-button";
import ExpandableText from "@/components/ui/expandable-text";
import RecentlyViewed from "./recently-viewed";
import styles from "./page.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Товар не найден" };

  return {
    title: product.name,
    description: product.description,
    alternates: {
      canonical: `/catalog/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} — Moranti`,
      description: product.description,
      url: `/catalog/${product.slug}`,
      type: "website",
      images: product.image
        ? [{ url: product.image, width: 516, height: 688 }]
        : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const siteUrl = process.env.SITE_URL || "http://localhost:3001";
  const allProducts = await getProducts();

  // Color variants (same imtId group + same category)
  const siblings = product.imtId
    ? allProducts.filter(
        (p) =>
          p.imtId === product.imtId &&
          p.category === product.category &&
          p.id !== product.id
      )
    : [];

  // Color chip label: цвет → материал → размер
  const colorLabel = (s: typeof product) => {
    const name = s.colorName || "";

    // Same-color siblings
    const sameColor = siblings.filter((p) => p.colorName === s.colorName);
    if (sameColor.length <= 1) return name; // unique color → just name

    // Check if same-color siblings differ by material
    const getMaterial = (p: typeof product) =>
      (p.composition || "").toLowerCase().includes("замша") ? "замша" : "кожа";

    const materials = [...new Set(sameColor.map(getMaterial))];
    if (materials.length > 1) {
      return `${name} · ${getMaterial(s)}`;
    }

    // Same color + same material → differentiate by size
    const isMini = (s.name || "").toLowerCase().includes("мини");
    return isMini ? `${name} мини` : name;
  };
  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  // Product JSON-LD structured data
  const offers = product.marketplaces?.length
    ? product.marketplaces.map((mp) => ({
        "@type": "Offer",
        name: `Купить на ${mp.name}`,
        url: mp.url,
        price: product.price,
        priceCurrency: "RUB",
        availability: "https://schema.org/InStock",
      }))
    : {
        "@type": "Offer",
        url: `${siteUrl}/catalog/${product.slug}`,
        price: product.price,
        priceCurrency: "RUB",
        availability: "https://schema.org/InStock",
      };

  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images?.length ? product.images : [product.image],
    offers,
  };

  if (product.rating) {
    productJsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewsCount || 0,
    };
  }

  return (
    <main className={styles.page}>
      {/* Track recently viewed */}
      <RecentlyViewedTracker wbArticle={product.wbArticle} />

      {/* Product JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link href="/catalog" className={styles.breadcrumbLink}>
          Каталог
        </Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>{product.name}</span>
      </nav>

      <div className={styles.layout}>
        {/* Gallery */}
        <div className={styles.imageCol}>
          <GalleryClient
            images={product.images?.length ? product.images : [product.image]}
            alt={product.name}
          />
        </div>

        {/* Info */}
        <div className={styles.infoCol}>
          <h1 className={styles.title}>{product.name}</h1>

          <PriceClient
            wbArticle={product.wbArticle}
            staticPrice={product.price}
            staticOriginal={product.originalPrice}
            currency={product.currency}
          />

          {/* Color variants */}
          {siblings.length > 0 ? (
            <div className={styles.colors}>
              <div className={styles.colorsLabel}>Цвет:</div>
              <div className={styles.colorsList}>
                <Link
                  href={`/catalog/${product.slug}`}
                  className={`${styles.colorLink} ${styles.colorLinkActive}`}
                >
                  <span
                    className={styles.colorDot}
                    style={{ backgroundColor: resolveColor(product.colorName) }}
                  />
                  {colorLabel(product)}
                </Link>
                {siblings.map((s) => (
                  <Link
                    key={s.id}
                    href={`/catalog/${s.slug}`}
                    className={styles.colorLink}
                  >
                    <span
                      className={styles.colorDot}
                      style={{ backgroundColor: resolveColor(s.colorName) }}
                    />
                    {colorLabel(s)}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {product.rating ? (
            <div className={styles.rating}>
              <span className={styles.stars}>
                {"★".repeat(Math.round(product.rating))}
                {"☆".repeat(5 - Math.round(product.rating))}
              </span>
              <span className={styles.ratingText}>
                {product.rating.toFixed(1)} · {product.reviewsCount}{" "}
                {product.reviewsCount === 1
                  ? "оценка"
                  : product.reviewsCount! < 5
                    ? "оценки"
                    : "оценок"}
              </span>
            </div>
          ) : null}

          <ExpandableText text={product.description} />

          {product.composition ? (
            <p className={styles.composition}>
              Состав: {product.composition}
            </p>
          ) : null}

          {/* Marketplace CTAs */}
          <div className={styles.ctas}>
            {product.marketplaces.map((mp, i) => (
              <a
                key={mp.name}
                href={mp.url}
                target="_blank"
                rel="noopener noreferrer"
                className={i === 0 ? styles.cta : styles.ctaOutline}
              >
                Купить на {mp.name}
              </a>
            ))}
          </div>

          <div className={styles.actionsRow}>
            <FavoriteButton wbArticle={product.wbArticle} />
            <ShareButton
              url={`${siteUrl}/catalog/${product.slug}`}
              title={product.name}
            />
          </div>

          <Link href="/catalog" className={styles.backLink}>
            ← Вернуться в каталог
          </Link>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className={styles.related}>
          <h2 className={styles.relatedTitle}>Похожие модели</h2>
          <div className={styles.relatedGrid}>
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/catalog/${r.slug}`}
                className={styles.relatedCard}
              >
                <div className={styles.relatedImageWrapper}>
                  <Image
                    src={r.image}
                    alt={r.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className={styles.relatedImage}
                    loading="lazy"
                  />
                </div>
                <span className={styles.relatedName}>{r.name}</span>
                <span className={styles.relatedPrice}>
                  {r.price.toLocaleString("ru-RU")} {r.currency}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recently viewed */}
      <RecentlyViewed />
    </main>
  );
}

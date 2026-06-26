import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { CharacteristicGroup } from "@/data/products";
import { getProducts, getProduct } from "@/data/products";
import PriceClient from "./price-client";
import ColorSwatches from "./color-swatches";
import GalleryClient from "./gallery-client";
import ShareButton from "./share-button";
import GalleryOverlay from "./gallery-overlay";
import RecentlyViewedTracker from "./recently-viewed-tracker";
import FavoriteButton from "./favorite-button";
import ExpandableText from "@/components/ui/expandable-text";
import ProductCard from "@/components/ui/product-card";
import ProductCharacteristics from "@/components/ui/product-characteristics";
import ProductTabs from "@/components/ui/product-tabs";
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

/** Извлечь значение характеристики по имени */
function getCharValue(chars: CharacteristicGroup[] | null, name: string): string | null {
  if (!chars) return null;
  for (const g of chars) {
    for (const o of g.options) {
      if (o.name === name) return o.value;
    }
  }
  return null;
}

/** Собрать подзаголовок: страна · состав ( · материал) */
function buildSubtitle(
  composition: string | null,
  chars: CharacteristicGroup[] | null
): string | null {
  const parts: string[] = [];

  const country = getCharValue(chars, "Страна производства");
  if (country) parts.push(country);

  if (composition) parts.push(composition);

  return parts.length > 0 ? parts.join(" · ") : null;
}

/** Размеры: ширина × высота × глубина */
function extractDimensions(chars: CharacteristicGroup[] | null) {
  if (!chars) return null;
  const dims = [
    { key: "Ширина предмета", label: "Ширина" },
    { key: "Высота предмета", label: "Высота" },
    { key: "Глубина предмета", label: "Глубина" },
  ];
  const result: { label: string; value: string }[] = [];
  for (const d of dims) {
    const v = getCharValue(chars, d.key);
    if (v) result.push({ label: d.label, value: v });
  }
  return result.length > 0 ? result : null;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const siteUrl = process.env.SITE_URL || "http://localhost:3001";
  const allProducts = await getProducts();

  // Color variants (same modelId) — show if not archived, even if out of stock
  const siblings = product.modelId
    ? allProducts.filter(
        (p) =>
          p.modelId === product.modelId &&
          !p.archivedAt &&
          p.id !== product.id
      )
    : [];

  // Related: same category, prefer same material + size keywords
  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .sort((a, b) => {
      const sizeWords = ["мини", "большой", "вечерний"];
      const prod = product;
      function score(p: typeof a) {
        let s = 0;
        if (p.composition && p.composition === prod.composition) s += 2;
        for (const w of sizeWords) {
          if (p.name.toLowerCase().includes(w) && prod.name.toLowerCase().includes(w)) s += 1;
        }
        return s;
      }
      return score(b) - score(a);
    })
    .slice(0, 4);

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

  // Build subtitle & dimensions
  const subtitle = buildSubtitle(product.composition ?? null, product.characteristics ?? null);
  const dimensions = extractDimensions(product.characteristics ?? null);

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
      {/* Top row: breadcrumb + actions */}
      <div className={styles.topRow}>
        <nav className={styles.breadcrumb}>
          <Link href="/catalog" className={styles.breadcrumbLink}>
            Каталог
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>{product.name}</span>
        </nav>
        <div className={styles.topActions}>
          <FavoriteButton wbArticle={product.wbArticle} />
          <ShareButton
            url={`${siteUrl}/catalog/${product.slug}`}
            title={product.name}
          />
        </div>
      </div>

      <div className={styles.layout}>
        {/* Gallery */}
        <div className={styles.imageCol}>
          <GalleryOverlay
            wbArticle={product.wbArticle!}
            shareUrl={`${siteUrl}/catalog/${product.slug}`}
            shareTitle={product.name}
          />
          <GalleryClient
            images={product.images?.length ? product.images : [product.image]}
            alt={product.name}
          />
        </div>

        {/* Info */}
        <div className={styles.infoCol}>
          <h1 className={styles.title}>{product.name}</h1>

          {subtitle && (
            <p className={styles.subtitle}>{subtitle}</p>
          )}

          {product.archivedAt ? (
            <div className={styles.outOfStock}>
              <span className={styles.priceMuted}>
                {product.price.toLocaleString("ru-RU")} {product.currency}
              </span>
              <span className={styles.archivedLabel}>Архивирован</span>
            </div>
          ) : !product.inStock ? (
            <div className={styles.outOfStock}>
              <span className={styles.priceMuted}>
                {product.price.toLocaleString("ru-RU")} {product.currency}
              </span>
              <span className={styles.outOfStockLabel}>Нет в наличии</span>
            </div>
          ) : (
            <PriceClient
              wbArticle={product.wbArticle}
              staticPrice={product.price}
              staticOriginal={product.originalPrice}
              currency={product.currency}
            />
          )}

          {/* Color variants — image-based swatches */}
          {siblings.length > 0 ? (
            <ColorSwatches current={product} siblings={siblings} />
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

          {/* Marketplace CTAs */}
          {!product.archivedAt && (
            <div className={styles.ctas}>
              {product.marketplaces.map((mp) => (
                <a
                  key={mp.name}
                  href={mp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.cta}
                >
                  {mp.name}
                </a>
              ))}
            </div>
          )}

          {/* Tabs: Description / Characteristics / Dimensions */}
          <ProductTabs
            tabs={[
              {
                label: "Описание",
                content: <ExpandableText text={product.description} />,
              },
              {
                label: "Характеристики",
                content: (
                  <ProductCharacteristics
                    data={product.characteristics ?? []}
                    composition={product.composition ?? undefined}
                  />
                ),
              },
              ...(dimensions
                ? [
                    {
                      label: "Размеры",
                      content: (
                        <div className={styles.dimensionsGrid}>
                          {dimensions.map((d) => (
                            <div key={d.label} className={styles.dimItem}>
                              <span className={styles.dimValue}>{d.value}</span>
                              <span className={styles.dimLabel}>{d.label}</span>
                            </div>
                          ))}
                        </div>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className={styles.related}>
          <h2 className={styles.relatedTitle}>Похожие модели</h2>
          <div className={styles.relatedGrid}>
            {related.map((r) => (
              <ProductCard key={r.id} product={r} priority={false} />
            ))}
          </div>
        </section>
      )}

      {/* Recently viewed */}
      <RecentlyViewed />
    </main>
  );
}

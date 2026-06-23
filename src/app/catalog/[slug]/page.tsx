import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProducts, getProduct } from "@/data/products";
import { swatchUrl } from "@/lib/product-images";
import PriceClient from "./price-client";
import GalleryClient from "./gallery-client";
import ShareButton from "./share-button";
import RecentlyViewedTracker from "./recently-viewed-tracker";
import FavoriteButton from "./favorite-button";
import ExpandableText from "@/components/ui/expandable-text";
import ProductCard from "@/components/ui/product-card";
import ProductCharacteristics from "@/components/ui/product-characteristics";
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

          {product.archivedAt ? (
            <div className={styles.outOfStock}>
              <span className={styles.priceMuted}>
                {product.price.toLocaleString("ru-RU")} {product.currency}
              </span>
              <span className={styles.outOfStockLabel}>Нет в наличии</span>
            </div>
          ) : (
            <>
              <PriceClient
                wbArticle={product.wbArticle}
                staticPrice={product.price}
                staticOriginal={product.originalPrice}
                currency={product.currency}
              />
            </>
          )}

          {/* Color variants — image-based swatches */}
          {siblings.length > 0 ? (
            <div className={styles.colors}>
              <div className={styles.colorsLabel}>Цвет:</div>
              <div className={styles.colorsList}>
                <Link
                  href={`/catalog/${product.slug}`}
                  className={`${styles.swatch} ${styles.swatchActive}`}
                  title={colorLabel(product)}
                >
                  <img
                    src={swatchUrl(product.wbArticle!)}
                    alt={colorLabel(product)}
                    className={styles.swatchImage}
                    loading="lazy"
                  />
                </Link>
                {siblings.map((s) => (
                  <Link
                    key={s.id}
                    href={`/catalog/${s.slug}`}
                    className={styles.swatch}
                    title={colorLabel(s)}
                  >
                    <img
                      src={swatchUrl(s.wbArticle!)}
                      alt={colorLabel(s)}
                      className={styles.swatchImage}
                      loading="lazy"
                    />
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

          {/* Marketplace CTAs — только если в наличии */}
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
                  <img
                    src={`/images/icons/${mp.name.toLowerCase()}.svg`}
                    alt=""
                    width={16}
                    height={16}
                    style={{ opacity: 0.5, flexShrink: 0 }}
                  />
                  {mp.name}
                </a>
              ))}
            </div>
          )}

          <ExpandableText text={product.description} />

          {product.composition ? (
            <p className={styles.composition}>
              Состав: {product.composition}
            </p>
          ) : null}

          {product.characteristics ? (
            <ProductCharacteristics data={product.characteristics} />
          ) : null}

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

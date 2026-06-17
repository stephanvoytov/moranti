import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProducts, getProduct } from "@/data/products";
import PriceClient from "./price-client";
import GalleryClient from "./gallery-client";
import styles from "./page.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
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
  const allProducts = getProducts();
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

          <p className={styles.description}>{product.description}</p>

          {/* Marketplace CTAs */}
          <div className={styles.ctas}>
            {product.marketplaces.map((mp) => (
              <a
                key={mp.name}
                href={mp.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.cta}
              >
                Купить на {mp.name}
              </a>
            ))}
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
                  <img
                    src={r.image}
                    alt={r.name}
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
    </main>
  );
}

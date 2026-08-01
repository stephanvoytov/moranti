import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { CharacteristicGroup } from "@/data/products";
import { getProducts, getProduct, getAllProducts } from "@/data/products";
import { MARKETPLACE_URLS } from "@/lib/marketplaces";
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

const CATEGORY_NAMES: Record<string, string> = {
  crossbody: "кросс-боди", "na-plecho": "на плечо", baguette: "багет",
  tote: "тоут", saddle: "седло", backpack: "рюкзак",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Товар не найден" };

  const catName = CATEGORY_NAMES[product.category] || product.category;
  const composition = product.composition || "натуральной кожи";

  // Цвет из colorName («песочный, бежевый» → «песочный») — для уникальности title
  const color = (product.colorName ?? "").split(",")[0].trim();
  const colorPart = color ? ` (${color})` : "";

  // Если имя + цвет повторяются у другой модели — добавляем цену
  // (анализ на 102 товарах: остаётся 2 группы дублей вместо 20 без дискриминатора)
  const all = await getAllProducts();
  const twins = all.filter(
    (p) =>
      p.name === product.name &&
      ((p.colorName ?? "").split(",")[0].trim()) === color,
  );
  const pricePart =
    twins.length > 1 ? `, ${product.price.toLocaleString("ru-RU")} ₽` : "";

  const title = `${product.name}${colorPart}${pricePart} — купить | Moranti`;

  // Архивные товары: страница доступна, но из индекса убираем (тупик для пользователя)
  const noindex = Boolean(product.archivedAt);

  // Склонение для description: «Сумка-тоут…» → «сумку-тоут…» (все названия начинаются с «Сумка»)
  const declineName = product.name.startsWith("Сумка")
    ? `сумку${product.name.slice(5)}`
    : product.name.toLowerCase();

  const metaDesc = `Купить ${declineName}${colorPart} в Moranti. ${catName}, ${composition}. Цена: ${product.price.toLocaleString("ru-RU")} ₽. Доставка по России.`;

  return {
    title: { absolute: title },
    description: metaDesc,
    robots: noindex ? { index: false, follow: true } : undefined,
    alternates: {
      canonical: `/catalog/${product.slug}`,
    },
    openGraph: {
      title: `${product.name}${colorPart}${pricePart} — Moranti`,
      description: metaDesc,
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

  // Маркетплейс в наличии, если остаток ненулевой
  const mpInStock = (name: string): boolean =>
    name === "Wildberries"
      ? (product.wbStock ?? 0) > 0
      : name === "Ozon"
        ? (product.ozonStock ?? 0) > 0
        : true;

  const availableMarketplaces = (product.marketplaces ?? []).filter((mp) =>
    mpInStock(mp.name)
  );

  // Product JSON-LD structured data
  const offers = availableMarketplaces.length
    ? availableMarketplaces.map((mp) => ({
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

  const catName = CATEGORY_NAMES[product.category] || product.category;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Каталог", item: `${siteUrl}/catalog` },
      { "@type": "ListItem", position: 3, name: product.name, item: `${siteUrl}/catalog/${product.slug}` },
    ],
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

      {/* BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
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
                <span className={styles.priceAsterisk}>*</span>
              </span>
              <span className={styles.archivedLabel}>Архивирован</span>
            </div>
          ) : !product.inStock ? (
            <div className={styles.outOfStock}>
              <span className={styles.priceMuted}>
                {product.price.toLocaleString("ru-RU")} {product.currency}
                <span className={styles.priceAsterisk}>*</span>
              </span>
              <span className={styles.outOfStockLabel}>Нет в наличии</span>
            </div>
          ) : (
            <PriceClient
              staticPrice={product.price}
              staticOriginal={product.originalPrice}
              currency={product.currency}
            />
          )}

          {/* Color variants — image-based swatches */}
          {siblings.length > 0 ? (
            <ColorSwatches current={product} siblings={siblings} />
          ) : null}

          {product.rating && product.rating > 4 ? (
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

          {/* Marketplace CTAs — только маркетплейсы с ненулевым остатком */}
          {!product.archivedAt && (
            <div className={styles.ctas}>
              {product.wbArticle && (product.wbStock ?? 0) > 0 && (
                <a
                  href={MARKETPLACE_URLS.wbProduct(product.wbArticle)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.cta}
                >
                  Купить на Wildberries
                </a>
              )}
              {product.ozonArticle && (product.ozonStock ?? 0) > 0 && (
                <a
                  href={MARKETPLACE_URLS.ozonProduct(product.ozonArticle)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.cta}
                >
                  Купить на Ozon
                </a>
              )}
            </div>
          )}

          {/* SEO H2 */}
          <h2 className={styles.seoH2}>
            {product.name} — {catName}, {product.composition || "натуральная кожа"}
          </h2>

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

          {/* Примечание к цене — синхронизируется с маркетплейсов и может измениться */}
          <p className={styles.priceFootnote}>
            <span className={styles.priceFootnoteMark}>*</span>
            Цена ориентировочная и может отличаться от актуальной на
            маркетплейсе
          </p>
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

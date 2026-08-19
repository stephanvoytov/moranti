import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { CharacteristicGroup } from "@/data/products";
import { getProducts, getProduct } from "@/data/products";
import { seoConfig, buildProductSeoMeta } from "@/config/seo";
import { buildProductJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo-jsonld";
import CategoryView from "./category-view";
import PriceClient from "./price-client";
import ProductCartCta from "./product-cart-cta";
import ColorSwatches from "./color-swatches";
import GalleryClient from "./gallery-client";
import ShareButton from "./share-button";
import GalleryOverlay from "./gallery-overlay";
import RecentlyViewedTracker from "./recently-viewed-tracker";
import FavoriteButton from "./favorite-button";
import MarketplaceCtas from "./marketplace-cta";
import ExpandableText from "@/components/ui/expandable-text";
import ProductCard from "@/components/ui/product-card";
import RatingStars from "@/components/ui/rating-stars";
import ProductCharacteristics from "@/components/ui/product-characteristics";
import ProductTabs from "@/components/ui/product-tabs";
import RecentlyViewed from "./recently-viewed";
import styles from "./page.module.css";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateStaticParams() {
  const products = await getProducts();
  // Товары + категории живут на одном уровне /catalog/:slug
  return [
    ...products.map((p) => ({ slug: p.slug })),
    ...Object.keys(seoConfig.categories).map((slug) => ({ slug })),
  ];
}

// ISR 60с: цена, наличие и кнопки покупки должны пересобираться из свежих
// данных, а не висеть до следующего деплоя (синк меняет остатки/inStock в БД)
export const revalidate = 60;

// Слаги вне generateStaticParams (мусорные/несуществующие) — жёсткий 404
// от Next до рендера страницы. Без этого флага неFound() на ISR-странице
// в Next 16 отдаёт 200 с not-found контентом (мягкий 404).
export const dynamicParams = false;

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;

  // ─── Категория (/catalog/crossbody) ───
  const cat = seoConfig.categories[slug];
  if (cat) {
    const sp = await searchParams;
    const page = Number(sp?.page ?? "1") || 1;
    const hasFilters = [
      sp?.sort,
      sp?.color,
      sp?.material,
      sp?.q,
      sp?.priceMin,
      sp?.priceMax,
      sp?.marketplace,
    ].some((v) => v !== undefined && v !== "");

    // Пагинация и фильтры — дубли категории: noindex + canonical на базу
    if (page > 1 || hasFilters) {
      return {
        title: { absolute: cat.title },
        description: cat.description,
        robots: { index: false, follow: true },
        alternates: { canonical: `/catalog/${slug}` },
      };
    }

    return {
      title: { absolute: cat.title },
      description: cat.description,
      alternates: { canonical: `/catalog/${slug}` },
      openGraph: {
        title: cat.title,
        description: cat.description,
        url: `/catalog/${slug}`,
        siteName: seoConfig.site.siteName,
        type: "website",
        locale: seoConfig.site.locale,
      },
    };
  }

  // ─── Товар ───
  const product = await getProduct(slug);
  // notFound() до рендера страницы: иначе из-за Suspense (loading.tsx)
  // статус остаётся 200 и not-found уходит клиенту через RSC (мягкий 404).
  if (!product) notFound();

  const meta = buildProductSeoMeta(product);
  const title = meta.title;

  // Архивные товары: страница доступна, но из индекса убираем (тупик для пользователя)
  const noindex = Boolean(product.archivedAt);

  return {
    title: { absolute: title },
    description: meta.description,
    robots: noindex ? { index: false, follow: true } : undefined,
    alternates: {
      canonical: `/catalog/${product.slug}`,
    },
    openGraph: {
      title: meta.ogTitle,
      description: meta.description,
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

export default async function CatalogSlugPage({ params }: Props) {
  const { slug } = await params;

  // Категория? → категорийная страница
  if (seoConfig.categories[slug]) {
    return <CategoryView slug={slug} />;
  }

  // Иначе — товар
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

  const catName = seoConfig.categoryNames[product.category] || product.category;
  const catDisplayName =
    seoConfig.categories[product.category]?.name || product.category;
  const catPath = `/catalog/${product.category}`;
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(
    [
      { name: "Главная", path: "/" },
      { name: "Каталог", path: "/catalog" },
      { name: catDisplayName, path: catPath },
      { name: product.name, path: `/catalog/${product.slug}` },
    ],
    siteUrl,
  );
  const productJsonLd = buildProductJsonLd(product, siteUrl);

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
          <Link href="/" className={styles.breadcrumbLink}>
            Главная
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <Link href="/catalog" className={styles.breadcrumbLink}>
            Каталог
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <Link href={catPath} className={styles.breadcrumbLink}>
            {catDisplayName}
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
            video={product.video}
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

          {product.rating && product.rating >= 4 ? (
            <div className={styles.rating}>
              <RatingStars rating={product.rating} />
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

          {/* Marketplace CTAs — только маркетплейсы с ненулевым остатком.
              Клиентский компонент: цели Яндекс.Метрики (buy-wb / buy-ozon).
              «В корзину» — первичный CTA внутри той же секции. */}
          {!product.archivedAt && (
            <MarketplaceCtas
              wbArticle={product.wbArticle}
              wbStock={product.wbStock}
              ozonArticle={product.ozonArticle}
              ozonStock={product.ozonStock}
            >
              {product.inStock && (
                <ProductCartCta article={product.wbArticle} />
              )}
            </MarketplaceCtas>
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

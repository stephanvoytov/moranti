import { getProducts, getCategories } from "@/data/products";
import { readSettings } from "@/lib/settings";
import {
  buildCollectionPageJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo-jsonld";
import { buildVariantPages, type VariantPage } from "@/lib/variant-pages";
import { seoConfig } from "@/config/seo";
import CatalogPage from "@/app/catalog/catalog-content";
import CatalogSeo from "@/components/sections/catalog-seo";

/**
 * Лендинг категория×цвет/материал или глобальная страница материала.
 * Переиспользует клиентский каталог с предустановленными фильтрами
 * (категория/цвет/материал из пути) + SEO-текст и перелинковку.
 */
export default async function VariantView({ page }: { page: VariantPage }) {
  const siteUrl = process.env.SITE_URL || "http://localhost:3001";
  const [products, categories, settings] = await Promise.all([
    getProducts(),
    getCategories(),
    readSettings(),
  ]);

  // Соседние лендинги для перелинковки: глобальные страницы + варианты той же
  // категории (исключая текущий).
  const variantLinks = buildVariantPages(products)
    .filter(
      (p) =>
        p.path !== page.path &&
        (p.category === null || p.category === page.category),
    )
    .sort((a, b) => a.h1.localeCompare(b.h1, "ru"))
    .map((p) => ({ path: p.path, label: p.h1 }));

  // BreadcrumbList JSON-LD: Главная › Каталог › [Категория ›] Лендинг
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(
    [
      { name: "Главная", path: "/" },
      { name: "Каталог", path: "/catalog" },
      ...(page.category
        ? [
            {
              name: seoConfig.categories[page.category].name,
              path: `/catalog/${page.category}`,
            },
          ]
        : []),
      { name: page.breadcrumb, path: page.path },
    ],
    siteUrl,
  );

  // CollectionPage JSON-LD
  const collectionJsonLd = buildCollectionPageJsonLd(
    page.h1,
    page.description,
    page.path,
    page.products.length,
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      {/* key={page.path}: при переходе между лендингами состояние каталога сбрасывается */}
      <CatalogPage
        key={page.path}
        initialProducts={products}
        initialCategories={categories}
        initialCatalogOrder={settings.catalogOrder ?? []}
        initialCategory={page.category}
        categoryFromPath={Boolean(page.category)}
        initialColor={page.color ?? null}
        initialMaterial={page.material ?? null}
        categoryTitle={page.h1}
        breadcrumbLabel={page.breadcrumb}
      />
      <CatalogSeo variant={page} variantLinks={variantLinks} />
    </>
  );
}
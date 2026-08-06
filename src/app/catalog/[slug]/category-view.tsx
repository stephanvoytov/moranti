import { notFound } from "next/navigation";
import { getProducts, getCategories } from "@/data/products";
import { readSettings } from "@/lib/settings";
import { seoConfig } from "@/config/seo";
import {
  buildCollectionPageJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo-jsonld";
import CatalogPage from "../catalog-content";
import CatalogSeo from "@/components/sections/catalog-seo";

/**
 * Страница категории (/catalog/:slug): переиспользует клиентский каталог
 * с категорией из пути (categoryFromPath) + категорийный SEO-текст.
 */
export default async function CategoryView({ slug }: { slug: string }) {
  const cat = seoConfig.categories[slug];
  if (!cat) notFound();

  const siteUrl = process.env.SITE_URL || "http://localhost:3001";
  const [products, categories, settings] = await Promise.all([
    getProducts(),
    getCategories(),
    readSettings(),
  ]);

  const categoryTitle = cat.title.replace(" — Moranti", "");

  // BreadcrumbList JSON-LD: Главная › Каталог › Кросс-боди
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(
    [
      { name: "Главная", path: "/" },
      { name: "Каталог", path: "/catalog" },
      { name: cat.name, path: `/catalog/${slug}` },
    ],
    siteUrl,
  );

  // CollectionPage JSON-LD
  const collectionJsonLd = buildCollectionPageJsonLd(
    categoryTitle,
    cat.description,
    `/catalog/${slug}`,
    products.filter((p) => p.category === slug).length,
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
      {/* key={slug}: при переходе между категориями клиентский каталог
          пересоздаётся — состояние фильтров сбрасывается корректно */}
      <CatalogPage
        key={slug}
        initialProducts={products}
        initialCategories={categories}
        initialCatalogOrder={settings.catalogOrder ?? []}
        initialCategory={slug}
        categoryTitle={categoryTitle}
        categoryFromPath
      />
      <CatalogSeo category={slug} />
    </>
  );
}

import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { getProducts, getCategories } from "@/data/products";
import { readSettings } from "@/lib/settings";
import { seoConfig } from "@/config/seo";
import {
  buildCollectionPageJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo-jsonld";
import CatalogPage from "./catalog-content";
import CatalogSeo from "@/components/sections/catalog-seo";

// Страница dynamic: searchParams в generateMetadata (SEO-мета по фильтрам).
// Данные отдаются из TTL-кэша (30–600с), рендер дешёвый.
export const revalidate = 0;

interface Props {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    color?: string;
    material?: string;
    q?: string;
    priceMin?: string;
    priceMax?: string;
    marketplace?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;

  // Категории переехали на /catalog/:slug — старый query-URL редиректим (301)
  if (params.category) {
    permanentRedirect(`/catalog/${params.category}`);
  }

  const page = parseInt(params.page ?? "1", 10) || 1;
  const hasOtherFilters = [
    params.sort,
    params.color,
    params.material,
    params.q,
    params.priceMin,
    params.priceMax,
    params.marketplace,
  ].some((v) => v !== undefined && v !== "");

  // Пагинация (page>1) и фильтры — закрываем от индексации: дубли каталога.
  // canonical указывает на первую страницу/базовый URL.
  if (page > 1 || hasOtherFilters) {
    return {
      title: { absolute: seoConfig.catalog.title },
      description: seoConfig.catalog.description,
      robots: { index: false, follow: true },
      alternates: { canonical: "/catalog" },
    };
  }

  return {
    title: { absolute: seoConfig.catalog.title },
    description: seoConfig.catalog.description,
    alternates: { canonical: "/catalog" },
    openGraph: {
      title: seoConfig.catalog.title,
      description: seoConfig.catalog.description,
      url: "/catalog",
      siteName: seoConfig.site.siteName,
      type: "website",
      locale: seoConfig.site.locale,
    },
  };
}

export default async function CatalogPageWrapper({ searchParams }: Props) {
  const params = await searchParams;

  // Фолбэк-редирект: если generateMetadata не сработал (например, dev без меты)
  if (params.category) {
    permanentRedirect(`/catalog/${params.category}`);
  }

  const siteUrl = process.env.SITE_URL || "http://localhost:3001";
  const [products, categories, settings] = await Promise.all([
    getProducts(),
    getCategories(),
    readSettings(),
  ]);

  // BreadcrumbList JSON-LD: Главная › Каталог
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(
    [
      { name: "Главная", path: "/" },
      { name: "Каталог", path: "/catalog" },
    ],
    siteUrl,
  );

  // CollectionPage JSON-LD: весь каталог
  const collectionJsonLd = buildCollectionPageJsonLd(
    "Каталог кожаных сумок Moranti",
    "Женские сумки из натуральной итальянской кожи. Кросс-боди, тоуты, багеты, рюкзаки.",
    "/catalog",
    products.length,
  );

  return (
    <>
      {/* BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      {/* CollectionPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionJsonLd),
        }}
      />
      <CatalogPage
        initialProducts={products}
        initialCategories={categories}
        initialCatalogOrder={settings.catalogOrder ?? []}
      />
      {/* SEO-текст с ссылками на категории — после сетки товаров */}
      <CatalogSeo />
    </>
  );
}

import type { Metadata } from "next";
import { getProducts, getCategories } from "@/data/products";
import { readSettings } from "@/lib/settings";
import { seoConfig } from "@/config/seo";
import {
  buildCollectionPageJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo-jsonld";
import CatalogPage from "./catalog-content";
import CatalogSeo from "@/components/sections/catalog-seo";

// Страница dynamic: searchParams в generateMetadata (SEO-мета по категориям).
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
  const catSlug = params.category;
  const products = await getProducts();

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

  const cat = catSlug ? seoConfig.categories[catSlug] : undefined;

  // Пагинация (page>1) и фильтры — закрываем от индексации: дубли каталога.
  // canonical указывает на первую страницу/базовый URL.
  if (page > 1 || (catSlug && !cat)) {
    return {
      title: { absolute: seoConfig.catalog.title },
      description: seoConfig.catalog.description,
      robots: { index: false, follow: true },
      alternates: {
        canonical: catSlug ? `/catalog?category=${catSlug}` : "/catalog",
      },
    };
  }

  if (catSlug && cat) {
    const count = products.filter((p) => p.category === catSlug).length;
    const desc = `${cat.description} Доставка по России.`;
    return {
      title: { absolute: cat.title },
      description: desc,
      // Пустая категория — слабый сигнал для поисковиков: закрываем от индексации,
      // пока в ней нет товаров
      robots: count === 0 ? { index: false, follow: true } : undefined,
      alternates: { canonical: `/catalog?category=${catSlug}` },
      openGraph: {
        title: cat.title,
        description: desc,
        url: `/catalog?category=${catSlug}`,
        siteName: seoConfig.site.siteName,
        type: "website",
        locale: seoConfig.site.locale,
      },
    };
  }

  // Фильтры без категории (?sort=, ?color=, ?q= и т.д.) — дубли каталога
  if (hasOtherFilters) {
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
  const siteUrl = process.env.SITE_URL || "http://localhost:3001";
  const [products, categories, settings] = await Promise.all([
    getProducts(),
    getCategories(),
    readSettings(),
  ]);

  const catSlug = params.category;
  const cat = catSlug ? seoConfig.categories[catSlug] : undefined;

  // BreadcrumbList JSON-LD: Главная › Каталог (› Категория)
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(
    cat
      ? [
          { name: "Главная", path: "/" },
          { name: "Каталог", path: "/catalog" },
          { name: cat.name, path: `/catalog?category=${catSlug}` },
        ]
      : [
          { name: "Главная", path: "/" },
          { name: "Каталог", path: "/catalog" },
        ],
    siteUrl,
  );

  // CollectionPage JSON-LD: для категории — своя, иначе — весь каталог
  const collectionJsonLd = cat
    ? buildCollectionPageJsonLd(
        cat.title.replace(" — Moranti", ""),
        `${cat.description} Доставка по России.`,
        `/catalog?category=${catSlug}`,
        products.filter((p) => p.category === catSlug).length,
      )
    : buildCollectionPageJsonLd(
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

import { seoConfig, buildProductSeoMeta } from "@/config/seo";
import { getProducts } from "@/data/products";
import {
  buildProductJsonLd,
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildGlobalJsonLd,
} from "@/lib/seo-jsonld";
import SeoPreview from "@/components/admin/seo-preview";

/** Запись для превью: что Google покажет для URL + микроразметка */
export interface SeoEntry {
  id: string;
  group: "pages" | "categories" | "products";
  path: string;
  title: string;
  description: string;
  noindex: boolean;
  /** Сегменты breadcrumb в URL-строке: ["Каталог", "Кросс-боди"] */
  siteSegments: string[];
  /** Канонический URL (относительный путь) */
  canonical: string;
  /** JSON-LD, который реально отдаёт страница */
  jsonLd: Record<string, unknown>[];
  /** OpenGraph-значения (могут отличаться от title/description) */
  og?: { title: string; description: string };
  /** og:image (абсолютный URL) */
  ogImage?: string;
}

export default async function SeoAdminPage() {
  const siteUrl = process.env.SITE_URL || "http://localhost:3001";
  const domain = siteUrl.replace(/^https?:\/\//, "");
  const products = await getProducts();
  const { site, pages, categories, catalog } = seoConfig;
  // og:image по умолчанию для страниц (из конфига)
  const pageOgImage = `${siteUrl}${site.ogImage}`;

  const entries: SeoEntry[] = [];

  // ─── Страницы ───
  entries.push(
    {
      id: "home",
      group: "pages",
      path: "/",
      title: site.defaultTitle,
      description: site.defaultDescription,
      noindex: false,
      siteSegments: [],
      canonical: "/",
      jsonLd: [],
      ogImage: pageOgImage,
    },
    {
      id: "catalog",
      group: "pages",
      path: "/catalog",
      title: catalog.title,
      description: catalog.description,
      noindex: false,
      siteSegments: ["Каталог"],
      canonical: "/catalog",
      jsonLd: [
        buildCollectionPageJsonLd(
          "Каталог кожаных сумок Moranti",
          "Женские сумки из натуральной итальянской кожи. Кросс-боди, тоуты, багеты, рюкзаки.",
          "/catalog",
          products.length,
        ),
      ],
      ogImage: pageOgImage,
    },
    {
      id: "care",
      group: "pages",
      path: "/care",
      title: pages.care.title,
      description: pages.care.description,
      noindex: false,
      siteSegments: ["Уход за сумками"],
      canonical: "/care",
      jsonLd: [],
      ogImage: pageOgImage,
    },
    {
      id: "delivery",
      group: "pages",
      path: "/delivery",
      title: pages.delivery.title,
      description: pages.delivery.description,
      noindex: false,
      siteSegments: ["Доставка"],
      canonical: "/delivery",
      jsonLd: [],
      ogImage: pageOgImage,
    },
    {
      id: "favorites",
      group: "pages",
      path: "/favorites",
      title: pages.favorites.title,
      description: pages.favorites.description,
      noindex: true,
      siteSegments: [],
      canonical: "/favorites",
      jsonLd: [],
      ogImage: pageOgImage,
    },
  );

  // ─── Категории ───
  for (const [slug, cat] of Object.entries(categories)) {
    const count = products.filter((p) => p.category === slug).length;
    entries.push({
      id: `cat-${slug}`,
      group: "categories",
      path: `/catalog?category=${slug}`,
      title: cat.title,
      // Без счётчика: «12 моделей» кешируется Google и устаревает
      description: `${cat.description} Доставка по России.`,
      // Пустая категория закрыта от индексации (см. generateMetadata каталога)
      noindex: count === 0,
      siteSegments: ["Каталог", cat.name],
      canonical: `/catalog?category=${slug}`,
      jsonLd: [
        buildCollectionPageJsonLd(
          cat.title.replace(" — Moranti", ""),
          `${cat.description} Доставка по России.`,
          `/catalog?category=${slug}`,
          count,
        ),
      ],
      ogImage: pageOgImage,
    });
  }

  // ─── Товары (примеры: первые 3 с уникальными названиями) ───
  const seen = new Set<string>();
  const samples: typeof products = [];
  for (const p of products) {
    if (seen.has(p.name)) continue;
    seen.add(p.name);
    samples.push(p);
    if (samples.length >= 3) break;
  }
  for (const p of samples) {
    const meta = buildProductSeoMeta(p);
    entries.push({
      id: `prod-${p.slug}`,
      group: "products",
      path: `/catalog/${p.slug}`,
      title: meta.title,
      description: meta.description,
      noindex: false,
      siteSegments: ["Каталог", p.name],
      canonical: `/catalog/${p.slug}`,
      jsonLd: [
        buildProductJsonLd(p, siteUrl),
        buildBreadcrumbJsonLd(
          [
            { name: "Главная", path: "/" },
            { name: "Каталог", path: "/catalog" },
            { name: p.name, path: `/catalog/${p.slug}` },
          ],
          siteUrl,
        ),
      ],
      og: { title: meta.ogTitle, description: meta.description },
      ogImage: p.image,
    });
  }

  // Глобальная микроразметка из layout.tsx — присутствует на каждой странице.
  // Единый источник: seo-jsonld.ts (layout и превью не могут разойтись)
  const globalJsonLd = buildGlobalJsonLd(siteUrl);

  return (
    <SeoPreview
      entries={entries}
      domain={domain}
      siteName={site.siteName}
      globalJsonLd={globalJsonLd}
    />
  );
}